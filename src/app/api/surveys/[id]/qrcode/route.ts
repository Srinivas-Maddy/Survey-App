import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Survey from "@/models/Survey";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const survey = await Survey.findOne({ _id: id, userId: auth.userId });
    if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicUrl = `${appUrl}/s/${survey.publicId}`;

    const qrDataUrl = await QRCode.toDataURL(publicUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#4f46e5", light: "#ffffff" },
    });

    return NextResponse.json({ qrDataUrl, publicUrl, title: survey.title });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
