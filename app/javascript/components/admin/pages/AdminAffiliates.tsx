import { useEffect, useReducer, useState } from "react";
import {
  createAdminAffiliate,
  deleteAdminAffiliate,
  loadAdminAffiliates,
  updateAdminAffiliate,
  type AdminAffiliate,
} from "../../../lib/adminApi";
import { loadAdminUsers, type AdminUser } from "../../../lib/adminApi";

// Pagina /settings/affiliates_settings - cadastro e listagem de afiliados.

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type State = { phase: "loading" | "ready" | "error"; rows: AdminAffiliate[]; message?: string };
type Action =
  | { type: "load_success"; rows: AdminAffiliate[] }
  | { type: "load_error"; message: string }
  | { type: "append"; row: AdminAffiliate }
  | { type: "patch"; row: AdminAffiliate }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", rows: action.rows };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, rows: [action.row, ...state.rows] };
    case "patch":        return { ...state, rows: state.rows.map(r => r.id === action.row.id ? action.row : r) };
    case "remove":       return { ...state, rows: state.rows.filter(r => r.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", rows: [] };

export function AdminAffiliates() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userId, setUserId] = useState("");
  const [commission, setCommission] = useState(30);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAdminAffiliates(),
      loadAdminUsers({ perPage: 100 }),
    ])
      .then(([rows, page]) => {
        if (cancelled) return;
        dispatch({ type: "load_success", rows });
        setUsers(page.users);
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar afiliados." }); });
    return () => { cancelled = true; };
  }, []);

  const eligibleUsers = users.filter(u => !state.rows.some(r => r.user?.id === u.id));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setCreating(true);
    try {
      const row = await createAdminAffiliate({ user_id: userId, commission_pct: commission });
      dispatch({ type: "append", row });
      setUserId("");
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar afiliado." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (row: AdminAffiliate) => {
    setSavingId(row.id);
    try {
      const updated = await updateAdminAffiliate(row.id, { active: !row.active });
      dispatch({ type: "patch", row: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (row: AdminAffiliate) => {
    if (!window.confirm(`Excluir o código ${row.code}?`)) return;
    setSavingId(row.id);
    try {
      await deleteAdminAffiliate(row.id);
      dispatch({ type: "remove", id: row.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Afiliados</h1>
          <p className="admin-page-subtitle">
            Cadastre membros como afiliados e receba relatório de visitas,
            conversões e receita gerada por cada código.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo afiliado</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="aff-user">Membro</label>
              <select
                id="aff-user"
                className="admin-form-select"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {eligibleUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="aff-pct">Comissão (%)</label>
              <input
                id="aff-pct"
                type="number"
                min={1}
                max={100}
                className="admin-form-input"
                value={commission}
                onChange={e => setCommission(Number(e.target.value) || 30)}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating || !userId}>
              {creating ? "Criando..." : "Cadastrar afiliado"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Código</th>
                <th>Comissão</th>
                <th>Visitas</th>
                <th>Conversões</th>
                <th>Receita</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" ? (
                <tr><td colSpan={8} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Carregando...</td></tr>
              ) : state.rows.length === 0 ? (
                <tr><td colSpan={8} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>Nenhum afiliado cadastrado.</td></tr>
              ) : state.rows.map(row => (
                <tr key={row.id}>
                  <td>{row.user?.display_name || row.user?.username || "—"}</td>
                  <td><code style={{ fontSize: 12 }}>{row.code}</code></td>
                  <td>{row.commission_pct}%</td>
                  <td className="admin-table-muted">{row.visits_count}</td>
                  <td className="admin-table-muted">{row.conversions_count}</td>
                  <td>{formatCurrency(row.total_revenue_cents)}</td>
                  <td>
                    <span className={row.active ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                      {row.active ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleToggle(row)} disabled={savingId === row.id} style={{ height: 28, fontSize: 12 }}>
                        {row.active ? "Pausar" : "Ativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleDelete(row)} disabled={savingId === row.id} style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>
                        Excluir
                      </button>
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
