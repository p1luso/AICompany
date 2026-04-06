"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { API_BASE_URL } from "@/lib/constants";
import { unlockAudio } from "@/lib/audio"; // Ensure audio is unlocked via interaction

interface MemoryFile {
  name: string;
  content: string;
}

export function MemoryViewer() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load files list when the modal is opened
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(`${API_BASE_URL || "http://localhost:8000"}/api/memory`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load");
          return res.json();
        })
        .then((data) => {
          const list = data.files || [];
          setFiles(list);
          if (list.length > 0 && !selectedFile) setSelectedFile(list[0]);
        })
        .catch((err) => {
          console.error("Error fetching memory vault", err);
          // Fallback mock if API fails
          setFiles([
            { name: "tendencias.md", content: "# Tendencias del Mercado\n\nNo pudimos conectar con la API." },
            { name: "qa_report.md", content: "## QA Report\nTodos los sistemas operativos." }
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Fetch content for the selected file
  useEffect(() => {
    if (selectedFile && !selectedFile.content) {
      fetch(`${API_BASE_URL || "http://localhost:8000"}/api/memory/${selectedFile.name}`)
        .then(res => res.json())
        .then(data => {
          if (data.content) {
            setFiles(prev => prev.map(f => f.name === selectedFile.name ? { ...f, content: data.content } : f));
            setSelectedFile(prev => prev?.name === selectedFile.name ? { ...prev, content: data.content } : prev);
          }
        })
        .catch(err => console.error("Error fetching file content", err));
    }
  }, [selectedFile]);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          unlockAudio();
        }}
        className="fixed bottom-4 right-4 z-50 font-pixel px-4 py-3 cursor-pointer hover:brightness-110 active:brightness-90 transition-all flex items-center gap-2"
        style={{
          background: "#c0c0c0",
          color: "#000",
          borderTop: "3px solid #fff",
          borderLeft: "3px solid #fff",
          borderRight: "3px solid #666",
          borderBottom: "3px solid #666",
          fontSize: "10px"
        }}
      >
        <span>📂</span> Ver Archivos (Memory Vault)
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto flex flex-col"
        style={{
          width: "min(800px, 90vw)",
          height: "min(600px, 80vh)",
          background: "#c0c0c0", // Win95 base
          borderTop: "3px solid #fff",
          borderLeft: "3px solid #fff",
          borderRight: "3px solid #666",
          borderBottom: "3px solid #666",
          fontFamily: "'MS Sans Serif', sans-serif",
          boxShadow: "4px 4px 10px rgba(0,0,0,0.5)"
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-2 py-1 shrink-0"
          style={{
            background: "#000080", // Win95 Title blue
            color: "#fff",
          }}
        >
          <span className="font-pixel text-[10px] tracking-wide font-bold">MEMORY_VAULT.EXE</span>
          <button
            onClick={() => setOpen(false)}
            className="font-pixel px-2 py-0 cursor-pointer"
            style={{
              background: "#c0c0c0",
              color: "#000",
              borderTop: "2px solid #fff",
              borderLeft: "2px solid #fff",
              borderRight: "2px solid #666",
              borderBottom: "2px solid #666",
              fontSize: "8px"
            }}
          >
            X
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden p-2 gap-2">
          {/* Sidebar - File List */}
          <div
            className="w-48 flex flex-col gap-1 overflow-y-auto p-1"
            style={{
              background: "#fff",
              borderTop: "2px solid #666",
              borderLeft: "2px solid #666",
              borderRight: "2px solid #fff",
              borderBottom: "2px solid #fff",
            }}
          >
            {loading ? (
              <div className="text-xs p-2 text-gray-500 font-pixel">Cargando...</div>
            ) : files.length === 0 ? (
              <div className="text-xs p-2 text-gray-500 font-pixel">Directorio vacío</div>
            ) : (
              files.map(f => (
                <div
                  key={f.name}
                  onClick={() => setSelectedFile(f)}
                  className="font-pixel text-[8px] p-2 cursor-pointer truncate"
                  style={{
                    background: selectedFile?.name === f.name ? "#000080" : "transparent",
                    color: selectedFile?.name === f.name ? "#fff" : "#000",
                  }}
                >
                  📝 {f.name}
                </div>
              ))
            )}
          </div>

          {/* Main Content Area */}
          <div
            className="flex-1 flex flex-col gap-2 relative"
            style={{
              background: "#fff",
              borderTop: "2px solid #666",
              borderLeft: "2px solid #666",
              borderRight: "2px solid #fff",
              borderBottom: "2px solid #fff",
            }}
          >
            <div className="flex-1 overflow-y-auto p-4 prose prose-sm prose-slate max-w-none">
              {selectedFile ? (
                <ReactMarkdown>{selectedFile.content}</ReactMarkdown>
              ) : (
                <div className="text-gray-400 font-pixel text-[10px] text-center mt-10">
                  Selecciona un archivo
                </div>
              )}
            </div>
            
            {/* Action Bar inside Content */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!selectedFile}
                className="font-pixel px-3 py-2 text-[8px] cursor-pointer active:brightness-90 transition-all font-bold"
                style={{
                  background: "#c0c0c0",
                  color: "#000",
                  borderTop: "2px solid #fff",
                  borderLeft: "2px solid #fff",
                  borderRight: "2px solid #666",
                  borderBottom: "2px solid #666",
                }}
              >
                {copied ? "¡COPIADO!" : "COPIAR AL PORTAPAPELES"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Status bar */}
        <div 
          className="px-2 py-1 font-pixel text-[8px] shrink-0"
          style={{
            borderTop: "2px solid #666",
            background: "#c0c0c0"
          }}
        >
          {loading ? "Lectura de disco en proceso..." : `${files.length} archivos en bóveda.`}
        </div>
      </div>
    </div>
  );
}
