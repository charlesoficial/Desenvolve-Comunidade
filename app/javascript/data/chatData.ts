import type { ComponentType } from "react";
import { makeCommunityIcon } from "../design-system";
import type { P6GlyphProps } from "../design-system/components/CommunityIcon";

export type ChatMenuItem = {
  id: string;
  label: string;
  icon?: ComponentType<P6GlyphProps>;
  asset?: string;
  path?: string;
  unreadCount?: number;
  view?: "feed" | "chat" | "politica" | "members" | "progress" | "courses" | "events" | "hackingTec";
};

export type ChatMenuSection = {
  id: string;
  title?: string;
  menu?: boolean;
  items: ChatMenuItem[];
};

export type ChatMessage = {
  id: string;
  parentId?: string | null;
  author: string;
  authorUsername?: string;
  time?: string;
  createdAt?: string;
  avatar: string;
  text: string;
  highlighted?: boolean;
  divider?: string;
  newDivider?: boolean;
};

export type DetailMember = {
  id: string;
  name: string;
  avatar: string;
  status?: "green" | "yellow";
  admin?: boolean;
};

const p6SidebarAssets: Record<string, string> = {
  "achievement-2-svgrepo-com.png": "qk1pok3mibpj07b3gsarbs5aoj95-082da76c4dd8.png",
  "album-svgrepo-com.png": "l68u2wos71lizl1wfg4rbat3uayq-f82c93df34d6.png",
  "amazon-svgrepo-com.png": "mv618bynojaxoqbqsm0h8dcf0vmd-57a188f6b90f.png",
  "bitcoin-refresh-svgrepo-com.png": "gwf753znoljamoe5mkbo46vgf7e4-7c7599eb1085.png",
  "calendar-search-svgrepo-com.png": "5kxuitebf306hjouunl3xxwouigf-4fce3f3813eb.png",
  "chat-round-line-svgrepo-com.png": "dq8tk4grtiu6o2vbu216fi11fqze-4b574fbff460.png",
  "feed-svgrepo-com.png": "8anlrhrrcvf5244v64zgy9xac1i1-b7a55e865a5c.png",
  "folder-with-files-svgrepo-com.png": "gcw7n4qncrz7sx13bo9d9iqakyha-c340d4ba1b6e.png",
  "group-svgrepo-com.png": "gnhwspmtws9hx0901q7jhp8698lx-b276dd89ea89.png",
  "imagem_2026-02-02_152751805.png": "g0y72bar4nbfs93j392geuywd3nh-6b6a4591c96a.png",
  "imagem_2026-02-02_152832085.png": "zd4spj1qlityf0qm0ir6repxwwe3-965cb0896211.png",
  "imagem_2026-02-02_152915713.png": "xxwaql31mn87v7o3ur09l67xkh0m-676cd17658fb.png",
  "imagem_2026-02-02_153146158.png": "msydwkiz4a7wqjivsk1junn6pibr-a71af880f9f8.png",
  "imagem_2026-02-02_153231631.png": "2lbay8gmjhdejlgi9azvxpaf4uq1-ff4bfa64833e.png",
  "imagem_2026-02-02_153333630.png": "r1hb8y12pedfwkas00p0yvfkj5zi-0d7da70a2879.png",
  "imagem_2026-02-02_153413379.png": "dr9h1odd9uqukr569q4eqlxiqhpg-e4b841a25480.png",
  "screencast-svgrepo-com.png": "qfeoralvy2guhfrsgaufm020fta0-123aff879e1d.png",
  "shield-warning-svgrepo-com.png": "7scrifxr6swd4ggl11084ra0wxje-3195f3459dd3.png",
  "workers-connections-symbol-svgrepo-com.png": "vkhlfep70vv9vwwoxm0sfe0ct7x1-a9b53aae27d5.png",
};
const CommunityIcon = (name: string) => `/community-assets/${p6SidebarAssets[name] || name}`;
const FeedIcon = makeCommunityIcon("icon-20-feed-v3");
const LockIcon = makeCommunityIcon("icon-lock-v2");
const ArrowUpRightIcon = makeCommunityIcon("arrow-up-right-md", "compass");

