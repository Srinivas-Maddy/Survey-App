import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";
import Response from "@/models/Response";

export async function GET() {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const surveys = await Survey.find({ userId: auth.userId }).sort({ createdAt: -1 }).lean();
    const surveyIds = surveys.map((s) => s._id);
    const responseCounts = await Response.aggregate([
      { $match: { surveyId: { $in: surveyIds } } },
      { $group: { _id: "$surveyId", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    responseCounts.forEach((r) => { countMap[r._id.toString()] = r.count; });
    const surveysWithCounts = surveys.map((s) => ({ ...s, responseCount: countMap[s._id.toString()] || 0 }));
    return NextResponse.json({ surveys: surveysWithCounts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { title, description, questions, logo } = await req.json();

    const survey = await Survey.create({
      title,
      description,
      userId: auth.userId,
      questions,
      logo: logo || "",
      publicId: uuidv4().slice(0, 8),
    });

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
