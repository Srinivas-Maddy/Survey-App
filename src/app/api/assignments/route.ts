import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuth, requireAdmin } from "@/lib/auth";
import SurveyAssignment from "@/models/SurveyAssignment";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    let filter: Record<string, unknown>;
    if (auth.role === "admin") {
      const surveyId = req.nextUrl.searchParams.get("surveyId");
      filter = surveyId ? { assignedBy: auth.userId, surveyId } : { assignedBy: auth.userId };
    } else if (auth.role === "employee") {
      filter = { employeeId: auth.userId, isActive: true };
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await SurveyAssignment.find(filter)
      .populate("surveyId", "title")
      .populate("employeeId", "name email")
      .sort({ assignedAt: -1 })
      .lean();

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    if (!requireAdmin(auth)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { surveyId, employeeId } = await req.json();

    if (!surveyId || !employeeId) {
      return NextResponse.json({ error: "surveyId and employeeId are required" }, { status: 400 });
    }

    const existing = await SurveyAssignment.findOne({ surveyId, employeeId });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
        return NextResponse.json({ assignment: existing });
      }
      return NextResponse.json({ error: "Already assigned" }, { status: 400 });
    }

    const assignment = await SurveyAssignment.create({
      surveyId,
      employeeId,
      assignedBy: auth.userId,
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
