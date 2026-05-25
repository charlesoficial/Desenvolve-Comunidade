import { useEffect, useReducer, useState } from "react";
import {
  createAdminPaywallGroup,
  deleteAdminPaywallGroup,
  loadAdminPaywallGroups,
  loadAdminPaywalls,
  updateAdminPaywallGroup,
  type AdminPaywall,
  type AdminPaywallGroup,
} from "../../../lib/adminApi";

// /settings/paywall_groups - bundles de varios paywalls com 1 preco unico.

function formatCurrency(cents: number, currency = "BRL") {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });
}

const intervalLabels: Record<AdminPaywallGroup["interval"], string> = {
  month: "Mensal",
  year: "Anual",
  one_time: "Pagamento único",
};

type State = { phase: "loading" | "ready" | "error"; groups: AdminPaywallGroup[]; paywalls: AdminPaywall[]; message?: string };
type Action =
  | { type: "load_success"; groups: AdminPaywallGroup[]; paywalls: AdminPaywall[] }
  | { type: "load_error"; message: string }
  | { type: "append"; group: AdminPaywallGroup }
  | { type: "patch"; group: AdminPaywallGroup }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", groups: action.groups, paywalls: action.paywalls };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, groups: [action.group, ...state.groups] };
    case "patch":        return { ...state, groups: state.groups.map(g => g.id === action.group.id ? action.group : g) };
    case "remove":       return { ...state, groups: state.groups.filter(g => g.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", groups: [], paywalls: [] };

export function AdminPaywallGroups() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceReais, setPriceReais] = useState("");
  const [interval, setInterval] = useState<AdminPaywallGroup["interval"]>("month");
  const [trialDays, setTrialDays] = useState("0");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAdminPaywallGroups(), loadAdminPaywalls()])
      .then(([groups, paywalls]) => { if (!cancelled) dispatch({ type: "load_success", groups, paywalls }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const togglePaywall = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const cents = Math.round(Number(priceReais.replace(",", ".")) * 100) || 0;
      const group = await createAdminPaywallGroup({
        name: name.trim(),
        description,
        price_cents: cents,
        currency: "BRL",
        interval,
        trial_days: Number(trialDays) || 0,
        paywall_ids: Array.from(selected),
        active: true,
      });
      dispatch({ type: "append", group });
      setName(""); setDescription(""); setPriceReais(""); setTrialDays("0"); setSelected(new Set());
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (group: AdminPaywallGroup) => {
    setSavingId(group.id);
    try {
      const updated = await updateAdminPaywallGroup(group.id, { active: !group.active });
      dispatch({ type: "patch", group: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (group: AdminPaywallGroup) => {
    if (!window.confirm(`Excluir o grupo "${group.name}"?`)) return;
    setSavingId(group.id);
    try {
      await deleteAdminPaywallGroup(group.id);
      dispatch({ type: "remove", id: group.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Grupos de assinatura</h1>
          <p className="admin-page-subtitle">
            Combine vários paywalls num único pacote (ex.: Mentoria + Curso = bundle).
            Membro paga uma vez e libera tudo.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo grupo</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="pg-name">Nome</label>
              <input id="pg-name" type="text" className="admin-form-input"
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="Ex.: Pacote Mentoria + Curso" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="pg-price">Preço (R$)</label>
              <input id="pg-price" type="text" inputMode="decimal" className="admin-form-input"
                value={priceReais} onChange={e => setPriceReais(e.target.value)} placeholder="297,00" />
            </div>
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="pg-interval">Cobrança</label>
              <select id="pg-interval" className="admin-form-select"
                value={interval} onChange={e => setInterval(e.target.value as AdminPaywallGroup["interval"])}>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
                <option value="one_time">Pagamento único</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="pg-trial">Trial (dias)</label>
              <input id="pg-trial" type="number" min={0} className="admin-form-input"
                value={trialDays} onChange={e => setTrialDays(e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="pg-desc">Descrição</label>
            <input id="pg-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label">Paywalls inclusos</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, maxHeight: 220, overflowY: "auto", padding: 8, border: "1px solid #e7e9ec", borderRadius: 8 }}>
              {state.paywalls.length === 0 ? (
                <p className="admin-form-help" style={{ margin: 0 }}>Nenhum paywall cadastrado ainda.</p>
              ) : state.paywalls.map(pw => (
                <label key={pw.id} className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={selected.has(pw.id)} onChange={() => togglePaywall(pw.id)} />
                  {pw.name} <span style={{ color: "#717680" }}>· {formatCurrency(pw.price_cents, pw.currency)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar grupo"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Paywalls</th>
                <th>Preço</th>
                <th>Cobrança</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.groups.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum grupo cadastrado."}
                </td></tr>
              ) : state.groups.map(group => (
                <tr key={group.id}>
                  <td>
                    <strong>{group.name}</strong>
                    {group.description ? <p className="admin-form-help" style={{ margin: 0 }}>{group.description}</p> : null}
                  </td>
                  <td className="admin-table-muted">
                    {group.paywall_count} {group.paywall_count === 1 ? "paywall" : "paywalls"}
                  </td>
                  <td>{formatCurrency(group.price_cents, group.currency)}</td>
                  <td className="admin-table-muted">{intervalLabels[group.interval]}{group.trial_days > 0 ? ` · trial ${group.trial_days}d` : ""}</td>
                  <td>
                    <span className={group.active ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                      {group.active ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggle(group)} disabled={savingId === group.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {group.active ? "Pausar" : "Ativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(group)} disabled={savingId === group.id}
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
