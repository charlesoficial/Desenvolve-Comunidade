import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { P6Icon } from "../../design-system";
import {
  createFeedComment,
  createFeedPost,
  loadDirectoryMembers,
  loadFeedPosts,
  loadViewerProfileSummary,
  loadPostComments,
  togglePostReaction,
  togglePostSave,
  uploadFeedAttachment,
  type DirectoryMember,
  type FeedAttachment,
  type FeedComment,
  type FeedPost,
  type ViewerProfileSummary,
} from "../../lib/communityApi";
import { MemberCluster } from "../topbar/MemberCluster";

type ProgressView = "feed" | "chat" | "politica" | "members" | "progress";
type SortOption = "Mais recente" | "Nova atividade" | "Mais antiga" | "Popular" | "Curtidas" | "Alfabética";

const progressAssetBase = "/Seu%20Progresso%20_%20Project%20Six_files/";
const feedAssetBase = "/Feed%20Geral%20_%20Project%20Six_files/";
const progressAsset = (name: string) => `${progressAssetBase}${encodeURIComponent(name)}`;
const feedAsset = (name: string) => `${feedAssetBase}${encodeURIComponent(name)}`;

const fallbackMembers = [
  { id: "dumine", name: "dumine.x", avatar: progressAsset("424eae48f9d2135edb461bf04289b99e.png") },
  { id: "vamp", name: "vamp.darcy", avatar: progressAsset("download (3).jpg") },
  { id: "drk", name: "drk_333", avatar: progressAsset("cb9e8ea52c4bd777e771df8a3664c405.jpg") },
  { id: "zero", name: "zero", avatar: progressAsset("download (2).jfif") },
  { id: "tadashi", name: "Tadashi", avatar: progressAsset("IMG_3536.jpeg") },
  { id: "tetey", name: "tetey15k", avatar: progressAsset("Captura de tela 2025-10-31 202909.png") },
];

const fallbackPost: FeedPost = {
  id: "fallback-progress-main",
  title: "1 mês de operação com uma oferta daqui!",
  body:
    "É gratificante ver o que a P6 está fazendo! É uma comunidade sem igual. Esse resultado é de apenas um mês de operação em uma oferta daqui!🔥",
  spaceSlug: "seu-progresso",
  kind: "image",
  topics: [],
  publishedAt: "2026-04-27T12:00:00-03:00",
  comments: 0,
  likes: 7,
  views: 0,
  pinned: false,
  liked: false,
  saved: false,
  attachments: [
    {
      kind: "image",
      fileName: "WhatsApp Image 2026-04-27 at 22.07.18.jpeg",
      fileUrl: progressAsset("WhatsApp Image 2026-04-27 at 22.07.18.jpeg"),
      width: 1065,
      height: 1600,
    },
  ],
  author: {
    username: "tetey15k",
    name: "tetey15k",
    avatar: progressAsset("Captura de tela 2025-10-31 202909.png"),
    badge: "Hackudo",
    level: "p6 Veterano",
    joinedAt: "Membro desde 12 de dezembro de 2025",
  },
};

