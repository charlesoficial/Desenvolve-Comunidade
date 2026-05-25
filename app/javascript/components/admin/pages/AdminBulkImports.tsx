import { useEffect, useReducer, useState } from "react";
import {
  createAdminBulkImport,
  loadAdminBulkImports,
  loadAdminPlans,
  type AdminBulkImport,
  type AdminPlan,
} from "../../../lib/adminApi";

// /settings/members/bulk_import_tasks - historico de uploads CSV de membros.

const statusBadge: Record<AdminBulkImport["status"], string> = {
  pending: "admin-badge admin-badge-gray",
  running: "admin-badge admin-badge-blue",
  completed: "admin-badge admin-badge-green",
  failed: "admin-badge admin-badge-gray",
};

const statusLabels: Record<AdminBulkImport["status"], string> = {
  pending: "Na fila",
  running: "Processando",
  completed: "Concluído",
  failed: "Falhou",
};

type State = {
  phase: "loading" | "ready" | "error";
  imports: AdminBulkImport[];
  plans: AdminPlan[];
  message?: string;
};

type Action =
  | { type: "load_success"; imports: AdminBulkImport[]; plans: AdminPlan[] }
  | { type: "load_error"; message: string }
  | { type: "append"; row: AdminBulkImport };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", imports: action.imports, plans: action.plans };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, imports: [action.row, ...state.imports] };
    default:             return state;
  }
}

const initial: State = { phase: "loading", imports: [], plans: [] };

export function AdminBulkImports() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [fileName, setFileName] = useState("");
  const [totalRows, setTotalRows] = useState("");
  const [tags, setTags] = useState("");
  const [planId, setPlanId] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAdminBulkImports(), loadAdminPlans()])
      .then(([imports, plans]) => { if (!cancelled) dispatch({ type: "load_success", imports, plans }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    setCreating(true);
    try {
      const row = await createAdminBulkImport({
        file_name: fileName.trim(),
        total_rows: totalRows ? Number(totalRows) : undefined,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        plan_id: planId || undefined,
        note: note.trim() || undefined,
      });
      dispatch({ type: "append", row });
      setFileName(""); setTotalRows(""); setTags(""); setPlanId(""); setNote("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Importações de membros</h1>
          <p className="admin-page-subtitle">
            Histórico de uploads de CSV. Crie uma nova tarefa para registrar
            uma importação em massa de membros.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova importação</h2>
          <p className="admin-form-help" style={{ margin: 0 }}>
            Registre o CSV processado para auditoria. O processamento real é feito por um worker.
          </p>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="bi-file">Nome do arquivo</label>
              <input id="bi-file" type="text" className="admin-form-input"
                value={fileName} onChange={e => setFileName(e.target.value)} required
                placeholder="membros-2026-q2.csv" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="bi-rows">Total de linhas</label>
              <input id="bi-rows" type="number" min={0} className="admin-form-input"
                value={totalRows} onChange={e => setTotalRows(e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="bi-tags">Tags aplicadas (separe por vírgula)</label>
              <input id="bi-tags" type="text" className="admin-form-input"
                value={tags} onChange={e => setTags(e.target.value)} placeholder="vip, q2-2026" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="bi-plan">Plano aplicado</label>
              <select id="bi-plan" className="admin-form-select"
                value={planId} onChange={e => setPlanId(e.target.value)}>
                <option value="">— Nenhum —</option>
                {state.plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="bi-note">Observação</label>
            <input id="bi-note" type="text" className="admin-form-input"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Registrando..." : "Registrar importação"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Linhas</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Iniciado em</th>
                <th>Concluído em</th>
              </tr>
            </thead>
            <tbody>
              {state.imports.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma importação registrada."}
                </td></tr>
              ) : state.imports.map(row => {
                const filters = (row.filters || {}) as { file_name?: string; total_rows?: number; tags?: string[]; note?: string };
                return (
                  <tr key={row.id}>
                    <td>
                      <strong>{filters.file_name || "—"}</strong>
                      {filters.note ? <p className="admin-form-help" style={{ margin: 0 }}>{filters.note}</p> : null}
                    </td>
                    <td className="admin-table-muted">{filters.total_rows ?? "—"}</td>
                    <td className="admin-table-muted">
                      {(filters.tags || []).join(", ") || "—"}
                    </td>
                    <td><span className={statusBadge[row.status]}>{statusLabels[row.status]}</span></td>
                    <td className="admin-table-muted">{new Date(row.created_at).toLocaleString("pt-BR")}</td>
                    <td className="admin-table-muted">
                      {row.finished_at ? new Date(row.finished_at).toLocaleString("pt-BR") : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
