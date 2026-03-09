import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  try {
    const auth = await getUser();
    if (!auth) return NextResponse.json({ user: null }, { status: 401 });

    await connectDB();
    const user = await User.findById(auth.userId).select("-password");
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
