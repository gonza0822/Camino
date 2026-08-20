import mongoose, { Schema, type InferSchemaType } from "mongoose";

const reminderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reminderSchema.index({ userId: 1, sortOrder: 1 });

export type ReminderDocument = InferSchemaType<typeof reminderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Reminder =
  mongoose.models.Reminder ?? mongoose.model("Reminder", reminderSchema);
