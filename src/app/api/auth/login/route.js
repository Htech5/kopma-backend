import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    console.log("LOGIN: request received");

    const body = await req.json();
    const { email, password } = body;

    const cleanEmail = email?.trim();
    const cleanPassword = password?.trim();

    console.log("LOGIN: parsed body", { email: cleanEmail });

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT id, email, name, password, failed_attempts, locked_until
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    console.log("LOGIN: query success, rows:", rows.length);

    if (!rows || rows.length === 0) {
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

    if (!admin.password) {
      throw new Error("Password admin kosong atau tidak ditemukan di database");
    }

    const isMatch = await bcrypt.compare(cleanPassword, admin.password);
    console.log("LOGIN: bcrypt compare:", isMatch);

    if (!isMatch) {
      let failedAttempts = Number(admin.failed_attempts || 0) + 1;
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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET belum diset di environment production");
    }

    const token = createToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });

    console.log("LOGIN: token created");

    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR FULL:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server",
        error: error.message,
        code: error.code || null,
      },
      { status: 500 }
    );
  }
}
