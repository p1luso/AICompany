"use client";

import { useState, useRef, useCallback } from "react";
import { TaskRequest } from "@/types";
import { createTask } from "@/lib/api";
import { useTaskStore } from "@/store/taskStore";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
}

export function TaskModal({ open, onClose }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createTask: storeCreateTask } = useTaskStore();

  // Read .md file content
  const readFile = useCallback((file: File) => {
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      setError("Solo archivos .md o .txt");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDescription(content);
      if (!title) {
        setTitle(file.name.replace(/\.(md|txt)$/, "").replace(/[-_]/g, " "));
      }
      setError(null);
    };
    reader.readAsText(file);
  }, [title]);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [readFile]);

  // Paste handler for .md content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          readFile(file);
          return;
        }
      }
    }
    // Otherwise let normal paste happen
  }, [readFile]);

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim() || title.length < 5) {
      setError("Titulo: min 5 caracteres");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError("Descripcion: min 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      const req: TaskRequest = { title, description, priority };
      const res = await createTask(req);
      storeCreateTask(req, res.task_id);
      setSuccess(true);
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg mx-4"
        style={{
          background: "#0f0f1f",
          border: "4px solid #ffd700",
          boxShadow: "0 0 30px rgba(255,215,0,0.15), 8px 8px 0 #b8860b",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: "3px solid #0f3460" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "14px" }}>📋</span>
            <span className="font-pixel" style={{ fontSize: "9px", color: "#ffd700" }}>
              NUEVA TAREA
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-pixel"
            style={{ fontSize: "10px", color: "#ef5350", background: "none", border: "none", cursor: "pointer" }}
          >
            [X]
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="font-pixel block mb-1" style={{ fontSize: "7px", color: "#4fc3f7" }}>
              TITULO
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reciclar video de YouTube"
              className="w-full px-3 py-2 font-pixel"
              style={{
                fontSize: "8px",
                background: "#1a1a2e",
                border: "2px solid #0f3460",
                color: "#e2e8f0",
                outline: "none",
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="font-pixel block mb-1" style={{ fontSize: "7px", color: "#4fc3f7" }}>
              PRIORIDAD
            </label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className="font-pixel px-3 py-1"
                  style={{
                    fontSize: "7px",
                    background: priority === p ? (p === "high" ? "#ef535033" : p === "medium" ? "#ffd70033" : "#39ff1433") : "#1a1a2e",
                    border: `2px solid ${priority === p ? (p === "high" ? "#ef5350" : p === "medium" ? "#ffd700" : "#39ff14") : "#0f3460"}`,
                    color: priority === p ? (p === "high" ? "#ef5350" : p === "medium" ? "#ffd700" : "#39ff14") : "#555",
                    cursor: "pointer",
                  }}
                >
                  {p === "high" ? "ALTA" : p === "medium" ? "MEDIA" : "BAJA"}
                </button>
              ))}
            </div>
          </div>

          {/* Description / Drop zone */}
          <div>
            <label className="font-pixel block mb-1" style={{ fontSize: "7px", color: "#4fc3f7" }}>
              CONTENIDO / TRANSCRIPCION
            </label>
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative"
              style={{
                border: `2px ${isDragging ? "dashed" : "solid"} ${isDragging ? "#ffd700" : "#0f3460"}`,
                background: isDragging ? "#ffd70008" : "#1a1a2e",
                transition: "all 0.2s",
              }}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onPaste={handlePaste}
                placeholder={"Pega tu transcripcion aca...\n\nO arrastra un archivo .md"}
                rows={8}
                className="w-full px-3 py-2 font-pixel resize-none"
                style={{
                  fontSize: "7px",
                  lineHeight: "14px",
                  background: "transparent",
                  color: "#b0b0b0",
                  outline: "none",
                  border: "none",
                }}
              />

              {/* Drag overlay */}
              {isDragging && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(255,215,0,0.08)" }}
                >
                  <span className="font-pixel" style={{ fontSize: "10px", color: "#ffd700" }}>
                    SOLTAR .MD AQUI
                  </span>
                </div>
              )}
            </div>

            {/* File button */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="font-pixel"
                style={{
                  fontSize: "6px",
                  color: "#888",
                  background: "none",
                  border: "1px solid #333",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
              >
                CARGAR .MD
              </button>
              {description && (
                <span className="font-pixel" style={{ fontSize: "6px", color: "#555" }}>
                  {description.length} chars
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFile(file);
              }}
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="font-pixel px-2 py-1" style={{ fontSize: "7px", color: "#ef5350", border: "1px solid #ef535044", background: "#ef535011" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="font-pixel px-2 py-1" style={{ fontSize: "7px", color: "#39ff14", border: "1px solid #39ff1444", background: "#39ff1411" }}>
              TAREA ENVIADA - Los agentes comenzaran a trabajar
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || success}
            className="font-pixel w-full py-2"
            style={{
              fontSize: "9px",
              background: isSubmitting ? "#333" : "#ffd70022",
              border: "3px solid #ffd700",
              boxShadow: "4px 4px 0 #b8860b",
              color: "#ffd700",
              cursor: isSubmitting ? "wait" : "pointer",
              transition: "all 0.1s",
            }}
          >
            {isSubmitting ? "ENVIANDO..." : "ENVIAR TAREA"}
          </button>
        </div>
      </div>
    </div>
  );
}
