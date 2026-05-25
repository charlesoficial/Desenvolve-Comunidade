// Pagina /audience/manage — listagem de membros com busca, filtros
// e acoes em massa. Espelha a tabela da Circle (avatar, nome, email,
// nivel, status, ultima atividade).
const members = [
  { name: "Vitor Araújo",  email: "vitor@comunidade.com",   level: "L5", status: "Ativo",     lastSeen: "há 2 min" },
  { name: "Charles Souza", email: "charles@comunidade.com", level: "L7", status: "Ativo",     lastSeen: "há 1h" },
  { name: "Ana Lima",      email: "ana@comunidade.com",     level: "L3", status: "Ativo",     lastSeen: "há 3h" },
  { name: "Pedro Reis",    email: "pedro@comunidade.com",   level: "L2", status: "Pausado",   lastSeen: "há 2 dias" },
  { name: "Marina Costa",  email: "marina@comunidade.com",  level: "L4", status: "Convidado", lastSeen: "—" },
];

export function AdminAudience() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Membros</h1>
          <p className="admin-page-subtitle">
            Gerencie a audiência da comunidade, convites pendentes e solicitações.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-ghost">Importar CSV</button>
          <button type="button" className="admin-btn admin-btn-primary">Convidar</button>
        </div>
      </header>

      <section className="admin-page-body">
        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-form-input admin-toolbar-search"
            placeholder="Buscar por nome ou e-mail..."
          />
          <select className="admin-form-select admin-toolbar-filter" defaultValue="all">
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
            <option value="invited">Convidados</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>E-mail</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.email}>
                  <td>
                    <div className="admin-table-member">
                      <span className="admin-avatar" aria-hidden="true">
                        {m.name.charAt(0)}
                      </span>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="admin-table-muted">{m.email}</td>
                  <td>{m.level}</td>
                  <td>
                    <span
                      className={
                        m.status === "Ativo"
                          ? "admin-badge admin-badge-green"
                          : m.status === "Pausado"
                          ? "admin-badge admin-badge-gray"
                          : "admin-badge admin-badge-blue"
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="admin-table-muted">{m.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
