// Pagina /settings (Geral) — espelha o que o painel Circle mostra
// como primeiro destino quando o admin entra em "Configurações".
// Inclui dados basicos da comunidade (nome, descricao, locale, fuso).
export function AdminGeneral() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Geral</h1>
        <p className="admin-page-subtitle">
          Configurações principais da comunidade. Estas informações aparecem
          em e-mails, no app móvel e na página inicial pública.
        </p>
      </header>

      <section className="admin-page-body">
        <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="community-name">
              Nome da comunidade
            </label>
            <input
              id="community-name"
              type="text"
              className="admin-form-input"
              defaultValue="Comunidade"
              placeholder="Ex.: Comunidade do Charles"
            />
            <p className="admin-form-help">
              Aparece na barra do navegador, em e-mails e no header do app.
            </p>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="community-description">
              Descrição
            </label>
            <textarea
              id="community-description"
              className="admin-form-textarea"
              rows={3}
              defaultValue=""
              placeholder="Descreva sua comunidade em uma ou duas frases."
            />
          </div>

          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="community-locale">
                Idioma padrão
              </label>
              <select
                id="community-locale"
                className="admin-form-select"
                defaultValue="pt-BR"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="community-timezone">
                Fuso horário
              </label>
              <select
                id="community-timezone"
                className="admin-form-select"
                defaultValue="America/Sao_Paulo"
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Bahia">America/Bahia</option>
                <option value="America/Manaus">America/Manaus</option>
              </select>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary">
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
