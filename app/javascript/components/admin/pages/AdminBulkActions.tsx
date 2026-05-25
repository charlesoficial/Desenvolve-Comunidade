import { useEffect, useReducer } from "react";
import {
  loadAdminBulkActions,
  type AdminBulkAction,
} from "../../../lib/adminApi";

// /settings/posts/bulk_actions — log de acoes em massa do admin.

const actionLabels: Record<string, string> = {
  delete_posts: "Excluir posts",
  ban_members: "Banir membros",
  import_members: "Importar membros (CSV)",
  export_members: "Exportar membros",
  notify_all: "Notificação em massa",
};

const statusLabels: Record<AdminBulkAction["status"], string> = {
  pending: "Aguardando",
  running: "Em execução",
  completed: "Concluída",
  failed: "Falhou",
};

const statusBadge: Record<AdminBulkAction["status"], string> = {
  pending: "admin-badge admin-badge-gray",
  running: "admin-badge admin-badge-blue",
  completed: "admin-badge admin-badge-green",
  failed: "admin-badge admin-badge-gray",
};

type State = { phase: "loading" | "ready" | "error"; rows: AdminBulkAction[]; message?: string };
type Action =
  | { type: "load_success"; rows: AdminBulkAction[] }
  | { type: "load_error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", rows: action.rows };
    case "load_error":   return { ...state, phase: "error", message: action.message, rows: state.rows };
    default:             return state;
  }
}

const initial: State = { phase: "loading", rows: [] };

export function AdminBulkActions() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;
    loadAdminBulkActions()
      .then(rows => { if (!cancelled) dispatch({ type: "load_success", rows }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar o histórico." }); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Registros em massa</h1>
          <p className="admin-page-subtitle">
            Histórico das ações em massa executadas pelos administradores
            (exclusão de posts, banimentos, imports e notificações).
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ação</th>
                <th>Alvo</th>
                <th>Afetados</th>
                <th>Executado por</th>
                <th>Status</th>
                <th>Quando</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum registro em massa ainda."}
                </td></tr>
              ) : state.rows.map(row => (
                <tr key={row.id}>
                  <td><strong>{actionLabels[row.action] || row.action}</strong></td>
                  <td className="admin-table-muted">{row.target}</td>
                  <td>{row.affected_count}</td>
                  <td className="admin-table-muted">{row.user?.display_name || row.user?.username || "—"}</td>
                  <td><span className={statusBadge[row.status]}>{statusLabels[row.status]}</span></td>
                  <td className="admin-table-muted">{new Date(row.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
