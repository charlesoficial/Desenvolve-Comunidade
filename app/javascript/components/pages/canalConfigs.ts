export type CanalMode = "feed" | "private" | "hackingLanding" | "levelAccess";

export type CanalConfig = {
  title: string;
  icon: string;
  mode?: CanalMode;
  topics?: string[];
  showHero?: boolean;
  showRail?: boolean;
  showComposer?: boolean;
  showTopics?: boolean;
  showNewPost?: boolean;
  memberExtra?: string;
};

const assetBase = "/Feed%20Geral%20_%20Project%20Six_files/";
export const canalAsset = (name: string) => `${assetBase}${encodeURIComponent(name)}`;

const feedChrome = {
  showHero: false,
  showRail: false,
  showComposer: false,
  showTopics: false,
  showNewPost: false,
};

export const canalConfigs: Record<string, CanalConfig> = {
  feed: { title: "Feed", icon: canalAsset("feed-svgrepo-com.png"), mode: "private", showHero: false, showRail: false },
  hacking: { title: "Hacking", icon: canalAsset("imagem_2026-02-02_152751805.png"), mode: "hackingLanding", showHero: false, showRail: false },
  "tools-e-tutoriais": { title: "Ferramentas", icon: canalAsset("screencast-svgrepo-com.png"), mode: "hackingLanding", showHero: false, showRail: false },
  criptomoedas: { title: "Criptomoedas", icon: canalAsset("bitcoin-refresh-svgrepo-com.png"), mode: "hackingLanding", showHero: false, showRail: false },
  biblioteca: { title: "Biblioteca", icon: canalAsset("album-svgrepo-com.png"), mode: "hackingLanding", showHero: false, showRail: false },
  torrents: { title: "Torrents", icon: canalAsset("folder-with-files-svgrepo-com.png"), mode: "private", showHero: false, showRail: false },
  "news-hacking": { title: "Notícias", icon: canalAsset("shield-warning-svgrepo-com.png"), mode: "hackingLanding", showHero: false, showRail: false },
  "opsec-2026": { title: "Aula de OPSEC", icon: "/source-six-assets/hjskcyevn0m4onfjkc0ybxt3tr1w-579710e4bba9.png", topics: ["Todos", "Aulas", "Checklists"], showHero: false, showRail: false },
  sistemas: { title: "Sistemas", icon: canalAsset("screencast-svgrepo-com.png"), mode: "levelAccess", showHero: false, showRail: false },
  geral: { title: "Geral", icon: canalAsset("imagem_2026-02-02_153413379.png"), ...feedChrome },
  geopolitica: { title: "Geopolítica", icon: canalAsset("imagem_2026-02-02_153333630.png"), ...feedChrome },
  "politica-nacional": { title: "Política Nacional", icon: canalAsset("imagem_2026-02-02_153231631.png"), ...feedChrome },
  economia: { title: "Economia", icon: canalAsset("imagem_2026-02-02_153146158.png"), ...feedChrome },
  "criptomoedas-08edfd": { title: "Criptomoedas", icon: canalAsset("bitcoin-refresh-svgrepo-com.png"), ...feedChrome },
  "ia-news": { title: "IA News", icon: canalAsset("imagem_2026-02-02_152915713.png"), ...feedChrome },
  "marketing-digital": { title: "Marketing Digital", icon: canalAsset("imagem_2026-02-02_152832085.png"), ...feedChrome },
  "mr-robot": { title: "Hacking/Tec", icon: canalAsset("imagem_2026-02-02_152751805.png"), ...feedChrome, memberExtra: "+861" },
  "influencer-ia-tiktok-dark": { title: "Influencer IA & TikTok Dark", icon: "/source-six-assets/t1l74hojbmqzn2bz0lf4qfo61vqz-fe900685ddcf.png", topics: ["Todos", "TikTok", "IA", "Conteúdo"], showHero: false, showRail: false },
  fba: { title: "FBA", icon: canalAsset("amazon-svgrepo-com.png"), topics: ["Todos", "Amazon", "FBA", "Logística"], showHero: false },
};
