import mongoose, { Schema, Document } from "mongoose";

export interface ISurveyResponse extends Document {
  surveyId: mongoose.Types.ObjectId;
  answers: Record<string, string | string[]>;
  submittedAt: Date;
}

const ResponseSchema = new Schema<ISurveyResponse>({
  surveyId: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
  answers: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Response || mongoose.model<ISurveyResponse>("Response", ResponseSchema);
