import { useEffect, useReducer, useState } from "react";
import {
  createAdminPaywall,
  deleteAdminPaywall,
  loadAdminPaywalls,
  updateAdminPaywall,
  type AdminPaywall,
} from "../../../lib/adminApi";

// Pagina /settings/paywalls — gerencia paywalls cobrando antes do
// acesso a conteudos. CRUD completo via /api/v1/admin/paywalls.

const statusLabels: Record<AdminPaywall["status"], string> = {
  active: "Ativo",
  paused: "Pausado",
  archived: "Arquivado",
};

function formatPrice(cents: number, currency: string, interval: AdminPaywall["interval"]) {
  const amount = (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  });
  const suffix = interval === "month" ? "/mês" : interval === "year" ? "/ano" : "único";
  return `${amount} ${suffix}`;
}

type State = { phase: "loading" | "ready" | "error"; paywalls: AdminPaywall[]; message?: string };

type Action =
  | { type: "load_success"; paywalls: AdminPaywall[] }
  | { type: "load_error"; message: string }
  | { type: "append"; paywall: AdminPaywall }
  | { type: "patch"; paywall: AdminPaywall }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", paywalls: action.paywalls };
    case "load_error":
      return { phase: "error", paywalls: state.paywalls, message: action.message };
    case "append":
      return { ...state, paywalls: [...state.paywalls, action.paywall] };
    case "patch":
      return { ...state, paywalls: state.paywalls.map((p) => (p.id === action.paywall.id ? action.paywall : p)) };
    case "remove":
      return { ...state, paywalls: state.paywalls.filter((p) => p.id !== action.id) };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", paywalls: [] };

type Draft = {
  name: string;
  description: string;
  price_cents: number;
  interval: AdminPaywall["interval"];
  status: AdminPaywall["status"];
};

const blankDraft: Draft = {
  name: "",
  description: "",
  price_cents: 9700,
  interval: "month",
  status: "active",
};

export function AdminPaywalls() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminPaywalls()
      .then((paywalls) => {
        if (!cancelled) dispatch({ type: "load_success", paywalls });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os paywalls." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setCreating(true);
    try {
      const paywall = await createAdminPaywall({
        name: draft.name,
        description: draft.description,
        price_cents: Math.max(0, Math.round(draft.price_cents)),
        interval: draft.interval,
        status: draft.status,
      });
      dispatch({ type: "append", paywall });
      setDraft(blankDraft);
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar paywall." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (paywall: AdminPaywall) => {
    const next: AdminPaywall["status"] = paywall.status === "active" ? "paused" : "active";
    setSavingId(paywall.id);
    try {
      const updated = await updateAdminPaywall(paywall.id, { status: next });
      dispatch({ type: "patch", paywall: updated });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao atualizar paywall." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (paywall: AdminPaywall) => {
    if (!window.confirm(`Excluir o paywall "${paywall.name}"?`)) return;
    setSavingId(paywall.id);
    try {
      await deleteAdminPaywall(paywall.id);
      dispatch({ type: "remove", id: paywall.id });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao excluir paywall." });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Paywalls</h1>
          <p className="admin-page-subtitle">
            Configure cobranças únicas ou recorrentes para liberar acesso a
            espaços e conteúdos da comunidade.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo paywall</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="paywall-name">Nome</label>
              <input
                id="paywall-name"
                type="text"
                className="admin-form-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex.: Mentoria Premium"
                required
              />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="paywall-price">Preço (em centavos)</label>
              <input
                id="paywall-price"
                type="number"
                min={0}
                step={100}
                className="admin-form-input"
                value={draft.price_cents}
                onChange={(e) => setDraft({ ...draft, price_cents: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="paywall-description">Descrição</label>
            <textarea
              id="paywall-description"
              className="admin-form-textarea"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="O que o membro recebe ao pagar?"
            />
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="paywall-interval">Intervalo</label>
              <select
                id="paywall-interval"
                className="admin-form-select"
                value={draft.interval}
                onChange={(e) => setDraft({ ...draft, interval: e.target.value as AdminPaywall["interval"] })}
              >
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
                <option value="one_time">Único</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="paywall-status">Status</label>
              <select
                id="paywall-status"
                className="admin-form-select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminPaywall["status"] })}
              >
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar paywall"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Paywall</th>
                <th>Preço</th>
                <th>Status</th>
                <th style={{ width: 240 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" && state.paywalls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.paywalls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum paywall criado ainda.
                  </td>
                </tr>
              ) : (
                state.paywalls.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description ? (
                        <p className="admin-form-help" style={{ margin: 0 }}>{p.description}</p>
                      ) : null}
                    </td>
                    <td>{formatPrice(p.price_cents, p.currency, p.interval)}</td>
                    <td>
                      <span
                        className={
                          p.status === "active"
                            ? "admin-badge admin-badge-green"
                            : p.status === "paused"
                            ? "admin-badge admin-badge-gray"
                            : "admin-badge admin-badge-blue"
                        }
                      >
                        {statusLabels[p.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleToggleStatus(p)}
                          disabled={savingId === p.id}
                          style={{ height: 28, fontSize: 12 }}
                        >
                          {p.status === "active" ? "Pausar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleDelete(p)}
                          disabled={savingId === p.id}
                          style={{ height: 28, fontSize: 12, color: "#b91c1c" }}
                        >
                          Excluir
                        </button>
                      </div>
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
