import { NextResponse } from "next/server";
import db from "@/lib/db";
import slugify from "@/lib/slug";

export async function GET(_, context) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query(
      "SELECT * FROM events WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET event detail error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
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
      "SELECT id FROM events WHERE slug = ? AND id != ? LIMIT 1",
      [slug, id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Slug event sudah dipakai event lain" },
        { status: 409 }
      );
    }

    const [result] = await db.query(
      `UPDATE events
       SET title = ?, slug = ?, category_id = ?, main_image = ?, top_image = ?, middle_image = ?, content_top = ?, content_bottom = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title.trim(),
        slug,
        category_id ? Number(category_id) : null,
        main_image || null,
        top_image || null,
        middle_image || null,
        content_top.trim(),
        content_bottom?.trim() || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT event error:", error);
    return NextResponse.json(
      { message: "Gagal update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(_, context) {
  try {
    const { id } = await context.params;

    const [result] = await db.query("DELETE FROM events WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Event berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE event error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus event" },
      { status: 500 }
    );
  }
}