import { randomUUID } from "crypto";
import JSZip from "jszip";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { QuestionModel } from "@/lib/models";

interface GeminiQuestionOption {
  id: "a" | "b" | "c" | "d";
  text: string;
}

interface GeminiQuestion {
  question: string;
  options: GeminiQuestionOption[];
  correctOptionId: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty?: string;
  topic?: string;
}

type OptionId = "a" | "b" | "c" | "d";

const OPTION_IDS: OptionId[] = ["a", "b", "c", "d"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

function sentenceChunks(rawText: string): string[] {
  return rawText
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40)
    .slice(0, 30);
}

function normalizeOptionText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function balanceOptionLengths(options: GeminiQuestionOption[]): GeminiQuestionOption[] {
  const normalized = options.map((option) => ({
    id: option.id,
    text: normalizeOptionText(option.text),
  }));

  const lengths = normalized.map((option) => option.text.length);
  const maxLength = Math.max(...lengths);
  const minLength = Math.min(...lengths);

  if (maxLength <= 0 || maxLength - minLength < 35) {
    return normalized;
  }

  const targetMax = Math.min(95, Math.max(45, Math.round((maxLength + minLength) / 2)));

  return normalized.map((option) => ({
    id: option.id,
    text: truncateText(option.text, targetMax),
  }));
}

function shuffleOptions(
  options: GeminiQuestionOption[],
  correctOptionId: OptionId,
): { options: GeminiQuestionOption[]; correctOptionId: OptionId } {
  const balanced = balanceOptionLengths(options);
  const shuffled = balanced.map((option) => ({ ...option }));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const remapped = shuffled.map((option, index) => ({
    id: OPTION_IDS[index],
    text: option.text,
    originalId: option.id,
  }));

  const correct = remapped.find((option) => option.originalId === correctOptionId);

  return {
    options: remapped.map((option) => ({ id: option.id, text: option.text })),
    correctOptionId: correct?.id ?? "a",
  };
}

