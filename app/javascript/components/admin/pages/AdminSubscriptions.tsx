import { useEffect, useReducer, useState } from "react";
import {
  loadAdminSubscriptions,
  updateAdminSubscription,
  type AdminSubscription,
} from "../../../lib/adminApi";

// /settings/paywall_subscriptions - lista de assinantes ativos/cancelados.

function formatCurrency(cents: number, currency = "BRL") {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });
}

const statusBadge: Record<string, string> = {
  active: "admin-badge admin-badge-green",
  trialing: "admin-badge admin-badge-blue",
  paused: "admin-badge admin-badge-gray",
  canceled: "admin-badge admin-badge-gray",
  past_due: "admin-badge admin-badge-gray",
  inactive: "admin-badge admin-badge-gray",
};

const statusLabels: Record<string, string> = {
  active: "Ativa",
  trialing: "Trial",
  paused: "Pausada",
  canceled: "Cancelada",
  past_due: "Inadimplente",
  inactive: "Inativa",
};

type State = {
  phase: "loading" | "ready" | "error";
  subscriptions: AdminSubscription[];
  total: number;
  totalPages: number;
  mrr_cents: number;
  message?: string;
};

type Action =
  | { type: "load_success"; subscriptions: AdminSubscription[]; total: number; totalPages: number; mrr: number }
  | { type: "load_error"; message: string }
  | { type: "patch"; subscription: AdminSubscription };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", subscriptions: action.subscriptions, total: action.total, totalPages: action.totalPages, mrr_cents: action.mrr };
    case "load_error":
      return { ...state, phase: "error", message: action.message };
    case "patch":
      return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.subscription.id ? action.subscription : s) };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", subscriptions: [], total: 0, totalPages: 0, mrr_cents: 0 };

export function AdminSubscriptions() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminSubscriptions({ page, status: statusFilter })
      .then(data => {
        if (cancelled) return;
        dispatch({
          type: "load_success",
          subscriptions: data.subscriptions,
          total: data.total,
          totalPages: data.total_pages,
          mrr: data.mrr_cents,
        });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar assinaturas." }); });
    return () => { cancelled = true; };
  }, [page, statusFilter]);

  const handleCancel = async (sub: AdminSubscription) => {
    if (!window.confirm(`Cancelar a assinatura de ${sub.user?.display_name || sub.user?.username}?`)) return;
    setSavingId(sub.id);
    try {
      const updated = await updateAdminSubscription(sub.id, "canceled");
      dispatch({ type: "patch", subscription: updated });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Assinaturas</h1>
          <p className="admin-page-subtitle">
            {state.total} assinatura{state.total === 1 ? "" : "s"} cadastrada{state.total === 1 ? "" : "s"}.
            MRR atual: <strong>{formatCurrency(state.mrr_cents)}</strong>.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <div className="admin-toolbar">
          <select className="admin-form-select admin-toolbar-filter"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="trialing">Em trial</option>
            <option value="paused">Pausadas</option>
            <option value="canceled">Canceladas</option>
            <option value="past_due">Inadimplentes</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Próxima cobrança</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.subscriptions.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma assinatura encontrada."}
                </td></tr>
              ) : state.subscriptions.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <strong>{sub.user?.display_name || sub.user?.username || "—"}</strong>
                    <p className="admin-form-help" style={{ margin: 0 }}>{sub.user?.email}</p>
                  </td>
                  <td>{sub.plan?.name || "—"}</td>
                  <td>
                    {sub.plan ? formatCurrency(sub.plan.price_cents, sub.plan.currency) : "—"}
                  </td>
                  <td>
                    <span className={statusBadge[sub.status] || "admin-badge admin-badge-gray"}>
                      {statusLabels[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className="admin-table-muted">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td>
                    {sub.status === "active" || sub.status === "trialing" ? (
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleCancel(sub)} disabled={savingId === sub.id}
                        style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>
                        Cancelar
                      </button>
                    ) : (
                      <span className="admin-form-help">—</span>
                    )}
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
