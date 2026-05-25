import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CommunityIcon } from "../../design-system";
import {
  createMemberConnection,
  createOrLoadDirectConversation,
  loadDirectoryMembers,
  loadFeedPosts,
  loadViewerConnections,
  loadViewerProfileSummary,
  type DirectoryMember,
  type FeedPost,
  type ViewerProfileSummary,
} from "../../lib/communityApi";

type MemberSort = "oldest" | "recent" | "alphabetical";
type ProfileTab = "about" | "posts" | "comments" | "spaces" | "rewards";
type MemberQuickFilter = "all" | "near" | "online" | "recent";

const cardTints = ["22, 106, 100", "155, 39, 190", "102, 39, 190", "144, 144, 144", "144, 144, 144", "155, 39, 190", "22, 106, 100", "71, 71, 71", "144, 144, 144"];

export function MembersMain({ withSidebar = false }: { withSidebar?: boolean } = {}) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [query, setQuery] = useState("");
  const [sort] = useState<MemberSort>("oldest");
  const [selected, setSelected] = useState<DirectoryMember | null>(null);
  const [connectionPrompt, setConnectionPrompt] = useState<DirectoryMember | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [locationQuery, setLocationQuery] = useState("");
  const [tagQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<MemberQuickFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterNow] = useState(() => Date.now());
  const [viewer, setViewer] = useState<ViewerProfileSummary | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.resolve().then(() => {
      if (!alive) return;
      setLoading(true);
      setError("");
    });
    Promise.all([loadDirectoryMembers(sort), loadViewerConnections()])
      .then(([rows, connectionUsernames]) => {
        if (!alive) return;
        setMembers(rows);
        setConnected(Object.fromEntries(rows.map((member) => [member.id, connectionUsernames.includes(member.username)])));
      })
      .catch(() => {
        if (alive) {
          setMembers([]);
          setError("Não foi possível carregar os membros.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sort]);

  useEffect(() => {
    let alive = true;

    loadViewerProfileSummary()
      .then((summary) => {
        if (alive) setViewer(summary);
      })
      .catch(() => {
        if (alive) setViewer(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const normalizedLocation = locationQuery.trim().toLowerCase();
    const normalizedTag = tagQuery.trim().toLowerCase();
    return members.filter((member) => {
      const searchable = `${member.name} ${member.username} ${member.headline} ${member.bio} ${member.location} ${member.role} ${member.tags.join(" ")}`.toLowerCase();
      const matchesText = !normalized || searchable.includes(normalized);
      const matchesLocation = !normalizedLocation || member.location.toLowerCase().includes(normalizedLocation);
      const matchesTag = !normalizedTag || member.tags.some((tag) => tag.toLowerCase().includes(normalizedTag));
      const matchesQuick =
        quickFilter === "all" ||
        (quickFilter === "near" && Boolean(member.location)) ||
        (quickFilter === "online" && member.status === "online") ||
        (quickFilter === "recent" && filterNow - new Date(member.joinedAt).getTime() <= 1000 * 60 * 60 * 24 * 30);

      return matchesText && matchesLocation && matchesTag && matchesQuick;
    });
  }, [members, query, locationQuery, tagQuery, quickFilter, filterNow]);

  const openDirectMessage = async (member: DirectoryMember) => {
    const conversation = await createOrLoadDirectConversation(member);
    window.history.pushState({}, "", `/messages/${encodeURIComponent(conversation.id)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const toggleConnection = async (member: DirectoryMember, message = "") => {
    const previous = Boolean(connected[member.id]);
    setConnected((current) => ({ ...current, [member.id]: !previous }));

    try {
      const next = await createMemberConnection(member, message);
      setConnected((current) => ({ ...current, [member.id]: next }));
    } catch {
      setConnected((current) => ({ ...current, [member.id]: previous }));
    }
  };

  const confirmConnection = async (message: string) => {
    if (!connectionPrompt) return;
    const member = connectionPrompt;
    setConnectionPrompt(null);
    if (!connected[member.id]) await toggleConnection(member, message);
  };

  return (
    <main className={withSidebar ? "members-main has-sidebar" : "members-main"}>
      <header className="members-header">
        <div className="members-title">
          <h1>Membros</h1>
        </div>
        <div className="members-header-actions">
          <button className="members-map-link" type="button" onClick={() => {
            window.history.pushState({}, "", "/members/map");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}>
            <CommunityIcon name="icon-map" size={17} />
            Mostrar mapa
          </button>
        </div>
      </header>

      <div className="members-scroll">
        <div className="members-shell">
          <aside className="members-left-column">
            <section className="members-viewer-card">
              <div className="members-viewer-avatar-wrap">
              <div className="members-viewer-avatar">
                {viewer?.avatar?.startsWith("/") || viewer?.avatar?.startsWith("http") ? <img src={viewer.avatar} alt="" /> : <span>{(viewer?.avatar || "VA").slice(0, 2)}</span>}
              </div>
              <span className="members-viewer-level">1</span>
              </div>
              <h2>{viewer?.name || "Vítor Santos Araujo"}</h2>
              <button type="button">Ver perfil</button>
            </section>

            <aside className="members-filter-card">
            <section>
              <h2>Encontrar membros</h2>
              <label className="members-search">
                <CommunityIcon name="icon-16-magnifying-glass" size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" />
              </label>
              <div className="members-filter-pills">
                <button className={quickFilter === "near" ? "active" : ""} type="button" onClick={() => setQuickFilter((value) => value === "near" ? "all" : "near")}>
                  <CommunityIcon name="icon-16-pin-location" size={16} /> Perto de mim
                </button>
                <button className={quickFilter === "online" ? "active" : ""} type="button" onClick={() => setQuickFilter((value) => value === "online" ? "all" : "online")}>
                  <CommunityIcon name="icon-16-online-users" size={14} /> Online
                </button>
                <button className={quickFilter === "recent" ? "active" : ""} type="button" onClick={() => setQuickFilter((value) => value === "recent" ? "all" : "recent")}>
                  <CommunityIcon name="icon-16-confetti" size={14} /> Entrou recentemente
                </button>
              </div>
            </section>
            <section>
              <h3>Localidade</h3>
              <input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="Pesquisar localidade" />
            </section>
            <section>
              <h3>Tag</h3>
              <button className="members-select" type="button">
                Selecione uma opção <CommunityIcon name="icon-12-chevron-down-v3" size={14} />
              </button>
            </section>
            </aside>
          </aside>

          <section className="members-directory">
            <nav className="members-directory-tabs" aria-label="Membros">
              <button className="active" type="button">Todos os membros</button>
              <button type="button">Minhas conexões</button>
            </nav>
            <h2>
              Todos os membros <span>{filteredMembers.length}</span>
            </h2>
            <label className="members-search members-mobile-search">
              <CommunityIcon name="icon-16-magnifying-glass" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" />
            </label>
            {loading ? <MembersState title="Carregando membros" body="Buscando membros ativos da comunidade." /> : null}
            {!loading && error ? <MembersState title="Erro ao carregar" body={error} /> : null}
            {!loading && !error && !filteredMembers.length ? <MembersState title="Nenhum membro encontrado" body="Ajuste os filtros ou tente outro termo de busca." /> : null}
            {!loading && !error && filteredMembers.length ? <div className="members-grid">
              {filteredMembers.map((member, index) => (
                <article className="member-card" key={member.id}>
                  <button className="member-card-main" type="button" onClick={() => setSelected(member)}>
                    <div
                      className="member-card-glow"
                      style={{ "--member-card-tint": cardTints[index % cardTints.length] } as CSSProperties}
                    />
                    <AvatarImage member={member} size={64} />
                    <h3>{member.name}</h3>
                    {member.role === "admin" || member.role === "owner" ? <em className="admin-badge">Administrador</em> : null}
                    {member.headline ? <small>{member.headline}</small> : null}
                    {member.location ? (
                      <p>
                        <CommunityIcon name="icon-16-location" size={16} />
                        {member.location}
                      </p>
                    ) : (
                      <p aria-hidden="true">&nbsp;</p>
                    )}
                  </button>
                  <button className="member-connect" type="button" onClick={() => setConnectionPrompt(member)}>
                    <CommunityIcon name={connected[member.id] ? "icon-20-message-check" : "icon-16-plus-v2"} size={16} />
                    {connected[member.id] ? "Conectado" : "Conectar"}
                  </button>
                </article>
              ))}
            </div> : null}
          </section>
        </div>
      </div>

      {selected ? (
        <MemberProfileModal
          member={selected}
          connected={Boolean(connected[selected.id])}
          onConnect={() => setConnectionPrompt(selected)}
          onMessage={() => openDirectMessage(selected)}
          onClose={() => setSelected(null)}
        />
      ) : null}
      {connectionPrompt ? (
        <ConnectionPromptModal
          member={connectionPrompt}
          onCancel={() => setConnectionPrompt(null)}
          onConfirm={confirmConnection}
        />
      ) : null}
    </main>
  );
}

function MembersState({ body, title }: { body: string; title: string }) {
  return (
    <div className="members-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function AvatarImage({ member, size }: { member: DirectoryMember; size: number }) {
  const isImage = member.avatar.startsWith("http") || member.avatar.startsWith("/") || member.avatar.startsWith("data:");
  return isImage ? (
    <img src={member.avatar} alt={member.name} style={{ width: size, height: size }} />
  ) : (
    <span className="member-initials" style={{ width: size, height: size }}>
      {member.avatar.slice(0, 2)}
    </span>
  );
}

function MemberProfileModal({
  member,
  connected,
  onConnect,
  onMessage,
  onClose,
}: {
  member: DirectoryMember;
  connected: boolean;
  onConnect: () => void;
  onMessage: () => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberPosts, setMemberPosts] = useState<FeedPost[]>([]);
  const nextLevelRemaining = member.username === "night" ? 295 : Math.max(10, 300 - member.points);
  const showProfileLocation = member.username !== "night" && Boolean(member.location);
  useEffect(() => {
    let alive = true;
    loadFeedPosts("feed-geral")
      .then((posts) => {
        if (alive) setMemberPosts(posts.filter((post) => post.author.username === member.username));
      })
      .catch(() => {
        if (alive) setMemberPosts([]);
      });
    return () => {
      alive = false;
    };
  }, [member.username]);

  return createPortal(
    <div className="member-profile-backdrop">
      <section className="member-profile-modal" role="dialog" aria-modal="true" aria-label={`Perfil de ${member.name}`}>
        <header>
          <h2>Perfil</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>
            <CommunityIcon name="icon-20-close" size={21} />
          </button>
        </header>
        <div className="member-profile-body">
          <aside className="member-profile-aside">
            <div className="member-profile-gradient">
              <AvatarImage member={member} size={96} />
              <span>{member.level}</span>
            </div>
            <h3>{member.name}</h3>
            <p>
              <CommunityIcon name="icon-16-clock" size={16} />
              {member.lastSeen}
            </p>
            <p>
              <CommunityIcon name="icon-16-calendar-join-date" size={16} />
              Membro desde {formatLongDate(member.joinedAt)}
            </p>
            <div className="member-tags centered">
              {member.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="member-profile-actions">
              <button type="button" onClick={onMessage}>Mensagem</button>
              <div className="member-profile-more-wrap">
                <button type="button" aria-label={member.username === "night" ? "Copiar link" : "Mais opções"} onClick={() => setMenuOpen((current) => !current)}>
                  <CommunityIcon name={member.username === "night" ? "icon-20-link" : "icon-16-menu-dots-horizontal"} size={member.username === "night" ? 19 : 20} />
                </button>
                {menuOpen ? (
                  <div className="member-profile-side-menu">
                    <button type="button">
                      <CommunityIcon name="icon-16-link" size={16} />
                      Copiar link para perfil
                    </button>
                    <button type="button">
                      <CommunityIcon name="icon-16-close" size={14} />
                      Bloquear mensagens diretas
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
          <section className="member-profile-content">
            <div className="member-connect-banner">
              <AvatarImage member={member} size={32} />
              <span className="general-va">VA</span>
              <div>
                <strong>Conecte-se</strong>
                <p>Crie vínculos dentro da comunidade.</p>
              </div>
              <button type="button" onClick={onConnect}>
                <CommunityIcon name={connected ? "icon-20-message-check" : "icon-16-plus-v2"} size={16} />
                {connected ? "Conectado" : "Conectar"}
              </button>
            </div>
            <nav className="member-profile-tabs" aria-label="Perfil">
              <button className={activeTab === "about" ? "active" : ""} type="button" onClick={() => setActiveTab("about")}>Sobre</button>
              <button className={activeTab === "posts" ? "active" : ""} type="button" onClick={() => setActiveTab("posts")}>Publicações <span>{member.posts || ""}</span></button>
              <button className={activeTab === "comments" ? "active" : ""} type="button" onClick={() => setActiveTab("comments")}>Comentários <span>{member.comments || ""}</span></button>
              <button className={activeTab === "spaces" ? "active" : ""} type="button" onClick={() => setActiveTab("spaces")}>Espaços <span>{member.spaces}</span></button>
              <button className={activeTab === "rewards" ? "active" : ""} type="button" onClick={() => setActiveTab("rewards")}>Recompensas</button>
            </nav>
            <div className={`member-profile-tab-panel ${activeTab === "about" ? "is-about" : "is-list"}`}>
              {activeTab === "about" ? (
                <MemberAboutPanel member={member} nextLevelRemaining={nextLevelRemaining} showProfileLocation={showProfileLocation} />
              ) : activeTab === "posts" ? (
                <MemberPostsPanel member={member} posts={memberPosts} />
              ) : activeTab === "comments" ? (
                <MemberCommentsPanel member={member} />
              ) : activeTab === "spaces" ? (
                <MemberSpacesPanel />
              ) : (
                <MemberRewardsPanel />
              )}
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ConnectionPromptModal({
  member,
  onCancel,
  onConfirm,
}: {
  member: DirectoryMember;
  onCancel: () => void;
  onConfirm: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const title = `Conectar com ${member.name}`;

  return createPortal(
    <div className="member-action-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="member-action-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="Fechar" onClick={onCancel}>
            <CommunityIcon name="icon-20-close" size={20} />
          </button>
        </header>
        <div className="member-action-summary">
          <AvatarImage member={member} size={40} />
          <div>
            <strong>{member.name}</strong>
            <span>Entrou em {formatJoinedAgo(member.joinedAt)}</span>
          </div>
        </div>
        <label className="member-action-message">
          <span>Adicionar mensagem (opcional)</span>
          <small>Os membros têm mais probabilidade de se conectar quando você inclui uma mensagem pessoal.</small>
          <textarea
            maxLength={300}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Adicione uma mensagem pessoal para se apresentar..."
          />
          <em>{message.length} / 300</em>
        </label>
        <div className="member-action-buttons">
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="button" onClick={() => onConfirm(message)}>Enviar solicitação</button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function MemberAboutPanel({ member, nextLevelRemaining, showProfileLocation }: { member: DirectoryMember; nextLevelRemaining: number; showProfileLocation: boolean }) {
  return (
    <>
      <div className="member-level-row">
        <span className="member-level-trophy">🏆</span>
        <b>{member.level}</b>
        <span className="member-level-divider" aria-hidden="true" />
        <strong>Level {member.level}</strong>
      </div>
      <p className="member-points">{member.points} pontos&nbsp;&nbsp;•&nbsp;&nbsp;{nextLevelRemaining} para subir de nível</p>
      <div className="member-profile-section">
        <h4>Tags</h4>
        <div className="member-tags">
          {member.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      {member.bio ? (
        <div className="member-profile-section">
          <h4>Bio</h4>
          <p>{member.bio}</p>
        </div>
      ) : null}
      {showProfileLocation ? (
        <div className="member-profile-section">
          <h4>Location</h4>
          <p>{member.location}{member.location === "Massachusetts" ? ", Estados Unidos" : ""}</p>
        </div>
      ) : null}
    </>
  );
}

function MemberPostsPanel({ member, posts }: { member: DirectoryMember; posts: FeedPost[] }) {
  const renderedPosts = member.username === "night" ? [nightProfilePost] : posts;

  if (renderedPosts.length === 0) {
    return <div className="member-profile-empty"><h3>Nenhuma publicação ainda</h3><p>As publicações deste membro serão exibidas aqui.</p></div>;
  }

  return (
    <div className="member-profile-post-list">
      {renderedPosts.map((post) => (
        "cover" in post ? <NightProfilePostCard key={post.id} member={member} /> : <DbProfilePostCard key={post.id} post={post} member={member} />
      ))}
    </div>
  );
}

const nightProfilePost = { id: "night-lotto", cover: "/community-assets/imagem_2026-04-13_015104696.png" };

function NightProfilePostCard({ member }: { member: DirectoryMember }) {
  return (
    <article className="member-profile-post-card">
      <img className="member-profile-post-cover" src={nightProfilePost.cover} alt="" />
      <div className="member-profile-post-inner">
        <div className="member-profile-post-title-row">
          <h3>Formula que os maiores ganhadores da Loteria usam</h3>
          <button type="button" aria-label="Salvar"><CommunityIcon name="icon-20-bookmark-v3" size={21} /></button>
          <button type="button" aria-label="Ações"><CommunityIcon name="icon-16-menu-dots-horizontal" size={20} /></button>
        </div>
        <div className="member-profile-post-author">
          <AvatarImage member={member} size={40} />
          <strong>Night</strong>
          <em className="admin-badge">Administrador</em>
          <em>p6 Veterano</em>
          <em>p6 Goat</em>
          <i>+1</i>
          <time>13 de abr.</time>
        </div>
        <div className="member-profile-post-copy">
          <p><strong>1.100 anúncios ativos</strong></p>
          <p>Biblioteca de anúncios: [ <a>CLIQUE AQUI</a> ]</p>
          <p>Página de vendas: [ <a>CLIQUE AQUI</a> ]<br />Checkout: [ <a>CLIQUE AQUI</a> ]</p>
          <p>Quiz PÓS: [ <a>CLIQUE AQUI</a> ]<br />VSL PÓS: [ <a>CLIQUE AQUI</a> ]</p>
        </div>
      </div>
    </article>
  );
}

function DbProfilePostCard({ post, member }: { post: FeedPost; member: DirectoryMember }) {
  return (
    <article className="member-profile-post-card">
      <div className="member-profile-post-inner">
        <div className="member-profile-post-title-row">
          <h3>{post.title}</h3>
          <button type="button" aria-label="Salvar"><CommunityIcon name="icon-20-bookmark-v3" size={21} /></button>
          <button type="button" aria-label="Ações"><CommunityIcon name="icon-16-menu-dots-horizontal" size={20} /></button>
        </div>
        <div className="member-profile-post-author">
          <AvatarImage member={member} size={40} />
          <strong>{member.name}</strong>
          {member.tags.slice(0, 2).map((tag) => <em key={tag}>{tag}</em>)}
          <time>{formatShortPostDate(post.publishedAt)}</time>
        </div>
        <div className="member-profile-post-copy"><p>{post.body}</p></div>
      </div>
    </article>
  );
}

function MemberCommentsPanel({ member }: { member: DirectoryMember }) {
  const comments = member.username === "night" ? nightComments : [];
  if (comments.length === 0) {
    return <div className="member-profile-empty"><h3>Nenhum comentário ainda</h3><p>Os comentários deste membro serão exibidos aqui.</p></div>;
  }

  return (
    <div className="member-comments-list">
      {comments.map((comment) => (
        <article className="member-comment-row" key={`${comment.title}-${comment.date}`}>
          <AvatarImage member={member} size={40} />
          <div>
            <header><span>Comentou em <strong>{comment.title}</strong></span><time>{comment.date}</time></header>
            <p>{comment.body}</p>
            {comment.image ? <img src={comment.image} alt="" /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

const nightComments = [
  { title: "Dia 1 - Progresso no novo FBM amazon", date: "jan 14", body: "Você é uma florzinha! Ter começado o método novo já enche a gente de orgulho, amamos voce!!!!" },
  { title: "Resultados do método night15k", date: "jan 12", body: "não foi na s6xpay > judas" },
  { title: "Dia 4 — Iniciando o Método Night15k", date: "jan 10", body: "Você desonrou o método, acabei de presenciar sua ausencia na call." },
  { title: "Salmi 23", date: "jan 03", body: "Aula de OpSec vindai e vc me solta essa" },
  { title: "Gratidão.", date: "dez 19", body: "", image: "/community-assets/1772935473117.png" },
];

function MemberSpacesPanel() {
  return (
    <div className="member-spaces-list">
      {profileSpaces.map((space) => (
        <article key={space.name}>
          <CommunityIcon name={space.icon} size={21} />
          <div><h3>{space.name}</h3><p>{space.members} membros</p></div>
        </article>
      ))}
    </div>
  );
}

const profileSpaces = [
  { name: "Economia", members: 857, icon: "icon-20-billing" },
  { name: "Política Nacional", members: 857, icon: "icon-20-eye" },
  { name: "Geopolítica", members: 857, icon: "icon-20-course-lesson" },
  { name: "Geral", members: 857, icon: "icon-20-feed-v3" },
  { name: "Influencer IA & TikTok Dark", members: 856, icon: "icon-16-tiktok" },
  { name: "Central de Ajuda 'FBM'", members: 856, icon: "icon-20-amazon" },
  { name: "Básico", members: 883, icon: "icon-20-calendar" },
  { name: "FBA", members: 856, icon: "icon-20-amazon" },
];

function MemberRewardsPanel() {
  return (
    <div className="member-profile-empty rewards">
      <h3>Ainda não há recompensas</h3>
      <p>As recompensas recebidas por este membro serão exibidas aqui.</p>
    </div>
  );
}

function formatShortPostDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatJoinedAgo(value: string) {
  const joined = new Date(value);
  if (Number.isNaN(joined.getTime())) return "recentemente";

  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - joined.getFullYear()) * 12 + now.getMonth() - joined.getMonth());
  if (months >= 1) return `há ${months} ${months === 1 ? "mês" : "meses"}`;

  const days = Math.max(1, Math.round((now.getTime() - joined.getTime()) / 86400000));
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}
