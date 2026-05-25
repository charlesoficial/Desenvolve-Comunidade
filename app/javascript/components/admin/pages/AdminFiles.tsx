import { useEffect, useReducer, useState } from "react";
import {
  deleteAdminFile,
  loadAdminFiles,
  type AdminFile,
} from "../../../lib/adminApi";

// Pagina /settings/files - listagem dos uploads catalogados em uploads_catalog.

const PER_PAGE = 30;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

type State = {
  phase: "loading" | "ready" | "error";
  files: AdminFile[];
  total: number;
  totalPages: number;
  message?: string;
};

type Action =
  | { type: "load_success"; files: AdminFile[]; total: number; totalPages: number }
  | { type: "load_error"; message: string }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", files: action.files, total: action.total, totalPages: action.totalPages };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "remove":       return { ...state, files: state.files.filter(f => f.id !== action.id), total: Math.max(0, state.total - 1) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", files: [], total: 0, totalPages: 0 };

export function AdminFiles() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminFiles({ page, perPage: PER_PAGE })
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", files: data.files, total: data.total, totalPages: data.total_pages });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os arquivos." }); });
    return () => { cancelled = true; };
  }, [page]);

  const handleDelete = async (file: AdminFile) => {
    if (!window.confirm(`Remover ${file.filename} do catálogo?`)) return;
    setSavingId(file.id);
    try {
      await deleteAdminFile(file.id);
      dispatch({ type: "remove", id: file.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Mídia</h1>
          <p className="admin-page-subtitle">
            Arquivos enviados para a comunidade ({state.total} no total). Backend
            atual: {state.files[0]?.backend || "—"}.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tipo</th>
                <th>Tamanho</th>
                <th>Enviado por</th>
                <th>Data</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Carregando...</td></tr>
              ) : state.files.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Nenhum arquivo no catálogo.</td></tr>
              ) : state.files.map(file => (
                <tr key={file.id}>
                  <td>
                    <a href={file.url} target="_blank" rel="noreferrer">{file.filename}</a>
                  </td>
                  <td className="admin-table-muted">{file.content_type || "—"}</td>
                  <td className="admin-table-muted">{formatBytes(file.bytes)}</td>
                  <td className="admin-table-muted">{file.user?.display_name || file.user?.username || "—"}</td>
                  <td className="admin-table-muted">{new Date(file.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleDelete(file)} disabled={savingId === file.id} style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state.totalPages > 1 ? (
          <div className="admin-pagination">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || state.phase === "loading"}>Anterior</button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>Página {page} de {state.totalPages}</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.min(state.totalPages, p + 1))} disabled={page >= state.totalPages || state.phase === "loading"}>Próxima</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
