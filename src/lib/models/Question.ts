import { model, models, Schema, type InferSchemaType } from "mongoose";

const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    questionId: { type: String, required: true, unique: true },
    id: { type: String, required: true },
    subject: { type: String, required: true },
    subjectSlug: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    correctOptionId: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    tags: { type: [String], default: [] },
    source: { type: String, default: "seed-script" },
    isDummy: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "questions" },
);

export type QuestionDocument = InferSchemaType<typeof questionSchema>;

export const QuestionModel = models.Question || model("Question", questionSchema);
