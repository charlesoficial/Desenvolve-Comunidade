import { Heart, MessageCircle } from "lucide-react";
import { members } from "../../data/communityData";
import { Avatar } from "../ui/Avatar";

export function PostComposer() {
  return (
    <div className="composer-card">
      <div className="composer-body">
        <button type="button">Ver mais</button>
      </div>
      <div className="composer-footer">
        <div className="post-action-left">
          <button type="button" aria-label="Curtir">
            <Heart size={20} />
          </button>
          <button type="button" aria-label="Comentar">
            <MessageCircle size={20} />
          </button>
        </div>
        <div className="composer-stats">
          <Avatar src={members[2].avatar} name={members[2].name} size="sm" />
          <span>1 curtida</span>
          <span>·</span>
          <span>0 comentários</span>
        </div>
      </div>
    </div>
  );
}
