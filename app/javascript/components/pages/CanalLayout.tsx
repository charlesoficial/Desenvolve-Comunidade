import { FeedGeralMain } from "../feedGeral/FeedGeralMain";
import { CommunityIcon } from "../../design-system";
import { canalAsset, canalConfigs } from "./canalConfigs";

export function CanalLayout({ slug }: { slug: string }) {
  const config = canalConfigs[slug] || {
    title: slug.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" "),
    icon: canalAsset("feed-svgrepo-com.png"),
    showHero: false,
  };

  if (config.mode === "private") {
    return <PrivateCanalPage title={config.title} />;
  }

  if (config.mode === "hackingLanding") {
    return <HackingLandingPage title={config.title} />;
  }

  if (config.mode === "levelAccess") {
    return <LevelAccessPage title={config.title} />;
  }

  return (
    <FeedGeralMain
      spaceSlug={slug}
      title={config.title}
      icon={config.icon}
      topics={config.topics}
      variant="hacking"
      showHero={config.showHero}
      showRail={config.showRail}
      showComposer={config.showComposer}
      showTopics={config.showTopics}
      showNewPost={config.showNewPost}
      memberExtra={config.memberExtra}
      magicLabel="Resumir"
    />
  );
}

function CanalHeader({ title }: { title: string }) {
  return (
    <header className="channel-page-header">
      <div>
        <CommunityIcon name="icon-lock" size={18} />
        <h1>{title}</h1>
      </div>
    </header>
  );
}

function PrivateCanalPage({ title }: { title: string }) {
  return (
    <main className="channel-page-main">
      <CanalHeader title={title} />
      <div className="channel-page-scroll">
        <section className="channel-private-card">
          <CommunityIcon name="icon-lock" size={48} />
          <h2>Este Ã© um espaÃ§o privado</h2>
          <p>Membros devem ser convidados para este espaÃ§o.</p>
        </section>
      </div>
    </main>
  );
}

function HackingLandingPage({ title }: { title: string }) {
  return (
    <main className="channel-page-main channel-landing-main">
      <CanalHeader title={title} />
      <section className="channel-hacking-hero">
        <div className="channel-hacking-copy">
          <h2>Ãrea Hacking</h2>
          <p>
            Essa Ã© uma Ã¡rea focada em hacking, onde <strong>vocÃª</strong> irÃ¡ encontrar, alÃ©m de ferramentas,
            publicaÃ§Ãµes com ensinamentos, indicaÃ§Ã£o de cursos (vazados) e muito mais.
          </p>
          <p>
            Claro, <strong>alÃ©m</strong> de ter um chat focado exclusivamente nisso para tirar <strong>dÃºvidas</strong>{" "}
            e fazer <strong>networking</strong> sobre o tema.
          </p>
          <p>
            O <strong>responsÃ¡vel</strong> por essa <strong>Ã¡rea</strong> Ã© o Kali15k, especialista em OpSec e dev
            full-stack com vasta <strong>experiÃªncia</strong> na <strong>Ã¡rea</strong>, principalmente em{" "}
            <strong>ciberseguranÃ§a</strong>, pois, quando viveu na China, precisou aprender para se comunicar com os
            parentes brasileiros, devido Ã  restriÃ§Ã£o de algumas redes, como WhatsApp, e Ã  forte vigilÃ¢ncia.
          </p>
          <a href="https://checkout.p6.chat/areahacking">Adquirir Acesso Exclusivo</a>
        </div>
        <img src="/community-assets/okcda187dlu9zjnkkltzalwvpvbm-46135cf67bb4.png" alt="" />
      </section>
    </main>
  );
}

function LevelAccessPage({ title }: { title: string }) {
  return (
    <main className="channel-page-main channel-level-main">
      <CanalHeader title={title} />
      <section className="channel-level-hero">
        <div className="channel-level-copy">
          <span>Upgrade -&gt; NÃ­vel 2</span>
          <h2>NÃ­vel 2</h2>
          <p>
            O <strong>NÃ­vel 2</strong> Ã© uma Ã¡rea exclusiva onde postamos <strong>cÃ³digos-fonte</strong> de sistemas.
          </p>
          <p>
            O acesso Ã© vitalÃ­cio, entÃ£o vocÃª sempre verÃ¡ um sistema novo para poder subir uma operaÃ§Ã£o ou atÃ© mesmo
            vender.
          </p>
          <p>
            JÃ¡ temos <strong>disponÃ­veis</strong> para download: plataforma de investimentos, raspadinha, checkout
            prÃ³prio, sistema de seguidores e outros.
          </p>
          <div className="channel-level-actions">
            <a href="https://checkout.p6.chat/nivel2">Adquirir Acesso ao NÃ­vel 2</a>
            <a href="https://15k.bio/discord">Suporte</a>
          </div>
          <small>100+ membros fizeram upgrade.</small>
        </div>
        <img src="/community-assets/6u3sqv3ljm5oun074a2fqdyd4ohs-a1f8730efc6e.png" alt="" />
      </section>
    </main>
  );
}