export const chatMenuSections: ChatMenuSection[] = [
  {
    id: "root",
    items: [{ id: "feed", label: "Feed", icon: FeedIcon, view: "feed", path: "/feed" }],
  },
  {
    id: "free",
    title: "Área Free",
    items: [{ id: "avisos-free", label: "Avisos", asset: CommunityIcon("shield-warning-svgrepo-com.png"), view: "feed", path: "/c/avisos-4e37a7" }],
  },
  {
    id: "principal",
    title: "Principal",
    menu: true,
    items: [
      { id: "avisos", label: "Avisos", asset: CommunityIcon("shield-warning-svgrepo-com.png"), view: "feed", path: "/c/avisos", unreadCount: 2 },
      { id: "feed-geral", label: "Feed Geral", asset: CommunityIcon("feed-svgrepo-com.png"), view: "feed", path: "/c/feed-geral" },
      { id: "chat-geral", label: "Chat Geral", asset: CommunityIcon("chat-round-line-svgrepo-com.png"), view: "chat", path: "/c/chat-geral", unreadCount: 1 },
      { id: "membros", label: "Membros", asset: CommunityIcon("group-svgrepo-com.png"), view: "members", path: "/c/membros" },
      { id: "progresso", label: "Seu Progresso", asset: CommunityIcon("achievement-2-svgrepo-com.png"), view: "progress", path: "/c/seu-progresso" },
    ],
  },
  {
    id: "aulas",
    title: "Aulas",
    items: [
      { id: "agenda", label: "Agenda de aulas", asset: CommunityIcon("calendar-search-svgrepo-com.png"), view: "events", path: "/c/evento-aula" },
      { id: "gravadas", label: "Aulas Gravadas", asset: CommunityIcon("album-svgrepo-com.png"), view: "courses", path: "/c/aulas-gravadas" },
    ],
  },
  {
    id: "metodo",
    title: "Método P6 | 2026",
    items: [
      { id: "merchant", label: "Fulfillment by Merchant", asset: CommunityIcon("amazon-svgrepo-com.png"), view: "courses", path: "/c/metodo-comunidade" },
      { id: "central", label: "Central de Ajuda 'FBM'", asset: CommunityIcon("amazon-svgrepo-com.png"), view: "feed", path: "/c/central-de-ajuda-fbm" },
      { id: "fba", label: "FBA", asset: CommunityIcon("amazon-svgrepo-com.png"), view: "feed", path: "/c/fba" },
      { id: "network", label: "Network", asset: CommunityIcon("workers-connections-symbol-svgrepo-com.png"), view: "members", path: "/c/network" },
    ],
  },
  {
    id: "info",
    title: "Info Produto",
    items: [
      { id: "aulas-info", label: "Aulas", asset: CommunityIcon("screencast-svgrepo-com.png"), view: "courses", path: "/c/aulas-nvl1" },
      { id: "network-info", label: "Network", asset: CommunityIcon("workers-connections-symbol-svgrepo-com.png"), view: "members", path: "/c/network-033efe" },
      { id: "ofertas-info", label: "Ofertas", asset: CommunityIcon("folder-with-files-svgrepo-com.png"), view: "feed", path: "/c/ofertas" },
    ],
  },
  {
    id: "expert-hot",
    title: "Expert Hot",
    items: [
      { id: "basico", label: "Básico", asset: CommunityIcon("album-svgrepo-com.png"), view: "courses", path: "/c/como-comecar-a4b99e" },
      { id: "aulas-completas", label: "Aulas Completas", icon: LockIcon, view: "courses", path: "/c/como-comecar" },
      { id: "network-expert", label: "Network", icon: LockIcon, view: "members", path: "/c/network-7e232a" },
    ],
  },
  {
    id: "facebook",
    title: "FaceBook",
    menu: true,
    items: [{ id: "network-facebook", label: "Network", asset: CommunityIcon("workers-connections-symbol-svgrepo-com.png"), view: "members", path: "/c/network-ae9544" }],
  },
  {
    id: "area-hacking",
    title: "Área Hacking",
    items: [
      { id: "chat-hacking", label: "Chat", icon: LockIcon, view: "chat", path: "/c/chat-3b19c1" },
      { id: "feed-hacking", label: "Feed", icon: LockIcon, view: "feed", path: "/c/feed" },
      { id: "hacking", label: "Hacking", icon: LockIcon, view: "hackingTec", path: "/c/hacking" },
      { id: "ferramentas", label: "Ferramentas", icon: LockIcon, view: "hackingTec", path: "/c/tools-e-tutoriais" },
      { id: "criptomoedas-locked", label: "Criptomoedas", icon: LockIcon, view: "hackingTec", path: "/c/criptomoedas" },
      { id: "biblioteca", label: "Biblioteca", icon: LockIcon, view: "hackingTec", path: "/c/biblioteca" },
      { id: "torrents", label: "Torrents", icon: LockIcon, view: "hackingTec", path: "/c/torrents" },
      { id: "noticias-locked", label: "Notícias", icon: LockIcon, view: "hackingTec", path: "/c/news-hacking" },
      { id: "opsec", label: "Aula de OPSEC", icon: LockIcon, view: "hackingTec", path: "/c/opsec-2026" },
    ],
  },
  {
    id: "nivel-2",
    title: "Nível 2",
    items: [
      { id: "sistemas", label: "Sistemas", icon: LockIcon, view: "hackingTec", path: "/c/sistemas" },
      { id: "chat-nivel", label: "Chat", icon: LockIcon, view: "chat", path: "/c/chat-8e7b7e" },
    ],
  },
  {
    id: "noticias",
    title: "Notícias",
    items: [
      { id: "geral-news", label: "Geral", asset: CommunityIcon("imagem_2026-02-02_153413379.png"), view: "politica", path: "/c/geral" },
      { id: "geopolitica", label: "Geopolítica", asset: CommunityIcon("imagem_2026-02-02_153333630.png"), view: "politica", path: "/c/geopolitica" },
      { id: "politica-nacional", label: "Política Nacional", asset: CommunityIcon("imagem_2026-02-02_153231631.png"), view: "politica", path: "/c/politica-nacional" },
      { id: "economia", label: "Economia", asset: CommunityIcon("imagem_2026-02-02_153146158.png"), view: "politica", path: "/c/economia" },
      { id: "criptomoedas-news", label: "Criptomoedas", asset: CommunityIcon("bitcoin-refresh-svgrepo-com.png"), view: "politica", path: "/c/criptomoedas-08edfd" },
      { id: "ia-news", label: "IA News", asset: CommunityIcon("imagem_2026-02-02_152915713.png"), view: "politica", path: "/c/ia-news" },
      { id: "marketing-digital", label: "Marketing Digital", asset: CommunityIcon("imagem_2026-02-02_152832085.png"), view: "politica", path: "/c/marketing-digital" },
      { id: "hacking-tec", label: "Hacking/Tec", asset: CommunityIcon("imagem_2026-02-02_152751805.png"), view: "hackingTec", path: "/c/mr-robot" },
    ],
  },
  {
    id: "diverso",
    title: "Diverso",
    items: [{ id: "influencer", label: "Influencer IA & TikTok ...", asset: CommunityIcon("album-svgrepo-com.png"), view: "courses", path: "/c/influencer-ia-tiktok-dark" }],
  },
  {
    id: "links",
    title: "Links",
    items: [
      { id: "discord", label: "Discord", icon: ArrowUpRightIcon },
      { id: "suporte", label: "Suporte", icon: ArrowUpRightIcon },
      { id: "instagram", label: "Instagram", icon: ArrowUpRightIcon },
    ],
  },
];

