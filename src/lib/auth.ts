import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthPayload {
  userId: string;
  email: string;
  role: "admin" | "employee";
  adminId: string | null;
}

export function signToken(payload: { userId: string; email: string; role?: string; adminId?: string | null }) {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role || "admin", adminId: payload.adminId || null },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
  return { userId: decoded.userId, email: decoded.email, role: decoded.role || "admin", adminId: decoded.adminId || null };
}

// Cookie-based auth (web)
export async function getUser(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

// Cookie-first, then Bearer token (supports both web and mobile)
export async function getAuth(req: NextRequest): Promise<AuthPayload | null> {
  // Try cookie first
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) {
    try {
      return verifyToken(cookieToken);
    } catch { /* fall through */ }
  }
  // Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return verifyToken(authHeader.slice(7));
    } catch { /* fall through */ }
  }
  return null;
}

export function requireAdmin(auth: AuthPayload | null): auth is AuthPayload {
  return auth !== null && auth.role === "admin";
}

export function requireEmployee(auth: AuthPayload | null): auth is AuthPayload {
  return auth !== null && auth.role === "employee";
}
