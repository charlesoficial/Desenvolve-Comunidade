import { useEffect, useMemo, useReducer, useState } from "react";
import { loadAdminUsers, type AdminUser, type AdminUserDetail } from "../../../lib/adminApi";
import { AdminMemberDrawer } from "./AdminMemberDrawer";

// Pagina /audience/manage — listagem real de membros com busca,
// filtro de status e paginacao. Le do Rails em /api/v1/admin/users.
const PER_PAGE = 20;

const statusLabels: Record<AdminUser["status"], string> = {
  online: "Online",
  offline: "Offline",
  away: "Ausente",
};

const roleLabels: Record<AdminUser["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  moderator: "Mod",
  member: "Membro",
};

function formatLastSeen(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return "—";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  return `há ${months} ${months === 1 ? "mês" : "meses"}`;
}

function avatarLetter(user: AdminUser): string {
  const source = user.display_name || user.username || user.email;
  return source.charAt(0).toUpperCase() || "?";
}

type FetchState = {
  status: "loading" | "ready" | "error";
  users: AdminUser[];
  total: number;
  totalPages: number;
  error: string | null;
};

type FetchAction =
  | { type: "start" }
  | { type: "success"; users: AdminUser[]; total: number; totalPages: number }
  | { type: "error"; message: string }
  | { type: "patch"; user: AdminUser };

const initialState: FetchState = {
  status: "loading",
  users: [],
  total: 0,
  totalPages: 0,
  error: null,
};

function reducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case "start":
      return { ...state, status: "loading", error: null };
    case "success":
      return {
        status: "ready",
        users: action.users,
        total: action.total,
        totalPages: action.totalPages,
        error: null,
      };
    case "error":
      return { ...state, status: "error", error: action.message };
    case "patch":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
      };
    default:
      return state;
  }
}

export function AdminAudience() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState("");
  const [fetchState, dispatch] = useReducer(reducer, initialState);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const { status: fetchStatus, users, total, totalPages, error } = fetchState;
  const loading = fetchStatus === "loading";

  const handleUserUpdated = (user: AdminUserDetail) => {
    dispatch({ type: "patch", user });
  };

  // Debounce simples na busca pra nao bater no Rails a cada tecla.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });
    loadAdminUsers({ page, perPage: PER_PAGE, q: debouncedQuery, status })
      .then((data) => {
        if (cancelled) return;
        dispatch({
          type: "success",
          users: data.users,
          total: data.total,
          totalPages: data.total_pages,
        });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error", message: "Não foi possível carregar os membros." });
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, status]);

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 membros";
    const start = (page - 1) * PER_PAGE + 1;
    const end = Math.min(page * PER_PAGE, total);
    return `${start}–${end} de ${total}`;
  }, [page, total]);

  return (
    <>
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Membros</h1>
          <p className="admin-page-subtitle">
            Gerencie a audiência da comunidade, convites pendentes e solicitações.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-ghost">Importar CSV</button>
          <button type="button" className="admin-btn admin-btn-primary">Convidar</button>
        </div>
      </header>

      <section className="admin-page-body">
        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-form-input admin-toolbar-search"
            placeholder="Buscar por nome ou e-mail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="admin-form-select admin-toolbar-filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            <option value="online">Online</option>
            <option value="away">Ausente</option>
            <option value="offline">Offline</option>
          </select>
          <span className="admin-form-help" style={{ marginLeft: "auto" }}>
            {rangeLabel}
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Status</th>
                <th>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#b91c1c" }}>
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum membro encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setActiveUserId(user.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div className="admin-table-member">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="admin-avatar"
                            style={{ background: "transparent" }}
                          />
                        ) : (
                          <span className="admin-avatar" aria-hidden="true">
                            {avatarLetter(user)}
                          </span>
                        )}
                        <span>{user.display_name || user.username}</span>
                      </div>
                    </td>
                    <td className="admin-table-muted">{user.email}</td>
                    <td>
                      <span
                        className={
                          user.role === "owner" || user.role === "admin"
                            ? "admin-badge admin-badge-blue"
                            : "admin-badge admin-badge-gray"
                        }
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          user.status === "online"
                            ? "admin-badge admin-badge-green"
                            : user.status === "away"
                            ? "admin-badge admin-badge-blue"
                            : "admin-badge admin-badge-gray"
                        }
                      >
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td className="admin-table-muted">{formatLastSeen(user.last_seen_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="admin-pagination">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Próxima
            </button>
          </div>
        ) : null}
      </section>
    </div>
    {activeUserId ? (
      <AdminMemberDrawer
        userId={activeUserId}
        onClose={() => setActiveUserId(null)}
        onUpdated={handleUserUpdated}
      />
    ) : null}
    </>
  );
}
