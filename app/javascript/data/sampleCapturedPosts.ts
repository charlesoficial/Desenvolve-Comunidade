import type { FeedAttachment, FeedComment, FeedPost } from "../lib/communityApi";

type CapturedAuthor = FeedPost["author"];

export type SampleCapturedPostSeed = {
  spaceSlug: string;
  postId: string;
  title: string;
  body: string;
  kind?: FeedPost["kind"];
  likes?: number;
  comments?: number;
  pinned?: boolean;
  publishedAt?: string;
  author?: CapturedAuthor;
  attachments?: FeedAttachment[];
  topics?: string[];
};

const asset = (name: string) => `/community-assets/${name}`;

const night: CapturedAuthor = {
  username: "night",
  name: "Night",
  avatar: "/community-assets/Cindy.jpeg",
  badge: "Administrador",
  level: "p6 Goat",
  joinedAt: "Membro desde 3 de dezembro de 2025",
};

const cuervo: CapturedAuthor = {
  username: "o_cuervo",
  name: "o_cuervo",
  avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg",
  badge: "p6 Veterano",
  level: "Hackudo",
  joinedAt: "Membro desde 2 de fevereiro de 2026",
};

const member: CapturedAuthor = {
  username: "membro",
  name: "Membro",
  avatar: "M",
  badge: "Hackudo",
  level: "NÃ­vel 2",
  joinedAt: "Membro desde 2026",
};

const goat: CapturedAuthor = {
  username: "goat-jornalista",
  name: "Goat Jornalista",
  avatar: "/community-assets/Generated20Image20February200220202620-203_09PM.jpeg-c5fdca6c865d.jpg",
  badge: "Hackudo",
  level: "NÃ­vel 2",
  joinedAt: "Membro desde 2 de fevereiro de 2026",
};

const image = (fileName: string, label = "Imagem anexada"): FeedAttachment => ({
  kind: "image",
  fileName: label,
  fileUrl: asset(fileName),
});

const video = (fileName: string, label = "VÃ­deo anexado"): FeedAttachment => ({
  kind: "video",
  fileName: label,
  fileUrl: asset(fileName),
});

