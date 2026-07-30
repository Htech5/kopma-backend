import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { putImage } from "@/lib/uploadInventaris";

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

    // putImage: validasi magic byte + ukuran (5MB), simpan ke Vercel Blob.
    const filePath = await putImage(file, "events");

    return NextResponse.json({ message: "Upload berhasil", filePath });
  } catch (error) {
    if (String(error?.message).startsWith("INVALID_UPLOAD:")) {
      return NextResponse.json(
        { message: error.message.replace("INVALID_UPLOAD: ", "") },
        { status: 400 }
      );
    }
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ message: "Gagal upload file" }, { status: 500 });
  }
}
