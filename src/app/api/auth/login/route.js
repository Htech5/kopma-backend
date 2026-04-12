import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = email?.trim();
    const cleanPassword = password?.trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const admin = rows[0];
    const now = new Date();

    if (admin.locked_until && new Date(admin.locked_until) > now) {
      return NextResponse.json(
        { message: "Akun terkunci. Coba lagi 5 menit lagi." },
        { status: 423 }
      );
    }

    const isMatch = await bcrypt.compare(cleanPassword, admin.password);

    if (!isMatch) {
      let failedAttempts = (admin.failed_attempts || 0) + 1;
      let lockedUntil = null;

      if (failedAttempts >= 5) {
        lockedUntil = new Date(now.getTime() + 5 * 60 * 1000);
        failedAttempts = 0;
      }

      await pool.query(
        "UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?",
        [failedAttempts, lockedUntil, admin.id]
      );

      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    await pool.query(
      "UPDATE admins SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
      [admin.id]
    );

    const token = createToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json(
      { message: "Login berhasil" },
      { status: 200 }
    );

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}