// Pagina /settings/spaces — gerenciamento dos espacos da comunidade
// (canais, feeds, cursos). Ordem manual via drag, visibilidade publica
// ou privada, tipo (chat/feed/course/event/members/link).
const spaces = [
  { name: "Feed Geral",        type: "Feed",     visibility: "Público",  members: 1248 },
  { name: "Chat Geral",        type: "Chat",     visibility: "Público",  members: 1248 },
  { name: "Avisos",            type: "Feed",     visibility: "Público",  members: 1248 },
  { name: "Aulas Gravadas",    type: "Curso",    visibility: "Pago",     members: 184 },
  { name: "Network",           type: "Membros",  visibility: "Privado",  members: 612 },
  { name: "Política Nacional", type: "Feed",     visibility: "Público",  members: 974 },
  { name: "Hacking & Tech",    type: "Chat",     visibility: "Privado",  members: 412 },
];

export function AdminSpaces() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Espaços</h1>
          <p className="admin-page-subtitle">
            Organize os canais, feeds e cursos da comunidade. Arraste para
            reordenar.
          </p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="admin-btn admin-btn-ghost">Nova categoria</button>
          <button type="button" className="admin-btn admin-btn-primary">Novo espaço</button>
        </div>
      </header>

      <section className="admin-page-body">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Visibilidade</th>
                <th>Membros</th>
              </tr>
            </thead>
            <tbody>
              {spaces.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.type}</td>
                  <td>
                    <span
                      className={
                        s.visibility === "Público"
                          ? "admin-badge admin-badge-green"
                          : s.visibility === "Pago"
                          ? "admin-badge admin-badge-blue"
                          : "admin-badge admin-badge-gray"
                      }
                    >
                      {s.visibility}
                    </span>
                  </td>
                  <td>{s.members}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
