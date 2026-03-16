import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuth, requireEmployee } from "@/lib/auth";
import SurveyAssignment from "@/models/SurveyAssignment";
import Survey from "@/models/Survey";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    if (!requireEmployee(auth)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const assignments = await SurveyAssignment.find({ employeeId: auth.userId, isActive: true }).lean();
    const surveyIds = assignments.map((a) => a.surveyId);

    const surveys = await Survey.find({ _id: { $in: surveyIds }, isActive: true }).select("-userId").lean();

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
