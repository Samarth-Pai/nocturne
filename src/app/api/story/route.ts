import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { StorySessionModel } from "@/lib/models";

export const runtime = "nodejs";

type OptionId = "a" | "b" | "c" | "d";

interface StoryTopicPayload {
  topic: string;
  explanation: string;
  imageFilename?: string | null;
}

interface StoryQuizOption {
  id: OptionId;
  text: string;
}

interface StoryQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: StoryQuizOption[];
  correctOptionId: OptionId;
  explanation: string;
}

interface GeminiQuestion {
  topic?: string;
  question: string;
  options: StoryQuizOption[];
  correctOptionId: OptionId;
  explanation: string;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

function sanitizeFilename(value: string): string {
  // Split extension from basename to avoid mangling the .png suffix
  const lastDot = value.lastIndexOf(".");
  const hasDot = lastDot > 0 && lastDot < value.length - 1;
  const stem = hasDot ? value.slice(0, lastDot) : value;
  const ext = hasDot ? value.slice(lastDot) : "";

  const cleanedStem = stem
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || `image-${Date.now()}`;

  // Force PNG extension — disallow .svg or anything else
  const safeExt = ext.toLowerCase() === ".svg" || !ext ? ".png" : ext.toLowerCase();

  return `${cleanedStem}${safeExt}`;
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeTopicExplanation(topic: string, explanation: string): string {
  const cleaned = stripMarkdown(explanation).replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return `${topic} is an important concept in this subject.\n\nKey points:\n1) Understand the core definition and scope of ${topic}.\n2) Learn common examples and where this concept is applied.\n3) Revise the key terms and relationships related to ${topic}.`;
  }

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const intro = sentences.slice(0, Math.min(3, sentences.length)).join(" ");
  const remaining = sentences.slice(3);
  const points = (remaining.length > 0 ? remaining : sentences.slice(0, 5))
    .slice(0, 5)
    .map((point, index) => `${index + 1}) ${point}`);

  if (points.length === 0) {
    return intro;
  }

  return `${intro}\n\nKey points:\n${points.join("\n")}`;
}

// Minimal valid 1×1 white PNG (base64) used as a fallback placeholder
const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function createTopicPlaceholderImage(
  topic: string,
  folderAbsoluteDir: string,
  folderPublicPath: string,
  index: number,
): Promise<{ imageFilename: string; imagePath: string }> {
  const safeStem = topic
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || `topic-${index + 1}`;

  const localFilename = `${index + 1}-${safeStem}-placeholder.png`;
  const absoluteTargetPath = path.join(folderAbsoluteDir, localFilename);
  const relativeImagePath = `${folderPublicPath}/${localFilename}`;

  await writeFile(absoluteTargetPath, Buffer.from(PLACEHOLDER_PNG_BASE64, "base64"));

  return {
    imageFilename: localFilename,
    imagePath: relativeImagePath,
  };
}

function parseGeminiJson(raw: string): GeminiQuestion[] {
  const withoutFence = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(withoutFence) as { questions?: GeminiQuestion[] } | GeminiQuestion[];
  return Array.isArray(parsed) ? parsed : parsed.questions ?? [];
}

function buildFallbackQuiz(topics: StoryTopicPayload[]): StoryQuizQuestion[] {
  const seeds = topics.length > 0
    ? topics
    : [{ topic: "General", explanation: "No topic explanation available." }];

  return Array.from({ length: 5 }).map((_, index) => {
    const source = seeds[index % seeds.length];
    const excerpt = source.explanation.replace(/\s+/g, " ").trim().slice(0, 120);
    const qid = `story-q-${Date.now()}-${index + 1}-${randomUUID().slice(0, 8)}`;

    return {
      id: qid,
      topic: source.topic,
      question: `Which statement best matches this ${source.topic} explanation: "${excerpt}"?`,
      options: [
        { id: "a", text: excerpt },
        { id: "b", text: "It mainly discusses an unrelated historical timeline." },
        { id: "c", text: "It focuses exclusively on sports training drills." },
        { id: "d", text: "It is about weather forecasting with no concept overlap." },
      ],
      correctOptionId: "a",
      explanation: "The correct option restates the explanation generated for this topic.",
    };
  });
}

function normalizeQuestions(rawQuestions: GeminiQuestion[], topicFallback: string): StoryQuizQuestion[] {
  return rawQuestions
    .filter((item) => {
      const ids = new Set(item.options?.map((option) => option.id));
      return (
        typeof item.question === "string" &&
        item.question.trim().length > 0 &&
        typeof item.explanation === "string" &&
        item.explanation.trim().length > 0 &&
        ids.has("a") &&
        ids.has("b") &&
        ids.has("c") &&
        ids.has("d") &&
        ids.size === 4 &&
        ["a", "b", "c", "d"].includes(item.correctOptionId)
      );
    })
    .slice(0, 5)
    .map((item, index) => ({
      id: `story-q-${Date.now()}-${index + 1}-${randomUUID().slice(0, 8)}`,
      topic: item.topic?.trim() || topicFallback,
      question: item.question.trim(),
      options: item.options.map((option) => ({
        id: option.id,
        text: option.text.trim(),
      })),
      correctOptionId: item.correctOptionId,
      explanation: item.explanation.trim(),
    }));
}

async function generateStoryQuizWithGemini(
  subject: string,
  content: string,
  topics: StoryTopicPayload[],
): Promise<StoryQuizQuestion[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-3-pro-preview";

  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured.");
  }

