import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    return NextResponse.json({ success: true, rows });
  } catch (error) {
    console.error("DB TEST ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
