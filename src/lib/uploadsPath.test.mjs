// node src/lib/uploadsPath.test.mjs
import assert from "assert";
import path from "path";
import { resolveUploadPath } from "./uploadsPath.js";

const root = path.resolve("/app/public/uploads");

assert.equal(
  resolveUploadPath(["events", "foto.png"], root),
  path.join(root, "events", "foto.png")
);
assert.equal(resolveUploadPath(["magazines", "a.pdf"], root), path.join(root, "magazines", "a.pdf"));
assert.equal(resolveUploadPath(["..", "..", ".env.local"], root), null, "traversal harus ditolak");
assert.equal(resolveUploadPath(["events", "..", "..", "db.js"], root), null, "traversal harus ditolak");
assert.equal(resolveUploadPath(["events", "payload.svg"], root), null, "svg harus ditolak");
assert.equal(resolveUploadPath([], root), null);

console.log("ok");
