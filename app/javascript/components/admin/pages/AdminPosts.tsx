import { useEffect, useReducer, useState } from "react";
import {
  bulkDeleteAdminPosts,
  deleteAdminPost,
  loadAdminPosts,
  type AdminPostRow,
} from "../../../lib/adminApi";

// Pagina /settings/posts (Moderacao) - lista posts da comunidade,
// permite buscar, deletar individualmente ou em massa.

const PER_PAGE = 25;

type State = {
  phase: "loading" | "ready" | "error";
  posts: AdminPostRow[];
  total: number;
  totalPages: number;
  message?: string;
};

type Action =
  | { type: "load_success"; posts: AdminPostRow[]; total: number; totalPages: number }
  | { type: "load_error"; message: string }
  | { type: "remove"; ids: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return {
        phase: "ready",
        posts: action.posts,
        total: action.total,
        totalPages: action.totalPages,
      };
    case "load_error":
      return { ...state, phase: "error", message: action.message };
    case "remove":
      return {
        ...state,
        posts: state.posts.filter((p) => !action.ids.includes(p.id)),
        total: Math.max(0, state.total - action.ids.length),
      };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", posts: [], total: 0, totalPages: 0 };

export function AdminPosts() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    loadAdminPosts({ page, perPage: PER_PAGE, q: debouncedQuery })
      .then((data) => {
        if (cancelled) return;
        dispatch({
          type: "load_success",
          posts: data.posts,
          total: data.total,
          totalPages: data.total_pages,
        });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os posts." });
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === state.posts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(state.posts.map((p) => p.id)));
    }
  };

  const handleDeleteOne = async (post: AdminPostRow) => {
    if (!window.confirm(`Excluir o post "${post.title}"?`)) return;
    setSavingId(post.id);
    try {
      await deleteAdminPost(post.id);
      dispatch({ type: "remove", ids: [post.id] });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao excluir post." });
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Excluir ${ids.length} post${ids.length === 1 ? "" : "s"} selecionado${ids.length === 1 ? "" : "s"}?`)) {
      return;
    }
    setBulkDeleting(true);
    try {
      await bulkDeleteAdminPosts(ids);
      dispatch({ type: "remove", ids });
      setSelected(new Set());
    } catch {
      dispatch({ type: "load_error", message: "Falha ao excluir em massa." });
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Moderação</h1>
          <p className="admin-page-subtitle">
            Reveja e remova publicações da comunidade. Use a busca para filtrar
            por título ou conteúdo.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-form-input admin-toolbar-search"
            placeholder="Buscar por título ou conteúdo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={handleBulkDelete}
            disabled={selected.size === 0 || bulkDeleting}
            style={{ color: "#b91c1c" }}
          >
            {bulkDeleting
              ? "Excluindo..."
              : `Excluir ${selected.size} selecionado${selected.size === 1 ? "" : "s"}`}
          </button>
          <span className="admin-form-help" style={{ marginLeft: "auto" }}>
            {state.total} posts no total
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={state.posts.length > 0 && selected.size === state.posts.length}
                    onChange={toggleAll}
                    aria-label="Selecionar todos"
                  />
                </th>
                <th>Título</th>
                <th>Espaço</th>
                <th>Autor</th>
                <th>Criado em</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" && state.posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum post encontrado.
                  </td>
                </tr>
              ) : (
                state.posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggle(post.id)}
                        aria-label={`Selecionar ${post.title}`}
                      />
                    </td>
                    <td>
                      <strong>{post.title || "—"}</strong>
                      {post.body ? (
                        <p className="admin-form-help" style={{ margin: "2px 0 0" }}>
                          {post.body}
                        </p>
                      ) : null}
                    </td>
                    <td className="admin-table-muted">{post.space?.name || "—"}</td>
                    <td className="admin-table-muted">
                      {post.author?.display_name || post.author?.username || "—"}
                    </td>
                    <td className="admin-table-muted">
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => handleDeleteOne(post)}
                        disabled={savingId === post.id}
                        style={{ height: 28, fontSize: 12, color: "#b91c1c" }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {state.totalPages > 1 ? (
          <div className="admin-pagination">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || state.phase === "loading"}
            >
              Anterior
            </button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>
              Página {page} de {state.totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => setPage((p) => Math.min(state.totalPages, p + 1))}
              disabled={page >= state.totalPages || state.phase === "loading"}
            >
              Próxima
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
