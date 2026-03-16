import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { getAuth, requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import SurveyAssignment from "@/models/SurveyAssignment";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    if (!requireAdmin(auth)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const employees = await User.find({ adminId: auth.userId, role: "employee" }).select("-password").sort({ createdAt: -1 }).lean();

    // Get assignment counts
    const assignmentCounts = await SurveyAssignment.aggregate([
      { $match: { employeeId: { $in: employees.map((e) => e._id) }, isActive: true } },
      { $group: { _id: "$employeeId", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    assignmentCounts.forEach((a) => { countMap[a._id.toString()] = a.count; });

    const employeesWithCounts = employees.map((e) => ({ ...e, assignedSurveys: countMap[e._id.toString()] || 0 }));
    return NextResponse.json({ employees: employeesWithCounts });
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
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const employee = await User.create({
      name,
      email,
      password: hashed,
      role: "employee",
      adminId: auth.userId,
      phone: phone || "",
    });

    return NextResponse.json({
      employee: { _id: employee._id, name: employee.name, email: employee.email, phone: employee.phone, role: employee.role, createdAt: employee.createdAt },
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
