import { ChevronDown, MoreHorizontal, Sparkles } from "lucide-react";
import { members } from "../../data/communityData";
import { MemberCluster } from "../topbar/MemberCluster";

export function FeedHeader() {
  return (
    <div className="feed-header">
      <div className="space-title">
        <img className="space-title-icon" src="/Feed%20Geral%20_%20Project%20Six_files/imagem_2026-02-02_153231631.png" alt="" aria-hidden="true" />
        <h1>PolÃ­tica Nacional</h1>
      </div>
      <div className="feed-controls">
        <button className="sort-button" type="button">
          Mais recente <ChevronDown size={14} />
        </button>
        <button className="magic-button" type="button" aria-label="Destaques">
          <Sparkles size={18} fill="currentColor" />
        </button>
        <MemberCluster members={members} extra="+860" />
        <button className="feed-more" type="button" aria-label="Mais opcoes">
          <MoreHorizontal size={19} />
        </button>
      </div>
    </div>
  );
}
