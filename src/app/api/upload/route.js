import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth";
import { sniffImageExt, MAX_IMAGE_BYTES } from "@/lib/uploadInventaris";

export async function POST(request) {
  try {
    if (!(await requireAuth())) {
      return NextResponse.json({ message: "Tidak diautentikasi" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    // Validasi magic byte, bukan MIME/ekstensi dari client (tolak SVG dll).
    const ext = sniffImageExt(buffer);
    if (!ext) {
      return NextResponse.json(
        { message: "File harus berupa gambar JPEG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/events");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      message: "Upload berhasil",
      filePath: `/uploads/events/${filename}`,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json(
      { message: "Gagal upload file" },
      { status: 500 }
    );
  }
}