import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CommunityIcon } from "../../design-system";
import {
  createFeedComment,
  loadPostDetail,
  loadPostDetailComments,
  recordPostView,
  type FeedAttachment,
  type FeedComment,
  type FeedPost,
} from "../../lib/communityApi";
import { BookmarkButton } from "../global/BookmarkButton";
import { PostReactions } from "../global/PostReactions";

type Props = {
  postId: string;
  spaceSlug: string;
};

const spaceLabels: Record<string, string> = {
  "avisos": "Avisos",
  "central-de-ajuda-fbm": "Central de Ajuda 'FBM'",
  "feed-geral": "Feed Geral",
  "ofertas": "Ofertas",
  "seu-progresso": "Seu Progresso",
};

const railMembers = [
  { name: "vamp.darcy", avatar: "/community-assets/download203-eaf77e9d9bc7.jpg" },
  { name: "Refzinho", avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg" },
  { name: "Sorenus", avatar: "/community-assets/IMG_2459.jpeg-20e76166eb1c.jpg" },
  { name: "oolho15k", avatar: "/community-assets/image202-30bbc0e950d8.png" },
  { name: "o_cuervo", avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg" },
  { name: "lhz", avatar: "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg" },
];

export function PostDetail({ postId, spaceSlug }: Props) {
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spaceLabel = useMemo(() => spaceLabels[spaceSlug] || titleize(spaceSlug), [spaceSlug]);

  useEffect(() => {
    let alive = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      setError(null);

      try {
        const loaded = await loadPostDetail(postId, spaceSlug);
        if (!alive) return;
        setPost(loaded);

        if (loaded) {
          void recordPostView(loaded.id).catch(() => undefined);
          const rows = await loadPostDetailComments(loaded.id).catch(() => []);
          if (alive) setComments(rows);
        } else {
          setComments([]);
        }
      } catch {
        if (alive) setError("NÃ£o foi possÃ­vel carregar esta publicaÃ§Ã£o agora.");
      } finally {
        if (alive) setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, [postId, spaceSlug]);

  const goBack = () => {
    const target = `/c/${spaceSlug}`;
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  async function comment() {
    if (!post || !body.trim() || savingComment) return;
    const value = body.trim();
    setSavingComment(true);

    try {
      const created = await createFeedComment(post.id, value);
      setComments((current) => [...current, created]);
      setPost({ ...post, comments: post.comments + 1 });
    } catch {
      setComments((current) => [...current, localComment(post.id, value)]);
      setPost({ ...post, comments: post.comments + 1 });
    } finally {
      setBody("");
      setSavingComment(false);
    }
  }

  return (
    <main className="general-feed-main post-detail-page source-post-detail-page">
      <header className="post-detail-backbar">
        <button type="button" onClick={goBack}>
          <CommunityIcon name="arrow-left-lg" sprite="compass" size={18} />
          <span>Voltar para {spaceLabel}</span>
        </button>
      </header>

      <div className="general-feed-scroll source-post-detail-scroll">
        {loading ? <PostDetailState title="Carregando publicaÃ§Ã£o" body="Buscando dados pelo backend." /> : null}
        {!loading && error ? <PostDetailState title="Erro ao carregar" body={error} /> : null}
        {!loading && !error && !post ? (
          <PostDetailState title="PublicaÃ§Ã£o nÃ£o encontrada" body="Confira o link ou tente novamente." />
        ) : null}

        {post ? (
          <div className="source-post-detail-grid">
            <article className="source-post-detail-card">
              <header className="source-post-detail-card-header">
                <h1>{post.title}</h1>
                <div>
                  <button type="button" aria-label="Destaques">
                    <CommunityIcon name="icon-20-stardust-gradient" size={20} />
                  </button>
                  <BookmarkButton postId={post.id} saved={post.saved} onChange={(saved) => setPost({ ...post, saved })} />
                  <button type="button" aria-label="Mais opÃ§Ãµes">
                    <CommunityIcon name="icon-16-menu-dots-horizontal" size={20} />
                  </button>
                </div>
              </header>

              <PostAuthor post={post} />

              <div className="post-detail-body source-post-detail-body">
                <RichPostBody body={post.body} />
                {post.attachments.map((attachment) => (
                  <AttachmentBlock attachment={attachment} key={attachment.id || attachment.fileUrl} />
                ))}
              </div>

              {post.kind === "video" ? (
                <section className="source-post-summary">
                  <strong>
                    <CommunityIcon name="icon-20-stardust-gradient" size={17} />
                    Resumo da conversa
                  </strong>
                  <p>A discussÃ£o gira em torno do tema principal do post, com comentÃ¡rios e respostas carregados pelo backend quando disponÃ­veis.</p>
                </section>
              ) : null}

              <footer className="source-post-detail-actions">
                <div>
                  <PostReactions
                    liked={post.liked}
                    likes={post.likes}
                    postId={post.id}
                    onChange={(liked, likes) => setPost({ ...post, liked, likes })}
                  />
                  <button type="button" aria-label="Comentar">
                    <CommunityIcon name="icon-20-comment" size={21} />
                  </button>
                </div>
                <div className="source-post-engagement">
                  {post.likes ? <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span> : null}
                  {post.likes ? <b>Â·</b> : null}
                  <span>{Math.max(post.comments, comments.length)} comentÃ¡rio{Math.max(post.comments, comments.length) === 1 ? "" : "s"}</span>
                </div>
              </footer>

              <section className="post-comments-list source-post-comments">
                {comments.map((item) => (
                  <article className="compact-comment" key={item.id}>
                    <Avatar value={item.author.avatar} name={item.author.name} />
                    <div>
                      <p>
                        <strong>{item.author.name}</strong>
                        {item.author.level ? <em>NÃ­vel {item.author.level}</em> : null}
                        <time>{formatShortDate(item.createdAt)}</time>
                      </p>
                      <span>{item.body}</span>
                      <small>Curtir&nbsp;&nbsp;Responder</small>
                    </div>
                    <button type="button" aria-label="Mais">
                      <CommunityIcon name="icon-16-menu-dots-horizontal" size={18} />
                    </button>
                    {item.reactions ? <b>{item.reactions} curtida</b> : null}
                  </article>
                ))}
              </section>

              <div className="source-post-comment-box">
                <span className="general-va">VA</span>
                <div>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="O que vocÃª acha?"
                    aria-label="O que vocÃª acha?"
                  />
                  <footer>
                    <div>
                      <CommunityIcon name="icon-20-add-circle" size={20} />
                      <CommunityIcon name="icon-20-attach" size={20} />
                      <CommunityIcon name="icon-20-video" size={20} />
                      <CommunityIcon name="icon-20-file-image" size={20} />
                      <CommunityIcon name="icon-20-emoji" size={20} />
                    </div>
                    <button type="button" disabled={!body.trim() || savingComment} onClick={comment}>
                      Publicar
                    </button>
                  </footer>
                </div>
              </div>
            </article>

            <RightRail />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function PostDetailState({ body, title }: { body: string; title: string }) {
  return (
    <div className="source-post-detail-grid is-state">
      <div className="members-state">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

function PostAuthor({ post }: { post: FeedPost }) {
  return (
    <div className="source-post-author">
      <Avatar value={post.author.avatar} name={post.author.name} />
      <div>
        <strong>{post.author.name}</strong>
        <span className="source-author-badge is-veteran">{post.author.badge}</span>
        <span className="source-author-badge is-level">{post.author.level}</span>
        <span className="source-author-date">{formatShortDate(post.publishedAt)}</span>
        <small>{post.author.joinedAt}</small>
      </div>
    </div>
  );
}

function AttachmentBlock({ attachment }: { attachment: FeedAttachment }) {
  if (attachment.kind === "image") {
    return (
      <figure className="post-detail-attachment source-post-attachment">
        <img src={attachment.fileUrl} alt={attachment.fileName} />
      </figure>
    );
  }

  if (attachment.kind === "video") {
    return (
      <figure className="post-detail-attachment source-post-attachment is-video">
        <div className="source-video-placeholder">
          <CommunityIcon name="icon-20-video" size={30} />
          <span>{attachment.fileName}</span>
          <small>0:00 / 3:12</small>
        </div>
      </figure>
    );
  }

  return (
    <a className="feed-file-attachment source-file-attachment" href={attachment.fileUrl}>
      <CommunityIcon name="icon-20-attach" size={18} />
      <span>{attachment.fileName}</span>
    </a>
  );
}

function RichPostBody({ body }: { body: string }) {
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`}>
        {bullets.map((item) => <li key={item}>{renderInline(item)}</li>)}
      </ul>,
    );
    bullets = [];
  };

  body.split("\n").forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      return;
    }

    if (line.startsWith("- ") || line.startsWith("â€¢ ")) {
      bullets.push(line.slice(2));
      return;
    }

    flushBullets();

    if (line.startsWith("### ")) {
      nodes.push(<h3 key={index}>{line.slice(4)}</h3>);
    } else if (line.startsWith("> ")) {
      nodes.push(<blockquote key={index}>{renderInline(line.slice(2))}</blockquote>);
    } else {
      nodes.push(<p key={index}>{renderInline(line)}</p>);
    }
  });

  flushBullets();

  return <>{nodes}</>;
}

function renderInline(value: string): ReactNode[] {
  return value.split(/(https?:\/\/\S+|\*\*[^*]+\*\*)/g).filter(Boolean).map((part) => {
    if (part.startsWith("http")) {
      return <a href={part} target="_blank" rel="noreferrer" key={part}>{part}</a>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={part}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function RightRail() {
  return (
    <aside className="source-post-detail-rail" aria-label="Barra lateral direita">
      <section>
        <h2>Membros</h2>
        <ul>
          {railMembers.map((member) => (
            <li key={member.name}>
              <Avatar value={member.avatar} name={member.name} />
              <span>{member.name}</span>
            </li>
          ))}
        </ul>
        <button type="button">Ver membros</button>
      </section>
      <section>
        <h2>PublicaÃ§Ãµes fixadas</h2>
        <a href="/c/feed-geral/opsec-seguranca-operacional">ðŸ” OPSEC: SeguranÃ§a Operacional</a>
      </section>
    </aside>
  );
}

function Avatar({ name, value }: { name: string; value: string }) {
  if (value.startsWith("/") || value.startsWith("http") || value.startsWith("data:")) {
    return <img className="post-detail-avatar" src={value} alt="" />;
  }

  return <span className="post-detail-avatar">{(value || name).slice(0, 2).toUpperCase()}</span>;
}

function localComment(postId: string, value: string): FeedComment {
  return {
    id: `${postId}-local-${Date.now()}`,
    postId,
    body: value,
    reactions: 0,
    createdAt: new Date().toISOString(),
    author: {
      username: "voce",
      name: "VocÃª",
      avatar: "VA",
      role: "member",
      level: 2,
    },
  };
}

function titleize(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(date);
}
