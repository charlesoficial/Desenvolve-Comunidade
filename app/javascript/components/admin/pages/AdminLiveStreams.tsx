import { useEffect, useReducer, useState } from "react";
import {
  createAdminLiveStream,
  deleteAdminLiveStream,
  loadAdminLiveStreams,
  updateAdminLiveStream,
  type AdminLiveStream,
} from "../../../lib/adminApi";

// /settings/live_streams — gerenciar lives e aulas ao vivo.

const statusLabels: Record<AdminLiveStream["status"], string> = {
  scheduled: "Agendada",
  live: "Ao vivo",
  ended: "Encerrada",
  cancelled: "Cancelada",
};

const statusBadge: Record<AdminLiveStream["status"], string> = {
  scheduled: "admin-badge admin-badge-blue",
  live: "admin-badge admin-badge-green",
  ended: "admin-badge admin-badge-gray",
  cancelled: "admin-badge admin-badge-gray",
};

type State = { phase: "loading" | "ready" | "error"; streams: AdminLiveStream[]; message?: string };
type Action =
  | { type: "load_success"; streams: AdminLiveStream[] }
  | { type: "load_error"; message: string }
  | { type: "append"; stream: AdminLiveStream }
  | { type: "patch"; stream: AdminLiveStream }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", streams: action.streams };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, streams: [action.stream, ...state.streams] };
    case "patch":        return { ...state, streams: state.streams.map(s => s.id === action.stream.id ? action.stream : s) };
    case "remove":       return { ...state, streams: state.streams.filter(s => s.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", streams: [] };

const blankDraft = { title: "", description: "", starts_at: "", source_url: "" };

export function AdminLiveStreams() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState(blankDraft);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminLiveStreams()
      .then(streams => { if (!cancelled) dispatch({ type: "load_success", streams }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar as lives." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.starts_at) return;
    setCreating(true);
    try {
      const stream = await createAdminLiveStream({
        title: draft.title.trim(),
        description: draft.description,
        starts_at: new Date(draft.starts_at).toISOString(),
        source_url: draft.source_url || null,
        status: "scheduled",
      });
      dispatch({ type: "append", stream });
      setDraft(blankDraft);
    } finally {
      setCreating(false);
    }
  };

  const handleStatus = async (stream: AdminLiveStream, status: AdminLiveStream["status"]) => {
    setSavingId(stream.id);
    try {
      const updated = await updateAdminLiveStream(stream.id, { status });
      dispatch({ type: "patch", stream: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (stream: AdminLiveStream) => {
    if (!window.confirm(`Excluir "${stream.title}"?`)) return;
    setSavingId(stream.id);
    try {
      await deleteAdminLiveStream(stream.id);
      dispatch({ type: "remove", id: stream.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Ao vivo</h1>
          <p className="admin-page-subtitle">
            Agende lives, aulas e workshops. Os membros recebem notificação 1h antes.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Agendar nova live</h2>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="ls-title">Título</label>
            <input id="ls-title" type="text" className="admin-form-input"
              value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required
              placeholder="Ex.: Aula 12 — Introdução a Hacking" />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="ls-desc">Descrição</label>
            <textarea id="ls-desc" className="admin-form-textarea" rows={2}
              value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="ls-start">Início</label>
              <input id="ls-start" type="datetime-local" className="admin-form-input"
                value={draft.starts_at} onChange={e => setDraft({ ...draft, starts_at: e.target.value })} required />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="ls-url">URL de transmissão</label>
              <input id="ls-url" type="url" className="admin-form-input"
                value={draft.source_url} onChange={e => setDraft({ ...draft, source_url: e.target.value })}
                placeholder="https://youtube.com/live/..." />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Salvando..." : "Agendar live"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Live</th>
                <th>Início</th>
                <th>Host</th>
                <th>Status</th>
                <th style={{ width: 240 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.streams.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma live agendada."}
                </td></tr>
              ) : state.streams.map(stream => (
                <tr key={stream.id}>
                  <td>
                    <strong>{stream.title}</strong>
                    {stream.description ? (
                      <p className="admin-form-help" style={{ margin: 0 }}>{stream.description.slice(0, 100)}</p>
                    ) : null}
                  </td>
                  <td className="admin-table-muted">
                    {stream.starts_at ? new Date(stream.starts_at).toLocaleString("pt-BR") : "—"}
                  </td>
                  <td className="admin-table-muted">{stream.host?.display_name || "—"}</td>
                  <td><span className={statusBadge[stream.status]}>{statusLabels[stream.status]}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {stream.status !== "live" ? (
                        <button type="button" className="admin-btn admin-btn-primary"
                          onClick={() => handleStatus(stream, "live")} disabled={savingId === stream.id}
                          style={{ height: 28, fontSize: 12 }}>Iniciar</button>
                      ) : null}
                      {stream.status === "live" ? (
                        <button type="button" className="admin-btn admin-btn-ghost"
                          onClick={() => handleStatus(stream, "ended")} disabled={savingId === stream.id}
                          style={{ height: 28, fontSize: 12 }}>Encerrar</button>
                      ) : null}
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(stream)} disabled={savingId === stream.id}
                        style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>Excluir</button>
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
