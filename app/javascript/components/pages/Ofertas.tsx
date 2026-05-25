import { useEffect, useMemo, useState } from "react";
import { CommunityIcon } from "../../design-system";
import { loadFeedPosts, type FeedPost } from "../../lib/communityApi";
import { MemberCluster } from "../topbar/MemberCluster";

type OfferCard = {
  id: string;
  title: string;
  author: string;
  cover: string;
  likes: number;
  comments: number;
  href: string;
  publishedAt: string;
};

const offerFallbacks: OfferCard[] = [
  {
    id: "formula-loteria",
    title: "Formula que os maiores ganhadores da Loteria usam",
    author: "Night",
    cover: "/community-assets/imagem_2026-04-13_015104696.png",
    likes: 9,
    comments: 0,
    href: "/c/ofertas/formula-que-os-maiores-ganhadores-da-loteria-usam",
    publishedAt: "hÃ¡ 18 dias",
  },
  {
    id: "restaure-relacionamento",
    title: "Restaure seu relacionamento em atÃ© 2 dias",
    author: "Night",
    cover: "/community-assets/Screenshot_2026-04-15-23-00-22-543_com.android.chrome-4ba5f07ae8de.jpg",
    likes: 3,
    comments: 0,
    href: "/c/ofertas/restaure-seu-relacionamento-em-ate-2-dias",
    publishedAt: "hÃ¡ 1 mÃªs",
  },
  {
    id: "alma-gemea",
    title: "Encontre sua alma gÃªmea",
    author: "Night",
    cover: "/community-assets/Screenshot_2026-04-15-23-00-30-593_com.android.chrome-81ac240cd72a.jpg",
    likes: 3,
    comments: 0,
    href: "/c/ofertas/encontre-sua-alma-gemea",
    publishedAt: "hÃ¡ 1 mÃªs",
  },
  {
    id: "azeite",
    title: "Truque do Azeite para rejuvenescer sua pele",
    author: "Night",
    cover: "/community-assets/Screenshot_2026-04-15-23-00-37-982_com.android.chrome-9d1f66c5b165.jpg",
    likes: 3,
    comments: 0,
    href: "/c/ofertas/truque-do-azeite-para-rejuvenescer-sua-pele",
    publishedAt: "hÃ¡ 1 mÃªs",
  },
  {
    id: "artista",
    title: "Torne seu filho um Artista",
    author: "Night",
    cover: "/community-assets/imagem_2026-02-12_204350682-2c274df34315.png",
    likes: 3,
    comments: 0,
    href: "/c/ofertas/torne-seu-filho-um-artista",
    publishedAt: "hÃ¡ 3 meses",
  },
  {
    id: "parasitas",
    title: "Elimine parasitas do seu corpo",
    author: "Night",
    cover: "/community-assets/light-mode-cover-thumbnail-2x-c6fb3d12e591.png",
    likes: 3,
    comments: 0,
    href: "/c/ofertas/elimine-parasitas-do-seu-corpo",
    publishedAt: "hÃ¡ 3 meses",
  },
];

const headerMembers = [
  { id: "night", name: "Night", avatar: "/community-assets/Cindy.jpeg", online: true },
  { id: "va", name: "VÃ­tor Santos Araujo", avatar: "VA", online: true },
  { id: "cuervo", name: "o_cuervo", avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg" },
];

export function Ofertas() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    loadFeedPosts("ofertas")
      .then((rows) => {
        if (alive) setPosts(rows);
      })
      .catch(() => {
        if (alive) setPosts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const offers = useMemo(() => {
    if (!posts.length) return offerFallbacks;

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.author.name,
      cover: post.attachments[0]?.fileUrl || "/community-assets/light-mode-cover-thumbnail-2x-c6fb3d12e591.png",
      likes: post.likes,
      comments: post.comments,
      href: `/c/ofertas/${post.id}`,
      publishedAt: "publicou",
    }));
  }, [posts]);

  return (
    <main className="offers-main">
      <header className="general-feed-header">
        <div className="general-feed-title">
          <img src="/community-assets/xl3r0vbgevbnw5yyjany3qz7xmfl-4b726cf873ee.png" alt="" aria-hidden="true" />
          <h1>Ofertas</h1>
        </div>
        <div className="general-feed-actions">
          <button className="general-sort-button" type="button">
            Mais recente <CommunityIcon name="icon-12-chevron-down-v3" size={14} />
          </button>
          <button className="general-magic-button" type="button" aria-label="Resumir">
            <CommunityIcon name="icon-20-stardust-gradient" size={20} />
          </button>
          <MemberCluster members={headerMembers} extra="+856" />
          <button className="general-more" type="button" aria-label="ConfiguraÃ§Ãµes do espaÃ§o">
            <CommunityIcon name="icon-16-menu-dots-horizontal" size={20} />
          </button>
        </div>
      </header>

      <section className="offers-scroll" aria-label="Ofertas">
        <div className="offers-hero">
          <img src="/community-assets/xl3r0vbgevbnw5yyjany3qz7xmfl-4b726cf873ee.png" alt="Comunidade: Ofertas" />
        </div>
        <nav className="offers-chips" aria-label="Categorias">
          {["Todos", "Relacionamento", "Emagrecimento", "Mais"].map((chip, index) => (
            <button className={index === 0 ? "active" : ""} type="button" key={chip}>
              {chip}
              {chip === "Mais" ? <CommunityIcon name="icon-12-chevron-down-v3" size={14} /> : null}
            </button>
          ))}
        </nav>
        {loading ? <div className="offers-grid">{offerFallbacks.slice(0, 3).map((offer) => <OfferCardItem offer={offer} key={offer.id} />)}</div> : null}
        {!loading ? <div className="offers-grid">{offers.map((offer) => <OfferCardItem offer={offer} key={offer.id} />)}</div> : null}
      </section>
    </main>
  );
}

function OfferCardItem({ offer }: { offer: OfferCard }) {
  return (
    <article className="offer-card">
      <a className="offer-card-cover" href={offer.href}>
        <img src={offer.cover} alt="" />
      </a>
      <div className="offer-card-author">
        <img src="/community-assets/Cindy.jpeg" alt="" />
      </div>
      <div className="offer-card-body">
        <h2>
          <a href={offer.href}>{offer.title}</a>
        </h2>
        <p>{offer.author} publicou <span>{offer.publishedAt}</span></p>
      </div>
      <footer className="offer-card-actions">
        <button type="button" aria-label="Curtir">
          <CommunityIcon name="icon-24-heart-outline" size={22} /> {offer.likes}
        </button>
        <a href={offer.href} aria-label="Comentar">
          <CommunityIcon name="icon-20-comment" size={20} /> {offer.comments}
        </a>
        <button type="button" aria-label="AÃ§Ãµes">
          <CommunityIcon name="icon-16-menu-dots-horizontal" size={20} />
        </button>
      </footer>
    </article>
  );
}
