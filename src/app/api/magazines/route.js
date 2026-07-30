import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { putPdf } from "@/lib/uploadInventaris";

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
    if (!(await requireAuth())) {
      return NextResponse.json({ message: "Tidak diautentikasi" }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get("title");
    const year = formData.get("year");
    const file = formData.get("file");

    if (!title || !year || !file || typeof file === "string") {
      return NextResponse.json(
        { message: "Judul, tahun, dan file wajib diisi" },
        { status: 400 }
      );
    }

    // putPdf: validasi magic byte + ukuran (50MB), simpan ke Vercel Blob.
    const pdfFile = await putPdf(file, "magazines");

    await pool.query(
      "INSERT INTO magazines (title, year, pdf_file) VALUES (?, ?, ?)",
      [title, year, pdfFile]
    );

    return NextResponse.json(
      { message: "Magazine berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (error) {
    if (String(error?.message).startsWith("INVALID_UPLOAD:")) {
      return NextResponse.json(
        { message: error.message.replace("INVALID_UPLOAD: ", "") },
        { status: 400 }
      );
    }
    console.error("POST magazines error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan magazine" },
      { status: 500 }
    );
  }
}