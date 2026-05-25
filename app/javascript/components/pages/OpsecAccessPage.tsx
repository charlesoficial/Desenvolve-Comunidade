import { CommunityIcon } from "../../design-system";

export function OpsecAccessPage() {
  return (
    <main className="opsec-access-main">
      <header className="opsec-access-header">
        <span className="opsec-access-title-icon">
          <CommunityIcon name="icon-lock" size={20} />
        </span>
        <h1>Aula de OPSEC</h1>
      </header>
      <section className="opsec-access-content" aria-label="Ãrea Hacking">
        <div className="opsec-copy">
          <h2>Ãrea Hacking</h2>
          <p>
            Essa Ã© uma Ã¡rea focada em hacking, onde vocÃª irÃ¡ encontrar, alÃ©m de ferramentas, publicaÃ§Ãµes com
            ensinamentos, indicaÃ§Ã£o de cursos (vazados) e muito mais.
          </p>
          <p>
            Claro, alÃ©m de ter um chat focado exclusivamente nisso para tirar dÃºvidas e fazer networking sobre o tema.
            O responsÃ¡vel por essa Ã¡rea Ã© o Kali15k, especialista em OpSec e dev full-stack com vasta experiÃªncia na
            Ã¡rea, principalmente em ciberseguranÃ§a, pois, quando viveu na China, precisou aprender para se comunicar
            com os parentes brasileiros, devido Ã  restriÃ§Ã£o de algumas redes, como WhatsApp, e Ã  forte vigilÃ¢ncia.
          </p>
          <button type="button">Adquirir Acesso Exclusivo</button>
        </div>
        <img src="/community-assets/okcda187dlu9zjnkkltzalwvpvbm-46135cf67bb4.png" alt="" />
      </section>
    </main>
  );
}
