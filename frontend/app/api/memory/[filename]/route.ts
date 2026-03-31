import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  // Sanitize: allow only alphanumeric, dash, underscore, dot
  if (!/^[\w\-\.]+\.md$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(MEMORY_PATH, filename);

  // Prevent path traversal
  if (!filePath.startsWith(MEMORY_PATH)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ filename, content });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
