import { model, models, Schema, type InferSchemaType } from "mongoose";

const storyTopicSchema = new Schema(
  {
    topic: { type: String, required: true },
    explanation: { type: String, required: true },
    imagePath: { type: String, default: null },
    imageFilename: { type: String, default: null },
  },
  { _id: false },
);

const quizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const storyQuizQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    topic: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [quizOptionSchema], default: [] },
    correctOptionId: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

const storySessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    subjectSlug: { type: String, required: true, index: true },
    sourceType: {
      type: String,
      enum: ["text", "pdf", "txt", "mixed"],
      default: "text",
    },
    sourceFileName: { type: String, default: null },
    sourceText: { type: String, required: true },
    topics: { type: [storyTopicSchema], default: [] },
    quizQuestions: { type: [storyQuizQuestionSchema], default: [] },
  },
  { timestamps: true, collection: "story_sessions" },
);

export type StorySessionDocument = InferSchemaType<typeof storySessionSchema>;

export const StorySessionModel =
  models.StorySession || model("StorySession", storySessionSchema);
