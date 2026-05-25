// Pagina /settings/dashboard — visao geral do admin com cards de KPIs
// (membros, posts, comentarios, receita), espelho da Circle.
const stats = [
  { label: "Membros ativos", value: "1.248", delta: "+18%", positive: true },
  { label: "Novos esta semana", value: "37", delta: "+5%", positive: true },
  { label: "Posts publicados", value: "412", delta: "+9%", positive: true },
  { label: "Receita (30 dias)", value: "R$ 8.640", delta: "-2%", positive: false },
];

export function AdminDashboard() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Dashboard</h1>
        <p className="admin-page-subtitle">
          Visão geral da sua comunidade nos últimos 30 dias.
        </p>
      </header>

      <section className="admin-page-body">
        <div className="admin-stats-grid">
          {stats.map((s) => (
            <article key={s.label} className="admin-stat-card">
              <span className="admin-stat-label">{s.label}</span>
              <strong className="admin-stat-value">{s.value}</strong>
              <span
                className={
                  s.positive
                    ? "admin-stat-delta is-positive"
                    : "admin-stat-delta is-negative"
                }
              >
                {s.delta}
              </span>
            </article>
          ))}
        </div>

        <div className="admin-empty-card">
          <h2>Atividade recente</h2>
          <p>
            Os gráficos detalhados de engajamento ficam disponíveis assim que a
            integração com o backend de analytics estiver concluída.
          </p>
        </div>
      </section>
    </div>
  );
}
