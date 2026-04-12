import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM magazines ORDER BY year DESC, created_at DESC"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET magazines error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data magazine" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const year = formData.get("year");
    const file = formData.get("file");

    if (!title || !year || !file) {
      return NextResponse.json(
        { message: "Judul, tahun, dan file wajib diisi" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "File harus berupa PDF" },
        { status: 400 }
      );
    }

    const maxSizeBytes = 50 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 50 MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads/magazines");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = file.name.replace(/\s+/g, "-");
    const fileName = `${Date.now()}-${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const pdfFile = `/uploads/magazines/${fileName}`;

    await pool.query(
      "INSERT INTO magazines (title, year, pdf_file) VALUES (?, ?, ?)",
      [title, year, pdfFile]
    );

    return NextResponse.json(
      { message: "Magazine berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST magazines error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan magazine" },
      { status: 500 }
    );
  }
}