import { useEffect, useReducer } from "react";
import { loadAdminPaywallBulkLogs, type AdminPaywallBulkLog } from "../../../lib/adminApi";

// /settings/paywall_bulk_logs - logs de acoes em massa em paywalls.

const actionLabels: Record<string, string> = {
  paywall_bulk_cancel: "Cancelamento em massa",
  paywall_bulk_pause: "Pausar assinaturas em massa",
  paywall_bulk_discount: "Aplicar desconto em massa",
  paywall_bulk_export: "Exportar lista de assinantes",
  subscription_bulk_cancel: "Cancelar assinaturas",
};

const statusBadge: Record<AdminPaywallBulkLog["status"], string> = {
  pending: "admin-badge admin-badge-gray",
  running: "admin-badge admin-badge-blue",
  completed: "admin-badge admin-badge-green",
  failed: "admin-badge admin-badge-gray",
};

const statusLabels: Record<AdminPaywallBulkLog["status"], string> = {
  pending: "Na fila",
  running: "Processando",
  completed: "Concluído",
  failed: "Falhou",
};

type State = { phase: "loading" | "ready" | "error"; logs: AdminPaywallBulkLog[]; message?: string };
type Action =
  | { type: "load_success"; logs: AdminPaywallBulkLog[] }
  | { type: "load_error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", logs: action.logs };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    default:             return state;
  }
}

const initial: State = { phase: "loading", logs: [] };

export function AdminPaywallBulkLogs() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;
    loadAdminPaywallBulkLogs()
      .then(logs => { if (!cancelled) dispatch({ type: "load_success", logs }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Registros em massa de paywalls</h1>
          <p className="admin-page-subtitle">
            Histórico de cancelamentos, descontos, exports e outras ações
            executadas em lote sobre paywalls e assinaturas.
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
                <th>Status</th>
                <th>Iniciado</th>
                <th>Concluído</th>
              </tr>
            </thead>
            <tbody>
              {state.logs.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma ação em massa registrada."}
                </td></tr>
              ) : state.logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <strong>{actionLabels[log.action] || log.action}</strong>
                    <p className="admin-form-help" style={{ margin: 0 }}>
                      <code style={{ fontSize: 11 }}>{log.action}</code>
                    </p>
                  </td>
                  <td className="admin-table-muted">{log.target}</td>
                  <td className="admin-table-muted">{log.affected_count}</td>
                  <td><span className={statusBadge[log.status]}>{statusLabels[log.status]}</span></td>
                  <td className="admin-table-muted">{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                  <td className="admin-table-muted">
                    {log.finished_at ? new Date(log.finished_at).toLocaleString("pt-BR") : "—"}
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
