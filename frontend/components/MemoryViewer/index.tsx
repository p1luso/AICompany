"use client";

import { useEffect, useState, useCallback } from "react";

interface MemoryFile {
  name: string;
  mtime: number;
  size: number;
}

export function MemoryViewer() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch file list
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/memory");
      if (!res.ok) return;
      const data = await res.json() as { files: MemoryFile[] };
      setFiles(data.files);
    } catch {
      // server not ready
    }
  }, []);

  // Fetch file content
  const fetchContent = useCallback(async (filename: string) => {
    setLoading(true);
    setContent("");
    try {
      const res = await fetch(`/api/memory/${encodeURIComponent(filename)}`);
      if (!res.ok) {
        setContent("// File not found or empty");
        return;
      }
      const data = await res.json() as { content: string };
      setContent(data.content);
    } catch {
      setContent("// Error reading file");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 10_000);
    return () => clearInterval(interval);
  }, [fetchFiles]);

  useEffect(() => {
    if (selected) fetchContent(selected);
  }, [selected, fetchContent]);

  const formatTime = (mtime: number) =>
    new Date(mtime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}b`;
    return `${(bytes / 1024).toFixed(1)}kb`;
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#001100", border: "4px solid #00ff41" }}>

      {/* ── HEADER ────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2 font-pixel"
        style={{ background: "#003300", borderBottom: "3px solid #00ff41", fontSize: "8px" }}
      >
        <span style={{ color: "#00ff41" }}>📁</span>
        <span style={{ color: "#00ff41" }}>MEMORY VAULT</span>
        <span className="ml-auto terminal-cursor" style={{ color: "#00ff41", fontSize: "10px" }} />
      </div>

      {/* ── FILE LIST ─────────────────────────────── */}
      <div
        className="font-pixel overflow-y-auto"
        style={{ maxHeight: "160px", borderBottom: "3px solid #004400" }}
      >
        {files.length === 0 ? (
          <div className="p-3" style={{ color: "#005500", fontSize: "7px" }}>
            <p>// No memory files found</p>
            <p className="mt-1">// MEMORY_PATH not mounted</p>
          </div>
        ) : (
          files.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelected(file.name)}
              className="w-full text-left flex items-center gap-2 px-3 py-1.5 transition-colors"
              style={{
                background: selected === file.name ? "#003300" : "transparent",
                borderBottom: "1px solid #002200",
                color: selected === file.name ? "#00ff41" : "#008800",
                fontSize: "7px",
              }}
            >
              <span style={{ fontSize: "10px" }}>📄</span>
              <span className="flex-1 truncate">{file.name}</span>
              <span style={{ color: "#005500", fontSize: "6px" }}>
                {formatSize(file.size)} · {formatTime(file.mtime)}
              </span>
            </button>
          ))
        )}
      </div>

      {/* ── TERMINAL VIEWER ───────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Terminal header */}
        <div
          className="flex items-center gap-2 px-3 py-1 font-pixel"
          style={{ background: "#002200", borderBottom: "2px solid #004400", fontSize: "7px", color: "#008800" }}
        >
          <span>$</span>
          <span style={{ color: "#00ff41" }}>
            {selected ? `cat ${selected}` : "select a file..."}
          </span>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-3 font-mono"
          style={{ color: "#00ff41", fontSize: "8px", lineHeight: "1.6", background: "#001100" }}
        >
          {loading ? (
            <span style={{ color: "#005500" }}>Loading<span className="terminal-cursor" /></span>
          ) : !selected ? (
            <div style={{ color: "#003300" }}>
              <p>{">"} Luva Mission Control</p>
              <p>{">"} Memory Vault v1.0</p>
              <p>{">"} Select a file to inspect</p>
              <span className="terminal-cursor" />
            </div>
          ) : content ? (
            <pre className="whitespace-pre-wrap break-words">{content}</pre>
          ) : (
            <span style={{ color: "#005500" }}>// Empty file<span className="terminal-cursor" /></span>
          )}
        </div>
      </div>

      {/* ── STATUS BAR ────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-3 py-1 font-pixel"
        style={{ background: "#003300", borderTop: "2px solid #004400", fontSize: "6px", color: "#006600" }}
      >
        <span>{files.length} files</span>
        <span className="ml-auto">Polling: 10s</span>
      </div>
    </div>
  );
}
