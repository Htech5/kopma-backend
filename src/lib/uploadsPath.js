import path from "path";

export const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export const UPLOAD_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

// Return path absolut yang aman, atau null bila keluar dari folder uploads
// (path traversal) atau ekstensinya tidak diizinkan.
export function resolveUploadPath(segments, root = UPLOADS_ROOT) {
  if (!Array.isArray(segments) || segments.length === 0) return null;

  const filePath = path.resolve(root, ...segments);

  if (!filePath.startsWith(root + path.sep)) return null;
  if (!UPLOAD_MIME[path.extname(filePath).toLowerCase()]) return null;

  return filePath;
}
