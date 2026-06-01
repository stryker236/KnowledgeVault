import { useEffect, useMemo, useState } from "react";

const initialStatus = "Backend not checked";

export default function App() {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [mode, setMode] = useState("edit");
  const [newFileName, setNewFileName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return files.filter((file) => file.path.toLowerCase().includes(query));
  }, [files, searchQuery]);

  const previewMarkup = useMemo(() => ({ __html: markdownToHtml(content) }), [content]);
  const normalizedNewFileName = normalizeMarkdownName(newFileName);
  const canUseVault = isBackendReady;
  const canCreate = canUseVault && normalizedNewFileName !== "";
  const canSave = Boolean(activeFile) && isDirty;

  useEffect(() => {
    refreshFiles();
  }, []);

  async function refreshFiles() {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/notes");
      const nextFiles = response.files.toSorted((first, second) => first.path.localeCompare(second.path));
      setFiles(nextFiles);
      setIsBackendReady(true);
      setStatus("Connected to storage");
    } catch (error) {
      setIsBackendReady(false);
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function openFile(fileEntry) {
    if (isDirty && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    try {
      const note = await apiRequest(`/api/notes/${encodeNotePath(fileEntry.path)}`);
      setContent(note.content);
      setActiveFile({ path: note.path });
      setIsDirty(false);
      setMode("edit");
      setStatus("Connected to storage");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function createFile() {
    if (!isBackendReady || !normalizedNewFileName) {
      return;
    }

    try {
      const note = await apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify({ path: normalizedNewFileName }),
      });
      setNewFileName("");
      setContent(note.content);
      setActiveFile({ path: note.path });
      setIsDirty(false);
      setMode("edit");
      await refreshFiles();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function saveActiveFile() {
    if (!activeFile || !isDirty) {
      return;
    }

    try {
      await apiRequest(`/api/notes/${encodeNotePath(activeFile.path)}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setIsDirty(false);
      setStatus("Saved to storage");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function updateContent(nextContent) {
    setContent(nextContent);
    setIsDirty(true);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header className="brand">
          <div>
            <h1>KnowledgeVault</h1>
            <p>{status}</p>
          </div>
        </header>

        <section className="panel">
          <div className="button-row">
            <button type="button" onClick={refreshFiles}>
              Load storage
            </button>
            <button type="button" onClick={refreshFiles} disabled={!canUseVault || isLoading}>
              Refresh
            </button>
          </div>

          <label className="field">
            <span>New note</span>
            <div className="create-row">
              <input
                type="text"
                placeholder="note-name.md"
                autoComplete="off"
                value={newFileName}
                onChange={(event) => setNewFileName(event.target.value)}
              />
              <button type="button" onClick={createFile} disabled={!canCreate}>
                Create
              </button>
            </div>
          </label>
        </section>

        <section className="file-section">
          <div className="section-title">
            <h2>Files</h2>
            <span>{files.length}</span>
          </div>
          <input
            className="search"
            type="search"
            placeholder="Search files"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            disabled={!canUseVault}
          />
          <FileList
            activePath={activeFile?.path}
            canUseVault={canUseVault}
            files={filteredFiles}
            onOpenFile={openFile}
          />
        </section>
      </aside>

      <main className="workspace">
        <header className="editor-header">
          <div>
            <p className="eyebrow">Markdown</p>
            <h2>{activeFile?.path ?? "Open a file"}</h2>
          </div>
          <div className="actions">
            <button
              className={`tab ${mode === "edit" ? "active" : ""}`}
              type="button"
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
            <button
              className={`tab ${mode === "preview" ? "active" : ""}`}
              type="button"
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
            <button
              className={isDirty ? "dirty" : ""}
              type="button"
              onClick={saveActiveFile}
              disabled={!canSave}
            >
              {isDirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </header>

        <section className="editor-grid">
          {mode === "edit" ? (
            <textarea
              value={content}
              spellCheck="true"
              disabled={!activeFile}
              onChange={(event) => updateContent(event.target.value)}
            />
          ) : (
            <article className="preview" dangerouslySetInnerHTML={previewMarkup} />
          )}
        </section>
      </main>
    </div>
  );
}

function FileList({ activePath, canUseVault, files, onOpenFile }) {
  if (!canUseVault) {
    return (
      <ul className="file-list">
        <li className="empty">Open storage to load notes</li>
      </ul>
    );
  }

  if (files.length === 0) {
    return (
      <ul className="file-list">
        <li className="empty">No markdown files</li>
      </ul>
    );
  }

  return (
    <ul className="file-list">
      {files.map((file) => (
        <li key={file.path}>
          <button
            className={activePath === file.path ? "active" : ""}
            type="button"
            title={file.path}
            onClick={() => onOpenFile(file)}
          >
            {file.path}
          </button>
        </li>
      ))}
    </ul>
  );
}

function normalizeMarkdownName(value) {
  const trimmed = value.trim().replaceAll("\\", "/").replace(/^\/+/, "");
  const hasUnsafeSegment = trimmed.split("/").some((part) => part === "" || part === "." || part === "..");

  if (!trimmed || hasUnsafeSegment || trimmed.endsWith("/")) {
    return "";
  }

  return trimmed.toLowerCase().endsWith(".md") ? trimmed : `${trimmed}.md`;
}

function markdownToHtml(markdown) {
  const escaped = escapeHtml(markdown);
  const lines = escaped.split(/\r?\n/);
  const html = [];
  let inList = false;
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      html.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      html.push(`${line}\n`);
      continue;
    }

    const listMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${formatInline(listMatch[1])}</li>`);
      continue;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }

    if (!line.trim()) {
      html.push("");
    } else if (line.startsWith("# ")) {
      html.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("> ")) {
      html.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
    } else {
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) {
    html.push("</ul>");
  }

  if (inCode) {
    html.push("</code></pre>");
  }

  return html.join("\n");
}

function formatInline(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }

  return response.json();
}

function encodeNotePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}
