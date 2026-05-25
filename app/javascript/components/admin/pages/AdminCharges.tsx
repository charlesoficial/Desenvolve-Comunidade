import { useEffect, useReducer, useState } from "react";
import { loadAdminCharges, type AdminCharge } from "../../../lib/adminApi";

function formatCurrency(cents: number | null, currency = "BRL") {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });
}

type State = {
  phase: "loading" | "ready" | "error";
  charges: AdminCharge[];
  total: number;
  totalPages: number;
  message?: string;
};

type Action =
  | { type: "load_success"; charges: AdminCharge[]; total: number; totalPages: number }
  | { type: "load_error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", charges: action.charges, total: action.total, totalPages: action.totalPages };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    default:             return state;
  }
}

const initial: State = { phase: "loading", charges: [], total: 0, totalPages: 0 };

export function AdminCharges() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    loadAdminCharges({ page })
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", charges: data.charges, total: data.total, totalPages: data.total_pages });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar as transações." }); });
    return () => { cancelled = true; };
  }, [page]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Transações</h1>
          <p className="admin-page-subtitle">
            Histórico de cobranças vindas do Stripe (sucesso, falha, reembolso).
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Stripe ID</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {state.charges.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma transação registrada ainda."}
                </td></tr>
              ) : state.charges.map(charge => (
                <tr key={charge.id}>
                  <td>
                    <strong>{charge.user?.display_name || charge.user?.username || "—"}</strong>
                    <p className="admin-form-help" style={{ margin: 0 }}>{charge.user?.email}</p>
                  </td>
                  <td>{charge.plan?.name || "—"}</td>
                  <td>{formatCurrency(charge.amount_cents, charge.currency)}</td>
                  <td>
                    <span className={
                      charge.status === "active" ? "admin-badge admin-badge-green"
                      : charge.status === "canceled" ? "admin-badge admin-badge-gray"
                      : "admin-badge admin-badge-blue"
                    }>
                      {charge.status}
                    </span>
                  </td>
                  <td className="admin-table-muted">
                    <code style={{ fontSize: 11 }}>{charge.provider_subscription_id || "—"}</code>
                  </td>
                  <td className="admin-table-muted">
                    {new Date(charge.created_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state.totalPages > 1 ? (
          <div className="admin-pagination">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || state.phase === "loading"}>Anterior</button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>Página {page} de {state.totalPages}</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.min(state.totalPages, p + 1))} disabled={page >= state.totalPages || state.phase === "loading"}>Próxima</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
