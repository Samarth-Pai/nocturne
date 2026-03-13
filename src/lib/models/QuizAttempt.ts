import { model, models, Schema, type InferSchemaType } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    subjectSlug: { type: String, required: true, index: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  { timestamps: true, collection: "quiz_attempts" },
);

export type QuizAttemptDocument = InferSchemaType<typeof quizAttemptSchema>;

export const QuizAttemptModel =
  models.QuizAttempt || model("QuizAttempt", quizAttemptSchema);