  const topicSummary = topics.map((topic, index) => `${index + 1}. ${topic.topic}`).join("\n");

  const prompt = [
    "You are creating a final checkpoint quiz for a story-based learning mode.",
    `Subject: ${subject}`,
    "Generate exactly 5 multiple-choice questions based only on the provided topic explanations.",
    "Each question must have four options with ids a,b,c,d and one correctOptionId.",
    "Return ONLY valid JSON in this format:",
    "{\"questions\":[{\"topic\":string,\"question\":string,\"options\":[{\"id\":\"a\"|\"b\"|\"c\"|\"d\",\"text\":string}],\"correctOptionId\":\"a\"|\"b\"|\"c\"|\"d\",\"explanation\":string}]}",
    "Do not include markdown code fences.",
    "Topics:",
    topicSummary,
    "Reference content:",
    content.slice(0, 18000),
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, topP: 0.9 },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!rawText) {
    throw new Error("Gemini returned empty quiz output.");
  }

  const parsed = parseGeminiJson(rawText);
  return normalizeQuestions(parsed, subject);
}

export async function GET(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const sessions = await StorySessionModel.find({ userId: authUser.userId })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean();

  return NextResponse.json({
    stories: sessions.map((session) => ({
      id: String(session._id),
      subject: session.subject,
      subjectSlug: session.subjectSlug,
      sourceType: session.sourceType,
      sourceFileName: session.sourceFileName,
      topicCount: session.topics?.length ?? 0,
      quizCount: session.quizQuestions?.length ?? 0,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const subject = String(formData.get("subject") ?? "").trim() || "General";
  const subjectSlugInput = String(formData.get("subjectSlug") ?? "").trim();
  const textInput = String(formData.get("textInput") ?? "").trim();
  const file = formData.get("file");

  let sourceText = textInput;
  let sourceType: "text" | "pdf" | "txt" | "mixed" = textInput ? "text" : "txt";
  let sourceFileName: string | null = null;

  if (file instanceof File) {
    sourceFileName = file.name;
    const bytes = Buffer.from(await file.arrayBuffer());
    const lowerName = file.name.toLowerCase();

    if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
      const parsed = await pdfParse(bytes);
      sourceText = `${sourceText}\n${parsed.text ?? ""}`.trim();
      sourceType = textInput ? "mixed" : "pdf";
    } else if (file.type.startsWith("text/") || lowerName.endsWith(".txt")) {
      sourceText = `${sourceText}\n${bytes.toString("utf8")}`.trim();
      sourceType = textInput ? "mixed" : "txt";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type for Story Mode. Use PDF or TXT, or submit text." },
        { status: 400 },
      );
    }
  }

  if (!sourceText) {
    return NextResponse.json({ error: "No extractable text found." }, { status: 400 });
  }

  const subjectSlug = subjectSlugInput || slugify(subject);
  const visualCreatorBase = process.env.VISUAL_CREATOR_API_BASE_URL ?? "http://127.0.0.1:5000";

  const visualResponse = await fetch(`${visualCreatorBase}/generate-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sourceText }),
  });

  if (!visualResponse.ok) {
    const detail = await visualResponse.text();
    return NextResponse.json(
      { error: `Visual creator failed: ${detail || visualResponse.statusText}` },
      { status: 502 },
    );
  }

  const visualPayload = (await visualResponse.json()) as {
    results?: StoryTopicPayload[];
  };

  const rawTopics = visualPayload.results ?? [];
  if (rawTopics.length === 0) {
    return NextResponse.json(
      { error: "No topics were generated by visual-creator." },
      { status: 502 },
    );
  }

  const storyAssetFolder = `story-${randomUUID().slice(0, 8)}`;
  const storyAssetsAbsoluteDir = path.join(process.cwd(), "public", "story-images", storyAssetFolder);
  const storyAssetsPublicPath = `/story-images/${storyAssetFolder}`;
  await mkdir(storyAssetsAbsoluteDir, { recursive: true });

  const topicsWithLocalImages = await Promise.all(
    rawTopics.map(async (item, index) => {
      const normalizedExplanation = normalizeTopicExplanation(item.topic, item.explanation);

      if (!item.imageFilename) {
        const placeholder = await createTopicPlaceholderImage(
          item.topic,
          storyAssetsAbsoluteDir,
          storyAssetsPublicPath,
          index,
        );

        return {
          topic: item.topic,
          explanation: normalizedExplanation,
          imageFilename: placeholder.imageFilename,
          imagePath: placeholder.imagePath,
        };
      }

      try {
        const imageResponse = await fetch(
          `${visualCreatorBase}/generated-images/${encodeURIComponent(item.imageFilename)}`,
        );

        if (!imageResponse.ok) {
          throw new Error(`Image download failed (${imageResponse.status})`);
        }

        const imageBytes = Buffer.from(await imageResponse.arrayBuffer());
        const localFilename = `${index + 1}-${sanitizeFilename(item.imageFilename)}`;
        const absoluteTargetPath = path.join(storyAssetsAbsoluteDir, localFilename);
        const relativeImagePath = `${storyAssetsPublicPath}/${localFilename}`;

        await writeFile(absoluteTargetPath, imageBytes);

        return {
          topic: item.topic,
          explanation: normalizedExplanation,
          imageFilename: localFilename,
          imagePath: relativeImagePath,
        };
      } catch {
        const placeholder = await createTopicPlaceholderImage(
          item.topic,
          storyAssetsAbsoluteDir,
          storyAssetsPublicPath,
          index,
        );

        return {
          topic: item.topic,
          explanation: normalizedExplanation,
          imageFilename: placeholder.imageFilename,
          imagePath: placeholder.imagePath,
        };
      }
    }),
  );

  let quizQuestions: StoryQuizQuestion[] = [];

  try {
    quizQuestions = await generateStoryQuizWithGemini(subject, sourceText, rawTopics);
  } catch {
    quizQuestions = [];
  }

  if (quizQuestions.length < 5) {
    quizQuestions = buildFallbackQuiz(rawTopics);
  }

  quizQuestions = quizQuestions.slice(0, 5);

  await connectToDatabase();

  const created = await StorySessionModel.create({
    userId: authUser.userId,
    subject,
    subjectSlug,
    sourceType,
    sourceFileName,
    sourceText: sourceText.slice(0, 60000),
    topics: topicsWithLocalImages,
    quizQuestions,
  });

  return NextResponse.json({
    ok: true,
    storySession: {
      id: String(created._id),
      subject,
      subjectSlug,
      topics: topicsWithLocalImages,
      quizQuestions,
      createdAt: created.createdAt,
    },
  });
}
