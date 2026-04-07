import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";

const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderPath = searchParams.get("path");

  if (!folderPath) {
    return NextResponse.json({ error: "No path provided" }, { status: 400 });
  }

  const fullPath = path.join(MEMORY_PATH, folderPath);

  // Seguridad: evitar Path Traversal
  if (!fullPath.startsWith(MEMORY_PATH)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  const stat = fs.statSync(fullPath);
  if (!stat.isDirectory()) {
    return NextResponse.json({ error: "Target is not a directory" }, { status: 400 });
  }

  const zipName = `${path.basename(fullPath)}.zip`;

  // Crear el archivo ZIP en memoria (stream)
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  // Convert Node.js stream to Web Stream for Next.js Response compatibility
  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => controller.enqueue(chunk));
      archive.on("end", () => controller.close());
      archive.on("error", (err) => controller.error(err));
      archive.directory(fullPath, false);
      archive.finalize();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
    },
  });
}
