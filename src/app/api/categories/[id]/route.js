import { NextResponse } from "next/server";
import db from "@/lib/db";
import slugify from "@/lib/slug";

export async function GET(_, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (!Number.isFinite(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT * FROM categories WHERE id = ? LIMIT 1",
      [categoryId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET category detail error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail kategori" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);
    const body = await request.json();
    const { name } = body;

    if (!Number.isFinite(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1",
      [slug, categoryId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Slug kategori sudah dipakai" },
        { status: 409 }
      );
    }

    const [result] = await db.query(
      "UPDATE categories SET name = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name.trim(), slug, categoryId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Kategori berhasil diupdate",
    });
  } catch (error) {
    console.error("PUT category error:", error);
    return NextResponse.json(
      { message: "Gagal update kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(_, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (!Number.isFinite(categoryId)) {
      return NextResponse.json(
        { message: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "DELETE FROM categories WHERE id = ?",
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE category error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}