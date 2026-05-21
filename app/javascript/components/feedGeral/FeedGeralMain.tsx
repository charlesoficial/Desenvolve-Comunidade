import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { P6Icon } from "../../design-system";
import {
  createFeedComment,
  createFeedPost,
  deleteFeedPost,
  loadFeedPosts,
  loadMembers,
  loadViewerProfileSummary,
  loadPostComments,
  loadPostLikes,
  recordPostView,
  togglePostReaction,
  togglePostSave,
  updateFeedPost,
  uploadFeedAttachment,
  type FeedAttachment,
  type FeedComment,
  type FeedLike,
  type FeedPost,
  type ViewerProfileSummary,
} from "../../lib/communityApi";
import type { DetailMember } from "../../data/chatData";
import { MemberCluster } from "../topbar/MemberCluster";

const assetBase = "/Feed%20Geral%20_%20Project%20Six_files/";
const asset = (name: string) => `${assetBase}${encodeURIComponent(name)}`;
const sourceSixAsset = (name: string) => `/source-six-assets/${name}`;
const POSTS_PAGE_SIZE = 8;

const topMembers = [
  { id: "m1", name: "o_cuervo", avatar: asset("d0f92b7a6b87e4692dfd1c8e88c5df4e.jpg") },
  { id: "m2", name: "VA", avatar: "VA", online: true },
  { id: "m3", name: "Refzinho", avatar: asset("9745dcfe727b27ce8d8aea9cc7814732.jpg") },
];

const capturedPostRoutes = new Set([
  "seu-progresso/1-mes-de-operacao-com-uma-oferta-daqui",
  "feed-geral/retorica-o-essencial-para-ter-uma-boa-persuasao-e-criar-boas-copys",
  "central-de-ajuda-fbm/falha-na-transferencia-de-fundos",
  "feed-geral/oferta-black-valida-mas-sem-conhecimento-em-ads",
  "central-de-ajuda-fbm/copiar-oferta-ao-inves-de-vender-este-produto-qual-sua-opiniao",
  "central-de-ajuda-fbm/cliente-reclamando-sendo-que-comecei-a-vender-agora-em-marco-o-que-fazer",
  "central-de-ajuda-fbm/alguem-com-a-tabela-de-frete-da-amazon",
  "central-de-ajuda-fbm/nao-consigo-fazer-a-verificacao-de-endereco",
  "central-de-ajuda-fbm/selecionar-melhores-produtos",
  "ofertas/formula-que-os-maiores-ganhadores-da-loteria-usam",
  "avisos/s6xpay-venda-sem-kyc",
  "avisos/veterano-leia-para-nao-ficar-perdido",
  "feed-geral/saindo-do-dba",
  "feed-geral/chegando-agora",
  "feed-geral/quando-nada-parece-ajudar-eu-vou-olhar-para-um-cortador-de-pedras",
  "feed-geral/bidcap-ou-baiana",
  "feed-geral/duvida-sobre-hot",
  "feed-geral/nao-aposte-todas-suas-fichas-na-inspiracao",
  "feed-geral/fornecedores-amazon",
  "feed-geral/engenharia-de-software",
  "feed-geral/30k-em-1-dia",
  "feed-geral/2026-a832e0",
  "feed-geral/engenharia-social",
  "feed-geral/como-configurar-esse-adaptador-para-o-modo-monitor",
  "feed-geral/como-randomizar-o-mac-address-da-placa-de-rede-no-linux",
  "feed-geral/adeus-scroll-infinito-sem-twitter-e-insta-por-40-dias-bora-ver-no-que-da",
  "feed-geral/como-eu-havia-dito-e-preciso-ser-estoico",
  "feed-geral/opsec-seguranca-operacional",
  "feed-geral/aproveitem-sem-moderacao",
]);

const fallbackPosts: FeedPost[] = [
  {
    id: "fallback-retorica",
    title: "Retórica. O essencial para ter uma boa persuasão e criar boas copys.",
    body:
      "Os 3 pilares da persuasão\n\n- Ethos\n- Pathos\n- Logos\n\nEthos\n\nÉ o ponto de partida, é o caráter do orador, sua credibilidade\n\n\"Persuadimos mais pela confiança\n\nQue temos no orador do que pela\n\nForça do raciocínio.\"\n\n~aristoteles\n\nEnsinamentos e pensamento todos tirado do livro\n\nA retórica, de Aristóteles.\n\nCuervo...",
    spaceSlug: "feed-geral",
    kind: "article",
    topics: ["Filosofia", "Geral"],
    publishedAt: "2026-04-24T12:00:00-03:00",
    comments: 0,
    likes: 6,
    views: 0,
    pinned: false,
    liked: false,
    saved: false,
    attachments: [],
    author: {
      username: "o_cuervo",
      name: "o_cuervo",
      avatar: asset("d0f92b7a6b87e4692dfd1c8e88c5df4e.jpg"),
      badge: "Hackudo",
      level: "Nivel 2",
      joinedAt: "Membro desde 2 de fevereiro de 2026",
    },
  },
];

const goatJornalista = {
  username: "goat-jornalista",
  name: "Goat Jornalista",
  avatar: sourceSixAsset("Generated20Image20February200220202620-203_09PM.jpeg-c5fdca6c865d.jpg"),
  badge: "Hackudo",
  level: "Nível 2",
  joinedAt: "Membro desde 2 de fevereiro de 2026",
};

function channelPost(
  spaceSlug: string,
  id: string,
  title: string,
  body: string,
  options: Partial<Pick<FeedPost, "likes" | "comments" | "attachments" | "kind">> = {},
): FeedPost {
  const attachments = options.attachments || [];

  return {
    id,
    title,
    body,
    spaceSlug,
    kind: options.kind || (attachments.length ? "image" : "article"),
    topics: [],
    publishedAt: "2026-02-05T12:00:00-03:00",
    comments: options.comments || 0,
    likes: options.likes || 0,
    views: 0,
    pinned: false,
    liked: false,
    saved: false,
    attachments,
    author: goatJornalista,
  };
}

