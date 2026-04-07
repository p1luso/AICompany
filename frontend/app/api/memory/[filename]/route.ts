import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Decode filename to handle slashes correctly
  const decodedPath = decodeURIComponent(params.filename);
  const resolvedMemoryPath = path.resolve(MEMORY_PATH);
  const filePath = path.join(resolvedMemoryPath, decodedPath);

  // Security: Prevent path traversal
  if (!filePath.startsWith(resolvedMemoryPath)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Ensure it's an allowed file type
  const allowedExtensions = [".md", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".txt"];
  const ext = path.extname(filePath).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ filename: decodedPath, content });
  } catch (error) {
    console.error("Error reading memory file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
