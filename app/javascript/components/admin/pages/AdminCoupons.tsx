import { useEffect, useReducer, useState } from "react";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  loadAdminCoupons,
  updateAdminCoupon,
  type AdminCoupon,
} from "../../../lib/adminApi";

// Pagina /settings/coupons - cupons de desconto aplicaveis a paywalls/planos.

const discountTypeLabel: Record<AdminCoupon["discount_type"], string> = {
  percent: "%",
  fixed: "R$",
};

function formatDiscount(coupon: AdminCoupon) {
  if (coupon.discount_type === "percent") return `${coupon.discount_value}%`;
  return (coupon.discount_value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type State = { phase: "loading" | "ready" | "error"; coupons: AdminCoupon[]; message?: string };
type Action =
  | { type: "load_success"; coupons: AdminCoupon[] }
  | { type: "load_error"; message: string }
  | { type: "append"; coupon: AdminCoupon }
  | { type: "patch"; coupon: AdminCoupon }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", coupons: action.coupons };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, coupons: [action.coupon, ...state.coupons] };
    case "patch":        return { ...state, coupons: state.coupons.map(c => c.id === action.coupon.id ? action.coupon : c) };
    case "remove":       return { ...state, coupons: state.coupons.filter(c => c.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", coupons: [] };

const blankDraft = {
  code: "",
  description: "",
  discount_type: "percent" as const,
  discount_value: 10,
  max_uses: "" as string | "",
  expires_at: "" as string | "",
  applies_to: "all" as const,
};

export function AdminCoupons() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState(blankDraft);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminCoupons()
      .then(coupons => { if (!cancelled) dispatch({ type: "load_success", coupons }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os cupons." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.code.trim()) return;
    setCreating(true);
    try {
      const coupon = await createAdminCoupon({
        code: draft.code.trim().toUpperCase(),
        description: draft.description,
        discount_type: draft.discount_type,
        discount_value: Number(draft.discount_value) || 0,
        max_uses: draft.max_uses === "" ? null : Number(draft.max_uses),
        expires_at: draft.expires_at ? new Date(draft.expires_at).toISOString() : null,
        applies_to: draft.applies_to,
      });
      dispatch({ type: "append", coupon });
      setDraft(blankDraft);
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar cupom." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (coupon: AdminCoupon) => {
    setSavingId(coupon.id);
    try {
      const updated = await updateAdminCoupon(coupon.id, { active: !coupon.active });
      dispatch({ type: "patch", coupon: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!window.confirm(`Excluir o cupom "${coupon.code}"?`)) return;
    setSavingId(coupon.id);
    try {
      await deleteAdminCoupon(coupon.id);
      dispatch({ type: "remove", id: coupon.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Cupons</h1>
          <p className="admin-page-subtitle">
            Códigos de desconto aplicáveis a paywalls e planos. Pode ser percentual ou valor fixo.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo cupom</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="cp-code">Código</label>
              <input id="cp-code" type="text" className="admin-form-input"
                value={draft.code} onChange={e => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="LANCAMENTO20" required />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="cp-desc">Descrição (interna)</label>
              <input id="cp-desc" type="text" className="admin-form-input"
                value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
                placeholder="Cupom da campanha do lançamento" />
            </div>
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="cp-type">Tipo de desconto</label>
              <select id="cp-type" className="admin-form-select"
                value={draft.discount_type} onChange={e => setDraft({ ...draft, discount_type: e.target.value as "percent" | "fixed" })}>
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="cp-value">
                Valor {draft.discount_type === "percent" ? "(%)" : "(em centavos)"}
              </label>
              <input id="cp-value" type="number" className="admin-form-input"
                min={0} value={draft.discount_value}
                onChange={e => setDraft({ ...draft, discount_value: Number(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="cp-max">Limite de usos (opcional)</label>
              <input id="cp-max" type="number" className="admin-form-input"
                min={0} value={draft.max_uses}
                onChange={e => setDraft({ ...draft, max_uses: e.target.value })}
                placeholder="Sem limite" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="cp-exp">Validade (opcional)</label>
              <input id="cp-exp" type="datetime-local" className="admin-form-input"
                value={draft.expires_at} onChange={e => setDraft({ ...draft, expires_at: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar cupom"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Usos</th>
                <th>Validade</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.coupons.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum cupom criado."}
                </td></tr>
              ) : state.coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <strong><code style={{ fontSize: 13 }}>{coupon.code}</code></strong>
                    {coupon.description ? (
                      <p className="admin-form-help" style={{ margin: 0 }}>{coupon.description}</p>
                    ) : null}
                  </td>
                  <td>{formatDiscount(coupon)} {discountTypeLabel[coupon.discount_type]}</td>
                  <td className="admin-table-muted">
                    {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""}
                  </td>
                  <td className="admin-table-muted">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td>
                    <span className={
                      coupon.usable ? "admin-badge admin-badge-green"
                      : coupon.active ? "admin-badge admin-badge-blue"
                      : "admin-badge admin-badge-gray"
                    }>
                      {coupon.usable ? "Ativo" : coupon.active ? "Esgotado/Expirado" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggle(coupon)} disabled={savingId === coupon.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {coupon.active ? "Pausar" : "Reativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(coupon)} disabled={savingId === coupon.id}
                        style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>Excluir</button>
                    </div>
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
