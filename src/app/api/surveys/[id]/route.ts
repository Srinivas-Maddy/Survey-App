import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";
import Response from "@/models/Response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const survey = await Survey.findOne({ _id: id, userId: auth.userId });
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const responses = await Response.find({ surveyId: survey._id }).sort({ submittedAt: -1 });
    return NextResponse.json({ survey, responses });
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
    const { title, description, questions } = await req.json();

    const survey = await Survey.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { title, description, questions },
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
