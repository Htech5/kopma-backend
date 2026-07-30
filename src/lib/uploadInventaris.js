import fs from "fs/promises";
import path from "path";

// Sniff magic byte — jangan percaya file.type/ekstensi (bisa dipalsukan).
// Tolak SVG (bisa berisi <script>) dan file non-gambar.
export function sniffImageExt(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const INVENTARIS_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "inventaris"
);

export async function ensureInventarisUploadDir() {
  await fs.mkdir(INVENTARIS_UPLOAD_DIR, { recursive: true });
}

export function sanitizeFileName(fileName = "file") {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

export async function saveInventarisImage(file) {
  if (!file) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("INVALID_UPLOAD: ukuran file maksimal 5MB");
  }

  const ext = sniffImageExt(buffer);
  if (!ext) {
    throw new Error("INVALID_UPLOAD: file harus gambar JPEG/PNG/WebP");
  }

  await ensureInventarisUploadDir();

  // Nama file dari ekstensi hasil sniff, bukan dari nama asli yang dikontrol user.
  const finalName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const finalPath = path.join(INVENTARIS_UPLOAD_DIR, finalName);

  await fs.writeFile(finalPath, buffer);

  return `/uploads/inventaris/${finalName}`;
}