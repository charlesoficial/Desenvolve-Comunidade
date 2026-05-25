import { useEffect, useReducer } from "react";
import {
  loadAdminAnalyticsBreakdown,
  type AdminAnalyticsBreakdown,
} from "../../../lib/adminApi";

// Componente generico que renderiza qualquer breakdown de Analytics.
// Usado em todas as sub-paginas: /settings/analytics/<scope>.

const scopeMeta: Record<string, { title: string; subtitle: string }> = {
  members: {
    title: "Analytics — Membros",
    subtitle: "Crescimento, ativação, retenção e churn da base.",
  },
  website: {
    title: "Analytics — Site",
    subtitle: "Visitas à parte pública e conversão de visitante para membro.",
  },
  spaces: {
    title: "Analytics — Espaços",
    subtitle: "Engajamento por espaço (posts, comentários, reações).",
  },
  post_comments: {
    title: "Analytics — Publicações & comentários",
    subtitle: "Volume e qualidade das interações em conteúdo.",
  },
  messages: {
    title: "Analytics — Mensagens",
    subtitle: "Volume de DMs e mensagens em chat público.",
  },
  devices: {
    title: "Analytics — Dispositivos",
    subtitle: "Distribuição de uso por desktop, mobile, tablet e app nativo.",
  },
  events: {
    title: "Analytics — Eventos",
    subtitle: "RSVP, presença em lives e gravações.",
  },
  payments: {
    title: "Analytics — Pagamentos",
    subtitle: "Receita, MRR, ARR e churn financeiro.",
  },
  courses: {
    title: "Analytics — Cursos",
    subtitle: "Conclusão de aulas, drop-off e certificados.",
  },
};

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: AdminAnalyticsBreakdown }
  | { phase: "error"; message: string };

type Action =
  | { type: "load_success"; data: AdminAnalyticsBreakdown }
  | { type: "load_error"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", data: action.data };
    case "load_error":   return { phase: "error", message: action.message };
    default:             return state;
  }
}

const initial: State = { phase: "loading" };

function formatNumber(value: number) {
  if (Number.isInteger(value)) return value.toLocaleString("pt-BR");
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Sparkline({ series }: { series: AdminAnalyticsBreakdown["series"] }) {
  if (!series || series.length === 0) return null;
  const max = Math.max(...series.map(p => p.value), 1);
  const w = 720;
  const h = 96;
  const step = w / Math.max(series.length - 1, 1);
  const points = series.map((p, i) => `${i * step},${h - (p.value / max) * (h - 8) - 4}`).join(" ");

  return (
    <div style={{ background: "#fafbfc", border: "1px solid #e7e9ec", borderRadius: 8, padding: 12, marginTop: 12 }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#717680", marginTop: 4 }}>
        <span>{series[0]?.date.slice(5)}</span>
        <span>{series[series.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export function AdminAnalyticsBreakdown({ scope }: { scope: string }) {
  const meta = scopeMeta[scope] ?? { title: "Analytics", subtitle: "Métricas detalhadas" };
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "load_success", data: { scope, generated_at: "", totals: [], series: [], top: [] } } as Action);
    loadAdminAnalyticsBreakdown(scope)
      .then(data => { if (!cancelled) dispatch({ type: "load_success", data }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, [scope]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>{meta.title}</h1>
          <p className="admin-page-subtitle">{meta.subtitle}</p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        {state.phase === "loading" ? (
          <div className="admin-empty-card"><p>Carregando métricas...</p></div>
        ) : state.phase === "ready" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {state.data.totals.map(t => (
                <div key={t.key} style={{ background: "#fff", border: "1px solid #e7e9ec", borderRadius: 10, padding: 16 }}>
                  <p className="admin-form-help" style={{ margin: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.04em", fontWeight: 600 }}>
                    {t.label}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#1d2939" }}>
                    {formatNumber(t.value)}
                  </p>
                </div>
              ))}
            </div>

            {state.data.series && state.data.series.length > 0 ? (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#717680", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {state.data.series_label || "Série temporal"}
                </h2>
                <Sparkline series={state.data.series} />
              </div>
            ) : null}

            {state.data.top && state.data.top.length > 0 ? (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#717680", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {state.data.top_label || "Top"}
                </h2>
                <div className="admin-table-wrap" style={{ marginTop: 8 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th style={{ width: 140, textAlign: "right" }}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.data.top.map(row => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.name || row.display_name || row.username || "—"}</strong>
                            {row.last_seen_at ? (
                              <p className="admin-form-help" style={{ margin: 0 }}>
                                Visto em {new Date(row.last_seen_at).toLocaleString("pt-BR")}
                              </p>
                            ) : null}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <strong>{formatNumber(row.value)}</strong>
                            {row.label ? (
                              <p className="admin-form-help" style={{ margin: 0 }}>{row.label}</p>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {state.data.generated_at ? (
              <p className="admin-form-help" style={{ marginTop: 16 }}>
                Gerado em {new Date(state.data.generated_at).toLocaleString("pt-BR")}
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
