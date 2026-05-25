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
          <h2>Este é um espaço privado</h2>
          <p>Membros devem ser convidados para este espaço.</p>
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
          <h2>Área Hacking</h2>
          <p>
            Essa é uma área focada em hacking, onde <strong>você</strong> irá encontrar, além de ferramentas,
            publicações com ensinamentos, indicação de cursos (vazados) e muito mais.
          </p>
          <p>
            Claro, <strong>além</strong> de ter um chat focado exclusivamente nisso para tirar <strong>dúvidas</strong>{" "}
            e fazer <strong>networking</strong> sobre o tema.
          </p>
          <p>
            O <strong>responsável</strong> por essa <strong>área</strong> é o Kali15k, especialista em OpSec e dev
            full-stack com vasta <strong>experiência</strong> na <strong>área</strong>, principalmente em{" "}
            <strong>cibersegurança</strong>, pois, quando viveu na China, precisou aprender para se comunicar com os
            parentes brasileiros, devido Ã  restrição de algumas redes, como WhatsApp, e Ã  forte vigilância.
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
          <span>Upgrade -&gt; Nível 2</span>
          <h2>Nível 2</h2>
          <p>
            O <strong>Nível 2</strong> é uma área exclusiva onde postamos <strong>códigos-fonte</strong> de sistemas.
          </p>
          <p>
            O acesso é vitalício, então você sempre verá um sistema novo para poder subir uma operação ou até mesmo
            vender.
          </p>
          <p>
            Já temos <strong>disponíveis</strong> para download: plataforma de investimentos, raspadinha, checkout
            próprio, sistema de seguidores e outros.
          </p>
          <div className="channel-level-actions">
            <a href="https://checkout.p6.chat/nivel2">Adquirir Acesso ao Nível 2</a>
            <a href="https://15k.bio/discord">Suporte</a>
          </div>
          <small>100+ membros fizeram upgrade.</small>
        </div>
        <img src="/community-assets/6u3sqv3ljm5oun074a2fqdyd4ohs-a1f8730efc6e.png" alt="" />
      </section>
    </main>
  );
}
