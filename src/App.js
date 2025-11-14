import React, { useState } from "react";

const CodeIDE = () => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "UserProgram.java",
      content: `import java.util.Scanner;

public class UserProgram {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your age: ");
        int age = sc.nextInt();
        System.out.print("Enter your name: ");
        String name = sc.next();
        System.out.println("Hello, " + name + "! You are " + age + " years old.");
        sc.close();
    }
}`,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState(1);
  const [scannerInput, setScannerInput] = useState("");
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
    if (files.length === 1) return;
    const idx = files.findIndex((f) => f.id === id);
    const nextFiles = files.filter((f) => f.id !== id);
    setFiles(nextFiles);
    if (id === activeFileId) {
      setActiveFileId(nextFiles[Math.max(0, idx - 1)].id);
    }
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    try {
      const response = await fetch("http://localhost:8080/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeFile.content,
          input: scannerInput,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Backend error");
      }

      const data = await response.json(); // { status: "SUCCESS", output: "..." }
      setOutput(data.output);
    } catch (err) {
      setOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", padding: 20, fontFamily: "monospace" }}>
      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {files.map((f) => (
            <div
              key={f.id}
              style={{
                padding: "4px 8px",
                cursor: "pointer",
                borderBottom: f.id === activeFileId ? "2px solid blue" : "none",
              }}
              onClick={() => setActiveFileId(f.id)}
            >
              {f.name} <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>✕</button>
            </div>
          ))}
          <button onClick={addFile}>+ New File</button>
        </div>

        <textarea
          style={{ flex: 1, padding: 10, fontFamily: "monospace", fontSize: 14 }}
          value={activeFile?.content || ""}
          onChange={(e) => updateContent(e.target.value)}
        />

        <textarea
          style={{ height: 60, padding: 8, fontFamily: "monospace", fontSize: 14 }}
          value={scannerInput}
          onChange={(e) => setScannerInput(e.target.value)}
          placeholder="Enter input for Scanner (each input separated by newline)"
        />

        <button onClick={runCode} disabled={loading}>
          {loading ? "⏳ Running..." : "▶ Run Code"}
        </button>
      </div>

      {/* Output */}
      <div style={{ width: 400, marginLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Output:</div>
        <textarea
          readOnly
          style={{ flex: 1, padding: 10, fontFamily: "monospace", fontSize: 14, background: "#222", color: "#0f0" }}
          value={output}
        />
        <button onClick={() => setOutput("")}>Clear Output</button>
      </div>
    </div>
  );
};

export default CodeIDE;