const feedFallbackPostsBySlug: Record<string, FeedPost[]> = {
  feed: [
    {
      id: "fallback-feed-1-mes",
      title: "1 mês de operação com uma oferta daqui!",
      body:
        "É gratificante ver o que a P6 está fazendo! É uma comunidade sem igual. Esse resultado é de apenas um mês de operação em uma oferta daqui!",
      spaceSlug: "seu-progresso",
      kind: "image",
      topics: [],
      publishedAt: "2026-04-27T22:07:00-03:00",
      comments: 0,
      likes: 8,
      views: 0,
      pinned: false,
      liked: false,
      saved: false,
      attachments: [
        {
          kind: "image",
          fileName: "Resultado da operação",
          fileUrl: sourceSixAsset("WhatsApp20Image202026-04-2720at2022.07.18.jpeg-044a69000b23.jpg"),
        },
      ],
      author: {
        username: "vitor",
        name: "Vítor Santos Araujo",
        avatar: "VA",
        level: "Nível 1",
        badge: "Membro",
        joinedAt: "2026-02-02",
      },
    },
  ],
  "feed-geral": fallbackPosts,
  avisos: [
    {
      id: "fallback-avisos-s6xpay",
      title: "s6xpay - Venda sem KYC",
      body:
        "Foi lançada uma plataforma de venda como Kiwify, Cakto, Hotmart e outras, porém sem necessidade de KYC (verificação de documentos), possibilitando que você realize suas vendas com total anonimato de verdade.",
      spaceSlug: "avisos",
      kind: "image",
      topics: [],
      publishedAt: "2026-01-04T19:06:00-03:00",
      comments: 0,
      likes: 51,
      views: 0,
      pinned: false,
      liked: false,
      saved: false,
      attachments: [{ kind: "image", fileName: "s6xpay", fileUrl: "/source-six-assets/photo_2026-01-04_19-06-38-d345916d908e.jpg" }],
      author: {
        username: "night",
        name: "Night",
        avatar: "/p6-members-assets/Cindy.jpeg",
        badge: "Admin",
        level: "Nível 2",
        joinedAt: "Membro desde 3 de dezembro de 2025",
      },
    },
    {
      id: "fallback-avisos-veterano",
      title: "Veterano, leia para não ficar perdido!",
      body:
        "Como dito na publicação do Feed Geral, agilizamos a migração, mas todas as áreas do acesso GOAT ainda não estão completas. Teremos a área da Amazon, Infoprodutos e outras novas áreas incluídas no seu acesso.",
      spaceSlug: "avisos",
      kind: "article",
      topics: [],
      publishedAt: "2025-12-15T12:00:00-03:00",
      comments: 0,
      likes: 26,
      views: 0,
      pinned: false,
      liked: false,
      saved: false,
      attachments: [],
      author: {
        username: "night",
        name: "Night",
        avatar: "/p6-members-assets/Cindy.jpeg",
        badge: "Admin",
        level: "Nível 2",
        joinedAt: "Membro desde 3 de dezembro de 2025",
      },
    },
  ],
  "central-de-ajuda-fbm": [
    {
      id: "fallback-fbm-transferencia",
      title: "Falha na transferência de fundos",
      body:
        "Alguém sabe como resolver? Já atualizei meus dados bancários 3 vezes, com diferentes bancos e não consigo fazer a transferência de jeito nenhum.",
      spaceSlug: "central-de-ajuda-fbm",
      kind: "image",
      topics: [],
      publishedAt: "2026-04-20T11:20:00-03:00",
      comments: 6,
      likes: 0,
      views: 0,
      pinned: false,
      liked: false,
      saved: false,
      attachments: [{ kind: "image", fileName: "amazon-print", fileUrl: "/source-six-assets/amazon20print-e1fd641ee262.png" }],
      author: {
        username: "nixon",
        name: "nixon",
        avatar: "N",
        badge: "p6 Goat",
        level: "Nível 2",
        joinedAt: "Membro desde 7 de março de 2026",
      },
    },
    {
      id: "fallback-fbm-copiar-oferta",
      title: "\"Copiar Oferta\" ao invés de \"Vender este produto\"; Qual sua opinião?",
      body:
        "Galera, vi que alguns produtos aparecem com a ação de copiar oferta em vez de vender este produto. O que vocês recomendam nessa situação?",
      spaceSlug: "central-de-ajuda-fbm",
      kind: "image",
      topics: [],
      publishedAt: "2026-04-18T10:00:00-03:00",
      comments: 1,
      likes: 5,
      views: 0,
      pinned: false,
      liked: false,
      saved: false,
      attachments: [{ kind: "image", fileName: "seller-central", fileUrl: "/source-six-assets/Screenshot202026-03-1620at2019-41-2920Amazon-4f6b8ca93fbf.png" }],
      author: {
        username: "nixon",
        name: "nixon",
        avatar: "N",
        badge: "p6 Goat",
        level: "Nível 2",
        joinedAt: "Membro desde 7 de março de 2026",
      },
    },
  ],
  geral: [
    channelPost("geral", "fallback-geral-texas", "Republicanos Ausentes: Democratas Vencem Eleição no Texas 🗳️", "A republicana Leigh Wambsganss sofreu uma derrota expressiva na eleição para o Distrito 9 do Senado estadual do Texas, perdendo por mais de 14 pontos percentuais. Analistas apontam que a baixa participação de eleitores republicanos foi um fator crucial..."),
    channelPost("geral", "fallback-geral-stranger-things", "Eleven, Will e a Gangue de Hawkins Retornam em Nova Série 'Stranger Things'", "A Netflix está retornando a Hawkins com Stranger Things: Contos de 85, uma nova série spin-off animada que chega em 23 de abril. Situada entre as temporadas 2 e 3, a série reúne Eleven, Mike, Will, Max, Lucas e Dustin enquanto eles enfrentam um..."),
    channelPost("geral", "fallback-geral-don-lemon", "Prisão de Don Lemon Alerta para Ameaças à Liberdade de Imprensa", "O caso reacendeu discussões sobre liberdade de imprensa e limites de atuação das autoridades diante de cobertura jornalística sensível."),
  ],
  geopolitica: [
    channelPost("geopolitica", "fallback-geopolitica-boa-vista", "PM de folga impede assalto à mão armada em posto de Boa Vista, RR", "Um policial militar de folga frustrou um assalto a um posto de combustíveis no bairro Asa Branca, em Boa Vista, na manhã desta segunda-feira (2). Dois jovens, de 24 e 26 anos, foram presos em flagrante. 🚨\n\nDe acordo com a Polícia Militar, o PM estava ...", {
      likes: 2,
      attachments: [{ kind: "image", fileName: "editassalto", fileUrl: sourceSixAsset("editassalto-f13ba143ba31.jpg") }],
    }),
    channelPost("geopolitica", "fallback-geopolitica-humor-sazonal", "Cientistas Descobrem \"Engrenagens\" Genéticas do Humor Sazonal", "Pesquisadores identificaram mecanismos genéticos que ajudam a explicar variações de humor em diferentes períodos do ano."),
    channelPost("geopolitica", "fallback-geopolitica-gas", "Turquia e Azerbaijão vão provar fornecimento de gás não russo à UE", "A Turquia e o Azerbaijão se comprometeram a demonstrar que estão fornecendo gás não russo para a União Europeia, conforme exigido por uma nova regulamentação da UE."),
  ],
  "politica-nacional": [
    channelPost("politica-nacional", "fallback-politica-lula", "Lula defende educação de meninos em pacto nacional contra feminicídio", "O presidente Lula anunciou a necessidade de educar os meninos como parte de um pacto contra o feminicídio que será firmado com os Três Poderes. O acordo está previsto para ser oficializado na quarta-feira, 4 de fevereiro.", { likes: 1 }),
    channelPost("politica-nacional", "fallback-politica-mara", "Mara Maravilha Internada na UTI em São Paulo: Motivo é Desconhecido", "A apresentadora Mara Maravilha foi internada na Unidade de Terapia Intensiva (UTI) em São Paulo. A notícia se espalhou rapidamente após a divulgação de um atestado médico nas redes sociais da artista. 🏥"),
    channelPost("politica-nacional", "fallback-politica-alcolumbre", "Alcolumbre Defende Congresso e Manda Indireta ao Governo Lula: \"Paz Não É Omissão\"", "A declaração movimentou os bastidores de Brasília e gerou novas leituras sobre a relação entre Congresso e governo federal."),
  ],
  economia: [
    channelPost("economia", "fallback-economia-apple", "Evercore ISI Reafirma Recomendação de Compra para Apple (AAPL) com Alvo de US$330", "A Evercore ISI reiterou sua classificação de \"Outperform\" para as ações da Apple (AAPL), mantendo o preço-alvo em US$ 330. A análise da empresa sugere que a Apple continua sendo uma escolha sólida para investidores, com perspect..."),
    channelPost("economia", "fallback-economia-raizen", "Raízen (RAIZ4) Cai Após Alta em Janeiro e Volta a Negociar Abaixo de R$1", "As ações da Raízen (RAIZ4) ampliaram a correção negativa após um período de alta em janeiro, voltando a ser negociadas abaixo de R$1."),
    channelPost("economia", "fallback-economia-watts", "Watts Water Technologies Alcança Novo Recorde: Ações a US$ 306,07", "As ações da Watts Water Technologies, empresa líder em produtos e soluções, renovaram máximas em meio a expectativas positivas do mercado."),
  ],
  "criptomoedas-08edfd": [
    channelPost("criptomoedas-08edfd", "fallback-cripto-liquidacao", "3 Altcoins com Alto Risco de Liquidação em Fevereiro: Fique Atento!", "O mercado de criptomoedas inicia a primeira semana de fevereiro com uma batalha intensa entre ursos (vendedores) e touros (compradores). Os ursos ainda detêm a vantagem, mas os touros parecem estar enxergando uma oportunidade."),
    channelPost("criptomoedas-08edfd", "fallback-cripto-mineradores", "Mineradores de Bitcoin Correm Risco se Preço Cair Abaixo de US$70 Mil", "A recente onda de vendas de Bitcoin é mais profunda do que uma simples correção técnica. Está se aproximando de um nível que afeta diretamente a economia da mineração."),
    channelPost("criptomoedas-08edfd", "fallback-cripto-tokens", "Liberação de Tokens: Hyperliquid, XDC e Berachain agitam fevereiro de 2026", "O mercado de criptomoedas se prepara para receber mais de US$ 638 milhões em desbloqueios de tokens ao longo do mês."),
  ],
  "ia-news": [
    channelPost("ia-news", "fallback-ia-meloni", "Polêmica: rosto de Meloni surge em anjo restaurado em igreja de Roma", "A recente restauração de uma capela em Roma trouxe uma surpresa inesperada: um anjo pintado com as feições da primeira-ministra da Itália, Giorgia Meloni. 😳"),
    channelPost("ia-news", "fallback-ia-gabbard", "Tulsi Gabbard Justifica Presença em Busca do FBI em Centro Eleitoral na Geórgia", "A ex-congressista e Diretora de Inteligência Nacional, Tulsi Gabbard, defendeu na segunda-feira sua presença durante uma busca realizada pelo FBI em um centro eleitoral."),
    channelPost("ia-news", "fallback-ia-cavalo", "Cavalo \"guitarrista\" faz sucesso na web com vídeo musical 🐴🎸", "Um vídeo musical incomum viralizou nas redes, misturando humor, tecnologia e cultura pop em formato curto."),
  ],
  "marketing-digital": [
    channelPost("marketing-digital", "fallback-marketing-reels", "Como Conquistar Atenção com Instagram Reels: Guia Completo", "O Instagram Reels evoluiu rapidamente de um \"novo recurso legal\" para o coração do aplicativo em poucos anos. Vídeos curtos se tornaram a forma como as pessoas exploram, aprendem e decidem o que experimentar."),
    channelPost("marketing-digital", "fallback-marketing-ppc", "7 Tendências Essenciais para sua Estratégia de PPC no E-commerce em 2026", "Os dias de campanhas de PPC fáceis já ficaram para trás. O mercado de e-commerce atual é um campo de batalha de alta velocidade, onde algoritmos e criatividade andam lado a lado."),
    channelPost("marketing-digital", "fallback-marketing-psicologia", "Psicologia na Publicidade: Transformando Comportamento em Conversões Reais", "A publicidade vai muito além de métricas e investimento em mídia; é uma disputa por atenção, memória e decisão."),
  ],
  "mr-robot": [
    channelPost("mr-robot", "fallback-mr-robot-ciber", "Segurança Cibernética Precisa de Produtos Inovadores, Diz Especialista", "Um especialista da comunidade Project Six levantou uma questão crucial: a necessidade urgente de uma nova abordagem em segurança cibernética. Segundo ele, a área tem falhado em demonstrar seu real valor para os negócios nas últimas décadas."),
    channelPost("mr-robot", "fallback-mr-robot-paimm", "Modelo de Maturidade em IA Pessoal (PAIMM) Ganha Destaque", "Desde 2016, com a publicação do livro The Real Internet of Things, a comunidade Project Six tem refletido sobre o Modelo de Maturidade em IA Pessoal (PAIMM)."),
    channelPost("mr-robot", "fallback-mr-robot-china", "China se Consolida como Fundo de Private Equity Global 🌎", "A análise compara movimentos de capital, tecnologia e infraestrutura para explicar a consolidação chinesa no cenário global."),
  ],
};

