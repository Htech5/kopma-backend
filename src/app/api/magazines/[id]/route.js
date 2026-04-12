import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const [rows] = await pool.query(
      "SELECT * FROM magazines WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Magazine tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET detail magazine error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail magazine" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get("title");
    const year = formData.get("year");
    const file = formData.get("file");

    if (!title || !year) {
      return NextResponse.json(
        { message: "Judul dan tahun wajib diisi" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      "SELECT * FROM magazines WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Magazine tidak ditemukan" },
        { status: 404 }
      );
    }

    let pdfFile = rows[0].pdf_file;

    if (file && file.size > 0) {
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

      pdfFile = `/uploads/magazines/${fileName}`;
    }

    await pool.query(
      "UPDATE magazines SET title = ?, year = ?, pdf_file = ? WHERE id = ?",
      [title, year, pdfFile, id]
    );

    return NextResponse.json({ message: "Magazine berhasil diupdate" });
  } catch (error) {
    console.error("PUT magazine error:", error);
    return NextResponse.json(
      { message: "Gagal mengupdate magazine" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await pool.query("DELETE FROM magazines WHERE id = ?", [id]);

    return NextResponse.json({ message: "Magazine berhasil dihapus" });
  } catch (error) {
    console.error("DELETE magazine error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus magazine" },
      { status: 500 }
    );
  }
}