import { redirect } from "next/navigation";

export default function HomePage() {
  // Root langsung ke login; middleware yang lempar ke dashboard kalau sudah punya token.
  redirect("/login");
}
