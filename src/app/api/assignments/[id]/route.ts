import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuth, requireAdmin } from "@/lib/auth";
import SurveyAssignment from "@/models/SurveyAssignment";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    if (!requireAdmin(auth)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const assignment = await SurveyAssignment.findOneAndDelete({ _id: id, assignedBy: auth.userId });
    if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
