import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";

export async function GET() {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const surveys = await Survey.find({ userId: auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ surveys });
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
    const { title, description, questions } = await req.json();

    const survey = await Survey.create({
      title,
      description,
      userId: auth.userId,
      questions,
      publicId: uuidv4().slice(0, 8),
    });

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
