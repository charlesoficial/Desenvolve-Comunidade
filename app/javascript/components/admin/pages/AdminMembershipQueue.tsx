import { useEffect, useReducer, useState } from "react";
import {
  deleteAdminMembership,
  loadAdminMemberships,
  updateAdminMembership,
  type AdminMembership,
} from "../../../lib/adminApi";

// Pagina compartilhada por /audience/invites e /audience/requests.
// Filtra memberships pelo state e oferece acoes (aprovar / rejeitar / desbloquear).

type Variant = "invites" | "requests";

const titleByVariant: Record<Variant, string> = {
  invites: "Convites",
  requests: "Solicitações",
};

const subtitleByVariant: Record<Variant, string> = {
  invites: "Membros convidados que ainda não aceitaram.",
  requests: "Pessoas que pediram para entrar e aguardam aprovação.",
};

type State = { phase: "loading" | "ready" | "error"; memberships: AdminMembership[]; message?: string };
type Action =
  | { type: "load_success"; memberships: AdminMembership[] }
  | { type: "load_error"; message: string }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", memberships: action.memberships };
    case "load_error":
      return { phase: "error", memberships: state.memberships, message: action.message };
    case "remove":
      return { ...state, memberships: state.memberships.filter((m) => m.id !== action.id) };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", memberships: [] };

type Props = { variant: Variant };

export function AdminMembershipQueue({ variant }: Props) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminMemberships("pending")
      .then((memberships) => {
        if (!cancelled) dispatch({ type: "load_success", memberships });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar a lista." });
      });
    return () => {
      cancelled = true;
    };
  }, [variant]);

  const handleApprove = async (membership: AdminMembership) => {
    setSavingId(membership.id);
    try {
      await updateAdminMembership(membership.id, { state: "active" });
      dispatch({ type: "remove", id: membership.id });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao aprovar." });
    } finally {
      setSavingId(null);
    }
  };

  const handleReject = async (membership: AdminMembership) => {
    if (!window.confirm("Rejeitar este pedido?")) return;
    setSavingId(membership.id);
    try {
      await deleteAdminMembership(membership.id);
      dispatch({ type: "remove", id: membership.id });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao rejeitar." });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>{titleByVariant[variant]}</h1>
          <p className="admin-page-subtitle">{subtitleByVariant[variant]}</p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>E-mail</th>
                <th>Pedido em</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" && state.memberships.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.memberships.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nada por aqui no momento.
                  </td>
                </tr>
              ) : (
                state.memberships.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="admin-table-member">
                        {m.user?.avatar_url ? (
                          <img src={m.user.avatar_url} alt="" className="admin-avatar" />
                        ) : (
                          <span className="admin-avatar" aria-hidden="true">
                            {(m.user?.display_name || m.user?.username || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span>{m.user?.display_name || m.user?.username || "—"}</span>
                      </div>
                    </td>
                    <td className="admin-table-muted">{m.user?.email || "—"}</td>
                    <td className="admin-table-muted">
                      {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary"
                          onClick={() => handleApprove(m)}
                          disabled={savingId === m.id}
                          style={{ height: 28, fontSize: 12 }}
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleReject(m)}
                          disabled={savingId === m.id}
                          style={{ height: 28, fontSize: 12, color: "#b91c1c" }}
                        >
                          Rejeitar
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
