import { useEffect, useReducer, useState } from "react";
import {
  createAdminSegment,
  deleteAdminSegment,
  loadAdminSegments,
  type AdminSegment,
} from "../../../lib/adminApi";

// /settings/segments - listas dinamicas de membros baseadas em filtros.

const filterFields = [
  { key: "active_in_days", label: "Ativos nos últimos N dias", type: "number" },
  { key: "min_posts", label: "Mínimo de posts", type: "number" },
  { key: "min_comments", label: "Mínimo de comentários", type: "number" },
  { key: "tag", label: "Tag aplicada", type: "text" },
  { key: "plan", label: "Plano atual", type: "text" },
];

type State = { phase: "loading" | "ready" | "error"; segments: AdminSegment[]; message?: string };
type Action =
  | { type: "load_success"; segments: AdminSegment[] }
  | { type: "load_error"; message: string }
  | { type: "append"; segment: AdminSegment }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", segments: action.segments };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, segments: [action.segment, ...state.segments] };
    case "remove":       return { ...state, segments: state.segments.filter(s => s.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", segments: [] };

export function AdminSegments() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminSegments()
      .then(segments => { if (!cancelled) dispatch({ type: "load_success", segments }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os segmentos." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const cleaned = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => String(v).trim() !== ""),
      );
      const segment = await createAdminSegment({
        name: name.trim(),
        description,
        filters: cleaned,
      });
      dispatch({ type: "append", segment });
      setName(""); setDescription(""); setFilters({});
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (segment: AdminSegment) => {
    if (!window.confirm(`Excluir o segmento "${segment.name}"?`)) return;
    setSavingId(segment.id);
    try {
      await deleteAdminSegment(segment.id);
      dispatch({ type: "remove", id: segment.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Segmentos</h1>
          <p className="admin-page-subtitle">
            Listas dinâmicas de membros baseadas em filtros. Use em campanhas
            de e-mail, automações e relatórios.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo segmento</h2>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="seg-name">Nome</label>
            <input id="seg-name" type="text" className="admin-form-input"
              value={name} onChange={e => setName(e.target.value)} required
              placeholder="Ex.: Membros engajados (últimos 7 dias)" />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="seg-desc">Descrição</label>
            <input id="seg-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="O que esse segmento captura?" />
          </div>

          <h3 style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 700, color: "#717680", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Filtros
          </h3>
          <div className="admin-form-row admin-form-row-grid">
            {filterFields.map(field => (
              <div key={field.key}>
                <label className="admin-form-label" htmlFor={`seg-${field.key}`}>{field.label}</label>
                <input id={`seg-${field.key}`} type={field.type} className="admin-form-input"
                  value={filters[field.key] || ""}
                  onChange={e => setFilters({ ...filters, [field.key]: e.target.value })} />
              </div>
            ))}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar segmento"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Segmento</th>
                <th>Filtros</th>
                <th>Membros</th>
                <th>Atualizado</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.segments.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum segmento cadastrado."}
                </td></tr>
              ) : state.segments.map(segment => (
                <tr key={segment.id}>
                  <td>
                    <strong>{segment.name}</strong>
                    {segment.description ? (
                      <p className="admin-form-help" style={{ margin: 0 }}>{segment.description}</p>
                    ) : null}
                  </td>
                  <td className="admin-table-muted" style={{ fontSize: 12 }}>
                    {Object.keys(segment.filters).length === 0
                      ? "—"
                      : Object.entries(segment.filters).map(([k, v]) => `${k}: ${String(v)}`).join(", ")}
                  </td>
                  <td>{segment.members_count}</td>
                  <td className="admin-table-muted">
                    {segment.last_calculated_at
                      ? new Date(segment.last_calculated_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost"
                      onClick={() => handleDelete(segment)} disabled={savingId === segment.id}
                      style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>
                      Excluir
                    </button>
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
