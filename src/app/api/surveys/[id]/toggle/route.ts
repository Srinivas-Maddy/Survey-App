import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const survey = await Survey.findOne({ _id: id, userId: auth.userId });
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    survey.isActive = !survey.isActive;
    await survey.save();
    return NextResponse.json({ survey });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
