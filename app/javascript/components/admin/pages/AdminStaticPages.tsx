import { useEffect, useReducer, useState } from "react";
import {
  createAdminPage,
  deleteAdminPage,
  loadAdminPages,
  updateAdminPage,
  type AdminStaticPage,
} from "../../../lib/adminApi";

// /settings/pages — paginas estaticas (about, regras, FAQ).

type State = { phase: "loading" | "ready" | "error"; pages: AdminStaticPage[]; message?: string };
type Action =
  | { type: "load_success"; pages: AdminStaticPage[] }
  | { type: "load_error"; message: string }
  | { type: "append"; page: AdminStaticPage }
  | { type: "patch"; page: AdminStaticPage }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", pages: action.pages };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, pages: [...state.pages, action.page] };
    case "patch":        return { ...state, pages: state.pages.map(p => p.id === action.page.id ? action.page : p) };
    case "remove":       return { ...state, pages: state.pages.filter(p => p.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", pages: [] };

const blankDraft = { title: "", slug: "", body: "", published: true };

export function AdminStaticPages() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState(blankDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminPages()
      .then(pages => { if (!cancelled) dispatch({ type: "load_success", pages }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar as páginas." }); });
    return () => { cancelled = true; };
  }, []);

  const startEdit = (page: AdminStaticPage) => {
    setEditingId(page.id);
    setDraft({ title: page.title, slug: page.slug, body: page.body, published: page.published });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(blankDraft);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateAdminPage(editingId, draft);
        dispatch({ type: "patch", page: updated });
      } else {
        const created = await createAdminPage(draft);
        dispatch({ type: "append", page: created });
      }
      cancelEdit();
    } catch {
      dispatch({ type: "load_error", message: "Falha ao salvar página." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page: AdminStaticPage) => {
    if (!window.confirm(`Excluir a página "${page.title}"?`)) return;
    setSavingId(page.id);
    try {
      await deleteAdminPage(page.id);
      dispatch({ type: "remove", id: page.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Páginas</h1>
          <p className="admin-page-subtitle">
            Páginas estáticas da comunidade — sobre, regras, FAQ. Use Markdown no corpo.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleSubmit}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {editingId ? "Editar página" : "Nova página"}
          </h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="page-title">Título</label>
              <input id="page-title" type="text" className="admin-form-input"
                value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="page-slug">Slug (opcional)</label>
              <input id="page-slug" type="text" className="admin-form-input"
                value={draft.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })}
                placeholder="gerado a partir do título" />
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="page-body">Corpo (Markdown)</label>
            <textarea id="page-body" className="admin-form-textarea" rows={6}
              value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} />
          </div>
          <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={draft.published}
              onChange={e => setDraft({ ...draft, published: e.target.checked })} />
            Publicada (visível para membros)
          </label>
          <div className="admin-form-actions">
            {editingId ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={cancelEdit}>Cancelar</button>
            ) : null}
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar página"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Atualizada</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.pages.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma página cadastrada."}
                </td></tr>
              ) : state.pages.map(page => (
                <tr key={page.id}>
                  <td><strong>{page.title}</strong></td>
                  <td className="admin-table-muted"><code style={{ fontSize: 12 }}>/{page.slug}</code></td>
                  <td>
                    <span className={page.published ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                      {page.published ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td className="admin-table-muted">{new Date(page.updated_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => startEdit(page)} disabled={savingId === page.id}
                        style={{ height: 28, fontSize: 12 }}>Editar</button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(page)} disabled={savingId === page.id}
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
