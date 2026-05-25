import { useEffect, useReducer, useState } from "react";
import {
  loadAdminSpaces,
  reorderAdminSpaces,
  updateAdminSpace,
  type AdminSpace,
} from "../../../lib/adminApi";

// Pagina /settings/spaces — listagem real dos espacos da comunidade
// com toggle de visibilidade (locked) e reordenacao via setas.

const kindLabels: Record<AdminSpace["kind"], string> = {
  feed: "Feed",
  chat: "Chat",
  members: "Membros",
  progress: "Progresso",
  course: "Curso",
  link: "Link",
};

type State =
  | { status: "loading"; spaces: AdminSpace[] }
  | { status: "ready"; spaces: AdminSpace[] }
  | { status: "error"; spaces: AdminSpace[]; message: string };

type Action =
  | { type: "start" }
  | { type: "success"; spaces: AdminSpace[] }
  | { type: "error"; message: string }
  | { type: "patch"; space: AdminSpace }
  | { type: "reorder"; spaces: AdminSpace[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { status: "loading", spaces: state.spaces };
    case "success":
      return { status: "ready", spaces: action.spaces };
    case "error":
      return { status: "error", spaces: state.spaces, message: action.message };
    case "patch":
      return {
        status: state.status === "loading" ? "loading" : "ready",
        spaces: state.spaces.map((s) => (s.id === action.space.id ? action.space : s)),
      };
    case "reorder":
      return {
        status: state.status === "loading" ? "loading" : "ready",
        spaces: action.spaces,
      };
    default:
      return state;
  }
}

const initial: State = { status: "loading", spaces: [] };

export function AdminSpaces() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });
    loadAdminSpaces()
      .then((spaces) => {
        if (!cancelled) dispatch({ type: "success", spaces });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error", message: "Não foi possível carregar os espaços." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleLocked = async (space: AdminSpace) => {
    setSavingId(space.id);
    try {
      const updated = await updateAdminSpace(space.id, { locked: !space.locked });
      dispatch({ type: "patch", space: updated });
    } catch {
      dispatch({ type: "error", message: "Falha ao atualizar visibilidade." });
    } finally {
      setSavingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.spaces.length) return;

    const next = [...state.spaces];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    dispatch({ type: "reorder", spaces: next });

    try {
      await reorderAdminSpaces(next.map((s) => s.id));
    } catch {
      dispatch({ type: "error", message: "Falha ao reordenar espaços." });
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Espaços</h1>
          <p className="admin-page-subtitle">
            Organize os canais, feeds e cursos da comunidade. Use as setas
            para reordenar e o botão para alternar entre público e privado.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-ghost">Nova categoria</button>
          <button type="button" className="admin-btn admin-btn-primary">Novo espaço</button>
        </div>
      </header>

      <section className="admin-page-body">
        {state.status === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 96 }}>Ordem</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Visibilidade</th>
                <th>Posts</th>
                <th>Mensagens</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.status === "loading" && state.spaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.spaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum espaço cadastrado.
                  </td>
                </tr>
              ) : (
                state.spaces.map((space, idx) => (
                  <tr key={space.id}>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          style={{ height: 28, padding: "0 8px", fontSize: 12 }}
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          aria-label="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          style={{ height: 28, padding: "0 8px", fontSize: 12 }}
                          disabled={idx === state.spaces.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          aria-label="Mover para baixo"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>{space.name}</td>
                    <td>{kindLabels[space.kind]}</td>
                    <td>
                      <span
                        className={
                          space.locked
                            ? "admin-badge admin-badge-gray"
                            : "admin-badge admin-badge-green"
                        }
                      >
                        {space.locked ? "Privado" : "Público"}
                      </span>
                    </td>
                    <td>{space.posts_count}</td>
                    <td>{space.messages_count}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        style={{ height: 28, padding: "0 10px", fontSize: 12 }}
                        onClick={() => handleToggleLocked(space)}
                        disabled={savingId === space.id}
                      >
                        {savingId === space.id
                          ? "Salvando..."
                          : space.locked
                          ? "Tornar público"
                          : "Tornar privado"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