export function ProgressMain({ onNavigate }: { onNavigate?: (view: ProgressView) => void }) {
  const [posts, setPosts] = useState<FeedPost[]>([fallbackPost]);
  const [members, setMembers] = useState(fallbackMembers);
  const [showCreate, setShowCreate] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sort, setSort] = useState<SortOption>("Mais recente");
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [commentsPost, setCommentsPost] = useState<FeedPost | null>(null);
  const [imageViewer, setImageViewer] = useState<FeedAttachment | null>(null);
  const [viewer, setViewer] = useState<ViewerProfileSummary | null>(null);

  useEffect(() => {
    let alive = true;

    void Promise.resolve().then(async () => {
      const rows = await loadFeedPosts("seu-progresso").catch(() => []);
      if (!alive) return;
      const hasReferencePost = rows.some((post) => post.title === fallbackPost.title);
      setPosts(rows.length ? (hasReferencePost ? rows : [...rows, fallbackPost]) : [fallbackPost]);
    });

    loadViewerProfileSummary()
      .then((summary) => {
        if (alive) setViewer(summary);
      })
      .catch(() => {
        if (alive) setViewer(null);
      });
    loadDirectoryMembers("oldest")
      .then((rows) => {
        if (!alive) return;
        if (!rows.length) return;
        const display = mergeMembers(rows).slice(0, 6);
        setMembers(display.length ? display : fallbackMembers);
      })
      .catch(() => {
        if (alive) setMembers(fallbackMembers);
      });

    return () => {
      alive = false;
    };
  }, []);

  const viewerAvatar = viewer?.avatar || "VA";

  const headerMembers = useMemo(() => {
    const seed = members.slice(0, 3);
    return seed.length
      ? seed.map((member, index) => ({ id: member.id, name: member.name, avatar: member.avatar, online: index === 1 }))
      : [
          { id: "cluster-tetey", name: "tetey15k", avatar: progressAsset("Captura de tela 2025-10-31 202909.png") },
          { id: "cluster-va", name: "VA", avatar: "VA", online: true },
          { id: "cluster-ref", name: "Refzinho", avatar: feedAsset("9745dcfe727b27ce8d8aea9cc7814732.jpg") },
        ];
  }, [members]);

  const sortedPosts = useMemo(() => sortPosts(posts, sort), [posts, sort]);

  const handlePublish = async (title: string, body: string, attachments: FeedAttachment[]) => {
    const created = await createFeedPost(title || "Publicação", body, "seu-progresso", attachments);
    setPosts((current) => [created, ...current]);
    setShowCreate(false);
  };

  const updatePost = (updated: FeedPost) => {
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
    setCommentsPost((current) => (current?.id === updated.id ? updated : current));
  };

  const handleLike = async (post: FeedPost) => {
    if (isFallbackPost(post)) {
      updatePost({ ...post, liked: !post.liked, likes: Math.max(0, post.likes + (post.liked ? -1 : 1)) });
      return;
    }

    updatePost(await togglePostReaction(post.id));
  };

  const handleSave = async (post: FeedPost) => {
    if (isFallbackPost(post)) {
      updatePost({ ...post, saved: !post.saved });
      return;
    }

    await togglePostSave(post.id);
    updatePost({ ...post, saved: !post.saved });
  };

  return (
    <main className="progress-main">
      <header className="progress-header">
        <div className="progress-title">
          <img src={feedAsset("achievement-2-svgrepo-com.png")} alt="" aria-hidden="true" />
          <h1>Seu Progresso</h1>
        </div>
        <div className="progress-actions">
          <div className="progress-sort-wrap">
            <button className="progress-sort-button" type="button" aria-expanded={showSort} onClick={() => setShowSort((value) => !value)}>
              {sort} <P6Icon name="icon-12-chevron-down-v3" size={14} />
            </button>
            {showSort ? <ProgressSortMenu value={sort} onSelect={(value) => { setSort(value); setShowSort(false); }} /> : null}
          </div>
          <button className="progress-magic-button" type="button" aria-label="Resumir">
            <P6Icon name="icon-20-stardust-gradient" size={22} />
          </button>
          <button className="progress-member-cluster-button" type="button" aria-label="Ver membros" onClick={() => onNavigate?.("members")}>
            <MemberCluster members={headerMembers} extra="+857" />
          </button>
          <button className="progress-new-post" type="button" onClick={() => setShowCreate(true)}>Nova publicação</button>
          <div className="progress-menu-wrap">
            <button className="progress-more" type="button" aria-label="Mais opções" onClick={() => setTopMenuOpen((value) => !value)}>
              <P6Icon name="icon-16-menu-dots-horizontal" size={20} />
            </button>
            {topMenuOpen ? <ProgressTopMenu /> : null}
          </div>
        </div>
      </header>

      <div className="progress-scroll">
        <div className="progress-grid">
          <section className="progress-feed-column">
            <button className="progress-composer" type="button" onClick={() => setShowCreate(true)}>
              <span className="progress-va">{viewerAvatar.slice(0, 2)}</span>
              <span>Criar uma publicação</span>
              <i>
                <P6Icon name="icon-20-plus-v3" size={21} />
              </i>
            </button>

            {sortedPosts.map((post) => (
              <ProgressPostCard
                key={post.id}
                post={post}
                menuOpen={postMenuId === post.id}
                onToggleMenu={() => setPostMenuId((current) => (current === post.id ? null : post.id))}
                onLike={() => handleLike(post)}
                onSave={() => handleSave(post)}
                onComments={() => setCommentsPost(post)}
                onImage={setImageViewer}
              />
            ))}
          </section>

          <aside className="progress-members-card">
            <h2>Membros</h2>
            <ul>
              {members.slice(0, 6).map((member) => (
                <li key={member.id}>
                  <button type="button" onClick={() => onNavigate?.("members")} aria-label={`Ver perfil de ${member.name}`}>
                    <Avatar src={member.avatar} name={member.name} />
                    <span>{member.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => onNavigate?.("members")}>Ver membros</button>
          </aside>
        </div>
      </div>

      {showCreate ? <ProgressCreateModal onClose={() => setShowCreate(false)} onPublish={handlePublish} /> : null}
      {commentsPost ? (
        <ProgressCommentsModal
          post={commentsPost}
          onClose={() => setCommentsPost(null)}
          onCommented={(updated) => updatePost(updated)}
        />
      ) : null}
      {imageViewer ? <ProgressImageViewer attachment={imageViewer} onClose={() => setImageViewer(null)} /> : null}
    </main>
  );
}

function ProgressPostCard({
  post,
  menuOpen,
  onToggleMenu,
  onLike,
  onSave,
  onComments,
  onImage,
}: {
  post: FeedPost;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onLike: () => void;
  onSave: () => void;
  onComments: () => void;
  onImage: (attachment: FeedAttachment) => void;
}) {
  const primaryImage = post.attachments.find((attachment) => attachment.kind === "image");

  return (
    <article className="progress-post-card">
      <div className="progress-post-top">
        <div className="progress-post-heading">
          <h2>{post.title}</h2>
          <div className="progress-author-row">
            <Avatar src={post.author.avatar} name={post.author.name} />
            <div>
              <p>
                <strong>{post.author.name}</strong>
                <span className="progress-badge progress-badge-hackudo">
                  <img src={progressAsset("hat-and-moustache-svgrepo-com.png")} alt="" />
                  Hackudo
                </span>
                <span className="progress-badge progress-badge-veterano">
                  <img src={progressAsset("P6X (240 x 70 px) (800 x 800 px).png")} alt="" />
                  Veterano
                </span>
                <span className="progress-badge-more">+1</span>
                <time>{formatRelative(post.publishedAt)}</time>
              </p>
              <small>{post.author.joinedAt}</small>
            </div>
          </div>
        </div>
        <div className="progress-post-controls">
          <button className={post.saved ? "active" : ""} type="button" aria-label="Salvar" onClick={onSave}>
            <P6Icon name={post.saved ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={21} />
          </button>
          <div className="progress-post-menu-wrap">
            <button type="button" aria-label="Ações da publicação" onClick={onToggleMenu}>
              <P6Icon name="icon-16-menu-dots-horizontal" size={20} />
            </button>
            {menuOpen ? <ProgressPostMenu /> : null}
          </div>
        </div>
      </div>

      <div className="progress-post-body">
        <p>{post.body}</p>
        {primaryImage ? (
          <button className="progress-image-button" type="button" aria-label="Ver anexo" onClick={() => onImage(primaryImage)}>
            <img className="progress-report-image" src={primaryImage.fileUrl} alt="" />
          </button>
        ) : null}
      </div>

      <footer className="progress-post-footer">
        <div>
          <button className={post.liked ? "active" : ""} type="button" aria-label="Curtir" onClick={onLike}>
            <P6Icon name={post.liked ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={24} />
          </button>
          <button type="button" aria-label="Comentar" onClick={onComments}>
            <P6Icon name="icon-20-comment" size={22} />
          </button>
        </div>
        <button className="progress-engagement" type="button" onClick={onComments}>
          <LikeAvatars liked={post.liked} />
          <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span>
          <span className="progress-separator">·</span>
          <span>{post.comments} comentário{post.comments === 1 ? "" : "s"}</span>
        </button>
      </footer>
    </article>
  );
}

function ProgressCreateModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (title: string, body: string, attachments: FeedAttachment[]) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<FeedAttachment[]>([]);
  const [publishing, setPublishing] = useState(false);
  const canPublish = Boolean(title.trim() || body.trim());

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setPublishing(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => uploadFeedAttachment(file)));
      setAttachments((current) => [...current, ...uploaded]);
    } finally {
      setPublishing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    if (!canPublish || publishing) return;
    setPublishing(true);
    try {
      await onPublish(title, body, attachments);
    } finally {
      setPublishing(false);
    }
  };

  return createPortal(
    <div className="progress-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="progress-create-modal" role="dialog" aria-modal="true" aria-label="Criar publicação">
        <header>
          <h2>Criar publicação</h2>
          <div>
            <button type="button" aria-label="Redimensionar"><P6Icon name="icon-20-copy" size={18} /></button>
            <button type="button" aria-label="Tela cheia"><P6Icon name="icon-20-expand" size={18} /></button>
            <button type="button" aria-label="Fechar" onClick={onClose}><P6Icon name="icon-20-close" size={20} /></button>
          </div>
        </header>
        <div className="progress-create-editor">
          <textarea aria-label="Título opcional" placeholder="Título (opcional)" value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea aria-label="Escreva algo" placeholder="Escreva algo" value={body} onChange={(event) => setBody(event.target.value)} />
          {attachments.length ? (
            <div className="progress-attachment-list">
              {attachments.map((attachment) => <span key={attachment.fileUrl}>{attachment.fileName}</span>)}
            </div>
          ) : null}
        </div>
        <footer>
          <input ref={fileInputRef} className="progress-hidden-file" type="file" multiple onChange={(event) => handleFiles(event.target.files)} />
          <div className="progress-create-tools">
            <button type="button" aria-label="Adicionar"><P6Icon name="icon-20-plus-v3" size={18} /></button>
            <button type="button" aria-label="Hashtag"><P6Icon name="icon-16-hashtag" size={18} /></button>
            <button type="button" aria-label="Anexo" onClick={() => fileInputRef.current?.click()}><P6Icon name="icon-20-attach" size={18} /></button>
            <button type="button" aria-label="Vídeo" onClick={() => fileInputRef.current?.click()}><P6Icon name="icon-20-video" size={18} /></button>
            <button type="button" aria-label="GIF"><span>GIF</span></button>
            <button type="button" aria-label="Imagem" onClick={() => fileInputRef.current?.click()}><P6Icon name="icon-20-image-v3" size={18} /></button>
            <button type="button" aria-label="Emoji"><P6Icon name="icon-20-emoji" size={18} /></button>
            <button type="button" aria-label="Enquete"><P6Icon name="icon-20-chart" size={18} /></button>
            <button type="button" aria-label="Áudio"><P6Icon name="icon-20-microphone" size={18} /></button>
            <button type="button" aria-label="Câmera"><P6Icon name="icon-20-camera" size={18} /></button>
          </div>
          <div className="progress-create-publish">
            <span>Publicando em: <strong>Seu Progresso</strong> <P6Icon name="icon-12-chevron-down-v3" size={14} /></span>
            <button type="button" disabled={!canPublish || publishing} onClick={submit}>
              {publishing ? "Publicando" : "Publicar"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function ProgressCommentsModal({
  post,
  onClose,
  onCommented,
}: {
  post: FeedPost;
  onClose: () => void;
  onCommented: (post: FeedPost) => void;
}) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isFallbackPost(post)) {
      void Promise.resolve().then(() => setComments([]));
      return;
    }

    loadPostComments(post.id).then(setComments).catch(() => setComments([]));
  }, [post, post.id]);

  const submit = async () => {
    if (!body.trim() || saving) return;
    setSaving(true);
    try {
      if (isFallbackPost(post)) {
        const localComment: FeedComment = {
          id: `local-${Date.now()}`,
          postId: post.id,
          body,
          reactions: 0,
          createdAt: new Date().toISOString(),
          author: { username: "vitor-araujo", name: "Vítor Santos Araujo", avatar: "VA" },
        };
        setComments((current) => [...current, localComment]);
        onCommented({ ...post, comments: post.comments + 1 });
      } else {
        const created = await createFeedComment(post.id, body);
        setComments((current) => [...current, created]);
        onCommented({ ...post, comments: post.comments + 1 });
      }
      setBody("");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="progress-modal-backdrop progress-detail-backdrop">
      <section className="progress-detail-modal" role="dialog" aria-modal="true" aria-label={post.title}>
        <header>
          <h2>{post.title}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}><P6Icon name="icon-20-close" size={20} /></button>
        </header>
        <div className="progress-detail-scroll">
          <div className="progress-detail-post">
            <div className="progress-author-row">
              <Avatar src={post.author.avatar} name={post.author.name} />
              <div>
                <p>
                  <strong>{post.author.name}</strong>
                  <span className="progress-badge progress-badge-hackudo">
                    <img src={progressAsset("hat-and-moustache-svgrepo-com.png")} alt="" />
                    Hackudo
                  </span>
                  <span className="progress-badge progress-badge-veterano">
                    <img src={progressAsset("P6X (240 x 70 px) (800 x 800 px).png")} alt="" />
                    Veterano
                  </span>
                  <span className="progress-badge-more">+1</span>
                  <time>{formatRelative(post.publishedAt)}</time>
                </p>
                <small>{post.author.joinedAt}</small>
              </div>
            </div>
            <p>{post.body}</p>
            {post.attachments.find((attachment) => attachment.kind === "image") ? (
              <img src={post.attachments.find((attachment) => attachment.kind === "image")?.fileUrl} alt="" />
            ) : null}
          </div>
          <div className="progress-detail-actions">
            <button className={post.liked ? "active" : ""} type="button" aria-label="Curtir">
              <P6Icon name={post.liked ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={24} />
            </button>
            <button type="button" aria-label="Comentar">
              <P6Icon name="icon-20-comment" size={22} />
            </button>
            <button className="progress-engagement" type="button">
              <LikeAvatars liked={post.liked} />
              <span>{post.likes} curtida{post.likes === 1 ? "" : "s"}</span>
              <span className="progress-separator">·</span>
              <span>{post.comments} comentário{post.comments === 1 ? "" : "s"}</span>
            </button>
          </div>
          <div className="progress-comments-list">
            {comments.length ? comments.map((comment) => (
              <article key={comment.id}>
                <Avatar src={comment.author.avatar} name={comment.author.name} />
                <div>
                  <strong>{comment.author.name}</strong>
                  <p>{comment.body}</p>
                  <small>Curtir&nbsp;&nbsp;Responder</small>
                </div>
              </article>
            )) : <p className="progress-empty-comments">Nenhum comentário ainda.</p>}
          </div>
        </div>
        <footer>
          <span className="progress-va">VA</span>
          <input
            aria-label="O que você acha?"
            placeholder="O que você acha?"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
          <button type="button" disabled={!body.trim() || saving} onClick={submit}>Enviar</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function LikeAvatars({ liked }: { liked: boolean }) {
  return (
    <span className="progress-like-row">
      <img src={progressAsset("scarface.jfif")} alt="" />
      <img src={progressAsset("624854857-192351418-G_Aq7VCWgAEC3IQ.jpeg")} alt="" />
      {liked ? <span className="progress-like-initial">VA</span> : <img src={progressAsset("image (2).png")} alt="" />}
    </span>
  );
}

function ProgressSortMenu({ value, onSelect }: { value: SortOption; onSelect: (value: SortOption) => void }) {
  const options: SortOption[] = ["Mais recente", "Nova atividade", "Mais antiga", "Popular", "Curtidas", "Alfabética"];

  return (
    <div className="progress-sort-menu" role="menu" aria-label="Ordenar publicações">
      {options.map((option) => (
        <button className={value === option ? "active" : ""} type="button" key={option} onClick={() => onSelect(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

function ProgressTopMenu() {
  return (
    <div className="progress-dropdown-menu progress-top-dropdown">
      <button type="button"><P6Icon name="icon-20-bell-v3" size={16} /> Notificações do espaço</button>
      <button type="button"><P6Icon name="icon-20-link" size={16} /> Copiar link</button>
      <button type="button"><P6Icon name="icon-20-settings" size={16} /> Configurações</button>
    </div>
  );
}

function ProgressPostMenu() {
  const [following, setFollowing] = useState(false);

  return (
    <div className="progress-dropdown-menu progress-post-dropdown">
      <button type="button">Adicionar publicação aos favoritos</button>
      <button type="button">Denunciar publicação</button>
      <div className="progress-dropdown-separator" />
      <label>
        <span>Seguir publicação</span>
        <input type="checkbox" checked={following} onChange={(event) => setFollowing(event.target.checked)} />
        <i />
      </label>
    </div>
  );
}

function ProgressImageViewer({ attachment, onClose }: { attachment: FeedAttachment; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="progress-image-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="progress-image-viewer" role="dialog" aria-modal="true" aria-label={attachment.fileName}>
        <header>
          <h2>{attachment.fileName}</h2>
          <div>
            <a href={attachment.fileUrl} download={attachment.fileName} aria-label="Baixar">
              <P6Icon name="icon-20-download" size={18} />
            </a>
            <button type="button" aria-label="Fechar" onClick={onClose}>
              <P6Icon name="icon-20-close" size={22} />
            </button>
          </div>
        </header>
        <div className="progress-image-stage">
          <img src={attachment.fileUrl} alt="" />
        </div>
      </section>
    </div>,
    document.body,
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  const isImage = src.startsWith("http") || src.startsWith("/");
  if (isImage) return <img src={src} alt="" />;

  return <span className="progress-initial-avatar" title={name}>{src || initials(name)}</span>;
}

function mergeMembers(rows: DirectoryMember[]) {
  const mapped = rows.map((member) => ({ id: member.id, name: member.name, avatar: member.avatar }));
  const byName = new Map(mapped.map((member) => [member.name.toLowerCase(), member]));

  return fallbackMembers.map((fallback) => byName.get(fallback.name.toLowerCase()) || fallback);
}

function sortPosts(posts: FeedPost[], sort: SortOption) {
  const list = [...posts];

  if (sort === "Mais antiga") return list.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  if (sort === "Popular" || sort === "Curtidas") return list.sort((a, b) => b.likes - a.likes);
  if (sort === "Alfabética") return list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

  return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.round(diff / 86400000));
  if (days <= 0) return "hoje";
  if (days < 7) return `${days} d`;
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" })
    .format(new Date(value))
    .replace(" de ", " ");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "VA";
}

function isFallbackPost(post: FeedPost) {
  return post.id.startsWith("fallback-");
}
