type Props = {
  route: string;
};

// Placeholder generico para rotas admin ainda nao implementadas.
// Mostra o caminho atual + um aviso de "em construcao", seguindo o look
// minimalista do painel Circle (titulo + descricao curta + card vazio).
export function AdminPlaceholder({ route }: Props) {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Em construção</h1>
        <p className="admin-page-subtitle">
          Esta seção do painel ainda não foi implementada. Rota: <code>{route}</code>
        </p>
      </header>

      <section className="admin-page-body">
        <div className="admin-empty-card">
          <h2>Sem conteúdo por aqui</h2>
          <p>
            Estamos clonando o painel da Circle peça por peça. Volte mais tarde
            ou escolha outra opção no menu lateral.
          </p>
        </div>
      </section>
    </div>
  );
}
