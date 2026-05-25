import { useEffect, useReducer, useState } from "react";
import {
  createAdminWorkflow,
  deleteAdminWorkflow,
  loadAdminWorkflows,
  updateAdminWorkflow,
  type AdminWorkflow,
} from "../../../lib/adminApi";

// Pagina /settings/workflows — automacoes (gatilho + acao).
// Persistencia em communities.settings["workflows"] (sem migration).

const triggerLabels: Record<string, string> = {
  member_joined: "Membro entrou",
  post_created: "Post publicado",
  comment_created: "Comentário criado",
  paywall_purchased: "Paywall comprado",
};

const actionLabels: Record<string, string> = {
  send_email: "Enviar e-mail",
  send_dm: "Enviar mensagem direta",
  grant_access: "Liberar acesso",
  tag_member: "Adicionar tag",
};

type State = { phase: "loading" | "ready" | "error"; flows: AdminWorkflow[]; message?: string };
type Action =
  | { type: "load_success"; flows: AdminWorkflow[] }
  | { type: "load_error"; message: string }
  | { type: "append"; flow: AdminWorkflow }
  | { type: "patch"; flow: AdminWorkflow }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", flows: action.flows };
    case "load_error":
      return { phase: "error", flows: state.flows, message: action.message };
    case "append":
      return { ...state, flows: [...state.flows, action.flow] };
    case "patch":
      return { ...state, flows: state.flows.map((f) => (f.id === action.flow.id ? action.flow : f)) };
    case "remove":
      return { ...state, flows: state.flows.filter((f) => f.id !== action.id) };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", flows: [] };

const draftBlank = {
  name: "",
  trigger: "member_joined" as string,
  action: "send_dm" as string,
  enabled: true,
};

export function AdminWorkflows() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [draft, setDraft] = useState(draftBlank);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminWorkflows()
      .then((flows) => {
        if (!cancelled) dispatch({ type: "load_success", flows });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar as automações." });
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
      const flow = await createAdminWorkflow({
        name: draft.name,
        trigger: draft.trigger,
        action: draft.action,
        enabled: draft.enabled,
      });
      dispatch({ type: "append", flow });
      setDraft(draftBlank);
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar automação." });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (flow: AdminWorkflow) => {
    setSavingId(flow.id);
    try {
      const updated = await updateAdminWorkflow(flow.id, { enabled: !flow.enabled });
      dispatch({ type: "patch", flow: updated });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao atualizar automação." });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (flow: AdminWorkflow) => {
    if (!window.confirm(`Excluir a automação "${flow.name}"?`)) return;
    setSavingId(flow.id);
    try {
      await deleteAdminWorkflow(flow.id);
      dispatch({ type: "remove", id: flow.id });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao excluir automação." });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Automações</h1>
          <p className="admin-page-subtitle">
            Crie regras simples no formato "quando A, então B" para reagir a
            eventos da comunidade.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nova automação</h2>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="wf-name">Nome</label>
            <input
              id="wf-name"
              type="text"
              className="admin-form-input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ex.: Boas-vindas"
              required
            />
          </div>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="wf-trigger">Quando</label>
              <select
                id="wf-trigger"
                className="admin-form-select"
                value={draft.trigger}
                onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}
              >
                {Object.entries(triggerLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="wf-action">Então</label>
              <select
                id="wf-action"
                className="admin-form-select"
                value={draft.action}
                onChange={(e) => setDraft({ ...draft, action: e.target.value })}
              >
                {Object.entries(actionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar automação"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Quando</th>
                <th>Então</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" && state.flows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.flows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhuma automação cadastrada.
                  </td>
                </tr>
              ) : (
                state.flows.map((flow) => (
                  <tr key={flow.id}>
                    <td>{flow.name}</td>
                    <td className="admin-table-muted">{triggerLabels[flow.trigger] || flow.trigger}</td>
                    <td className="admin-table-muted">{actionLabels[flow.action] || flow.action}</td>
                    <td>
                      <span
                        className={
                          flow.enabled
                            ? "admin-badge admin-badge-green"
                            : "admin-badge admin-badge-gray"
                        }
                      >
                        {flow.enabled ? "Ativa" : "Pausada"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleToggle(flow)}
                          disabled={savingId === flow.id}
                          style={{ height: 28, fontSize: 12 }}
                        >
                          {flow.enabled ? "Pausar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleDelete(flow)}
                          disabled={savingId === flow.id}
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
