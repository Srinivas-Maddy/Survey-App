import mongoose, { Schema, Document } from "mongoose";

export interface ISurveyAssignment extends Document {
  surveyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  isActive: boolean;
}

const SurveyAssignmentSchema = new Schema<ISurveyAssignment>({
  surveyId: { type: Schema.Types.ObjectId, ref: "Survey", required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

SurveyAssignmentSchema.index({ surveyId: 1, employeeId: 1 }, { unique: true });

export default mongoose.models.SurveyAssignment || mongoose.model<ISurveyAssignment>("SurveyAssignment", SurveyAssignmentSchema);
