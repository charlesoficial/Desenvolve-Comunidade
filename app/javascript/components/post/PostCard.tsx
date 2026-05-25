import { Bookmark, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import type { Post } from "../../types/community";
import { Avatar } from "../ui/Avatar";

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  return (
    <article className="post-card cs-card">
      <div className="post-card-top">
        <h2 className="cs-post-title">{post.title}</h2>
        <div className="post-menu">
          <button className="cs-action-button" type="button" aria-label="Salvar">
            <Bookmark size={21} />
          </button>
          <button className="cs-action-button" type="button" aria-label="Mais">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="post-author">
        <Avatar src={post.author.avatar} name={post.author.name} />
        <div className="author-lines">
          <div className="author-meta">
            <strong>{post.author.name}</strong>
            <span className="author-badge">
              <span className="badge-lock">▣</span>
              {post.author.badge}
            </span>
            <span className="level-badge">{post.author.level}</span>
            <span className="tiny-pill">+1</span>
            <span>{post.date}</span>
          </div>
          <div className="joined">{post.author.joinedAt}</div>
        </div>
      </div>

      <div className="post-excerpt">
        {post.excerpt.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <button type="button">Ver mais</button>
      </div>

      <div className="post-actions">
        <div className="post-action-left">
          <button className="cs-action-button" type="button" aria-label="Curtir">
            <Heart size={20} />
          </button>
          <button className="cs-action-button" type="button" aria-label="Comentar">
            <MessageCircle size={20} />
          </button>
        </div>
        <span>{post.comments} comentários</span>
      </div>
    </article>
  );
}
