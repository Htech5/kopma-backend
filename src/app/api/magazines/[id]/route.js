import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { putPdf, deleteBlob } from "@/lib/uploadInventaris";

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
    if (!(await requireAuth())) {
      return NextResponse.json({ message: "Tidak diautentikasi" }, { status: 401 });
    }

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

    if (file && typeof file !== "string" && file.size > 0) {
      const oldPdf = pdfFile;
      pdfFile = await putPdf(file, "magazines"); // validasi + simpan ke Blob
      await deleteBlob(oldPdf); // hapus PDF lama (aman bila path lokal lama)
    }

    await pool.query(
      "UPDATE magazines SET title = ?, year = ?, pdf_file = ? WHERE id = ?",
      [title, year, pdfFile, id]
    );

    return NextResponse.json({ message: "Magazine berhasil diupdate" });
  } catch (error) {
    if (String(error?.message).startsWith("INVALID_UPLOAD:")) {
      return NextResponse.json(
        { message: error.message.replace("INVALID_UPLOAD: ", "") },
        { status: 400 }
      );
    }
    console.error("PUT magazine error:", error);
    return NextResponse.json(
      { message: "Gagal mengupdate magazine" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ message: "Tidak diautentikasi" }, { status: 401 });
    }

    const { id } = await params;

    const [rows] = await pool.query(
      "SELECT pdf_file FROM magazines WHERE id = ?",
      [id]
    );

    await pool.query("DELETE FROM magazines WHERE id = ?", [id]);

    if (rows[0]?.pdf_file) await deleteBlob(rows[0].pdf_file);

    return NextResponse.json({ message: "Magazine berhasil dihapus" });
  } catch (error) {
    console.error("DELETE magazine error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus magazine" },
      { status: 500 }
    );
  }
}