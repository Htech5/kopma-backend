import { NextResponse } from "next/server";
import db from "@/lib/db";
import slugify from "@/lib/slug";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data categories" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Kategori sudah ada" },
        { status: 409 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
      [name.trim(), slug]
    );

    return NextResponse.json(
      {
        message: "Kategori berhasil ditambahkan",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST categories error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}