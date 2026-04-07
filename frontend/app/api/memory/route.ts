import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

interface MemoryEntry {
  name: string;
  type: "file" | "directory";
  path: string;
  mtime?: number;
  size?: number;
  children?: MemoryEntry[];
}

function scanDirectory(dirPath: string, relativePath: string = ""): MemoryEntry[] {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  const results: MemoryEntry[] = [];

  for (const e of entries) {
    const fullPath = path.join(dirPath, e.name);
    const relPath = path.join(relativePath, e.name);
    const isDirectory = e.isDirectory();

    if (isDirectory) {
      results.push({
        name: e.name,
        type: "directory",
        path: relPath,
        children: scanDirectory(fullPath, relPath),
      });
    } else {
      const allowedExtensions = [".md", ".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".txt"];
      if (allowedExtensions.some(ext => e.name.endsWith(ext))) {
        const stat = fs.statSync(fullPath);
        results.push({
          name: e.name,
          type: "file",
          path: relPath,
          mtime: stat.mtimeMs,
          size: stat.size,
        });
      }
    }
  }

  return results.sort((a, b) => {
    // Directories first, then files by mtime
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return (b.mtime || 0) - (a.mtime || 0);
  });
}

export async function GET() {
  try {
    const files = scanDirectory(MEMORY_PATH);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error scanning memory:", error);
    return NextResponse.json({ files: [] });
  }
}
