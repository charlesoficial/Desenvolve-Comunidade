import { useEffect, useReducer } from "react";
import { loadAdminAnalytics, type AdminAnalytics } from "../../../lib/adminApi";

// Pagina /settings/analytics — KPIs + grafico SVG inline (signups, posts, mensagens em 30 dias).
type Series = AdminAnalytics["series"];

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: AdminAnalytics }
  | { phase: "error"; message: string };

type Action = { type: "success"; data: AdminAnalytics } | { type: "error"; message: string };

const initial: State = { phase: "loading" };

function reducer(state: State, action: Action): State {
  if (action.type === "success") return { phase: "ready", data: action.data };
  if (action.type === "error") return { phase: "error", message: action.message };
  return state;
}

const COLORS = {
  signups: "#4f46e5",
  posts: "#0ea5e9",
  messages: "#10b981",
} as const;

type Metric = keyof typeof COLORS;

function buildPath(series: Series, metric: Metric, width: number, height: number): string {
  const max = Math.max(1, ...series.map((s) => s[metric]));
  const stepX = width / Math.max(1, series.length - 1);
  return series
    .map((row, idx) => {
      const x = idx * stepX;
      const y = height - (row[metric] / max) * height;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function AdminAnalytics() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;
    loadAdminAnalytics()
      .then((data) => {
        if (!cancelled) dispatch({ type: "success", data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error", message: "Não foi possível carregar a análise." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.phase === "loading") {
    return (
      <div className="admin-page">
        <header className="admin-page-header">
          <h1>Analytics</h1>
        </header>
        <section className="admin-page-body">
          <div className="admin-empty-card"><p>Carregando dados...</p></div>
        </section>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="admin-page">
        <header className="admin-page-header"><h1>Analytics</h1></header>
        <section className="admin-page-body">
          <div className="admin-empty-card"><p>{state.message}</p></div>
        </section>
      </div>
    );
  }

  const { series, totals } = state.data;
  const width = 840;
  const height = 220;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Analytics</h1>
        <p className="admin-page-subtitle">
          Tendência diária dos últimos 30 dias para cadastros, publicações e mensagens.
        </p>
      </header>

      <section className="admin-page-body">
        <div className="admin-stats-grid">
          <article className="admin-stat-card">
            <span className="admin-stat-label">Cadastros (30d)</span>
            <strong className="admin-stat-value">{totals.signups.toLocaleString("pt-BR")}</strong>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-label">Posts (30d)</span>
            <strong className="admin-stat-value">{totals.posts.toLocaleString("pt-BR")}</strong>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-label">Mensagens (30d)</span>
            <strong className="admin-stat-value">{totals.messages.toLocaleString("pt-BR")}</strong>
          </article>
        </div>

        <div className="admin-empty-card">
          <h2>Atividade diária</h2>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            {(Object.keys(COLORS) as Metric[]).map((metric) => (
              <span key={metric} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: COLORS[metric],
                    display: "inline-block",
                  }}
                />
                {metric === "signups" ? "Cadastros" : metric === "posts" ? "Posts" : "Mensagens"}
              </span>
            ))}
          </div>
          <svg
            viewBox={`0 0 ${width} ${height + 24}`}
            width="100%"
            height={height + 24}
            preserveAspectRatio="none"
            style={{ display: "block" }}
            aria-label="Gráfico de atividade diária"
          >
            {(Object.keys(COLORS) as Metric[]).map((metric) => (
              <path
                key={metric}
                d={buildPath(series, metric, width, height)}
                fill="none"
                stroke={COLORS[metric]}
                strokeWidth={2}
              />
            ))}
            {series.length > 1 ? (
              <>
                <text x={0} y={height + 18} fontSize={11} fill="#717680">
                  {formatDateShort(series[0].date)}
                </text>
                <text x={width / 2 - 14} y={height + 18} fontSize={11} fill="#717680">
                  {formatDateShort(series[Math.floor(series.length / 2)].date)}
                </text>
                <text x={width - 32} y={height + 18} fontSize={11} fill="#717680">
                  {formatDateShort(series[series.length - 1].date)}
                </text>
              </>
            ) : null}
          </svg>
        </div>
      </section>
    </div>
  );
}
