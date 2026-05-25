import { useEffect, useReducer } from "react";
import { loadAdminDashboard, type AdminDashboard } from "../../../lib/adminApi";

// Pagina /settings/dashboard — KPIs reais lidos do Postgres pelo
// endpoint /api/v1/admin/dashboard. Substitui os mocks anteriores.

type State =
  | { status: "loading" }
  | { status: "ready"; data: AdminDashboard }
  | { status: "error"; message: string };

type Action = { type: "start" } | { type: "success"; data: AdminDashboard } | { type: "error"; message: string };

const initial: State = { status: "loading" };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { status: "loading" };
    case "success":
      return { status: "ready", data: action.data };
    case "error":
      return { status: "error", message: action.message };
    default:
      return _state;
  }
}

function formatDelta(delta: number | null) {
  if (delta == null) return "—";
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function AdminDashboard() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });
    loadAdminDashboard()
      .then((data) => {
        if (!cancelled) dispatch({ type: "success", data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error", message: "Não foi possível carregar o dashboard." });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Dashboard</h1>
        <p className="admin-page-subtitle">
          Visão geral da sua comunidade nos últimos 30 dias.
        </p>
      </header>

      <section className="admin-page-body">
        {state.status === "loading" ? (
          <div className="admin-empty-card">
            <p>Carregando indicadores...</p>
          </div>
        ) : state.status === "error" ? (
          <div className="admin-empty-card">
            <h2>Sem dados disponíveis</h2>
            <p>{state.message}</p>
          </div>
        ) : (
          <>
            <div className="admin-stats-grid">
              {state.data.stats.map((stat) => (
                <article key={stat.key} className="admin-stat-card">
                  <span className="admin-stat-label">{stat.label}</span>
                  <strong className="admin-stat-value">{stat.value.toLocaleString("pt-BR")}</strong>
                  <span
                    className={
                      stat.delta_pct == null
                        ? "admin-stat-delta"
                        : stat.delta_pct >= 0
                        ? "admin-stat-delta is-positive"
                        : "admin-stat-delta is-negative"
                    }
                  >
                    {formatDelta(stat.delta_pct)}
                  </span>
                </article>
              ))}
            </div>

            <div className="admin-empty-card">
              <h2>Totais</h2>
              <p>
                {state.data.totals.members.toLocaleString("pt-BR")} membros •{" "}
                {state.data.totals.spaces.toLocaleString("pt-BR")} espaços •{" "}
                {state.data.totals.posts.toLocaleString("pt-BR")} posts publicados
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