export const chatMessages: ChatMessage[] = [
  {
    id: "m-pre-1",
    author: "Wskz",
    time: "11:30",
    avatar: "W",
    text: "msm fita q eu",
  },
  {
    id: "m-pre-2",
    author: "SSweet",
    time: "15:29",
    avatar: "S",
    text: "Passa a agua pro seu nome kkk",
    divider: "24 DE ABR.",
  },
  {
    id: "m-pre-3",
    author: "Nemsemprefeliz",
    time: "15:32",
    avatar: "N",
    text: "Boa boa rapaziada. To dando uma olhada nas aulas, recomendam começar com amazon ou info?? (editado)",
  },
  {
    id: "m-pre-4",
    author: "bruniin",
    time: "15:49",
    avatar: "/community-assets/11fa80eb52474318b5d51c73ada152f6-58f23fff20cd.jpg",
    text: "depende do seu caixa",
  },
  {
    id: "m-pre-5",
    author: "Nemsemprefeliz",
    time: "17:10",
    avatar: "N",
    text: "em torno de uns 400 ou 300 reais todo mês pra investir nisso",
  },
  {
    id: "m0",
    author: "Nemsemprefeliz",
    time: "17:11",
    avatar: "N",
    text: "vale a pena pular logo pra info?",
  },
  {
    id: "m1",
    author: "nixon",
    time: "21:15",
    avatar: "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg",
    text: "depende, se vc quiser algo mais seguro mas com menos retorno e mais demorado amazon\nagora se vc quer arriscar, se validar uma oferta vc estoura a boa, mas acho dificil validar uma oferta de primeira com 400",
  },
  {
    id: "m2",
    author: "Gabriel Amarante",
    time: "21:45",
    avatar: "/community-assets/IMG_2459.jpeg-20e76166eb1c.jpg",
    text: "Boa noite rpz",
  },
  {
    id: "m3",
    author: "Pedro Henrique",
    time: "22:07",
    avatar: "PH",
    text: "Boa",
  },
  {
    id: "m4",
    author: "Gabriel Amarante",
    time: "01:08",
    avatar: "/community-assets/IMG_2459.jpeg-20e76166eb1c.jpg",
    text: "Levantar caixa com social media e uma boa? Da pra levantar uns 500 reais em 1~2 semanas?",
    divider: "ONTEM",
  },
  {
    id: "m5",
    author: "pablito escobalito",
    time: "01:24",
    avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg",
    text: "boa p nos",
  },
  {
    id: "m6",
    author: "pablito escobalito",
    time: "01:24",
    avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg",
    text: "dai 1 aq",
  },
  {
    id: "m7",
    author: "pablito escobalito",
    time: "03:30",
    avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg",
    text: "entrei aqui pra adquirir network",
  },
  {
    id: "m8",
    author: "pablito escobalito",
    time: "03:30",
    avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg",
    text: "mas oq vim e lucro",
  },
  {
    id: "m9",
    author: "lhz",
    time: "05:38",
    avatar: "/community-assets/eu-0ce4791927fa.jpg",
    text: "A casa cresceu",
  },
  {
    id: "m10",
    author: "Enzo Jacob",
    time: "16:05",
    avatar: "/community-assets/alain_20delon-b3fd874ea0e0.jpg",
    text: "como eu deixo o site no modo escuro",
    divider: "HOJE",
  },
  {
    id: "m11",
    author: "Enzo Jacob",
    time: "16:05",
    avatar: "/community-assets/alain_20delon-b3fd874ea0e0.jpg",
    text: "to ficando cego pprt",
  },
  {
    id: "m12",
    author: "henrik",
    time: "17:58",
    avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg",
    text: "2 kkk",
    newDivider: true,
  },
  {
    id: "m13",
    author: "reiltuo",
    time: "19:07",
    avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg",
    text: "Clica na logo da comunidade na parte superior esquerda, lá irá aparecer a opção de troca de tema.",
    highlighted: true,
  },
  {
    id: "m14",
    author: "henrik",
    time: "20:16",
    avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg",
    text: "quando o comprovante é negado 3 vezes na amazon ja era ne",
  },
  {
    id: "m15",
    author: "henrik",
    time: "20:16",
    avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg",
    text: "so outro cpf agora",
  },
];

