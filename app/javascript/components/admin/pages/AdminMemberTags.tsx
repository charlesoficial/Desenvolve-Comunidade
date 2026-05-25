import { useEffect, useReducer, useState } from "react";
import {
  createAdminMemberTag,
  deleteAdminMemberTag,
  loadAdminMemberTags,
  updateAdminMemberTag,
  type AdminMemberTag,
} from "../../../lib/adminApi";

// /settings/member_tags - tags de membros para segmentar comunicacoes,
// automacoes e relatorios.

type State = { phase: "loading" | "ready" | "error"; tags: AdminMemberTag[]; message?: string };
type Action =
  | { type: "load_success"; tags: AdminMemberTag[] }
  | { type: "load_error"; message: string }
  | { type: "append"; tag: AdminMemberTag }
  | { type: "patch"; tag: AdminMemberTag }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", tags: action.tags };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, tags: [action.tag, ...state.tags] };
    case "patch":        return { ...state, tags: state.tags.map(t => t.id === action.tag.id ? action.tag : t) };
    case "remove":       return { ...state, tags: state.tags.filter(t => t.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", tags: [] };
const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#06b6d4"];

export function AdminMemberTags() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminMemberTags()
      .then(tags => { if (!cancelled) dispatch({ type: "load_success", tags }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar as tags." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const tag = await createAdminMemberTag({ name: name.trim(), color, description });
      dispatch({ type: "append", tag });
      setName(""); setDescription("");
    } finally {
      setCreating(false);
    }
  };

  const handleColorChange = async (tag: AdminMemberTag, newColor: string) => {
    setSavingId(tag.id);
    try {
      const updated = await updateAdminMemberTag(tag.id, { color: newColor });
      dispatch({ type: "patch", tag: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (tag: AdminMemberTag) => {
    if (!window.confirm(`Excluir a tag "${tag.name}"? Membros que tinham essa tag perderão a marcação.`)) return;
    setSavingId(tag.id);
    try {
      await deleteAdminMemberTag(tag.id);
      dispatch({ type: "remove", id: tag.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Tags de membros</h1>
          <p className="admin-page-subtitle">
            Etiquete membros para segmentar comunicações, automações e relatórios.
            Tags podem ser usadas em filtros de Segmentos.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova tag</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="tag-name">Nome</label>
              <input id="tag-name" type="text" className="admin-form-input"
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="Ex.: Comprador VIP" />
            </div>
            <div>
              <label className="admin-form-label">Cor</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center", height: 40 }}>
                {colors.map(c => (
                  <button key={c} type="button" aria-label={`Cor ${c}`}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: c, border: c === color ? "2px solid #191b1f" : "1px solid #e7e9ec",
                      cursor: "pointer",
                    }} />
                ))}
              </div>
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="tag-desc">Descrição</label>
            <input id="tag-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="O que essa tag representa?" />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar tag"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Descrição</th>
                <th>Membros</th>
                <th>Cor</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.tags.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma tag cadastrada."}
                </td></tr>
              ) : state.tags.map(tag => (
                <tr key={tag.id}>
                  <td>
                    <span className="admin-badge" style={{ background: tag.color, color: "#fff" }}>
                      {tag.name}
                    </span>
                  </td>
                  <td className="admin-table-muted">{tag.description || "—"}</td>
                  <td className="admin-table-muted">{tag.members_count}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {colors.map(c => (
                        <button key={c} type="button" aria-label={`Mudar cor para ${c}`}
                          onClick={() => handleColorChange(tag, c)} disabled={savingId === tag.id}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            background: c, border: c === tag.color ? "2px solid #191b1f" : "1px solid transparent",
                            cursor: "pointer",
                          }} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost"
                      onClick={() => handleDelete(tag)} disabled={savingId === tag.id}
                      style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>Excluir</button>
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
