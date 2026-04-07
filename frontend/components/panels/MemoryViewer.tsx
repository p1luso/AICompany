"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { unlockAudio } from "@/lib/audio";
import { 
  Download, 
  FileText, 
  Folder, 
  FolderOpen, 
  MoreVertical, 
  Code2, 
  Braces, 
  FileCode, 
  ShieldCheck, 
  Box 
} from "lucide-react";

interface MemoryEntry {
  name: string;
  type: "file" | "directory";
  path: string;
  content?: string;
  children?: MemoryEntry[];
}

export function MemoryViewer() {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState<MemoryEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<MemoryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "projects": true,
    "reports": true
  });
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, path: string, name: string, type: string } | null>(null);
  const [deploying, setDeploying] = useState<Record<string, boolean>>({});
  const [activeDeploys, setActiveDeploys] = useState<Record<string, any>>({});

  // Load tree when the modal is opened, and poll for updates every 3 seconds
  useEffect(() => {
    if (!open) return;

    const loadTree = () => {
      setLoading(true);
      fetch("/api/memory")
        .then((res) => res.json())
        .then((data) => {
          setTree(data.files || []);
        })
        .catch((err) => console.error("Error fetching memory tree", err))
        .finally(() => setLoading(false));
    };

    // Initial load
    loadTree();

    // Poll every 2 seconds for real-time updates
    const interval = setInterval(loadTree, 2000);
    return () => clearInterval(interval);
  }, [open]);

  // Fetch content for the selected file
  useEffect(() => {
    if (selectedFile && selectedFile.type === "file" && !selectedFile.content) {
      fetch(`/api/memory/${encodeURIComponent(selectedFile.path)}`)
        .then(res => res.json())
        .then(data => {
          if (data.content) {
            setSelectedFile(prev => prev?.path === selectedFile.path ? { ...prev, content: data.content } : prev);
          }
        })
        .catch(err => console.error("Error fetching file content", err));
    }
  }, [selectedFile]);

  const handleCopy = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };
  
  const handleDeploy = async (slug: string) => {
    if (deploying[slug]) return;
    
    setDeploying(prev => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch(`/api/projects/${slug}/deploy`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        setActiveDeploys(prev => ({ ...prev, [slug]: data }));
        // Abrir en nueva pestaña
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Deployment failed", err);
    } finally {
      setDeploying(prev => ({ ...prev, [slug]: false }));
      setContextMenu(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: MemoryEntry) => {
    e.preventDefault();
    setContextMenu({ 
      x: e.clientX, 
      y: e.clientY, 
      path: item.path, 
      name: item.name,
      type: item.type 
    });
  };

  const handleDownloadFolder = (path: string) => {
    window.open(`/api/memory/download?path=${encodeURIComponent(path)}`, "_blank");
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const getFileIcon = (name: string, isSelected: boolean) => {
    const ext = name.split('.').pop()?.toLowerCase();
    const colorClass = isSelected ? "text-white" : "text-blue-500";
    
    if (ext === 'md') return <FileText size={10} className={colorClass} />;
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext || '')) return <Code2 size={10} className={isSelected ? "text-white" : "text-orange-500"} />;
    if (ext === 'json') return <Braces size={10} className={isSelected ? "text-white" : "text-yellow-500"} />;
    if (ext === 'css') return <FileCode size={10} className={isSelected ? "text-white" : "text-cyan-500"} />;
    return <FileText size={10} className={colorClass} />;
  };

  const renderTree = (items: MemoryEntry[], depth = 0) => {
    return items.map((item) => {
      const isExpanded = expandedFolders[item.path];
      const isSelected = selectedFile?.path === item.path;

      if (item.type === "directory") {
        let Icon = isExpanded ? FolderOpen : Folder;
        let iconColor = "text-yellow-500";
        
        if (item.name === "projects") { Icon = Box; iconColor = "text-purple-600"; }
        if (item.name === "reports") { Icon = ShieldCheck; iconColor = "text-green-600"; }

        return (
          <div key={item.path}>
            <div
              onClick={() => toggleFolder(item.path)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className="flex items-center gap-1 p-1 hover:bg-black/5 cursor-pointer font-pixel text-[7px] group transition-colors"
              style={{ paddingLeft: `${depth * 8 + 4}px`, color: "#000" }}
            >
              <Icon size={10} className={iconColor} />
              <span className={`truncate flex-1 ${['projects', 'reports'].includes(item.name) ? 'font-bold underline decoration-dotted' : ''}`} style={{ color: "#000" }}>
                {item.name.toUpperCase()}
              </span>
              {activeDeploys[item.name] && (
                <span className="bg-green-100 text-green-700 px-1 rounded-[1px] text-[5px] border border-green-300 animate-pulse">LIVE</span>
              )}
              <MoreVertical size={8} className="opacity-0 group-hover:opacity-40" />
            </div>
            {isExpanded && item.children && renderTree(item.children, depth + 1)}
          </div>
        );
      }

      return (
        <div
          key={item.path}
          onClick={() => setSelectedFile(item)}
          className="flex items-center gap-1 p-1 cursor-pointer font-pixel text-[7px] transition-all"
          style={{ 
            paddingLeft: `${depth * 8 + 4}px`,
            background: isSelected ? "#000080" : "transparent",
            color: isSelected ? "#fff" : "#000"
          }}
        >
          {getFileIcon(item.name, isSelected)}
          <span className="truncate">{item.name}</span>
        </div>
      );
    });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); unlockAudio(); }}
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
          <span>📂</span> Memory Vault
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
          <div
            className="flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
            style={{
              width: "min(950px, 98vw)",
              height: "min(750px, 90vh)",
              background: "#c0c0c0",
              borderTop: "2px solid #dfdfdf",
              borderLeft: "2px solid #dfdfdf",
              borderRight: "4px solid #444",
              borderBottom: "4px solid #444",
            }}
          >
            {/* Title Bar */}
            <div className="flex items-center justify-between px-2 py-1 m-0.5 shrink-0"
                 style={{ background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)", color: "#fff" }}>
              <div className="flex items-center gap-2">
                <Box size={12} />
                <span className="font-pixel text-[10px] tracking-wide">MISSION_CONTROL_CENTRAL_VAULT.EXE</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-5 h-5 bg-[#c0c0c0] text-black flex items-center justify-center border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 active:border-gray-800 active:border-t-2 active:border-l-2 text-[10px] font-bold">
                X
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden p-1 gap-1">
              {/* Sidebar - File Tree */}
              <div className="w-64 flex flex-col bg-white overflow-y-auto custom-scrollbar"
                   style={{ border: "2px inset #fff", boxShadow: "inset 1px 1px 2px #444" }}>
                <div className="p-2 border-b border-gray-200 bg-gray-100 font-pixel text-[6px] text-gray-500 flex justify-between items-center">
                  <span>FILESYSTEM ROOT</span>
                  <span className="animate-pulse text-green-600">ONLINE</span>
                </div>
                {loading ? (
                  <div className="p-4 text-center font-pixel text-[8px] animate-pulse">SYNCHRONIZING...</div>
                ) : (
                  <div className="py-1">
                    {renderTree(tree)}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col bg-white relative overflow-hidden"
                   style={{ border: "2px inset #fff", boxShadow: "inset 1px 1px 2px #444" }}>
                
                {selectedFile ? (
                  <>
                    <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div className="font-pixel text-[7px] text-blue-800 truncate pr-4">
                        {selectedFile.path.replace(/\//g, ' > ')}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={handleCopy} className="whitespace-nowrap font-pixel text-[6px] px-2 py-1 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-gray-800 hover:bg-gray-100 active:border-gray-800">
                          {copied ? "COPIED" : "COPY"}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth bg-[#fcfcfc]">
                      {selectedFile.content ? (
                        selectedFile.name.endsWith('.md') ? (
                          <div className="markdown-content" style={{ color: "#1a1a1a" }}>
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => <h1 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", paddingBottom: "6px", borderBottom: "2px solid #C62828", color: "#C62828", textTransform: "uppercase" }} {...props} />,
                                h2: ({node, ...props}) => <h2 style={{ fontSize: "12px", fontWeight: "bold", marginTop: "16px", marginBottom: "8px", color: "#1565C0", borderLeft: "4px solid #1565C0", paddingLeft: "8px" }} {...props} />,
                                h3: ({node, ...props}) => <h3 style={{ fontSize: "11px", fontWeight: "bold", marginTop: "12px", marginBottom: "6px", color: "#2E7D32" }} {...props} />,
                                p: ({node, ...props}) => <p style={{ fontSize: "10px", lineHeight: "1.6", marginBottom: "10px", color: "#333333" }} {...props} />,
                                ul: ({node, ...props}) => <ul style={{ listStyleType: "disc", paddingLeft: "16px", marginBottom: "10px" }} {...props} />,
                                ol: ({node, ...props}) => <ol style={{ listStyleType: "decimal", paddingLeft: "16px", marginBottom: "10px" }} {...props} />,
                                li: ({node, ...props}) => <li style={{ fontSize: "10px", color: "#333333", marginBottom: "4px", lineHeight: "1.5" }} {...props} />,
                                strong: ({node, ...props}) => <strong style={{ color: "#000000", fontWeight: "bold" }} {...props} />,
                                em: ({node, ...props}) => <em style={{ color: "#555555", fontStyle: "italic" }} {...props} />,
                                code: ({node, className, ...props}) => {
                                  const isInline = !className;
                                  return isInline
                                    ? <code style={{ background: "#f0f0f0", padding: "1px 4px", borderRadius: "3px", fontFamily: "monospace", fontSize: "9px", color: "#7B1FA2", border: "1px solid #e0e0e0" }} {...props} />
                                    : <code style={{ color: "#39FF14", fontFamily: "monospace", fontSize: "9px" }} {...props} />;
                                },
                                pre: ({node, ...props}) => <pre style={{ background: "#1e1e1e", color: "#39FF14", padding: "12px", borderRadius: "4px", marginBottom: "12px", overflowX: "auto", fontSize: "9px", borderLeft: "4px solid #4CAF50", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }} {...props} />,
                                a: ({node, ...props}) => <a style={{ color: "#1565C0", textDecoration: "underline" }} {...props} />,
                                blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: "4px solid #FFB300", paddingLeft: "12px", margin: "12px 0", color: "#555", fontStyle: "italic", background: "#FFFDE7", padding: "8px 12px" }} {...props} />,
                                hr: ({node, ...props}) => <hr style={{ border: "none", borderTop: "2px solid #e0e0e0", margin: "16px 0" }} {...props} />,
                                table: ({node, ...props}) => <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: "12px", fontSize: "9px" }} {...props} />,
                                th: ({node, ...props}) => <th style={{ background: "#e3f2fd", border: "1px solid #ccc", padding: "4px 8px", fontWeight: "bold", color: "#1a1a1a", textAlign: "left" }} {...props} />,
                                td: ({node, ...props}) => <td style={{ border: "1px solid #ddd", padding: "4px 8px", color: "#333" }} {...props} />,
                              }}
                            >
                              {selectedFile.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <pre style={{ fontSize: "9px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#1a1a1a", lineHeight: "1.5" }}>
                            {selectedFile.content}
                          </pre>
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center font-pixel text-[8px] text-gray-400 animate-pulse">
                          RETRIEVING_DATA_STREAM...
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-200">
                    <Box size={64} className="opacity-10" />
                    <div className="font-pixel text-[10px] opacity-30 text-black">SELECT_ENTITY_TO_VIEW</div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-2 py-0.5 font-pixel text-[7px] text-gray-600 bg-[#c0c0c0] border-t border-white shrink-0">
              <div className="flex gap-4">
                <span className="text-blue-700">STATUS: NOMINAL</span>
                <span>ROOT: /memory</span>
                <span>VOL: SHARED</span>
              </div>
              <div className="flex gap-4">
                <span>SECURED_SSL: YES</span>
                <span>BUFFER: 1024kb</span>
              </div>
            </div>
          </div>

          {/* Context Menu */}
          {contextMenu && (
            <div 
              className="fixed z-[200] bg-[#c0c0c0] shadow-[2px_2px_0_#000] border-t border-l border-white border-b border-r border-gray-800 animate-in fade-in zoom-in-95 duration-100"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button 
                onClick={() => handleDownloadFolder(contextMenu.path)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#000080] hover:text-white font-pixel text-[8px] w-full text-left transition-colors"
                style={{ border: "none", background: "none", cursor: "pointer" }}
              >
                <Download size={10} />
                DOWNLOAD_PROJECT (.ZIP)
              </button>

              {contextMenu.path.includes('projects/') && contextMenu.type === 'directory' && contextMenu.name !== 'projects' && (
                <button 
                  onClick={() => handleDeploy(contextMenu.name)}
                  disabled={deploying[contextMenu.name]}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-[#000080] hover:text-white font-pixel text-[8px] w-full text-left border-t border-gray-300 transition-colors disabled:opacity-50"
                  style={{ borderLeft: "none", borderRight: "none", borderBottom: "none", background: "none", cursor: deploying[contextMenu.name] ? "not-allowed" : "pointer" }}
                >
                  <Box size={10} className={deploying[contextMenu.name] ? "animate-spin" : ""} />
                  {deploying[contextMenu.name] ? "DEPLOYING..." : activeDeploys[contextMenu.name] ? "RE-DEPLOY" : "🚀 DEPLOY LIVE"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
