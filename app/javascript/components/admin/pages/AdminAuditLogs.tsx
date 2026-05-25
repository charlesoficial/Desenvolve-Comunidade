import { useEffect, useReducer, useState } from "react";
import { loadAdminAuditLogs, type AdminAuditLog } from "../../../lib/adminApi";

// /settings/members/activity_logs - auditoria de acoes admin.

type State = {
  phase: "loading" | "ready" | "error";
  logs: AdminAuditLog[];
  total: number;
  totalPages: number;
  message?: string;
};

type Action =
  | { type: "load_success"; logs: AdminAuditLog[]; total: number; totalPages: number }
  | { type: "load_error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", logs: action.logs, total: action.total, totalPages: action.totalPages };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    default:             return state;
  }
}

const initial: State = { phase: "loading", logs: [], total: 0, totalPages: 0 };

export function AdminAuditLogs() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminAuditLogs({ page, action: actionFilter })
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", logs: data.logs, total: data.total, totalPages: data.total_pages });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os logs." }); });
    return () => { cancelled = true; };
  }, [page, actionFilter]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Registros de atividades</h1>
          <p className="admin-page-subtitle">
            Auditoria de ações administrativas: quem mudou o que e quando.
            {state.total > 0 ? ` ${state.total} registro${state.total === 1 ? "" : "s"}.` : ""}
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <div className="admin-toolbar">
          <input type="text" className="admin-form-input admin-toolbar-search"
            placeholder="Filtrar por ação (ex.: plan.created)"
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }} />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Quem</th>
                <th>Ação</th>
                <th>Alvo</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {state.logs.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum registro encontrado."}
                </td></tr>
              ) : state.logs.map(log => (
                <>
                  <tr key={log.id} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)} style={{ cursor: "pointer" }}>
                    <td className="admin-table-muted" style={{ whiteSpace: "nowrap" }}>
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td>
                      {log.actor ? (
                        <>
                          <strong>{log.actor.display_name}</strong>
                          <p className="admin-form-help" style={{ margin: 0 }}>{log.actor.email}</p>
                        </>
                      ) : <span className="admin-table-muted">Sistema</span>}
                    </td>
                    <td><code style={{ fontSize: 12 }}>{log.action}</code></td>
                    <td className="admin-table-muted">
                      {log.target_type ? `${log.target_type}` : "—"}
                      {log.target_id ? <p className="admin-form-help" style={{ margin: 0, fontSize: 11 }}>{log.target_id}</p> : null}
                    </td>
                    <td className="admin-table-muted">{log.ip_address || "—"}</td>
                  </tr>
                  {expandedId === log.id && Object.keys(log.metadata || {}).length > 0 ? (
                    <tr key={`${log.id}-detail`}>
                      <td colSpan={5} style={{ background: "#f7f8fa", padding: 12 }}>
                        <pre style={{ margin: 0, fontSize: 11, overflowX: "auto" }}>
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                        {log.user_agent ? (
                          <p className="admin-form-help" style={{ margin: "8px 0 0" }}>
                            <strong>User-Agent:</strong> {log.user_agent}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {state.totalPages > 1 ? (
          <div className="admin-pagination">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>Página {page} de {state.totalPages}</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.min(state.totalPages, p + 1))} disabled={page >= state.totalPages}>Próxima</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
