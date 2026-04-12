import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query(
      "SELECT * FROM comments WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET comment detail error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil detail komentar",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_, context) {
  try {
    const { id } = await context.params;

    const [result] = await db.query("DELETE FROM comments WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Komentar berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE comment error:", error);
    return NextResponse.json(
      {
        message: "Gagal menghapus komentar",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}