import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("content_type");
    const contentId = searchParams.get("content_id");
    const status = searchParams.get("status");

    let query = `
      SELECT id, name, email, content_type, content_id, comment, status, created_at
      FROM comments
    `;
    const conditions = [];
    const values = [];

    if (contentType) {
      conditions.push("content_type = ?");
      values.push(contentType);
    }

    if (contentId) {
      conditions.push("content_id = ?");
      values.push(contentId);
    }

    if (status) {
      conditions.push("status = ?");
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data komentar",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const content_type = (body.content_type || "").trim();
    const content_id = Number(body.content_id);
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const comment = (body.comment || "").trim();

    if (!content_type || !content_id || !name || !email || !comment) {
      return NextResponse.json(
        {
          message:
            "content_type, content_id, name, email, dan comment wajib diisi",
        },
        { status: 400 }
      );
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO comments (name, email, content_type, content_id, comment, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
      `,
      [name, email, content_type, content_id, comment]
    );

    return NextResponse.json(
      {
        message: "Komentar berhasil dikirim dan menunggu moderasi",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST comments error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengirim komentar",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}