function buildFallbackQuestionStem(subject: string, chunk: string, index: number): string {
  const cleaned = normalizeOptionText(chunk).replace(/["'`]/g, "");
  const excerpt = truncateText(cleaned, 72);
  const templates = [
    `In ${subject}, which option best matches this idea: "${excerpt}"?`,
    `Based on the uploaded ${subject} content, what is the best interpretation of: "${excerpt}"?`,
    `Which option is most consistent with this ${subject} excerpt: "${excerpt}"?`,
  ];

  return templates[index % templates.length];
}

function generateQuestionsFallback(
  subject: string,
  subjectSlug: string,
  text: string,
): ReturnType<typeof normalizeGeminiQuestions> {
  const chunks = sentenceChunks(text).slice(0, 12);
  const usableChunks = chunks.length > 0 ? chunks : [text.replace(/\s+/g, " ").trim()].filter(Boolean);
  const now = Date.now();

  return usableChunks.slice(0, 10).map((chunk, index) => {
    const questionId = `upload-${subjectSlug}-${now}-fallback-${index + 1}-${randomUUID().slice(0, 8)}`;
    const answer = truncateText(normalizeOptionText(chunk), 100);

    const distractors = usableChunks
      .filter((_, itemIndex) => itemIndex !== index)
      .sort((left, right) => Math.abs(left.length - answer.length) - Math.abs(right.length - answer.length))
      .slice(0, 3)
      .map((item) => truncateText(normalizeOptionText(item), 100));

    const fillerPool = [
      "This claim is not clearly supported in the uploaded material.",
      "The source content does not provide evidence for this statement.",
      "This statement conflicts with the main ideas from the upload.",
    ];

    while (distractors.length < 3) {
      distractors.push(fillerPool[distractors.length]);
    }

    const shuffled = shuffleOptions(
      [
        { id: "a", text: answer },
        { id: "b", text: distractors[0] },
        { id: "c", text: distractors[1] },
        { id: "d", text: distractors[2] },
      ],
      "a",
    );

    return {
      questionId,
      id: questionId,
      subject,
      subjectSlug,
      topic: subject,
      difficulty: "Medium",
      question: buildFallbackQuestionStem(subject, chunk, index),
      options: shuffled.options,
      correctOptionId: shuffled.correctOptionId,
      correctAnswer: shuffled.correctOptionId,
      explanation: "This statement is extracted from the uploaded material.",
      tags: [subjectSlug, "upload", "generated", "fallback"],
      source: "fallback-upload-parser",
      isDummy: false,
    };
  });
}

function parseGeminiJson(raw: string): GeminiQuestion[] {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(withoutFence) as { questions?: GeminiQuestion[] } | GeminiQuestion[];

  if (Array.isArray(parsed)) {
    return parsed;
  }

  return parsed.questions ?? [];
}

function normalizeGeminiQuestions(
  subject: string,
  subjectSlug: string,
  questions: GeminiQuestion[],
) {
  const now = Date.now();

  return questions
    .filter((question) => {
      const hasQuestion = Boolean(question.question?.trim());
      const hasExplanation = Boolean(question.explanation?.trim());
      const optionIds = new Set(question.options?.map((option) => option.id));

      return (
        hasQuestion &&
        hasExplanation &&
        optionIds.has("a") &&
        optionIds.has("b") &&
        optionIds.has("c") &&
        optionIds.has("d") &&
        optionIds.size === 4 &&
        ["a", "b", "c", "d"].includes(question.correctOptionId)
      );
    })
    .slice(0, 12)
    .map((question, index) => {
      const questionId = `upload-${subjectSlug}-${now}-${index + 1}-${randomUUID().slice(0, 8)}`;
      const shuffled = shuffleOptions(
        question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
        question.correctOptionId,
      );

      return {
        questionId,
        id: questionId,
        subject,
        subjectSlug,
        topic: question.topic?.trim() || subject,
        difficulty: question.difficulty?.trim() || "Medium",
        question: question.question.trim(),
        options: shuffled.options,
        correctOptionId: shuffled.correctOptionId,
        correctAnswer: shuffled.correctOptionId,
        explanation: question.explanation.trim(),
        tags: [subjectSlug, "upload", "generated", "gemini"],
        source: "gemini-upload-parser",
        isDummy: false,
      };
    });
}

async function generateQuestionsWithGemini(
  subject: string,
  subjectSlug: string,
  text: string,
): Promise<ReturnType<typeof normalizeGeminiQuestions>> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured.");
  }

  const contentSample = text.slice(0, 20000);

  const prompt = [
    "You are an expert educational question generator.",
    `Subject: ${subject}`,
    `Subject Slug: ${subjectSlug}`,
    "Generate 8 to 12 high-quality MCQ questions strictly based on the provided content.",
    "Return ONLY valid JSON with this shape:",
    "{\"questions\":[{\"question\":string,\"options\":[{\"id\":\"a\"|\"b\"|\"c\"|\"d\",\"text\":string}],\"correctOptionId\":\"a\"|\"b\"|\"c\"|\"d\",\"explanation\":string,\"difficulty\":\"Easy\"|\"Medium\"|\"Hard\",\"topic\":string}]}",
    "Rules:",
    "1) Exactly 4 options per question with ids a,b,c,d.",
    "2) Only one correct option.",
    "3) Avoid duplicate or near-duplicate questions.",
    "4) Do not use markdown code fences.",
    "5) Questions must be answerable from the provided content.",
    "6) Keep all option lengths reasonably similar and avoid making the correct answer obviously longer.",
    "Content:",
    contentSample,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!rawText) {
    throw new Error("Gemini returned empty content.");
  }

  const parsed = parseGeminiJson(rawText);
  return normalizeGeminiQuestions(subject, subjectSlug, parsed);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function extractTextFromPptx(bytes: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const aNum = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const bNum = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return aNum - bNum;
    });

  const slideTexts = await Promise.all(
    slideFiles.map(async (slidePath) => {
      const xml = await zip.files[slidePath].async("text");
      const textRuns = Array.from(xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)).map((match) =>
        decodeXmlEntities(match[1] ?? ""),
      );
      return textRuns.join(" ");
    }),
  );

  return slideTexts.join("\n").trim();
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const subject = String(formData.get("subject") ?? "").trim() || "General";
  const subjectSlugInput = String(formData.get("subjectSlug") ?? "").trim();
  const textNotes = String(formData.get("textInput") ?? "").trim();
  const file = formData.get("file");

  let extractedText = textNotes;

  if (file instanceof File) {
    const lowerName = file.name.toLowerCase();
    const bytes = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      try {
        const parsed = await pdfParse(bytes);
        extractedText = `${extractedText}\n${parsed.text ?? ""}`.trim();
      } catch {
        return NextResponse.json(
          { error: "Could not parse this PDF. Try a text-based PDF or paste notes in the text box." },
          { status: 400 },
        );
      }
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      lowerName.endsWith(".pptx")
    ) {
      const pptxText = await extractTextFromPptx(bytes);
      extractedText = `${extractedText}\n${pptxText}`.trim();
    } else if (file.type.startsWith("text/") || lowerName.endsWith(".txt")) {
      extractedText = `${extractedText}\n${bytes.toString("utf8")}`.trim();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, PPTX, or TXT files." },
        { status: 400 },
      );
    }
  }

  if (!extractedText) {
    return NextResponse.json({ error: "No extractable text found in upload." }, { status: 400 });
  }

  const subjectSlug = subjectSlugInput || slugify(subject);
  let generatedQuestions: ReturnType<typeof normalizeGeminiQuestions> = [];

  try {
    generatedQuestions = await generateQuestionsWithGemini(subject, subjectSlug, extractedText);
  } catch {
    generatedQuestions = generateQuestionsFallback(subject, subjectSlug, extractedText);
  }

  if (generatedQuestions.length === 0) {
    generatedQuestions = generateQuestionsFallback(subject, subjectSlug, extractedText);
  }

  if (generatedQuestions.length === 0) {
    return NextResponse.json(
      { error: "Not enough meaningful content to generate questions." },
      { status: 400 },
    );
  }

  await connectToDatabase();
  await QuestionModel.insertMany(generatedQuestions, { ordered: false });

  return NextResponse.json({
    ok: true,
    subject,
    subjectSlug,
    createdCount: generatedQuestions.length,
  });
}
