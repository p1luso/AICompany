import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

export async function GET() {
  try {
    if (!fs.existsSync(MEMORY_PATH)) {
      return NextResponse.json({ files: [] });
    }

    const entries = fs.readdirSync(MEMORY_PATH, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => {
        const stat = fs.statSync(path.join(MEMORY_PATH, e.name));
        return {
          name: e.name,
          mtime: stat.mtimeMs,
          size: stat.size,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
