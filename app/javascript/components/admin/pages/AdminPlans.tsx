// Pagina /settings/plans — planos de assinatura da comunidade.
// Espelha o card grid da Circle, com nome, descricao, preco e quantos
// membros estao em cada plano.
const plans = [
  {
    name: "Básico",
    description: "Acesso ao feed e aos canais públicos.",
    price: "R$ 47/mês",
    members: 612,
    highlight: false,
  },
  {
    name: "Pro",
    description: "Inclui aulas gravadas e suporte prioritário.",
    price: "R$ 147/mês",
    members: 184,
    highlight: true,
  },
  {
    name: "VIP",
    description: "Mentoria mensal e acesso vitalício aos cursos.",
    price: "R$ 497/mês",
    members: 38,
    highlight: false,
  },
];

export function AdminPlans() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Planos</h1>
          <p className="admin-page-subtitle">
            Defina os níveis de acesso e cobrança recorrente da sua comunidade.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-primary">
            Novo plano
          </button>
        </div>
      </header>

      <section className="admin-page-body">
        <div className="admin-cards-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlight
                  ? "admin-plan-card is-highlight"
                  : "admin-plan-card"
              }
            >
              <header>
                <h2>{plan.name}</h2>
                {plan.highlight ? (
                  <span className="admin-badge admin-badge-blue">Mais popular</span>
                ) : null}
              </header>
              <p className="admin-plan-desc">{plan.description}</p>
              <strong className="admin-plan-price">{plan.price}</strong>
              <span className="admin-plan-meta">{plan.members} membros</span>
              <button type="button" className="admin-btn admin-btn-ghost admin-plan-edit">
                Editar
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
