import { model, models, Schema, type InferSchemaType } from "mongoose";

const streakSchema = new Schema(
  {
    count: { type: Number, default: 0 },
    lastActive: { type: Date, default: null },
  },
  { _id: false },
);

const gamificationSchema = new Schema(
  {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: streakSchema, default: () => ({}) },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    streak: { type: streakSchema, default: () => ({}) },
    gamification: { type: gamificationSchema, default: () => ({}) },
  },
  { timestamps: true, collection: "users" },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
