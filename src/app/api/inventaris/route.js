import { NextResponse } from "next/server";
import db from "@/lib/db";
import { saveInventarisImage } from "@/lib/uploadInventaris";

function buildImageUrl(apiBase, imagePath) {
  if (!imagePath || typeof imagePath !== "string") return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${cleanBase}${cleanPath}`;
}

function mapInventarisRow(row, apiBase) {
  return {
    id: row.id,
    nama: row.nama,
    gambar: buildImageUrl(apiBase, row.gambar),
    harga: row.harga !== null ? Number(row.harga) : null,
    stok: row.stok !== null ? Number(row.stok) : 0,
    stok_tersedia:
      row.stok_tersedia !== null ? Number(row.stok_tersedia) : 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(request) {
  try {
    const apiBase =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";

    const { searchParams } = new URL(request.url);
    const keyword = (searchParams.get("keyword") || "").trim();

    let query = `
      SELECT id, nama, gambar, harga, stok, stok_tersedia, created_at, updated_at
      FROM inventaris
    `;
    const values = [];

    if (keyword) {
      query += ` WHERE nama LIKE ?`;
      values.push(`%${keyword}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.query(query, values);

    return NextResponse.json(rows.map((row) => mapInventarisRow(row, apiBase)));
  } catch (error) {
    console.error("GET inventaris error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data inventaris",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const nama = String(formData.get("nama") || "").trim();
    const harga = Number(formData.get("harga") || 0);
    const stok = Number(formData.get("stok") || 0);
    const stok_tersedia = Number(formData.get("stok_tersedia") || 0);
    const gambarFile = formData.get("gambar");

    if (!nama) {
      return NextResponse.json(
        { message: "Nama inventaris wajib diisi" },
        { status: 400 }
      );
    }

    let gambarPath = null;

    if (gambarFile && typeof gambarFile === "object" && gambarFile.size > 0) {
      gambarPath = await saveInventarisImage(gambarFile);
    }

    const [result] = await db.query(
      `
      INSERT INTO inventaris (nama, gambar, harga, stok, stok_tersedia)
      VALUES (?, ?, ?, ?, ?)
      `,
      [nama, gambarPath, harga, stok, stok_tersedia]
    );

    return NextResponse.json(
      {
        message: "Inventaris berhasil ditambahkan",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST inventaris error:", error);
    return NextResponse.json(
      {
        message: "Gagal menambahkan inventaris",
        detail: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}