export const sampleCapturedPostSeeds: SampleCapturedPostSeed[] = [
  {
    spaceSlug: "seu-progresso",
    postId: "1-mes-de-operacao-com-uma-oferta-daqui",
    title: "1 mÃªs de operaÃ§Ã£o com uma oferta daqui!",
    body: "Ã‰ gratificante ver o que a comunidade estÃ¡ fazendo! Ã‰ uma comunidade sem igual. Esse resultado Ã© de apenas um mÃªs de operaÃ§Ã£o em uma oferta daqui! ðŸ‘‹",
    kind: "image",
    likes: 8,
    author: member,
    attachments: [image("WhatsApp20Image202026-04-2720at2022.07.18.jpeg-044a69000b23.jpg", "Resultado da operaÃ§Ã£o")],
  },
  {
    spaceSlug: "feed-geral",
    postId: "retorica-o-essencial-para-ter-uma-boa-persuasao-e-criar-boas-copys",
    title: "Retorica. O essencial para ter uma boa persuasÃ£o e criar boas copys.",
    body: "Os 3 pilares da persuasÃ£o\n\n- Ethos\n- Pathos\n- Logos\n\n### Ethos\n> Ã‰ o ponto de partida, Ã© o carÃ¡ter do orador, sua credibilidade\n\n**Persuadimos mais pela confianÃ§a**\n**Que temos no orador do que pela**\n**ForÃ§a do raciocÃ­nio.**\n**~aristoteles**\n\nO ethos Ã© a impressÃ£o moral e emocional que o orador causa. Ã‰ o tom, o olhar e o modo como ele respeita o pÃºblico.",
    likes: 6,
    author: cuervo,
    topics: ["Geral", "Copywriting"],
  },
  {
    spaceSlug: "central-de-ajuda-fbm",
    postId: "falha-na-transferencia-de-fundos",
    title: "Falha na transferÃªncia de fundos",
    body: "AlguÃ©m sabe como resolver? JÃ¡ atualizei meus dados bancÃ¡rios 3 vezes, com diferentes bancos e nÃ£o consigo fazer a transferÃªncia de jeito nenhum.",
    kind: "image",
    comments: 6,
    attachments: [image("image-7411cb8ec725.png", "Print da transferÃªncia")],
  },
  {
    spaceSlug: "feed-geral",
    postId: "oferta-black-valida-mas-sem-conhecimento-em-ads",
    title: "Oferta black vÃ¡lida mas sem conhecimento em ADS.",
    body: "Tenho acesso a uma boa oferta black, muito escalÃ¡vel e que inclusive um player estÃ¡ rodando, mas nÃ£o tenho conhecimento sobre como rodÃ¡-la. Caso alguÃ©m esteja disponÃ­vel para me ajudar, posso dar porcentagem da operaÃ§Ã£o.",
    comments: 2,
    likes: 3,
  },
  {
    spaceSlug: "central-de-ajuda-fbm",
    postId: "copiar-oferta-ao-inves-de-vender-este-produto-qual-sua-opiniao",
    title: "\"Copiar Oferta\" ao invÃ©s de \"Vender este produto\"; Qual sua opiniÃ£o?",
    body: "Time, Amazon atualmente estÃ¡ com duas opÃ§Ãµes quando vocÃª cola a ASIN. Estou com dificuldade para encontrar uma ASIN aberta. Acham que vale a pena copiar a oferta ao invÃ©s de tentar vender na mesma listagem?",
    kind: "image",
    comments: 1,
    likes: 5,
    attachments: [image("Screenshot202026-03-1620at2019-41-2920Amazon-4f6b8ca93fbf.png", "Seller Central")],
  },
  {
    spaceSlug: "central-de-ajuda-fbm",
    postId: "cliente-reclamando-sendo-que-comecei-a-vender-agora-em-marco-o-que-fazer",
    title: "Cliente reclamando sendo que comecei a vender agora em MarÃ§o, o que fazer?",
    body: "Eae pessoal?\n\nRecomendaÃ§Ãµes KKKKK?",
    kind: "image",
    comments: 3,
    attachments: [image("image-642575e201fd.png", "Mensagem do cliente")],
  },
  { spaceSlug: "central-de-ajuda-fbm", postId: "alguem-com-a-tabela-de-frete-da-amazon", title: "AlguÃ©m com a tabela de frete da amazon?", body: "NÃ£o tem mais disponÃ­vel no Miro.", comments: 1 },
  { spaceSlug: "central-de-ajuda-fbm", postId: "nao-consigo-fazer-a-verificacao-de-endereco", title: "nÃ£o consigo fazer a verificaÃ§Ã£o de endereÃ§o", body: "JÃ¡ tentei Nubank e Shopee Pay. NÃ£o tenho nenhum outro documento no meu nome que possa utilizar para verificar. AlguÃ©m consegue me ajudar?", comments: 2 },
  { spaceSlug: "central-de-ajuda-fbm", postId: "selecionar-melhores-produtos", title: "Selecionar melhores produtos", body: "Bom dia pessoal. Vou iniciar nesse mundo de vendas agora e sou leigo. Entendi por cima como minerar os produtos, mas para a prÃ¡tica, quais formas mais fÃ¡ceis vocÃªs usam para selecionar melhores produtos?", comments: 2 },
  {
    spaceSlug: "ofertas",
    postId: "formula-que-os-maiores-ganhadores-da-loteria-usam",
    title: "Formula que os maiores ganhadores da Loteria usam",
    body: "1.100 anÃºncios ativos\n\nBiblioteca de anÃºncios: [ CLIQUE AQUI ]\nPÃ¡gina de vendas: [ CLIQUE AQUI ]\nCheckout: [ CLIQUE AQUI ]\nQuiz PÃ“S: [ CLIQUE AQUI ]\nVSL PÃ“S: [ CLIQUE AQUI ]\n\nDownload Landing Page",
    kind: "file",
    likes: 4,
    attachments: [image("imagem_2026-04-13_015104696-b84c6c36ecd9.png", "Oferta")],
  },
  {
    spaceSlug: "avisos",
    postId: "s6xpay-venda-sem-kyc",
    title: "s6xpay - Venda sem KYC",
    body: "Foi lanÃ§ada uma plataforma de venda como Kiwify, Cakto, Hotmart e outras, porÃ©m sem necessidade de KYC, possibilitando que vocÃª realize suas vendas com total anonimato de verdade.",
    kind: "image",
    likes: 51,
    author: night,
    attachments: [image("photo_2026-01-04_19-06-38-d345916d908e.jpg", "s6xpay")],
  },
  { spaceSlug: "avisos", postId: "veterano-leia-para-nao-ficar-perdido", title: "Veterano, leia para nÃ£o ficar perdido!", body: "Como dito na publicaÃ§Ã£o do Feed Geral, agilizamos a migraÃ§Ã£o, mas todas as Ã¡reas do acesso GOAT ainda nÃ£o estÃ£o completas. Teremos a Ã¡rea da Amazon, Infoprodutos e outras novas Ã¡reas incluÃ­das no seu acesso.", likes: 26, author: night },
  { spaceSlug: "feed-geral", postId: "saindo-do-dba", title: "Saindo do DBA", body: "SÃ³ consigo acessar essa parte depois de ser aprovado nas 48 horas? Aparece essa informaÃ§Ã£o quando eu aperto o tutorial da aula.", kind: "image", attachments: [image("acessonecessC3A1rio-7a3d62168821.png", "Acesso necessÃ¡rio")] },
  { spaceSlug: "feed-geral", postId: "chegando-agora", title: "Chegando agora", body: "Opa, estou chegando agora. Alguma dica de por onde comeÃ§ar?", comments: 2 },
  { spaceSlug: "feed-geral", postId: "quando-nada-parece-ajudar-eu-vou-olhar-para-um-cortador-de-pedras", title: "Quando nada parece ajudar, eu vou olhar para um cortador de pedras..", body: "> Eu vou e olho para um cortador de pedras martelando sua rocha, talvez cem vezes sem sequer uma rachadura aparecer nela.\n\nNo entanto, na centÃ©sima primeira pancada, ela se dividirÃ¡ em duas. Eu sei que nÃ£o foi aquela pancada que fez isso, mas tudo o que veio antes.", likes: 1 },
  {
    spaceSlug: "feed-geral",
    postId: "bidcap-ou-baiana",
    title: "BidCap ou Baiana?",
    body: "PS: zero landing page > ads direto pro checkout!\n\nBom rapaziada noite aqui. Comecei no infoproduto de\n\nDesculpa o barulho de fundo; estou sem placa antirruÃ­do e, como odeio mousepad, o microfone estÃ¡ pegando o som do mouse na mesa.",
    kind: "video",
    comments: 7,
    likes: 11,
    author: night,
    attachments: [video("video-placeholder.mp4", "BidCap ou Baiana")],
  },
  { spaceSlug: "feed-geral", postId: "duvida-sobre-hot", title: "DÃºvida sobre hot", body: "AlguÃ©m fazendo ou jÃ¡ fez hot LATAM?", comments: 3 },
  { spaceSlug: "feed-geral", postId: "nao-aposte-todas-suas-fichas-na-inspiracao", title: "NÃ£o aposte todas suas fichas na inspiraÃ§Ã£o", body: "A inspiraÃ§Ã£o Ã© um mistÃ©rio, tudo bem. Mas tem uma coisa que precisamos entender antes de apostar nela: o mistÃ©rio nÃ£o trabalha por vocÃª. Se vocÃª fica sÃ³ esperando, achando que ela vai aparecer do nada e te entregar tudo de bandeja, entÃ£o vocÃª nÃ£o constrÃ³i consistÃªncia.", kind: "image", attachments: [image("image202-30bbc0e950d8.png", "InspiraÃ§Ã£o")] },
  { spaceSlug: "feed-geral", postId: "fornecedores-amazon", title: "Fornecedores Amazon", body: "Bom dia, vi que a Amazon Ã© forte e tem como criar um negÃ³cio sÃ³lido nela. Daqui uns meses penso em comprar produtos para montar estoque em casa ou encontrar fornecedor que permita ter logÃ­stica mais controlada.", comments: 1 },
  { spaceSlug: "feed-geral", postId: "engenharia-de-software", title: "Engenharia de software", body: "Galera, na opiniÃ£o de vocÃªs, engenharia de software em plena evoluÃ§Ã£o das IA Ã© um bom curso, ou daqui a 3 a 4 anos serÃ¡ uma Ã¡rea defasada?", comments: 4 },
  { spaceSlug: "feed-geral", postId: "30k-em-1-dia", title: "30k em 1 dia", body: "Estou aprendendo bastante nessa minha jornada no infoproduto.\n\nCoisas boas estÃ£o por vir!!!", kind: "image", likes: 6, attachments: [image("imagem_2026-03-02_201858512-3c64db896fd1.png", "Resultado")], author: night },
  { spaceSlug: "feed-geral", postId: "2026-a832e0", title: "2026", body: "Finalmente, passei um tempo na matrix (CLT, faculdade e desfoco total), mas estou de volta.", likes: 1 },
  { spaceSlug: "feed-geral", postId: "engenharia-social", title: "ðŸ§  Engenharia Social: Hackeando Mentes", body: "Para os demais conteÃºdos envolvendo ferramentas, mÃ©todos hacking, cripto, biblioteca e muito mais, acesse a Ãrea Hacking.\n\nEngenharia Social (.html)\nEngenharia Social (.pdf)\n\nNeste PDF, vocÃª se aprofundarÃ¡ nas melhores tÃ©cnicas, recursos e fundamentos.", kind: "file", attachments: [image("Engenharia20Social_page-0001-9db4a91f1c5b.jpg", "Engenharia Social")] },
  { spaceSlug: "feed-geral", postId: "como-configurar-esse-adaptador-para-o-modo-monitor", title: "Como configurar esse adaptador para o modo monitor", body: "AlguÃ©m me ajuda a configurar esse adaptador para o modo monitor? Preciso instalar o driver dele, mas nÃ£o estou conseguindo e ele nÃ£o estÃ¡ ativando o modo monitor.", kind: "image", attachments: [image("IMG_6372.jpeg-de8b0d28e1c2.jpg", "Adaptador")] },
  { spaceSlug: "feed-geral", postId: "como-randomizar-o-mac-address-da-placa-de-rede-no-linux", title: "Como randomizar o MAC Address da placa de rede no Linux", body: "Eu uso o NetworkManager para gerenciar, entÃ£o recomendo a utilizaÃ§Ã£o dele em vez do systemd-networkd. Vou utilizar ArchLinux para fazer todo esse rolÃª.\n\nTudo aqui vai ser na base do texto puro e comandos.", kind: "article" },
  { spaceSlug: "feed-geral", postId: "adeus-scroll-infinito-sem-twitter-e-insta-por-40-dias-bora-ver-no-que-da", title: "Adeus scroll infinito: sem Twitter e Insta por 40 dias - bora ver no que dÃ¡", body: "Galera, boa noite! Hoje comeÃ§o meu desafio pessoal: vou ficar sem X, sem Instagram e sem vÃ­deos curtos atÃ© o fim da Quaresma. Zero Reels, Shorts... nada mesmo. O principal motivo Ã© fazer um detox e recuperar foco.", comments: 2 },
  { spaceSlug: "feed-geral", postId: "como-eu-havia-dito-e-preciso-ser-estoico", title: "Como eu havia dito; Ã© preciso ser estoico.", body: "Domingo (15/02/2026 - 14:00)\n\nEsteja pronto para perder, mas nunca esteja pronto para desistir. Se na primeira crise vocÃª se desesperar, nÃ£o verÃ¡ o quÃ£o boa Ã© a calmaria apÃ³s a tempestade.", kind: "image", attachments: [image("image-1707f88c187a.png", "Estoicismo")] },
  { spaceSlug: "feed-geral", postId: "opsec-seguranca-operacional", title: "ðŸ” OPSEC: SeguranÃ§a Operacional", body: "Para os demais conteÃºdos envolvendo ferramentas, mÃ©todos hacking, cripto, biblioteca e muito mais, acesse a Ãrea Hacking.\n\n### Ãrea Hacking\nA aula do dia 10.01.2026 teve como base o assunto de seguranÃ§a operacional. Neste documento estou relatando todos os pontos importantes para manter uma operaÃ§Ã£o mais segura.", kind: "image", pinned: true, author: goat, attachments: [image("image-85727d05a36e.png", "OPSEC")] },
  { spaceSlug: "feed-geral", postId: "aproveitem-sem-moderacao", title: "APROVEITEM SEM MODERAÃ‡ÃƒO", body: "Ofertas e os links da ads library para vocÃªs, meus rapazes:\n\nhttps://docs.google.com/document/d/1KSrDc6n8SdtHP5YP9a_RnYWTVfDvbBF9aKjt-zPk-Fg/edit?usp=sharing", likes: 3 },
];

export function sampleCapturedPostId(seed: Pick<SampleCapturedPostSeed, "spaceSlug" | "postId">) {
  return `community-${seed.spaceSlug}-${seed.postId}`;
}

export function findSampleCapturedPost(spaceSlug: string, postId: string) {
  return sampleCapturedPostSeeds.find((post) => (
    post.spaceSlug === spaceSlug
    && (post.postId === postId || sampleCapturedPostId(post) === postId)
  ));
}

export function sampleCapturedComments(postId: string): FeedComment[] {
  if (!postId.startsWith("community-")) return [];
  return [];
}
