import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";
import Response from "@/models/Response";
import User from "@/models/User";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const survey = await Survey.findOne({ _id: id, userId: auth.userId });
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const responses = await Response.find({ surveyId: survey._id }).sort({ submittedAt: -1 }).lean();

    // Populate employee names for employee-collected responses
    const employeeIds = [...new Set(responses.filter((r) => r.employeeId).map((r) => r.employeeId!.toString()))];
    const employees = employeeIds.length > 0 ? await User.find({ _id: { $in: employeeIds } }).select("name email").lean() : [];
    const employeeMap: Record<string, { name: string; email: string }> = {};
    employees.forEach((e) => { employeeMap[e._id.toString()] = { name: e.name, email: e.email }; });

    const responsesWithEmployee = responses.map((r) => ({
      ...r,
      employeeName: r.employeeId ? employeeMap[r.employeeId.toString()]?.name || null : null,
    }));

    return NextResponse.json({ survey, responses: responsesWithEmployee });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const { title, description, questions, logo } = await req.json();

    const survey = await Survey.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { title, description, questions, logo: logo || "" },
      { new: true }
    );
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ survey });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    await Survey.deleteOne({ _id: id, userId: auth.userId });
    await Response.deleteMany({ surveyId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
