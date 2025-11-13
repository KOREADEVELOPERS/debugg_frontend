import React, { useState } from "react";

/*
  CodeIDE.jsx
  - Programiz-like dark IDE layout (custom  branding)
  - Works with backend expecting `text/plain`
*/

const CodeIDE = () => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "UserProgram.java",
      content: `import javax.swing.*;
import java.awt.Color;
public class UserProgram {
  JFrame frame;
  JPanel panel;
  UserProgram(){
    frame=new JFrame("Frame");
    frame.setSize(600,600);
    frame.setDefaultCloseOperation(frame.EXIT_ON_CLOSE);

    panel=new JPanel();
    panel.setBackground(Color.BLACK);
    frame.add(panel);
    frame.setVisible(true);
  }
  public static void main(String[] args) {
    new UserProgram();
  }
}`,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState(1);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  const updateContent = (value) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: value } : f))
    );
  };

  const addFile = () => {
    const newId = Date.now();
    setFiles((prev) => [
      ...prev,
      { id: newId, name: `NewFile${prev.length + 1}.java`, content: "// New file\n" },
    ]);
    setActiveFileId(newId);
  };

  const removeFile = (id) => {
    if (files.length === 1) return; // keep at least one file
    const idx = files.findIndex((f) => f.id === id);
    const nextFiles = files.filter((f) => f.id !== id);
    setFiles(nextFiles);
    if (id === activeFileId) {
      const nextIdx = Math.max(0, idx - 1);
      setActiveFileId(nextFiles[nextIdx].id);
    }
  };

  // ---- FIXED RUN CODE ----
  const runCode = async () => {
    setLoading(true);
    setOutput("");
    try {
      // Send pure Java code as text/plain (backend expects this)
      const response = await fetch("http://localhost:8080/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: activeFile.content,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Backend error");
      }

      const data = await response.json(); // { status: "OK", output: "..." }
      setOutput(`${data.status || "Result"}:\n${data.output ?? JSON.stringify(data)}`);
    } catch (err) {
      setOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  // -----------------------

  const clearOutput = () => setOutput("");

  return (
    <div className="ide-root" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`
        .ide-root { min-height:100vh; background: linear-gradient(180deg,#071025 0%, #0b2b3a 100%); display:flex; align-items:stretch; padding:24px; box-sizing:border-box; }
        .ide-card { margin:auto; width:100%; max-width:1200px; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.6); overflow:hidden; display:flex; flex-direction:column; background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.03); }
        .ide-top { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.03); }
        .ide-brand { display:flex; align-items:center; gap:12px; }
        .brand-bubble { width:44px; height:44px; border-radius:8px; background: linear-gradient(135deg,#00c6ff,#0072ff); display:flex; align-items:center; justify-content:center; color:#012; font-weight:700; box-shadow:0 6px 18px rgba(0,198,255,0.12); }
        .ide-main { display:flex; gap:0; min-height:520px; }
        .ide-sidebar { width:64px; background: rgba(0,0,0,0.25); border-right:1px solid rgba(255,255,255,0.02); display:flex; flex-direction:column; padding:12px; gap:12px; align-items:center; }
        .side-icon { width:44px; height:44px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#9fb8ff; cursor:pointer; opacity:0.95; transition:all .18s; }
        .side-icon:hover { transform: translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.45); }
        .ide-editor-pane { flex:1; display:flex; flex-direction:column; padding:16px; gap:12px; }
        .tabs { display:flex; gap:8px; align-items:center; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.03); }
        .tab { padding:8px 12px; background: rgba(0,0,0,0.25); border-radius:8px; color:#dbeafe; cursor:pointer; display:flex; gap:8px; align-items:center; }
        .tab.active { background: linear-gradient(90deg,#0ea5e9, #3b82f6); color:#001; font-weight:600; box-shadow:0 8px 20px rgba(59,130,246,0.12); }
        .editor { flex:1; margin-top:8px; }
        textarea.code-area { width:100%; height:100%; min-height:300px; resize:vertical; padding:16px; background:#0b1220; color:#cfeee8; border:1px solid rgba(255,255,255,0.02); border-radius:10px; font-family: 'Consolas', monospace; font-size:14px; line-height:1.5; }
        .runner-bar { display:flex; gap:12px; align-items:center; padding:12px 16px; border-top:1px solid rgba(255,255,255,0.02); }
        .run-btn { padding:10px 18px; border-radius:999px; font-weight:700; color:#052; background:linear-gradient(90deg,#00f0ff,#0072ff); box-shadow:0 10px 30px rgba(0,114,255,0.12); border:none; }
        .ghost-btn { padding:8px 12px; border-radius:8px; background:transparent; border:1px solid rgba(255,255,255,0.04); color:#cfeee8; }
        .ide-output { width:40%; min-width:280px; border-left:1px solid rgba(255,255,255,0.03); display:flex; flex-direction:column; padding:16px; gap:12px; background: linear-gradient(180deg, rgba(2,6,23,0.3), rgba(0,0,0,0.15)); }
        .console { flex:1; background:#071018; border-radius:8px; padding:12px; color:#7ef5a6; font-family: 'Consolas', monospace; font-size:13.5px; overflow:auto; border:1px solid rgba(0,180,140,0.06); white-space:pre-wrap; }
        .util-row { display:flex; gap:8px; align-items:center; justify-content:space-between; }
        .muted { color:#98a0b3; font-size:13px; }
        @media (max-width: 900px) {
          .ide-main { flex-direction:column; }
          .ide-output { width:100%; min-height:220px; border-left:none; border-top:1px solid rgba(255,255,255,0.03); }
        }
      `}</style>

      <div className="ide-card">
        {/* Top */}
        <div className="ide-top">
          <div className="ide-brand">
            <div className="brand-bubble">SS</div>
            <div>
              <div style={{ fontWeight: 700, color: "#e6f7ff" }}>Sulabh's Javas compiler</div>
              <div className="muted" style={{ fontSize: 13 }}>Online compiler — custom look</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="ghost-btn" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(activeFile.content); }}>
              Copy Code
            </button>
            <button className="ghost-btn" onClick={addFile}>
              New File
            </button>
            <button className="run-btn" onClick={runCode} disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
              {loading ? "⏳ Running..." : "▶ Run"}
            </button>
          </div>
        </div>

        {/* Main split */}
        <div className="ide-main">
          {/* Sidebar */}
          <div className="ide-sidebar">
            <div className="side-icon" title="Files">📂</div>
            <div className="side-icon" title="Java">☕</div>
            <div className="side-icon" title="Database">🗄️</div>
            <div className="side-icon" title="Settings">⚙️</div>
            <div style={{ flex: 1 }} />
            <div className="side-icon" title="Profile">👤</div>
          </div>

          {/* Editor area */}
          <div className="ide-editor-pane">
            <div className="tabs">
              {files.map(f => (
                <div key={f.id} className={`tab ${f.id === activeFileId ? "active" : ""}`} onClick={() => setActiveFileId(f.id)}>
                  <span style={{ fontSize: 13 }}>{f.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    style={{ marginLeft: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
                    title="Close file"
                  >✕</button>
                </div>
              ))}
              <div style={{ marginLeft: "auto" }} />
              <div className="muted">Java • JDK 17</div>
            </div>

            <div className="editor">
              <textarea
                className="code-area"
                value={activeFile?.content || ""}
                onChange={(e) => updateContent(e.target.value)}
                spellCheck="false"
              />
            </div>

            <div className="runner-bar">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="ghost-btn" onClick={() => { updateContent(""); }}>Clear File</button>
                <button className="ghost-btn" onClick={() => { updateContent(activeFile.content + "\n// debug log"); }}>Insert Log</button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div className="muted">Last run: <strong style={{ color: "#a9f4ff" }}>—</strong></div>
                <button className="ghost-btn" onClick={clearOutput}>Clear Output</button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="ide-output">
            <div className="util-row">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width:12, height:12, background: "#4ee6a6", borderRadius: 99 }} />
                <div style={{ fontWeight:700 }}>Output</div>
                <div className="muted" style={{ marginLeft:8 }}>Console / Program result</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="ghost-btn" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(output); }}>Copy</button>
                <button className="ghost-btn" onClick={() => {
                  const blob = new Blob([output], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeFile?.name || 'output'}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>Download</button>
              </div>
            </div>

            <div className="console" id="console">
              {output || "// Program output will appear here. Click ▶ Run to compile & run."}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div className="muted">Runtime: <strong style={{ color: "#a9f4ff" }}>—</strong></div>
              <div style={{ fontSize: 13, color: "#9fb8ff" }}>Sulabh's Debugger • Custom build</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeIDE;
