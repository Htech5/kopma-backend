import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { saveInventarisImage } from "@/lib/uploadInventaris";

async function removeOldImage(imagePath) {
  if (!imagePath) return;
  if (!imagePath.startsWith("/uploads/inventaris/")) return;

  const absolutePath = path.join(process.cwd(), "public", imagePath);

  try {
    await fs.unlink(absolutePath);
  } catch {
    // ignore
  }
}

export async function GET(_, context) {
  try {
    const apiBase =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api.ukmkopmaunnes.com";

    const { id } = await context.params;

    const [rows] = await db.query(
      `
      SELECT id, nama, gambar, harga, stok, stok_tersedia, created_at, updated_at
      FROM inventaris
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = rows[0];
    const gambar =
      row.gambar && /^https?:\/\//i.test(row.gambar)
        ? row.gambar
        : row.gambar
        ? `${apiBase}${row.gambar.startsWith("/") ? row.gambar : `/${row.gambar}`}`
        : null;

    return NextResponse.json({
      ...row,
      gambar,
    });
  } catch (error) {
    console.error("GET detail inventaris error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil detail inventaris",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;

    const [existingRows] = await db.query(
      `SELECT * FROM inventaris WHERE id = ? LIMIT 1`,
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = existingRows[0];
    const formData = await request.formData();

    const nama = String(formData.get("nama") || existing.nama).trim();
    const harga = Number(formData.get("harga") ?? existing.harga ?? 0);
    const stok = Number(formData.get("stok") ?? existing.stok ?? 0);
    const stok_tersedia = Number(
      formData.get("stok_tersedia") ?? existing.stok_tersedia ?? 0
    );

    const gambarFile = formData.get("gambar");
    const hapusGambar = String(formData.get("hapus_gambar") || "") === "true";

    let gambarPath = existing.gambar;

    if (hapusGambar) {
      await removeOldImage(existing.gambar);
      gambarPath = null;
    }

    if (gambarFile && typeof gambarFile === "object" && gambarFile.size > 0) {
      const newImagePath = await saveInventarisImage(gambarFile);
      if (existing.gambar) {
        await removeOldImage(existing.gambar);
      }
      gambarPath = newImagePath;
    }

    await db.query(
      `
      UPDATE inventaris
      SET nama = ?, gambar = ?, harga = ?, stok = ?, stok_tersedia = ?
      WHERE id = ?
      `,
      [nama, gambarPath, harga, stok, stok_tersedia, id]
    );

    return NextResponse.json({
      message: "Inventaris berhasil diperbarui",
    });
  } catch (error) {
    console.error("PUT inventaris error:", error);
    return NextResponse.json(
      {
        message: "Gagal memperbarui inventaris",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_, context) {
  try {
    const { id } = await context.params;

    const [rows] = await db.query(
      `SELECT gambar FROM inventaris WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Inventaris tidak ditemukan" },
        { status: 404 }
      );
    }

    const oldImage = rows[0].gambar;

    await db.query(`DELETE FROM inventaris WHERE id = ?`, [id]);

    if (oldImage) {
      await removeOldImage(oldImage);
    }

    return NextResponse.json({
      message: "Inventaris berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE inventaris error:", error);
    return NextResponse.json(
      {
        message: "Gagal menghapus inventaris",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}