import { useEffect, useReducer, useState } from "react";
import {
  loadAdminAiConversations,
  updateAdminAiConversation,
  type AdminAiConversation,
} from "../../../lib/adminApi";

// /settings/ai-agents/inbox - conversas que a IA teve com membros.

const statusBadge: Record<AdminAiConversation["status"], string> = {
  open: "admin-badge admin-badge-blue",
  resolved: "admin-badge admin-badge-green",
  escalated: "admin-badge admin-badge-gray",
};

const statusLabels: Record<AdminAiConversation["status"], string> = {
  open: "Aberta",
  resolved: "Resolvida",
  escalated: "Escalada",
};

type State = {
  phase: "loading" | "ready" | "error";
  conversations: AdminAiConversation[];
  total: number;
  totalPages: number;
  message?: string;
};

type Action =
  | { type: "load_success"; conversations: AdminAiConversation[]; total: number; totalPages: number }
  | { type: "load_error"; message: string }
  | { type: "patch"; conversation: AdminAiConversation };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", conversations: action.conversations, total: action.total, totalPages: action.totalPages };
    case "load_error":
      return { ...state, phase: "error", message: action.message };
    case "patch":
      return { ...state, conversations: state.conversations.map(c => c.id === action.conversation.id ? action.conversation : c) };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", conversations: [], total: 0, totalPages: 0 };

export function AdminAiInbox() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminAiConversations({ page, status: statusFilter })
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", conversations: data.conversations, total: data.total, totalPages: data.total_pages });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar conversas." }); });
    return () => { cancelled = true; };
  }, [page, statusFilter]);

  const handleResolve = async (conv: AdminAiConversation, status: AdminAiConversation["status"]) => {
    setSavingId(conv.id);
    try {
      const updated = await updateAdminAiConversation(conv.id, { status });
      dispatch({ type: "patch", conversation: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleConvert = async (conv: AdminAiConversation) => {
    setSavingId(conv.id);
    try {
      const updated = await updateAdminAiConversation(conv.id, { converted_to_kb: !conv.converted_to_kb });
      dispatch({ type: "patch", conversation: updated });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Inbox da IA</h1>
          <p className="admin-page-subtitle">
            Conversas que o agente teve com membros.
            {state.total > 0 ? ` ${state.total} conversa${state.total === 1 ? "" : "s"} registrada${state.total === 1 ? "" : "s"}.` : ""}
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
            <option value="open">Abertas</option>
            <option value="resolved">Resolvidas</option>
            <option value="escalated">Escaladas</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Pergunta / Resposta</th>
                <th>Turnos</th>
                <th>Avaliação</th>
                <th>Status</th>
                <th style={{ width: 240 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.conversations.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhuma conversa registrada."}
                </td></tr>
              ) : state.conversations.map(conv => (
                <tr key={conv.id}>
                  <td>
                    {conv.user ? (
                      <>
                        <strong>{conv.user.display_name}</strong>
                        <p className="admin-form-help" style={{ margin: 0 }}>{conv.user.email}</p>
                      </>
                    ) : <span className="admin-table-muted">Anônimo</span>}
                  </td>
                  <td>
                    {conv.last_question ? (
                      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>"{conv.last_question}"</p>
                    ) : null}
                    {conv.last_answer ? (
                      <p className="admin-form-help" style={{ margin: 0, maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        IA: {conv.last_answer}
                      </p>
                    ) : null}
                  </td>
                  <td className="admin-table-muted">{conv.turns_count}</td>
                  <td className="admin-table-muted">
                    {conv.rating === "positive" ? "👍" : conv.rating === "negative" ? "👎" : "—"}
                  </td>
                  <td>
                    <span className={statusBadge[conv.status]}>{statusLabels[conv.status]}</span>
                    {conv.converted_to_kb ? (
                      <p className="admin-form-help" style={{ margin: "4px 0 0", color: "#047857", fontSize: 11 }}>
                        Na base de conhecimento
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {conv.status !== "resolved" ? (
                        <button type="button" className="admin-btn admin-btn-ghost"
                          onClick={() => handleResolve(conv, "resolved")} disabled={savingId === conv.id}
                          style={{ height: 28, fontSize: 12 }}>Marcar resolvida</button>
                      ) : null}
                      {conv.status !== "escalated" ? (
                        <button type="button" className="admin-btn admin-btn-ghost"
                          onClick={() => handleResolve(conv, "escalated")} disabled={savingId === conv.id}
                          style={{ height: 28, fontSize: 12 }}>Escalar</button>
                      ) : null}
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleConvert(conv)} disabled={savingId === conv.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {conv.converted_to_kb ? "Remover da KB" : "Adicionar à KB"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {state.totalPages > 1 ? (
          <div className="admin-pagination">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
            <span className="admin-form-help" style={{ alignSelf: "center" }}>Página {page} de {state.totalPages}</span>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPage(p => Math.min(state.totalPages, p + 1))} disabled={page >= state.totalPages}>Próxima</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
