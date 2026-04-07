import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Configurable via env: MEMORY_PATH=/path/to/memory
const MEMORY_PATH = process.env.MEMORY_PATH || path.join(process.cwd(), "memory");

// Each agent maps to one or more files it "owns"
const AGENT_FILES: Record<string, string[]> = {
  alice:    ["tendencias.md", "research.md", "contexto_marca.md"],
  scribe:   ["borradores_copy.md", "copy_final.md", "feedback_copy.md"],
  sentinel: ["qa_report.md", "errores.md", "validacion.md", "security_audit_"],
  atlas:    ["implementacion.md", "arquitectura.md"],
  luna:     ["test_report.md", "calidad.md"],
  nova:     ["design_concept.md", "ui_ux_guide.md"],
};

function getFileMtime(filename: string): number | null {
  try {
    const filePath = path.join(MEMORY_PATH, filename);
    const stat = fs.statSync(filePath);
    return stat.mtimeMs;
  } catch {
    return null;
  }
}

function getLatestMtime(files: string[]): { mtime: number | null; file: string | null } {
  let latest: number | null = null;
  let latestFile: string | null = null;

  for (const file of files) {
    const mtime = getFileMtime(file);
    if (mtime !== null && (latest === null || mtime > latest)) {
      latest = mtime;
      latestFile = file;
    }
  }
  return { mtime: latest, file: latestFile };
}

function inferState(mtime: number | null): "idle" | "active" {
  if (mtime === null) return "idle";
  const ageMs = Date.now() - mtime;
  // Active if modified within last 30 seconds
  return ageMs < 30_000 ? "active" : "idle";
}

export async function GET() {
  const agents = Object.entries(AGENT_FILES).map(([agentId, files]) => {
    const { mtime, file } = getLatestMtime(files);
    return {
      id: agentId,
      state: inferState(mtime),
      lastModified: mtime,
      lastFile: file,
    };
  });

  return NextResponse.json({ agents, memoryPath: MEMORY_PATH });
}
