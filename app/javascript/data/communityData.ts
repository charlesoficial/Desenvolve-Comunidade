import { makeCommunityIcon } from "../design-system";
import type { Member, Post, SidebarSection } from "../types/community";

const AudioIcon = makeCommunityIcon("icon-20-course-audio");
const ShieldIcon = makeCommunityIcon("icon-20-shield-v3");
const FeedIcon = makeCommunityIcon("icon-20-feed-v3");
const ThreadIcon = makeCommunityIcon("icon-20-thread-v3");
const UsersIcon = makeCommunityIcon("icon-20-users-v3");
const ChartIcon = makeCommunityIcon("icon-20-chart");
const BookIcon = makeCommunityIcon("icon-20-book-v3");
const FolderIcon = makeCommunityIcon("icon-20-folder-v3");
const LockIcon = makeCommunityIcon("icon-lock-v2");
const GlobeIcon = makeCommunityIcon("icon-globe");
const DollarIcon = makeCommunityIcon("icon-circle-dollar");
const UserIcon = makeCommunityIcon("icon-20-user-v3");
const ArrowUpRightIcon = makeCommunityIcon("arrow-up-right-md", "compass");

export const topNav = ["Home", "Cursos", "Aulas", "Membros", "Ranking"];

export const sidebarSections: SidebarSection[] = [
  {
    id: "info",
    title: "Info Produto",
    items: [
      { id: "aulas-info", label: "Aulas", icon: AudioIcon },
      { id: "network-info", label: "Network", icon: UsersIcon, count: "99+" },
      { id: "ofertas", label: "Ofertas", icon: FolderIcon, count: "29" },
    ],
  },
  {
    id: "expert",
    title: "Expert Hot",
    items: [
      { id: "basico", label: "Básico", icon: ChartIcon },
      { id: "aulas-completas", label: "Aulas Completas", icon: LockIcon },
      { id: "network", label: "Network", icon: LockIcon },
    ],
  },
  {
    id: "facebook",
    title: "FaceBook",
    collapsible: true,
    menu: true,
    items: [{ id: "network-facebook", label: "Network", icon: UsersIcon, count: "24" }],
  },
  {
    id: "hacking",
    title: "Área Hacking",
    items: [
      { id: "chat-area", label: "Chat", icon: LockIcon },
      { id: "feed-area", label: "Feed", icon: LockIcon },
      { id: "hacking-area", label: "Hacking", icon: LockIcon },
      { id: "ferramentas", label: "Ferramentas", icon: LockIcon },
      { id: "criptomoedas-area", label: "Criptomoedas", icon: LockIcon },
      { id: "biblioteca", label: "Biblioteca", icon: LockIcon },
      { id: "torrents", label: "Torrents", icon: LockIcon },
      { id: "noticias-lock", label: "Notícias", icon: LockIcon },
      { id: "opsec", label: "Aula de OPSEC", icon: LockIcon },
    ],
  },
  {
    id: "nivel2",
    title: "Nível 2",
    collapsible: true,
    menu: true,
    items: [
      { id: "sistemas", label: "Sistemas", icon: LockIcon },
      { id: "chat", label: "Chat", icon: LockIcon },
    ],
  },
  {
    id: "noticias",
    title: "Notícias",
    items: [
      { id: "geral", label: "Geral", icon: BookIcon, count: "99+" },
      { id: "geopolitica", label: "Geopolítica", icon: UserIcon, count: "99+" },
      { id: "politica", label: "Política Nacional", icon: GlobeIcon, count: "", active: true },
      { id: "economia", label: "Economia", icon: DollarIcon, count: "99+" },
      { id: "cripto", label: "Criptomoedas", icon: ChartIcon, count: "99+" },
      { id: "ia", label: "IA News", icon: ChartIcon, count: "99+" },
      { id: "marketing", label: "Marketing Digital", icon: UsersIcon, count: "99+" },
      { id: "tec", label: "Hacking/Tec", icon: FolderIcon, count: "99+" },
    ],
  },
  {
    id: "diverso",
    title: "Diverso",
    items: [{ id: "influencer", label: "Influencer IA & TikTok ...", icon: AudioIcon, truncated: true }],
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

export const members: Member[] = [
  { id: "m1", name: "Noir", avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg" },
  { id: "m2", name: "Root", avatar: "R", online: true },
  { id: "m3", name: "Lia", avatar: "/community-assets/IMG_7929.jpeg-ecc736f53778.jpg" },
];

export const posts: Post[] = [
  {
    id: "p1",
    title: "Mara Maravilha Internada na UTI em São Paulo: Motivo é Desconhecido",
    author: {
      name: "Goat Jornalista",
      avatar: "/community-assets/photo_2025-12-05_16-06-52-9c0423940f33.jpg",
      badge: "Hackudo",
      level: "Nível 2",
      joinedAt: "Membro desde 2 de fevereiro de 2026",
    },
    excerpt: [
      "A apresentadora Mara Maravilha foi internada na Unidade de Terapia Intensiva (UTI) em São Paulo. A notícia se espalhou rapidamente após a divulgação de um atestado médico nas redes sociais da artista.",
      "O atestado, embora confirme a internação, não é...",
    ],
    date: "5 de fev.",
    comments: 0,
  },
  {
    id: "p2",
    title: 'Alcolumbre Defende Congresso e Manda Indireta ao Governo Lula: "Paz Não É Omissão"',
    author: {
      name: "Goat Jornalista",
      avatar: "/community-assets/photo_2025-12-05_16-06-52-9c0423940f33.jpg",
      badge: "Hackudo",
      level: "Nível 2",
      joinedAt: "Membro desde 2 de fevereiro de 2026",
    },
    excerpt: [
      "O presidente do Senado, Davi Alcolumbre (União Brasil-AP), defendeu a autonomia do Congresso Nacional nesta segunda-feira (2), durante a cerimônia de abertura do ano legislativo de 2026.",
      "Ele ressaltou que a busca por harmonia entre os Poderes não...",
    ],
    date: "5 de fev.",
    comments: 0,
  },
  {
    id: "p3",
    title: "Nova rodada de segurança digital movimenta grupos de especialistas",
    author: {
      name: "Goat Jornalista",
      avatar: "/community-assets/photo_2025-12-05_16-06-52-9c0423940f33.jpg",
      badge: "Hackudo",
      level: "Nível 2",
      joinedAt: "Membro desde 2 de fevereiro de 2026",
    },
    excerpt: [
      "Especialistas em segurança apontam uma nova onda de discussões sobre privacidade, autenticação e controle de acesso em comunidades digitais.",
    ],
    date: "5 de fev.",
    comments: 2,
    likes: 1,
  },
];

export const topbarActions = [ShieldIcon, ThreadIcon, UsersIcon, ShieldIcon];
export const heroAction = FeedIcon;
