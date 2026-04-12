import { NextResponse } from "next/server";
import db from "@/lib/db";
import slugify from "@/lib/slug";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        events.*,
        categories.name AS category_name
      FROM events
      LEFT JOIN categories ON events.category_id = categories.id
      ORDER BY events.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
  console.error("POST events error:", error);
  return NextResponse.json(
    {
      message: "Gagal menambahkan event",
      error: error.message,
      detail: error.sqlMessage || null,
    },
    { status: 500 }
  );
}
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      category_id,
      main_image,
      top_image,
      middle_image,
      content_top,
      content_bottom,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "Judul event wajib diisi" },
        { status: 400 }
      );
    }

    if (!content_top || !content_top.trim()) {
      return NextResponse.json(
        { message: "Isi berita bagian atas wajib diisi" },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    const [existing] = await db.query(
      "SELECT id FROM events WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Slug event sudah ada, ganti judul lain" },
        { status: 409 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO events
      (title, slug, category_id, main_image, top_image, middle_image, content_top, content_bottom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        slug,
        category_id ? Number(category_id) : null,
        main_image || null,
        top_image || null,
        middle_image || null,
        content_top.trim(),
        content_bottom?.trim() || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Event berhasil ditambahkan",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST events error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan event" },
      { status: 500 }
    );
  }
}