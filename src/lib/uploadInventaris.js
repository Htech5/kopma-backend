import { put, del } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB

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

function isPdf(buffer) {
  return buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
}

async function uploadToBlob(buffer, prefix, ext, contentType) {
  const pathname = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { url } = await put(pathname, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return url; // URL absolut permanen — disimpan ke DB
}

// Gambar (inventaris & events). Validasi magic byte + ukuran, lalu simpan ke Blob.
export async function putImage(file, prefix) {
  if (!file) return null;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("INVALID_UPLOAD: ukuran gambar maksimal 5MB");
  }
  const ext = sniffImageExt(buffer);
  if (!ext) {
    throw new Error("INVALID_UPLOAD: file harus gambar JPEG/PNG/WebP");
  }
  const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  return uploadToBlob(buffer, prefix, ext, contentType);
}

// PDF (magazine). Validasi magic byte + ukuran, lalu simpan ke Blob.
export async function putPdf(file, prefix) {
  if (!file) return null;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length > MAX_PDF_BYTES) {
    throw new Error("INVALID_UPLOAD: ukuran PDF maksimal 50MB");
  }
  if (!isPdf(buffer)) {
    throw new Error("INVALID_UPLOAD: file harus PDF");
  }
  return uploadToBlob(buffer, prefix, "pdf", "application/pdf");
}

// Hapus blob lama. Aman dipanggil dengan URL apa pun (del() gratis).
export async function deleteBlob(url) {
  if (!url || !/^https?:\/\//i.test(url)) return; // lewati path lokal lama
  try {
    await del(url);
  } catch {
    // ignore — file mungkin sudah tidak ada
  }
}

// Kompat mundur: dipakai route inventaris.
export async function saveInventarisImage(file) {
  return putImage(file, "inventaris");
}
