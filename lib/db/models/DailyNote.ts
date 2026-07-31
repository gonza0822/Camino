import mongoose, { Schema, type InferSchemaType } from "mongoose";

const dailyNoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    date: { type: String, required: true, index: true },
    content: { type: String, default: "", maxlength: 10000 },
  },
  { timestamps: true },
);

dailyNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

export type DailyNoteDocument = InferSchemaType<typeof dailyNoteSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyNote =
  mongoose.models.DailyNote ?? mongoose.model("DailyNote", dailyNoteSchema);
