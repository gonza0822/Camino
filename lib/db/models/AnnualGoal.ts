import mongoose, { Schema, type InferSchemaType } from "mongoose";

const annualGoalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    year: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    completed: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type AnnualGoalDocument = InferSchemaType<typeof annualGoalSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AnnualGoal =
  mongoose.models.AnnualGoal ?? mongoose.model("AnnualGoal", annualGoalSchema);
