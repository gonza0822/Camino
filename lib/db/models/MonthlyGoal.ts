import mongoose, { Schema, type InferSchemaType } from "mongoose";

const monthlyGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    completed: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type MonthlyGoalDocument = InferSchemaType<typeof monthlyGoalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MonthlyGoal =
  mongoose.models.MonthlyGoal ?? mongoose.model("MonthlyGoal", monthlyGoalSchema);