export const onlineMembers: DetailMember[] = [
  { id: "reiltuo", name: "reiltuo", avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg", status: "yellow" },
  { id: "henrik", name: "henrik", avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg", status: "yellow" },
];

export const offlineMembers: DetailMember[] = [
  { id: "night", name: "Night", avatar: "/community-assets/IMG_7929.jpeg-ecc736f53778.jpg", admin: true },
  { id: "suaves", name: "Suaves", avatar: "/community-assets/alain_20delon-b3fd874ea0e0.jpg" },
  { id: "walker", name: "Walker15k", avatar: "/community-assets/photo_2025-12-05_16-06-52-9c0423940f33.jpg" },
  { id: "toppan", name: "toppan15k", avatar: "/community-assets/11fa80eb52474318b5d51c73ada152f6-58f23fff20cd.jpg" },
  { id: "anya", name: "Anya", avatar: "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg" },
  { id: "kali", name: "Kali15k", avatar: "/community-assets/IMG_2459.jpeg-20e76166eb1c.jpg", admin: true },
  { id: "goat", name: "Goat", avatar: "p6" },
  { id: "only", name: "only15k", avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg" },
  { id: "shelby", name: "shelby15k", avatar: "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg" },
  { id: "vohes", name: "Vohes", avatar: "/community-assets/eu-0ce4791927fa.jpg" },
  { id: "kobe", name: "Kobe15k", avatar: "/community-assets/alain_20delon-b3fd874ea0e0.jpg" },
  { id: "hanzo", name: "Hanzo15k", avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg" },
];

