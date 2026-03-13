import { model, models, Schema, type InferSchemaType } from "mongoose";

const participantSchema = new Schema(
  {
    userId: { type: String, required: true },
    currentQuestion: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const duelSchema = new Schema(
  {
    duelId: { type: String, required: true, unique: true, index: true },
    participants: { type: [participantSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },
    winnerId: { type: String, default: null },
    bountyAwarded: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "duels" },
);

export type DuelDocument = InferSchemaType<typeof duelSchema>;

export const DuelModel = models.Duel || model("Duel", duelSchema);
