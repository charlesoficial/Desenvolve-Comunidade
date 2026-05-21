import { P6Icon } from "../../design-system";

export function OpsecAccessPage() {
  return (
    <main className="opsec-access-main">
      <header className="opsec-access-header">
        <span className="opsec-access-title-icon">
          <P6Icon name="icon-lock" size={20} />
        </span>
        <h1>Aula de OPSEC</h1>
      </header>
      <section className="opsec-access-content" aria-label="Área Hacking">
        <div className="opsec-copy">
          <h2>Área Hacking</h2>
          <p>
            Essa é uma área focada em hacking, onde você irá encontrar, além de ferramentas, publicações com
            ensinamentos, indicação de cursos (vazados) e muito mais.
          </p>
          <p>
            Claro, além de ter um chat focado exclusivamente nisso para tirar dúvidas e fazer networking sobre o tema.
            O responsável por essa área é o Kali15k, especialista em OpSec e dev full-stack com vasta experiência na
            área, principalmente em cibersegurança, pois, quando viveu na China, precisou aprender para se comunicar
            com os parentes brasileiros, devido à restrição de algumas redes, como WhatsApp, e à forte vigilância.
          </p>
          <button type="button">Adquirir Acesso Exclusivo</button>
        </div>
        <img src="/source-six-assets/okcda187dlu9zjnkkltzalwvpvbm-46135cf67bb4.png" alt="" />
      </section>
    </main>
  );
}