type OpenModal = { type: "detail" | "image" | "compact"; post: FeedPost; attachment?: FeedAttachment };

type FeedGeralMainProps = {
  spaceSlug?: string;
  title?: string;
  icon?: string;
  variant?: "default" | "hacking";
  showHero?: boolean;
  heroImage?: string;
  topics?: string[];
  showComposer?: boolean;
  showTopics?: boolean;
  showRail?: boolean;
  showNewPost?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  showEmptyCreate?: boolean;
  memberExtra?: string;
  magicLabel?: string;
};

export function FeedGeralMain({
  spaceSlug = "feed-geral",
  title = "Feed Geral",
  icon = asset("feed-svgrepo-com.png"),
  variant = "default",
  showHero = true,
  heroImage = asset("xsd23fs.png"),
  topics = ["Todos", "Canal Dark", "Filosofia", "Geral", "Amazon FBM"],
  showComposer = true,
  showTopics = true,
  showRail = true,
  showNewPost = true,
  emptyTitle = "Nenhuma publicação ainda",
  emptyBody = "As publicações deste espaço aparecerão aqui.",
  showEmptyCreate = true,
  memberExtra = "+856",
  magicLabel = "Destaques",
}: FeedGeralMainProps = {}) {
  const fallback = useMemo(() => feedFallbackPostsBySlug[spaceSlug] || [], [spaceSlug]);
  const [posts, setPosts] = useState<FeedPost[]>(fallback);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [openModal, setOpenModal] = useState<OpenModal | null>(null);
  const [imagePreview, setImagePreview] = useState<{ post: FeedPost; attachment?: FeedAttachment } | null>(null);
  const [likesPost, setLikesPost] = useState<FeedPost | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [sortLabel, setSortLabel] = useState("Mais recente");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(POSTS_PAGE_SIZE);
  const [viewer, setViewer] = useState<ViewerProfileSummary | null>(null);
  const [railMembers, setRailMembers] = useState<DetailMember[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const refreshPosts = async () => {
    const rows = await loadFeedPosts(spaceSlug);
    setPosts(rows.length ? rows : fallback);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;

    loadFeedPosts(spaceSlug)
      .then((rows) => {
        if (!alive) return;
        setPosts(rows.length ? rows : fallback);
        setVisibleCount(POSTS_PAGE_SIZE);
      })
      .catch(() => {
        if (alive) setPosts(fallback);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [fallback, spaceSlug]);

  useEffect(() => {
    let alive = true;
    loadViewerProfileSummary().then((summary) => {
      if (alive) setViewer(summary);
    }).catch(() => {
      if (alive) setViewer(null);
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    loadMembers().then((result) => {
      if (!alive) return;
      setRailMembers([...result.online, ...result.offline].slice(0, 6));
    }).catch(() => {
      if (alive) setRailMembers([]);
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const marker = loadMoreRef.current;
    if (!marker || loading || visibleCount >= posts.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((current) => Math.min(posts.length, current + POSTS_PAGE_SIZE));
      }
    }, { rootMargin: "360px 0px" });

    observer.observe(marker);
    return () => observer.disconnect();
  }, [loading, posts.length, visibleCount]);

  const viewerAvatar = viewer?.avatar || "VA";
  const headerMembers = useMemo(() => topMembers.map((member) => (
    member.id === "m2" ? { ...member, name: viewer?.name || "VA", avatar: viewerAvatar } : member
  )), [viewer, viewerAvatar]);
  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);
  const hasMorePosts = visibleCount < posts.length;

  const openPost = async (post: FeedPost, type: OpenModal["type"] = post.kind === "compact" ? "compact" : "detail", attachment?: FeedAttachment) => {
    const routeId = postRouteId(post);
    const canOpenAsRoute = !post.id.startsWith("fallback") || capturedPostRoutes.has(`${post.spaceSlug}/${routeId}`);

    if (type === "detail" && !attachment && canOpenAsRoute) {
      window.history.pushState({}, "", `/c/${post.spaceSlug}/${routeId}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
      if (!post.id.startsWith("fallback")) {
        await recordPostView(post.id).catch(() => undefined);
      }
      return;
    }

    setOpenModal({ type, post, attachment });
    if (!post.id.startsWith("fallback")) {
      await recordPostView(post.id).catch(() => undefined);
    }
  };

  const updatePostState = (updated: FeedPost) => {
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
    setOpenModal((current) => (current?.post.id === updated.id ? { ...current, post: updated } : current));
    setLikesPost((current) => (current?.id === updated.id ? updated : current));
  };

  const handlePublish = async (title: string, body: string, attachments: FeedAttachment[]) => {
    const created = await createFeedPost(title || "Publicação", body, spaceSlug, attachments);
    setPosts((current) => [created, ...current.filter((post) => !post.id.startsWith("fallback"))]);
    setShowCreate(false);
  };

  const handleUpdate = async (postId: string, title: string, body: string) => {
    const updated = await updateFeedPost(postId, title || "Publicação", body);
    updatePostState(updated);
    setEditingPost(null);
  };

  const handleDelete = async (post: FeedPost) => {
    await deleteFeedPost(post.id);
    setPosts((current) => current.filter((item) => item.id !== post.id));
    setOpenModal(null);
  };

  const handleLike = async (post: FeedPost) => {
    const nextLiked = !post.liked;
    const optimistic = { ...post, liked: nextLiked, likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)) };
    updatePostState(optimistic);

    if (post.id.startsWith("fallback") || post.id.startsWith("source-six-")) return;
    const updated = await togglePostReaction(post.id).catch(() => optimistic);
    updatePostState({ ...updated, liked: nextLiked });
  };

  const handleSave = async (post: FeedPost) => {
    const optimistic = { ...post, saved: !post.saved };
    updatePostState(optimistic);

    if (post.id.startsWith("fallback") || post.id.startsWith("source-six-")) return;
    await togglePostSave(post.id).catch(() => undefined);
  };

  const heroVisible = useMemo(() => showHero && !loading, [loading, showHero]);

  return (
    <main className={variant === "hacking" ? "general-feed-main hacking-feed-main" : "general-feed-main"}>
      <header className="general-feed-header">
        <div className="general-feed-title">
          <img src={icon} alt="" aria-hidden="true" />
          <h1>{title}</h1>
        </div>
        <div className="general-feed-actions">
          <div className="general-sort-wrap">
            <button
              className="general-sort-button"
              type="button"
              aria-haspopup="menu"
              aria-expanded={showSort}
              onClick={() => {
                setShowSettings(false);
                setShowMagic(false);
                setShowSort((current) => !current);
              }}
            >
              {sortLabel} <P6Icon name="icon-12-chevron-down-v3" size={14} />
            </button>
            {showSort ? <FeedSortMenu value={sortLabel} onSelect={(value) => { setSortLabel(value); setShowSort(false); }} /> : null}
          </div>
          <div className="general-magic-wrap">
            <button
              className={showMagic ? "general-magic-button active" : "general-magic-button"}
              type="button"
              aria-label={magicLabel}
              aria-haspopup="menu"
              aria-expanded={showMagic}
              onClick={() => {
                setShowSort(false);
                setShowSettings(false);
                setShowMagic((current) => !current);
              }}
            >
              <P6Icon name="icon-20-stardust-gradient" size={20} />
            </button>
            {showMagic ? <FeedMagicMenu /> : null}
          </div>
          <MemberCluster members={headerMembers} extra={memberExtra} />
          {showNewPost ? (
            <button className="general-new-post" type="button" onClick={() => setShowCreate(true)}>
              Nova publicação
            </button>
          ) : null}
          <div className="general-settings-wrap">
            <button
              className={showSettings ? "general-more active" : "general-more"}
              type="button"
              aria-label="Configurações do espaço"
              onClick={() => {
                setShowSort(false);
                setShowMagic(false);
                setShowSettings((current) => !current);
              }}
            >
              <P6Icon name="icon-16-menu-dots-horizontal" size={20} />
            </button>
            {showSettings ? <FeedSettingsMenu /> : null}
          </div>
        </div>
      </header>

      <div className="general-feed-scroll">
        {heroVisible ? (
          <div className="general-feed-hero">
            <img src={heroImage} alt={`Project Six ${title}`} />
          </div>
        ) : null}

        <div className={showRail ? "general-feed-grid" : "general-feed-grid is-single-column"}>
          <section className="general-feed-content">
            {showTopics ? <div className="general-topic-chips">
              {topics.map((chip, index) => (
                <button className={index === 0 ? "active" : ""} type="button" key={chip}>
                  {chip}
                </button>
              ))}
              <button type="button">
                Mais <P6Icon name="icon-12-chevron-down-v3" size={15} />
              </button>
            </div> : null}

            {showComposer ? <button className="general-inline-composer" type="button" onClick={() => setShowCreate(true)}>
              <span className="general-va">{viewerAvatar.slice(0, 2)}</span>
              <span>Criar uma publicação</span>
              <i>
                <P6Icon name="icon-20-plus-v3" size={21} />
              </i>
            </button> : null}

            {loading ? <FeedSkeleton /> : null}
            {!loading && !posts.length ? (
              <EmptySpaceState body={emptyBody} showCreate={showEmptyCreate && showComposer} title={emptyTitle} onCreate={() => setShowCreate(true)} />
            ) : null}
            {!loading && visiblePosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                viewerAvatar={viewerAvatar}
                onOpen={(modalType, attachment) => openPost(post, modalType, attachment)}
                onImage={(attachment) => setImagePreview({ post, attachment })}
                onLike={() => handleLike(post)}
                onSave={() => handleSave(post)}
                onLikes={() => setLikesPost(post)}
                onEdit={() => setEditingPost(post)}
                onDelete={() => handleDelete(post)}
              />
            ))}
            {!loading && hasMorePosts ? (
              <div className="feed-load-more-sentinel" ref={loadMoreRef}>
                <span>Carregando mais publicações</span>
              </div>
            ) : null}
          </section>

          {showRail ? <aside className="general-feed-rail">
            <section className="general-members-card">
              <h2>Membros</h2>
              {(railMembers.length ? railMembers : [
                { id: "vamp", name: "vamp.darcy", avatar: asset("9745dcfe727b27ce8d8aea9cc7814732.jpg") },
                { id: "ref", name: "Refzinho", avatar: "R" },
                { id: "sorenus", name: "Sorenus", avatar: "S" },
                { id: "olho", name: "oolho15k", avatar: "O" },
                { id: "cuervo", name: "o_cuervo", avatar: asset("d0f92b7a6b87e4692dfd1c8e88c5df4e.jpg") },
                { id: "lhz", name: "𝑙ℎ𝑧", avatar: "L" },
              ]).slice(0, 6).map((member) => (
                <button className="general-rail-member" type="button" key={member.id}>
                  <span className="general-rail-avatar"><Avatar value={member.avatar} name={member.name} /></span>
                  <span>{member.name}</span>
                </button>
              ))}
              <button className="general-rail-more" type="button">Ver membros</button>
            </section>
            <section className="general-pinned-card">
              <h2>Publicações fixadas</h2>
              <button type="button" onClick={() => posts[0] ? openPost(posts[0]) : undefined}>
                🔐 OPSEC: Segurança Operacional
              </button>
            </section>
          </aside> : null}
        </div>
      </div>

      {showCreate ? <CreatePostModal spaceName={title} onClose={() => setShowCreate(false)} onPublish={handlePublish} /> : null}
      {editingPost ? <CreatePostModal post={editingPost} spaceName={title} onClose={() => setEditingPost(null)} onUpdate={handleUpdate} /> : null}
      {imagePreview ? <ImageViewerModal post={imagePreview.post} attachment={imagePreview.attachment} onClose={() => setImagePreview(null)} /> : null}
      {openModal?.type === "compact" ? (
        <CompactPostModal
          post={openModal.post}
          viewerAvatar={viewerAvatar}
          onClose={() => setOpenModal(null)}
          onLike={() => handleLike(openModal.post)}
          onSave={() => handleSave(openModal.post)}
          onLikes={() => setLikesPost(openModal.post)}
          onCommented={refreshPosts}
        />
      ) : null}
      {openModal?.type === "detail" ? (
        <PostDetailModal
          post={openModal.post}
          viewerAvatar={viewerAvatar}
          onLike={() => handleLike(openModal.post)}
          onSave={() => handleSave(openModal.post)}
          onClose={() => setOpenModal(null)}
          onLikes={() => setLikesPost(openModal.post)}
          onCommented={refreshPosts}
          onImage={(attachment) => setImagePreview({ post: openModal.post, attachment })}
        />
      ) : null}
      {likesPost ? <LikesModal post={likesPost} onClose={() => setLikesPost(null)} /> : null}
    </main>
  );
}

function FeedPostCard({
  post,
  viewerAvatar,
  onOpen,
  onImage,
  onLike,
  onSave,
  onLikes,
  onEdit,
  onDelete,
}: {
  post: FeedPost;
  viewerAvatar: string;
  onOpen: (type: OpenModal["type"], attachment?: FeedAttachment) => void;
  onImage: (attachment?: FeedAttachment) => void;
  onLike: () => void;
  onSave: () => void;
  onLikes: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryAttachment = post.attachments[0];
  const modalType = post.kind === "compact" ? "compact" : "detail";

  return (
    <article className={`general-post-card ${post.kind === "image" ? "image-feed-post" : ""} ${post.kind === "compact" ? "compact-feed-post" : ""}`}>
      <div className="general-post-top">
        <button type="button" onClick={() => onOpen(modalType)}>
          <h2>{post.title}</h2>
        </button>
        <div className="general-post-menu-wrap">
          <button className={post.saved ? "active" : ""} type="button" aria-label="Salvar" onClick={onSave}>
            <P6Icon name={post.saved ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={21} />
          </button>
          <button type="button" aria-label="Mais" onClick={() => setMenuOpen((current) => !current)}>
            <P6Icon name="icon-16-menu-dots-horizontal" size={20} />
          </button>
          {menuOpen ? <PostMenu onEdit={onEdit} onDelete={onDelete} /> : null}
        </div>
      </div>

      {post.author.username === "maycon-pogan" ? <MayconAuthor post={post} /> : <PostAuthor post={post} />}

      {post.kind === "image" ? (
        <div className="image-post-body">
          <p>{post.body.split("\n\n")[0]}</p>
          {primaryAttachment ? (
            <button type="button" onClick={() => onImage(primaryAttachment)}>
              {primaryAttachment.kind === "image" ? <img src={primaryAttachment.fileUrl} alt={primaryAttachment.fileName} /> : <FileAttachment attachment={primaryAttachment} />}
            </button>
          ) : null}
          <p>{post.body.split("\n\n").slice(1).join("\n\n")}</p>
        </div>
      ) : post.kind === "compact" ? (
        <button className="image-post-body" type="button" onClick={() => onOpen("compact")}>
          <p>{post.body}</p>
        </button>
      ) : (
        <button className="general-post-body" type="button" onClick={() => onOpen("detail")}>
          <RichPostBody body={post.body} preview />
          <span>Ver mais</span>
        </button>
      )}

      <footer className="general-post-footer">
        <div>
          <button className={post.liked ? "liked" : ""} type="button" aria-label="Curtir" onClick={onLike}>
            <P6Icon name={post.liked ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={24} />
          </button>
          <button type="button" aria-label="Comentar" onClick={() => onOpen(modalType)}>
            <P6Icon name="icon-20-comment" size={20} />
          </button>
        </div>
        <button className="general-engagement" type="button" onClick={post.likes > 0 ? onLikes : () => onOpen(modalType)}>
          {post.likes > 0 ? (
            <>
              <LikeAvatars count={post.likes} viewerAvatar={viewerAvatar} />
              <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span>
              <b>·</b>
            </>
          ) : null}
          <span>{post.comments} comentário{post.comments === 1 ? "" : "s"}</span>
        </button>
      </footer>
    </article>
  );
}

function PostMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="feed-post-menu">
      <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
        <P6Icon name="icon-20-link" size={16} />
        Copiar link
      </button>
      <button type="button" onClick={() => window.alert("Você receberá notificações desta publicação.")}>
        <P6Icon name="icon-20-bell-v3" size={16} />
        Seguir publicação
      </button>
      <button type="button" onClick={() => window.alert("Denúncia registrada para análise.")}>
        <P6Icon name="icon-report" size={16} />
        Denunciar
      </button>
      <button type="button" onClick={onEdit}>
        <P6Icon name="icon-20-edit-v3" size={16} />
        Editar publicação
      </button>
      <button type="button" onClick={onDelete}>
        <P6Icon name="icon-20-bin-v3" size={16} />
        Excluir publicação
      </button>
    </div>
  );
}

function PostAuthor({ post }: { post: FeedPost }) {
  const levelLabel = post.author.level.replace("Nivel", "Nível");

  return (
    <div className="general-post-author">
      <Avatar value={post.author.avatar} name={post.author.name} />
      <div>
        <span>
          <strong>{post.author.name}</strong>
          <em className={post.author.badge === "Admin" ? "veteran-badge" : "hackudo-badge"}>{post.author.badge}</em>
          <em className="level-badge">🥈 {levelLabel}</em>
          <i>+2</i>
          <time>{formatRelativeDate(post.publishedAt)}</time>
        </span>
        <small>{post.author.joinedAt}</small>
      </div>
    </div>
  );
}

function MayconAuthor({ post }: { post: FeedPost }) {
  return (
    <div className="mp-author">
      <Avatar value={post.author.avatar || "MP"} name={post.author.name} fallback="MP" />
      <div>
        <p>
          <strong>{post.author.name}</strong>
          <em>p6 Goat</em>
          <time>{formatShortDate(post.publishedAt)}</time>
        </p>
        {post.kind === "image" ? <small>{post.author.joinedAt}</small> : null}
      </div>
    </div>
  );
}

function Avatar({ value, name, fallback }: { value: string; name: string; fallback?: string }) {
  const isImage = value.startsWith("http") || value.startsWith("/") || value.startsWith("data:");
  if (isImage) return <img src={value} alt="" />;
  return <span title={name}>{fallback || value || initials(name)}</span>;
}

function RichInlineText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("http")) {
          return <a href={part} target="_blank" rel="noreferrer" key={`${index}-${part}`}>{part}</a>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={`${index}-${part}`}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}

function RichPostBody({ body, preview = false }: { body: string; preview?: boolean }) {
  const blocks = body.split(/\n{2,}/).filter(Boolean);
  const visibleBlocks = preview ? blocks.slice(0, 2).map((block, index) => {
    if (index === 0 || block.length <= 24) return block;
    return `${block.slice(0, 10).trimEnd()}...`;
  }) : blocks;

  return (
    <>
      {visibleBlocks.map((block, index) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("- ")) {
          return (
            <ul key={`${index}-${trimmed}`}>
              {trimmed.split("\n").map((line) => (
                <li key={line}>{line.replace(/^-\s*/, "")}</li>
              ))}
            </ul>
          );
        }
        if (trimmed.startsWith("\"") || trimmed.startsWith("~")) return <strong key={`${index}-${trimmed}`}>{trimmed}</strong>;
        if (trimmed.length < 58 && !trimmed.endsWith(".") && !trimmed.includes("?")) return <h3 key={`${index}-${trimmed}`}>{trimmed}</h3>;
        return <p key={`${index}-${trimmed}`}><RichInlineText text={trimmed} /></p>;
      })}
    </>
  );
}

function FeedMagicMenu() {
  const actions = ["Resumir publicações", "Mostrar destaques", "Encontrar tópicos"];

  return (
    <div className="feed-magic-menu" role="menu" aria-label="Destaques do espaço">
      {actions.map((action) => (
        <button type="button" role="menuitem" key={action} onClick={() => window.alert(`${action} preparado.`)}>
          <P6Icon name="icon-20-stardust-gradient" size={16} />
          {action}
        </button>
      ))}
    </div>
  );
}

function FeedSettingsMenu() {
  const [email, setEmail] = useState(false);
  const [platform, setPlatform] = useState(true);

  return (
    <div className="feed-settings-menu">
      <p>Notificações das minhas publicações</p>
      <label>
        <input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} />
        <span>Notificações por e-mail</span>
      </label>
      <label>
        <input type="checkbox" checked={platform} onChange={(event) => setPlatform(event.target.checked)} />
        <span>Notificações na plataforma</span>
      </label>
    </div>
  );
}

function FeedSortMenu({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const options = ["Mais recente", "Nova atividade", "Mais antiga", "Popular", "Curtidas", "Alfabética"];

  return (
    <div className="feed-sort-menu" role="menu" aria-label="Ordenar publicações">
      {options.map((option) => (
        <button
          className={option === value ? "active" : ""}
          type="button"
          role="menuitem"
          key={option}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function EmptySpaceState({
  body,
  showCreate,
  title,
  onCreate,
}: {
  body: string;
  showCreate: boolean;
  title: string;
  onCreate: () => void;
}) {
  return (
    <article className={showCreate ? "general-empty-space" : "general-empty-space is-simple"}>
      <strong>{title}</strong>
      {body ? <span>{body}</span> : null}
      {showCreate ? <button type="button" onClick={onCreate}>Criar publicação</button> : null}
    </article>
  );
}

function CreatePostModal({
  post,
  spaceName = "Feed Geral",
  onClose,
  onPublish,
  onUpdate,
}: {
  post?: FeedPost;
  spaceName?: string;
  onClose: () => void;
  onPublish?: (title: string, body: string, attachments: FeedAttachment[]) => Promise<void>;
  onUpdate?: (postId: string, title: string, body: string) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(post?.title || "");
  const [body, setBody] = useState(post?.body || "");
  const [attachments, setAttachments] = useState<FeedAttachment[]>(post?.attachments || []);
  const [publishing, setPublishing] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  useCloseOnEscape(onClose);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setPublishing(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadFeedAttachment(file)));
      setAttachments((current) => [...current, ...uploaded]);
    } finally {
      setPublishing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!body.trim() || publishing) return;
    setPublishing(true);
    try {
      if (post && onUpdate) await onUpdate(post.id, title, body);
      else if (onPublish) await onPublish(title, body, attachments);
    } finally {
      setPublishing(false);
    }
  };

  const toggleTool = (tool: string) => {
    setActiveTool((current) => (current === tool ? null : tool));
  };

  const insertText = (text: string) => {
    setBody((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${text}`);
    setActiveTool(null);
  };

  return createPortal(
    <div className="feed-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="create-post-modal" role="dialog" aria-modal="true" aria-label={post ? "Editar publicação" : "Criar publicação"}>
        <header>
          <h2>{post ? "Editar publicação" : "Criar publicação"}</h2>
          <div>
            <button type="button" aria-label="Duplicar">
              <P6Icon name="icon-20-copy" size={18} />
            </button>
            <button type="button" aria-label="Expandir">
              <P6Icon name="icon-20-expand" size={18} />
            </button>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <P6Icon name="icon-20-close" size={20} />
            </button>
          </div>
        </header>
        <div className="create-post-editor">
          <input aria-label="Título" placeholder="Título (opcional)" value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea aria-label="Escreva algo" placeholder="Escreva algo" value={body} onChange={(event) => setBody(event.target.value)} />
          {attachments.length ? (
            <div className="create-post-attachments">
              {attachments.map((attachment) => (
                <span key={attachment.fileUrl}>{attachment.fileName}</span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="create-post-topic">Pesquisar até 5 tópicos</div>
        <footer>
          <input ref={fileInputRef} className="feed-hidden-file" type="file" multiple onChange={(event) => handleFiles(event.target.files)} />
          <div className="create-post-tools">
            <button type="button" aria-label="Adicionar" onClick={() => toggleTool("add")}>
              <P6Icon name="icon-20-plus-v3" size={18} />
            </button>
            <button type="button" aria-label="Tópico" onClick={() => toggleTool("topic")}>
              <P6Icon name="icon-12-globe" size={18} />
            </button>
            <button type="button" aria-label="Anexo" onClick={() => fileInputRef.current?.click()}>
              <P6Icon name="icon-20-attach" size={18} />
            </button>
            <button type="button" aria-label="Vídeo" onClick={() => fileInputRef.current?.click()}>
              <P6Icon name="icon-20-video" size={18} />
            </button>
            <button type="button" aria-label="GIF" onClick={() => toggleTool("gif")}>
              <span>GIF</span>
            </button>
            <button type="button" aria-label="Imagem" onClick={() => fileInputRef.current?.click()}>
              <P6Icon name="icon-20-image-v3" size={18} />
            </button>
            <button type="button" aria-label="Emoji" onClick={() => toggleTool("emoji")}>
              <P6Icon name="icon-20-emoji" size={18} />
            </button>
            <button type="button" aria-label="Enquete" onClick={() => insertText("\n\n[Enquete]\n- Opção 1\n- Opção 2")}>
              <P6Icon name="icon-20-chart" size={18} />
            </button>
            <button type="button" aria-label="Áudio" onClick={() => insertText("[Mensagem de áudio]")}>
              <P6Icon name="icon-20-microphone" size={18} />
            </button>
            <button type="button" aria-label="Câmera" onClick={() => fileInputRef.current?.click()}>
              <P6Icon name="icon-20-camera" size={18} />
            </button>
          </div>
          <div className="create-post-publish">
            <span>
              Publicando em: <strong>{spaceName}</strong> <P6Icon name="icon-12-chevron-down-v3" size={14} />
            </span>
            <button type="button" disabled={!body.trim() || publishing} onClick={handleSubmit}>
              {publishing ? "Publicando" : "Publicar"}
            </button>
          </div>
          {activeTool ? <CreatePostToolPopover tool={activeTool} onInsert={insertText} onPickFile={() => fileInputRef.current?.click()} /> : null}
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function CreatePostToolPopover({
  tool,
  onInsert,
  onPickFile,
}: {
  tool: string;
  onInsert: (text: string) => void;
  onPickFile: () => void;
}) {
  if (tool === "emoji") {
    return (
      <div className="create-post-tool-popover create-post-emoji-popover">
        {["😀", "🔥", "👏", "👀", "✅", "💬", "🚀", "❤️"].map((emoji) => (
          <button type="button" key={emoji} onClick={() => onInsert(emoji)}>{emoji}</button>
        ))}
      </div>
    );
  }

  if (tool === "gif") {
    return (
      <div className="create-post-tool-popover create-post-search-popover">
        <input placeholder="Pesquisar GIF" aria-label="Pesquisar GIF" />
        <button type="button" onClick={() => onInsert("[GIF]")}>Inserir GIF</button>
      </div>
    );
  }

  if (tool === "topic") {
    return (
      <div className="create-post-tool-popover create-post-list-popover">
        {["Hacking", "Tecnologia", "Cibersegurança", "OPSEC"].map((topic) => (
          <button type="button" key={topic} onClick={() => onInsert(`#${topic}`)}>{topic}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="create-post-tool-popover create-post-list-popover">
      <button type="button" onClick={onPickFile}>Upload de arquivo</button>
      <button type="button" onClick={() => onInsert("https://")}>Adicionar link</button>
      <button type="button" onClick={() => onInsert("@")}>Mencionar membro</button>
    </div>
  );
}

function ImageViewerModal({ post, attachment, onClose }: { post: FeedPost; attachment?: FeedAttachment; onClose: () => void }) {
  const target = attachment || post.attachments[0];
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!target) return null;

  return createPortal(
    <div className="feed-modal-backdrop image-viewer-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="image-viewer-modal" role="dialog" aria-modal="true" aria-label={target.fileName}>
        <header>
          <h2>{target.fileName}</h2>
          <div>
            <a href={target.fileUrl} download={target.fileName} aria-label="Baixar">
              <P6Icon name="icon-20-download" size={19} />
            </a>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <P6Icon name="icon-20-close" size={22} />
            </button>
          </div>
        </header>
        <div className="image-viewer-stage">
          {target.kind === "image" ? <img src={target.fileUrl} alt={target.fileName} /> : <FileAttachment attachment={target} />}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function CompactPostModal({
  post,
  viewerAvatar,
  onClose,
  onLike,
  onSave,
  onLikes,
  onCommented,
}: {
  post: FeedPost;
  viewerAvatar: string;
  onClose: () => void;
  onLike: () => void;
  onSave: () => void;
  onLikes: () => void;
  onCommented: () => Promise<void>;
}) {
  useCloseOnEscape(onClose);

  return createPortal(
    <div className="feed-modal-backdrop compact-post-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <button className="post-modal-arrow left" type="button" aria-label="Publicação anterior">
        <P6Icon name="chevron-left-lg" sprite="compass" size={22} />
      </button>
      <section className="compact-post-modal" role="dialog" aria-modal="true" aria-label={post.title}>
        <header>
          <h2>{post.title}</h2>
          <div>
            <button className={post.saved ? "active" : ""} type="button" aria-label="Salvar" onClick={onSave}>
              <P6Icon name={post.saved ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={21} />
            </button>
            <button type="button" aria-label="Mais">
              <P6Icon name="icon-16-menu-dots-horizontal" size={21} />
            </button>
            <button type="button" aria-label="Expandir">
              <P6Icon name="icon-20-expand" size={20} />
            </button>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <P6Icon name="icon-20-close" size={22} />
            </button>
          </div>
        </header>
        <div className="compact-post-content">
          <MayconAuthor post={post} />
          <p className="compact-post-text">{post.body}</p>
          <footer className="compact-post-actions">
            <div>
              <button className={post.liked ? "liked" : ""} type="button" aria-label="Curtir" onClick={onLike}>
                <P6Icon name={post.liked ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={24} />
              </button>
              <button type="button" aria-label="Comentar">
                <P6Icon name="icon-20-comment" size={20} />
              </button>
            </div>
            <button className="general-engagement" type="button" onClick={onLikes}>
              {post.likes > 0 ? (
                <>
                  <LikeAvatars count={post.likes} viewerAvatar={viewerAvatar} />
                  <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span>
                  <b>·</b>
                </>
              ) : null}
              <span>{post.comments} comentário{post.comments === 1 ? "" : "s"}</span>
            </button>
          </footer>
          <CommentList post={post} compact />
          <CommentBox post={post} onCommented={onCommented} />
        </div>
      </section>
      <button className="post-modal-arrow right" type="button" aria-label="Próxima publicação">
        <P6Icon name="chevron-right-lg" sprite="compass" size={22} />
      </button>
    </div>,
    document.body,
  );
}

function LikesModal({ post, onClose }: { post: FeedPost; onClose: () => void }) {
  const [likes, setLikes] = useState<FeedLike[]>([]);
  useCloseOnEscape(onClose);

  useEffect(() => {
    loadPostLikes(post.id).then(setLikes).catch(() => setLikes([]));
  }, [post.id]);

  return createPortal(
    <div className="likes-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="likes-modal" role="dialog" aria-modal="true" aria-label="Curtidas">
        <header>
          <h2>{Math.max(post.likes, likes.length)} Curtir</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <P6Icon name="icon-20-close" size={22} />
          </button>
        </header>
        {(likes.length ? likes : [{ id: "curly", author: { name: "Curly Silver", avatar: asset("424eae48f9d2135edb461bf04289b99e.png"), username: "curly" }, emoji: "like", postId: post.id }]).map((like) => (
          <div key={like.id}>
            <Avatar value={like.author.avatar} name={like.author.name} />
            <span>{like.author.name}</span>
          </div>
        ))}
      </section>
    </div>,
    document.body,
  );
}

function PostDetailModal({
  post,
  viewerAvatar,
  onLike,
  onSave,
  onClose,
  onLikes,
  onCommented,
  onImage,
}: {
  post: FeedPost;
  viewerAvatar: string;
  onLike: () => void;
  onSave: () => void;
  onClose: () => void;
  onLikes: () => void;
  onCommented: () => Promise<void>;
  onImage: (attachment?: FeedAttachment) => void;
}) {
  useCloseOnEscape(onClose);

  return createPortal(
    <div className="feed-modal-backdrop post-detail-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <button className="post-modal-arrow left" type="button" aria-label="Publicação anterior">
        <P6Icon name="chevron-left-lg" sprite="compass" size={22} />
      </button>
      <section className="post-detail-modal" role="dialog" aria-modal="true" aria-label={post.title}>
        <header>
          <h2>{post.title}</h2>
          <div>
            <button type="button" aria-label="Destaques">
              <P6Icon name="icon-20-stardust-gradient" size={20} />
            </button>
            <button className={post.saved ? "active" : ""} type="button" aria-label="Salvar" onClick={onSave}>
              <P6Icon name={post.saved ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={20} />
            </button>
            <button type="button" aria-label="Mais">
              <P6Icon name="icon-16-menu-dots-horizontal" size={20} />
            </button>
            <button type="button" aria-label="Expandir">
              <P6Icon name="icon-20-expand" size={20} />
            </button>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <P6Icon name="icon-20-close" size={22} />
            </button>
          </div>
        </header>
        <div className="post-detail-scroll">
          {post.author.username === "maycon-pogan" ? <MayconAuthor post={post} /> : <PostAuthor post={post} />}
          <div className="post-detail-body">
            {post.attachments.map((attachment) => (
              <div className="post-detail-attachment" key={attachment.fileUrl}>
                {attachment.kind === "image" ? (
                  <button type="button" aria-label={`Abrir ${attachment.fileName}`} onClick={() => onImage(attachment)}>
                    <img src={attachment.fileUrl} alt={attachment.fileName} />
                  </button>
                ) : <FileAttachment attachment={attachment} />}
              </div>
            ))}
            <RichPostBody body={post.body} />
          </div>
          <footer className="post-detail-footer">
            <div>
              <button className={post.liked ? "liked" : ""} type="button" aria-label="Curtir" onClick={onLike}>
                <P6Icon name={post.liked ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={24} />
              </button>
              <button type="button" aria-label="Comentar">
                <P6Icon name="icon-20-comment" size={20} />
              </button>
            </div>
            <button className="general-engagement" type="button" onClick={onLikes}>
              {post.likes > 0 ? (
                <>
                  <LikeAvatars count={post.likes} viewerAvatar={viewerAvatar} />
                  <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span>
                  <b>·</b>
                </>
              ) : null}
              <span>{post.comments} comentário{post.comments === 1 ? "" : "s"}</span>
            </button>
          </footer>
          <CommentList post={post} />
          <CommentBox post={post} onCommented={onCommented} />
        </div>
      </section>
      <button className="post-modal-arrow right" type="button" aria-label="Próxima publicação">
        <P6Icon name="chevron-right-lg" sprite="compass" size={22} />
      </button>
    </div>,
    document.body,
  );
}

function CommentList({ post, compact = false }: { post: FeedPost; compact?: boolean }) {
  const [comments, setComments] = useState<FeedComment[]>([]);

  useEffect(() => {
    loadPostComments(post.id).then(setComments).catch(() => setComments([]));
  }, [post.id, post.comments]);

  if (!comments.length) return null;

  return (
    <div className={compact ? "compact-comments-list" : "post-comments-list"}>
      {comments.map((comment) => (
        <div className="compact-comment" key={comment.id}>
          <Avatar value={comment.author.avatar} name={comment.author.name} />
          <div>
            <p>
              <strong>{comment.author.name}</strong>
              {comment.author.username === "matheusxzyz" ? <em>p6 Veterano</em> : null}
              {comment.author.username === "matheusxzyz" ? <em>p6 Goat</em> : null}
              <time>{formatShortDate(comment.createdAt)}</time>
            </p>
            <span>{comment.body}</span>
            <small>Curtir&nbsp;&nbsp;Responder</small>
          </div>
          <button type="button" aria-label="Mais">
            <P6Icon name="icon-16-menu-dots-horizontal" size={18} />
          </button>
          {comment.reactions ? <b>{comment.reactions} curtida</b> : null}
        </div>
      ))}
    </div>
  );
}

function CommentBox({ post, onCommented }: { post: FeedPost; onCommented: () => Promise<void> }) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!body.trim() || saving) return;
    setSaving(true);
    try {
      await createFeedComment(post.id, body);
      setBody("");
      await onCommented();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="post-comment-box">
      <span className="general-va">VA</span>
      <input
        placeholder="O que você acha?"
        aria-label="O que você acha?"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
      />
    </div>
  );
}

function LikeAvatars({ count, viewerAvatar }: { count: number; viewerAvatar: string }) {
  const fallback = [
    asset("Cindy.jpeg"),
    asset("Sean Connery _ 007.jpg"),
    asset("photo_2025-08-25_21-30-00.jpg"),
  ];
  const avatars = count === 1 ? [viewerAvatar] : fallback.slice(0, Math.min(count, fallback.length));

  return (
    <span className="general-like-row">
      {avatars.map((avatar, index) => (
        avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:")
          ? <img src={avatar} alt="" key={`${avatar}-${index}`} />
          : <span className="general-like-initial" key={`${avatar}-${index}`}>{avatar.slice(0, 2).toUpperCase()}</span>
      ))}
    </span>
  );
}

function FileAttachment({ attachment }: { attachment: FeedAttachment }) {
  return (
    <span className="feed-file-attachment">
      <P6Icon name="icon-20-doc" size={22} />
      {attachment.fileName}
    </span>
  );
}

function postRouteId(post: FeedPost) {
  return post.id.startsWith("fallback") ? slugify(post.title) : post.id;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useCloseOnEscape(onClose: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
}

function FeedSkeleton() {
  return (
    <article className="general-post-card feed-skeleton">
      <div />
      <div />
      <div />
    </article>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "VA";
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.max(0, Math.round(diff / 86400000));
  if (days <= 0) return "hoje";
  if (days < 7) return `${days} d`;
  return formatShortDate(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value)).replace(" de ", " ");
}

