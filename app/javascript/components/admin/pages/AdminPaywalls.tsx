// Pagina /settings/paywalls — listagem dos paywalls criados.
// Cada paywall vira uma "barreira" que cobra antes de liberar acesso a um
// espaco/conteudo, igual na Circle.
const paywalls = [
  { name: "Mentoria Premium", price: "R$ 297/mês", members: 84,  status: "Ativo" },
  { name: "Curso Avançado",   price: "R$ 997 único", members: 42, status: "Ativo" },
  { name: "Newsletter Pro",   price: "R$ 19/mês",   members: 312, status: "Pausado" },
];

export function AdminPaywalls() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Paywalls</h1>
          <p className="admin-page-subtitle">
            Configure cobranças únicas ou recorrentes para liberar acesso a
            espaços e conteúdos da comunidade.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-primary">
            Novo paywall
          </button>
        </div>
      </header>

      <section className="admin-page-body">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Paywall</th>
                <th>Preço</th>
                <th>Membros</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paywalls.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.members}</td>
                  <td>
                    <span
                      className={
                        p.status === "Ativo"
                          ? "admin-badge admin-badge-green"
                          : "admin-badge admin-badge-gray"
                      }
                    >
                      {p.status}
                    </span>
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
