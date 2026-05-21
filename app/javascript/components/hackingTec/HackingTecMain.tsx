import { FeedGeralMain } from "../feedGeral/FeedGeralMain";

const icon = "/Feed%20Geral%20_%20Project%20Six_files/imagem_2026-02-02_152751805.png";

export function HackingTecMain() {
  return (
    <FeedGeralMain
      spaceSlug="hacking-tec"
      title="Hacking/Tec"
      icon={icon}
      variant="hacking"
      showHero={false}
      showComposer={false}
      showTopics={false}
      showRail={false}
      showNewPost={false}
      memberExtra="+861"
      magicLabel="Resumir"
    />
  );
}
