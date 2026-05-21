import { FeedGeralMain } from "../feedGeral/FeedGeralMain";

export function Avisos({ empty = false }: { empty?: boolean } = {}) {
  return (
    <FeedGeralMain
      spaceSlug={empty ? "avisos-4e37a7" : "avisos"}
      title="Avisos"
      icon="/source-six-assets/0c2iva7hg2b40t7auhvb7slwjctf-09a76e33ae68.png"
      showHero={false}
      showTopics={false}
      showRail={false}
      showComposer={false}
      showNewPost={false}
      memberExtra="+858"
      magicLabel="Resumir"
    />
  );
}
