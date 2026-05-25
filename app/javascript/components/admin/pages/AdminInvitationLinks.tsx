import { useEffect, useReducer, useState } from "react";
import {
  createAdminInvitationLink,
  deleteAdminInvitationLink,
  loadAdminInvitationLinks,
  loadAdminPlans,
  updateAdminInvitationLink,
  type AdminInvitationLink,
  type AdminPlan,
} from "../../../lib/adminApi";

// /members/invitation_links - URLs unicas para campanhas com tracking.

const statusBadge: Record<AdminInvitationLink["status"], string> = {
  active: "admin-badge admin-badge-green",
  expired: "admin-badge admin-badge-gray",
  consumed: "admin-badge admin-badge-gray",
  inactive: "admin-badge admin-badge-gray",
};

const statusLabels: Record<AdminInvitationLink["status"], string> = {
  active: "Ativo",
  expired: "Expirado",
  consumed: "Esgotado",
  inactive: "Pausado",
};

type State = {
  phase: "loading" | "ready" | "error";
  links: AdminInvitationLink[];
  plans: AdminPlan[];
  message?: string;
};

type Action =
  | { type: "load_success"; links: AdminInvitationLink[]; plans: AdminPlan[] }
  | { type: "load_error"; message: string }
  | { type: "append"; link: AdminInvitationLink }
  | { type: "patch"; link: AdminInvitationLink }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", links: action.links, plans: action.plans };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, links: [action.link, ...state.links] };
    case "patch":        return { ...state, links: state.links.map(l => l.id === action.link.id ? action.link : l) };
    case "remove":       return { ...state, links: state.links.filter(l => l.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", links: [], plans: [] };

export function AdminInvitationLinks() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [planId, setPlanId] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAdminInvitationLinks(), loadAdminPlans()])
      .then(([links, plans]) => { if (!cancelled) dispatch({ type: "load_success", links, plans }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim() || null,
        description: description.trim() || null,
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt || null,
        active: true,
      };
      if (planId) payload.plan_id = planId;
      const link = await createAdminInvitationLink(payload);
      dispatch({ type: "append", link });
      setName(""); setDescription(""); setPlanId(""); setMaxUses(""); setExpiresAt("");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (link: AdminInvitationLink) => {
    setSavingId(link.id);
    try {
      const updated = await updateAdminInvitationLink(link.id, { active: !link.active });
      dispatch({ type: "patch", link: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (link: AdminInvitationLink) => {
    if (!window.confirm(`Excluir o link "${link.name || link.code}"?`)) return;
    setSavingId(link.id);
    try {
      await deleteAdminInvitationLink(link.id);
      dispatch({ type: "remove", id: link.id });
    } finally {
      setSavingId(null);
    }
  };

  const handleCopy = (link: AdminInvitationLink) => {
    const fullUrl = `${window.location.origin}${link.url}`;
    navigator.clipboard?.writeText(fullUrl);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Links de convite</h1>
          <p className="admin-page-subtitle">
            URLs únicas com tracking de origem. Defina limite de usos, validade
            e plano que aplica automaticamente ao novo membro.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo link</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="il-name">Nome (interno)</label>
              <input id="il-name" type="text" className="admin-form-input"
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex.: Black Friday 2026" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="il-plan">Plano aplicado</label>
              <select id="il-plan" className="admin-form-select"
                value={planId} onChange={e => setPlanId(e.target.value)}>
                <option value="">— Nenhum —</option>
                {state.plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="il-uses">Limite de usos (vazio = ilimitado)</label>
              <input id="il-uses" type="number" min={1} className="admin-form-input"
                value={maxUses} onChange={e => setMaxUses(e.target.value)} />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="il-expires">Expira em</label>
              <input id="il-expires" type="datetime-local" className="admin-form-input"
                value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="il-desc">Descrição</label>
            <input id="il-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Gerando..." : "Gerar link"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Plano</th>
                <th>Usos</th>
                <th>Expira em</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.links.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum link gerado."}
                </td></tr>
              ) : state.links.map(link => (
                <tr key={link.id}>
                  <td>
                    <strong>{link.name || link.code}</strong>
                    <p className="admin-form-help" style={{ margin: 0 }}>
                      <code style={{ fontSize: 11 }}>{link.url}</code>
                    </p>
                  </td>
                  <td className="admin-table-muted">{link.plan?.name || "—"}</td>
                  <td className="admin-table-muted">
                    {link.uses_count}{link.max_uses ? ` / ${link.max_uses}` : ""}
                  </td>
                  <td className="admin-table-muted">
                    {link.expires_at ? new Date(link.expires_at).toLocaleString("pt-BR") : "—"}
                  </td>
                  <td>
                    <span className={statusBadge[link.status]}>
                      {statusLabels[link.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleCopy(link)}
                        style={{ height: 28, fontSize: 12 }}>Copiar</button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggle(link)} disabled={savingId === link.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {link.active ? "Pausar" : "Ativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(link)} disabled={savingId === link.id}
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
