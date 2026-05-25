import { useEffect, useReducer, useState } from "react";
import {
  createAdminKnowledge,
  deleteAdminKnowledge,
  loadAdminKnowledge,
  updateAdminKnowledge,
  type AdminKnowledgeEntry,
} from "../../../lib/adminApi";

// Pagina /settings/ai-agents/knowledge - banco de conhecimento que
// alimenta os AI Agents (FAQ, posts oficiais, links).

type State = { phase: "loading" | "ready" | "error"; entries: AdminKnowledgeEntry[]; message?: string };
type Action =
  | { type: "load_success"; entries: AdminKnowledgeEntry[] }
  | { type: "load_error"; message: string }
  | { type: "append"; entry: AdminKnowledgeEntry }
  | { type: "patch"; entry: AdminKnowledgeEntry }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", entries: action.entries };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, entries: [action.entry, ...state.entries] };
    case "patch":        return { ...state, entries: state.entries.map(e => e.id === action.entry.id ? action.entry : e) };
    case "remove":       return { ...state, entries: state.entries.filter(e => e.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", entries: [] };

export function AdminAiKnowledge() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminKnowledge()
      .then(entries => { if (!cancelled) dispatch({ type: "load_success", entries }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar a base de conhecimento." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const entry = await createAdminKnowledge({ title: title.trim(), body, source_url: sourceUrl || null, enabled: true });
      dispatch({ type: "append", entry });
      setTitle(""); setBody(""); setSourceUrl("");
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar entrada." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (entry: AdminKnowledgeEntry) => {
    setSavingId(entry.id);
    try {
      const updated = await updateAdminKnowledge(entry.id, { enabled: !entry.enabled });
      dispatch({ type: "patch", entry: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (entry: AdminKnowledgeEntry) => {
    if (!window.confirm(`Excluir "${entry.title}"?`)) return;
    setSavingId(entry.id);
    try {
      await deleteAdminKnowledge(entry.id);
      dispatch({ type: "remove", id: entry.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Base de conhecimento</h1>
          <p className="admin-page-subtitle">
            Adicione documentos, FAQs e links oficiais que os AI Agents da
            comunidade podem consultar para responder dúvidas dos membros.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova entrada</h2>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="kn-title">Título</label>
            <input
              id="kn-title"
              type="text"
              className="admin-form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Como recuperar minha senha?"
              required
            />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="kn-body">Conteúdo</label>
            <textarea
              id="kn-body"
              className="admin-form-textarea"
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Resposta completa ou trecho do documento que o AI deve consultar."
            />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="kn-url">Link externo (opcional)</label>
            <input
              id="kn-url"
              type="url"
              className="admin-form-input"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Conteúdo</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" ? (
                <tr><td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Carregando...</td></tr>
              ) : state.entries.length === 0 ? (
                <tr><td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Nenhuma entrada cadastrada.</td></tr>
              ) : state.entries.map(entry => (
                <tr key={entry.id}>
                  <td><strong>{entry.title}</strong></td>
                  <td className="admin-table-muted" style={{ maxWidth: 400 }}>{entry.body.slice(0, 120) || "—"}</td>
                  <td>
                    <span className={entry.enabled ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                      {entry.enabled ? "Ativa" : "Pausada"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleToggle(entry)} disabled={savingId === entry.id} style={{ height: 28, fontSize: 12 }}>
                        {entry.enabled ? "Pausar" : "Ativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleDelete(entry)} disabled={savingId === entry.id} style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
