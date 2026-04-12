import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID komentar wajib dikirim" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "UPDATE comments SET status = 'rejected' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Komentar berhasil di-reject",
    });
  } catch (error) {
    console.error("REJECT comment error:", error);
    return NextResponse.json(
      {
        message: "Gagal reject komentar",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}