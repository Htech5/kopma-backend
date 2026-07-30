import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ message: "Tidak diautentikasi" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID komentar wajib dikirim" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "UPDATE comments SET status = 'approved' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Komentar berhasil di-approve",
    });
  } catch (error) {
    console.error("APPROVE comment error:", error);
    return NextResponse.json(
      {
        message: "Gagal approve komentar",
      },
      { status: 500 }
    );
  }
}