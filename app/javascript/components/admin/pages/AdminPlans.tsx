import { useEffect, useReducer, useState } from "react";
import {
  createAdminPlan,
  deleteAdminPlan,
  loadAdminPlans,
  updateAdminPlan,
  type AdminPlan,
} from "../../../lib/adminApi";
import { createCheckoutSession } from "../../../lib/billing";

// Pagina /settings/plans — CRUD de planos de assinatura.
// Le do Postgres via /api/v1/admin/plans (controller Rails).

const intervalLabels: Record<AdminPlan["interval"], string> = {
  month: "/mês",
  year: "/ano",
  one_time: "único",
};

function formatPrice(cents: number, currency: string, interval: AdminPlan["interval"]) {
  const amount = (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  });
  return `${amount} ${intervalLabels[interval]}`;
}

type Phase = "loading" | "ready" | "error";

type State = { phase: Phase; plans: AdminPlan[]; message?: string };

type Action =
  | { type: "load_success"; plans: AdminPlan[] }
  | { type: "load_error"; message: string }
  | { type: "patch"; plan: AdminPlan }
  | { type: "remove"; id: string }
  | { type: "append"; plan: AdminPlan };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", plans: action.plans };
    case "load_error":
      return { phase: "error", plans: state.plans, message: action.message };
    case "patch":
      return {
        ...state,
        plans: state.plans.map((p) => (p.id === action.plan.id ? action.plan : p)),
      };
    case "remove":
      return { ...state, plans: state.plans.filter((p) => p.id !== action.id) };
    case "append":
      return { ...state, plans: [...state.plans, action.plan] };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", plans: [] };

type Draft = {
  name: string;
  description: string;
  price_cents: number;
  interval: AdminPlan["interval"];
  highlight: boolean;
};

const blankDraft: Draft = {
  name: "",
  description: "",
  price_cents: 4700,
  interval: "month",
  highlight: false,
};

export function AdminPlans() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminPlans()
      .then((plans) => {
        if (!cancelled) dispatch({ type: "load_success", plans });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os planos." });
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
      const plan = await createAdminPlan({
        name: draft.name,
        description: draft.description,
        price_cents: Math.max(0, Math.round(draft.price_cents)),
        interval: draft.interval,
        highlight: draft.highlight,
      });
      dispatch({ type: "append", plan });
      setDraft(blankDraft);
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar plano." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleHighlight = async (plan: AdminPlan) => {
    setSavingId(plan.id);
    try {
      const updated = await updateAdminPlan(plan.id, { highlight: !plan.highlight });
      dispatch({ type: "patch", plan: updated });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao atualizar plano." });
    } finally {
      setSavingId(null);
    }
  };

  const handleCheckout = async (plan: AdminPlan) => {
    setSavingId(plan.id);
    try {
      const result = await createCheckoutSession(plan.id);
      if (result.mode === "stub") {
        window.alert(
          `Stripe não configurado. URL de stub gerada:\n${result.url}\n\nDefina STRIPE_SECRET_KEY no .env do Rails para abrir o Checkout real.`,
        );
      } else {
        window.location.assign(result.url);
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: "load_error", message: "Falha ao iniciar checkout." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (plan: AdminPlan) => {
    if (!window.confirm(`Excluir o plano "${plan.name}"?`)) return;
    setSavingId(plan.id);
    try {
      await deleteAdminPlan(plan.id);
      dispatch({ type: "remove", id: plan.id });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao excluir plano." });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Planos</h1>
          <p className="admin-page-subtitle">
            Defina os níveis de acesso e cobrança recorrente da comunidade.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo plano</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="plan-name">Nome</label>
              <input
                id="plan-name"
                type="text"
                className="admin-form-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex.: Pro"
                required
              />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="plan-price">Preço (em centavos)</label>
              <input
                id="plan-price"
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
            <label className="admin-form-label" htmlFor="plan-description">Descrição</label>
            <textarea
              id="plan-description"
              className="admin-form-textarea"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="O que está incluído neste plano?"
            />
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="plan-interval">Intervalo</label>
              <select
                id="plan-interval"
                className="admin-form-select"
                value={draft.interval}
                onChange={(e) => setDraft({ ...draft, interval: e.target.value as AdminPlan["interval"] })}
              >
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
                <option value="one_time">Único</option>
              </select>
            </div>
            <label
              style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}
              className="admin-form-help"
            >
              <input
                type="checkbox"
                checked={draft.highlight}
                onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })}
              />
              Destacar este plano como recomendado
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar plano"}
            </button>
          </div>
        </form>

        <div className="admin-cards-grid">
          {state.plans.map((plan) => (
            <article
              key={plan.id}
              className={plan.highlight ? "admin-plan-card is-highlight" : "admin-plan-card"}
            >
              <header>
                <h2>{plan.name}</h2>
                {plan.highlight ? (
                  <span className="admin-badge admin-badge-blue">Mais popular</span>
                ) : null}
              </header>
              <p className="admin-plan-desc">{plan.description}</p>
              <strong className="admin-plan-price">
                {formatPrice(plan.price_cents, plan.currency, plan.interval)}
              </strong>
              <span className="admin-plan-meta">
                {plan.active ? "Ativo" : "Pausado"} • posição {plan.position}
              </span>
              <div style={{ display: "flex", gap: 6, marginTop: "auto", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleCheckout(plan)}
                  disabled={savingId === plan.id}
                  style={{ height: 32, fontSize: 12 }}
                >
                  Testar checkout
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => handleToggleHighlight(plan)}
                  disabled={savingId === plan.id}
                  style={{ height: 32, fontSize: 12 }}
                >
                  {plan.highlight ? "Remover destaque" : "Destacar"}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => handleDelete(plan)}
                  disabled={savingId === plan.id}
                  style={{ height: 32, fontSize: 12, color: "#b91c1c" }}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
