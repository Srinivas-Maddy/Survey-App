import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";
import SurveyResponse from "@/models/Response";

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { action, surveyId, olderThanDays } = await req.json();

    let deleted = 0;

    switch (action) {
      case "delete-responses-by-survey": {
        // Delete all responses for a specific survey
        const survey = await Survey.findOne({ _id: surveyId, userId: auth.userId });
        if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        const result = await SurveyResponse.deleteMany({ surveyId: survey._id });
        deleted = result.deletedCount;
        break;
      }

      case "delete-old-responses": {
        const userSurveyIds = await Survey.find({ userId: auth.userId }).distinct("_id");
        let result;
        if (olderThanDays === 0) {
          // Delete ALL responses
          result = await SurveyResponse.deleteMany({ surveyId: { $in: userSurveyIds } });
        } else {
          // Delete responses older than X days
          const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
          result = await SurveyResponse.deleteMany({
            surveyId: { $in: userSurveyIds },
            submittedAt: { $lt: cutoff },
          });
        }
        deleted = result.deletedCount;
        break;
      }

      case "delete-all-responses": {
        // Delete ALL responses for all user's surveys
        const surveyIds = await Survey.find({ userId: auth.userId }).distinct("_id");
        const result = await SurveyResponse.deleteMany({ surveyId: { $in: surveyIds } });
        deleted = result.deletedCount;
        break;
      }

      case "delete-survey-with-responses": {
        // Delete a survey and its responses
        const survey = await Survey.findOne({ _id: surveyId, userId: auth.userId });
        if (!survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        const respResult = await SurveyResponse.deleteMany({ surveyId: survey._id });
        await Survey.deleteOne({ _id: survey._id });
        deleted = respResult.deletedCount + 1;
        break;
      }

      case "delete-inactive-surveys": {
        // Delete all inactive surveys and their responses
        const inactiveSurveys = await Survey.find({ userId: auth.userId, isActive: false });
        const inactiveIds = inactiveSurveys.map((s) => s._id);
        const respResult = await SurveyResponse.deleteMany({ surveyId: { $in: inactiveIds } });
        const survResult = await Survey.deleteMany({ _id: { $in: inactiveIds } });
        deleted = respResult.deletedCount + survResult.deletedCount;
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
