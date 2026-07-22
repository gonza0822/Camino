import mongoose, { Schema, type InferSchemaType } from "mongoose";

const weeklyGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    weekStart: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    completed: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type WeeklyGoalDocument = InferSchemaType<typeof weeklyGoalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WeeklyGoal =
  mongoose.models.WeeklyGoal ?? mongoose.model("WeeklyGoal", weeklyGoalSchema);
