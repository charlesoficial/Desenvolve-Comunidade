import { Lock } from "lucide-react";

export function ExpertHotAccessPage() {
  return (
    <main className="expert-hot-main">
      <header className="expert-hot-header">
        <Lock size={22} />
        <h1>Aulas Completas</h1>
      </header>
      <section className="expert-hot-scroll" aria-label="Aulas Completas">
        <div className="expert-hot-content">
          <article className="expert-hot-copy">
            <h2>Expert Hot</h2>
            <p>
              <strong>Expert Hot</strong> é uma área focada exclusivamente no Nicho Hot. Aqui dentro, você encontrará
              o guia essencial para sair do <strong>zero absoluto</strong> até o seu primeiro <strong>lead orgânico</strong>.
            </p>
            <p>
              <strong>Spoiler:</strong> Você terá acesso Ã  nossa plataforma própria e exclusiva para rodar sua operação
              com bot e conteúdo no site.
            </p>
            <p>
              Você terá acesso a modelos já validadas e como criar uma modelo com IA. Além disso, terá networking com
              experts que operam no mercado há mais de 2 anos, prontos para tirar suas dúvidas e dar conselhos.
            </p>
            <p>
              Ao adquirir, a liberação ocorre tanto aqui na plataforma quanto no Telegram. Para isso, basta inserir no
              ato da compra o mesmo e-mail da sua conta.
            </p>
            <div className="expert-hot-actions">
              <a href="https://checkout.p6.chat/experthot">Adquirir Acesso Exclusivo</a>
              <a href="https://t.me/experthot">Canal Free</a>
            </div>
          </article>
          <div className="expert-hot-media" aria-hidden="true">
            <img src="/community-assets/tday6unoazs5ho4srfet3wlbuhi6-0f7579313d9c.png" alt="" />
          </div>
        </div>
      </section>
    </main>
  );
}
