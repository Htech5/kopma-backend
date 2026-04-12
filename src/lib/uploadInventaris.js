import fs from "fs/promises";
import path from "path";

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

  await ensureInventarisUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = sanitizeFileName(file.name || "inventaris-image");
  const finalName = `${Date.now()}-${originalName}`;
  const finalPath = path.join(INVENTARIS_UPLOAD_DIR, finalName);

  await fs.writeFile(finalPath, buffer);

  return `/uploads/inventaris/${finalName}`;
}