import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Survey from "@/models/Survey";
import SurveyResponse from "@/models/Response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const survey = await Survey.findOne({ publicId, isActive: true }).select("-userId");
    if (!survey) return NextResponse.json({ error: "Survey not found or inactive" }, { status: 404 });
    return NextResponse.json({ survey });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    await connectDB();
    const { publicId } = await params;
    const survey = await Survey.findOne({ publicId, isActive: true });
    if (!survey) return NextResponse.json({ error: "Survey not found or inactive" }, { status: 404 });

    const { answers } = await req.json();
    await SurveyResponse.create({ surveyId: survey._id, answers });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
