import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export function createToken(payload) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET tidak ditemukan");
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token) {
  try {
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Gerbang auth untuk route API. Return payload admin bila token valid, null bila tidak.
export async function requireAuth() {
  const token = (await cookies()).get("admin_token")?.value;
  return token ? verifyToken(token) : null;
}
