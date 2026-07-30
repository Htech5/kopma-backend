import { readFile } from "fs/promises";
import path from "path";
import { resolveUploadPath, UPLOAD_MIME } from "@/lib/uploadsPath";

// Next hanya menyajikan isi public/ yang ada saat build. File yang di-upload
// setelah deploy (events/inventaris/magazines) tidak ikut tersaji -> 404.
// Route ini membaca file-nya langsung dari disk sebagai fallback.
export async function GET(request, { params }) {
  const filePath = resolveUploadPath((await params).path);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": UPLOAD_MIME[path.extname(filePath).toLowerCase()],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
