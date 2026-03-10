import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number" | "date" | "list" | "yesno";
  label: string;
  required: boolean;
  options?: string[];
  hideNextOnYes?: boolean;
}

export interface ISurvey extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  questions: IQuestion[];
  publicId: string;
  isActive: boolean;
  logo: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ["text", "textarea", "radio", "checkbox", "select", "number", "date", "list", "yesno"] },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  hideNextOnYes: { type: Boolean, default: true },
});

const SurveySchema = new Schema<ISurvey>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  questions: [QuestionSchema],
  publicId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  logo: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// Delete cached model to ensure schema updates are picked up in dev
if (mongoose.models.Survey) {
  delete mongoose.models.Survey;
}
export default mongoose.model<ISurvey>("Survey", SurveySchema);
