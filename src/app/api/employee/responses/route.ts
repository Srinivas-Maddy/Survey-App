import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuth, requireEmployee } from "@/lib/auth";
import SurveyAssignment from "@/models/SurveyAssignment";
import Response from "@/models/Response";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    if (!requireEmployee(auth)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { surveyId, answers } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ error: "surveyId and answers are required" }, { status: 400 });
    }

    // Verify employee is assigned to this survey
    const assignment = await SurveyAssignment.findOne({ surveyId, employeeId: auth.userId, isActive: true });
    if (!assignment) {
      return NextResponse.json({ error: "You are not assigned to this survey" }, { status: 403 });
    }

    const response = await Response.create({
      surveyId,
      answers,
      employeeId: auth.userId,
      collectionMethod: "employee",
    });

    return NextResponse.json({ success: true, responseId: response._id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
