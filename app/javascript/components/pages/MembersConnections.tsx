import { useEffect, useMemo, useState } from "react";
import { CommunityIcon } from "../../design-system";
import {
  createDirectMessage,
  createMemberConnection,
  createOrLoadDirectConversation,
  loadDirectConversation,
  loadDirectConversations,
  loadDirectoryMembers,
  loadViewerConnections,
  markDirectConversationRead,
  type DirectConversation,
  type DirectMessage,
  type DirectoryMember,
} from "../../lib/communityApi";
import { ChatComposer } from "../chat/ChatComposer";

type DmTab = "inbox" | "unread" | "agents";
type ConversationEntry = {
  key: string;
  conversation?: DirectConversation;
  member: DirectoryMember;
};

function getRouteConversationId() {
  const match = window.location.pathname.match(/^\/messages\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

function closeDirectMessages() {
  window.history.pushState({}, "", "/members");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function orderDmMembers(rows: DirectoryMember[]) {
  return [...rows].sort((a, b) => {
    if (a.username === "night") return -1;
    if (b.username === "night") return 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

function compactLastSeen(member: DirectoryMember) {
  if (member.status === "online") return "agora";
  return member.lastSeen.replace(/^Visto pela última vez\s*/i, "");
}

function memberFromConversation(conversation: DirectConversation, members: DirectoryMember[]): DirectoryMember {
  const existing = members.find((member) => member.id === conversation.memberId || member.username === conversation.memberUsername);
  if (existing) return existing;

  return {
    id: conversation.memberId,
    username: conversation.memberUsername,
    name: conversation.memberName,
    avatar: conversation.memberAvatar,
    headline: "",
    location: conversation.memberUsername === "night" ? "Sapopemba" : "",
    status: conversation.memberStatus,
    role: conversation.memberRole,
    level: conversation.memberUsername === "night" ? 7 : 1,
    joinedAt: conversation.memberUsername === "night" ? "2025-12-03T12:00:00Z" : conversation.lastMessageAt,
    lastSeen: conversation.memberUsername === "night" ? "Visto pela última vez há 2 dias" : "Visto pela última vez há 2 dias",
    bio: "",
    tags: conversation.memberUsername === "night" ? ["p6 Veterano", "p6 Goat", "Hackudo"] : [],
    points: conversation.memberUsername === "night" ? 345 : 0,
    posts: 0,
    comments: 0,
    spaces: 0,
  };
}

function conversationPreview(conversation?: DirectConversation, member?: DirectoryMember) {
  if (conversation?.lastMessage) return conversation.lastMessage;
  if (member?.status === "online") return "Online agora";
  return member?.lastSeen || "";
}

export function MembersConnections() {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DmTab>("inbox");
  const [selectedConversationId, setSelectedConversationId] = useState(getRouteConversationId());
  const [directConversations, setDirectConversations] = useState<DirectConversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    let alive = true;
    void Promise.resolve().then(() => {
      if (!alive) return;
      setLoading(true);
      setError("");
    });

    Promise.all([loadDirectoryMembers("recent"), loadViewerConnections(), loadDirectConversations()])
      .then(async ([rows, connected, conversations]) => {
        if (!alive) return;

        const orderedRows = orderDmMembers(rows);
        let nextConversations = conversations;
        let nextSelected = getRouteConversationId() || conversations[0]?.id || "";

        if (!nextSelected && orderedRows.length) {
          const night = orderedRows.find((member) => member.username === "night") || orderedRows[0];
          const created = await createOrLoadDirectConversation(night);
          nextConversations = [created, ...conversations.filter((conversation) => conversation.id !== created.id)];
          nextSelected = created.id;
        }

        setMembers(orderedRows);
        setConnections(connected);
        setDirectConversations(nextConversations);
        setSelectedConversationId(nextSelected);

        if (window.location.pathname === "/messages" && nextSelected) {
          window.history.replaceState({}, "", `/messages/${encodeURIComponent(nextSelected)}`);
        }
      })
      .catch((requestError) => {
        if (alive) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as conversas.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function handlePopState() {
      setSelectedConversationId(getRouteConversationId());
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDirectMessages();
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;

    let alive = true;
    void Promise.resolve().then(() => {
      if (!alive) return;
      setMessagesLoading(true);
      setMessageError("");
    });

    loadDirectConversation(selectedConversationId)
      .then(({ conversation, messages: loadedMessages }) => {
        if (!alive) return;
        setMessages(loadedMessages);
        setDirectConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
        void markDirectConversationRead(conversation.id).then((readConversation) => {
          setDirectConversations((current) => current.map((item) => item.id === readConversation.id ? readConversation : item));
        });
      })
      .catch((requestError) => {
        if (!alive) return;
        setMessages([]);
        setMessageError(requestError instanceof Error ? requestError.message : "Não foi possível abrir a conversa.");
      })
      .finally(() => {
        if (alive) setMessagesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedConversationId]);

  const conversationEntries = useMemo<ConversationEntry[]>(() => {
    const normalized = query.trim().toLowerCase();
    const conversations = directConversations.map((conversation) => ({
      key: conversation.id,
      conversation,
      member: memberFromConversation(conversation, members),
    }));

    const base = activeTab === "agents"
      ? orderDmMembers(members.filter((member) => member.role === "admin" || member.role === "owner" || member.role === "moderator"))
          .map((member) => {
            const conversation = directConversations.find((item) => item.memberUsername === member.username || item.memberId === member.id);
            return { key: conversation?.id || member.id, conversation, member };
          })
      : conversations.filter((entry) => activeTab === "inbox" || entry.conversation.unread);

    return base
      .filter((entry) => `${entry.member.name} ${entry.member.username} ${entry.member.headline}`.toLowerCase().includes(normalized))
      .slice(0, 18);
  }, [activeTab, directConversations, members, query]);

  const selectedConversation = directConversations.find((conversation) => conversation.id === selectedConversationId) || conversationEntries[0]?.conversation;
  const selectedMember = selectedConversation ? memberFromConversation(selectedConversation, members) : conversationEntries[0]?.member;
  const connected = selectedMember ? connections.includes(selectedMember.username) : false;

  async function openConversation(entry: ConversationEntry) {
    const conversation = entry.conversation || await createOrLoadDirectConversation(entry.member);
    setDirectConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
    setSelectedConversationId(conversation.id);
    window.history.pushState({}, "", `/messages/${encodeURIComponent(conversation.id)}`);
  }

  async function connect(member: DirectoryMember) {
    const next = await createMemberConnection(member);
    setConnections((current) => next ? Array.from(new Set([...current, member.username])) : current);
  }

  async function sendDirectMessage(body: string) {
    if (!selectedConversationId) return;
    const message = await createDirectMessage(selectedConversationId, body);
    setMessages((current) => [...current, message]);
    setDirectConversations(await loadDirectConversations());
  }

  return (
    <main className="members-connections-main">
      <button className="dm-overlay-close" type="button" aria-label="Fechar mensagens diretas" onClick={closeDirectMessages}>
        <CommunityIcon name="icon-20-close" size={22} />
      </button>
      <section className="dm-shell" aria-label="Mensagens diretas">
        <aside className="dm-inbox">
          <header className="dm-inbox-header">
            <h1>Mensagens diretas</h1>
            <div>
              <button type="button" aria-label="Marcar como lidas">
                <CommunityIcon name="icon-20-message-check" size={18} />
              </button>
              <button type="button" aria-label="Nova mensagem">
                <CommunityIcon name="icon-16-plus-v2" size={18} />
              </button>
            </div>
          </header>
          <nav className="dm-tabs" aria-label="Mensagens diretas">
            <button className={activeTab === "inbox" ? "active" : ""} type="button" onClick={() => setActiveTab("inbox")}>Inbox</button>
            <button className={activeTab === "unread" ? "active" : ""} type="button" onClick={() => setActiveTab("unread")}>Não lidas</button>
            <button className={activeTab === "agents" ? "active" : ""} type="button" onClick={() => setActiveTab("agents")}>
              <CommunityIcon name="icon-20-sparkle" size={13} />
              Agentes
            </button>
          </nav>
          <label className="dm-search">
            <CommunityIcon name="icon-16-magnifying-glass" size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por um nome" />
          </label>
          <div className="dm-list">
            {loading ? <div className="dm-state">Carregando conversas...</div> : null}
            {!loading && error ? <div className="dm-state">{error}</div> : null}
            {!loading && !error && !conversationEntries.length ? <div className="dm-state">Nenhuma conversa encontrada.</div> : null}
            {conversationEntries.map((entry, index) => (
              <button
                className={selectedConversationId === entry.conversation?.id ? "dm-conversation active" : "dm-conversation"}
                type="button"
                key={entry.key}
                onClick={() => void openConversation(entry)}
              >
                <Avatar member={entry.member} size={36} />
                <span>
                  <span className="dm-conversation-title">
                    <strong>{entry.member.name}</strong>
                    {entry.conversation ? <time>{formatShortDate(entry.conversation.lastMessageAt)}</time> : null}
                  </span>
                  <small>{conversationPreview(entry.conversation, entry.member)}</small>
                </span>
                {!entry.conversation && index === 0 ? <time>novo</time> : null}
                {entry.conversation?.unread ? <em aria-label={`${entry.conversation.unreadCount} não lida`} /> : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="dm-thread" aria-label="Conversa direta">
          {selectedMember ? (
            <>
              <header className="dm-thread-header">
                <button type="button" className="dm-thread-title">
                  {selectedMember.name}
                  <CommunityIcon name="icon-12-chevron-down-v3" size={14} />
                </button>
                <div className="dm-thread-actions">
                  <button type="button" aria-label="Pesquisar conversa">
                    <CommunityIcon name="icon-16-magnifying-glass" size={18} />
                  </button>
                  <button type="button" aria-label="Abrir detalhes">
                    <CommunityIcon name="icon-20-arrow-right" size={18} />
                  </button>
                </div>
              </header>
              <div className="dm-message-scroll">
                {messagesLoading ? <div className="dm-state">Carregando mensagens...</div> : null}
                {!messagesLoading && messageError ? <div className="dm-state">{messageError}</div> : null}
                {!messagesLoading && !messageError && !messages.length ? <div className="dm-state">Nenhuma mensagem ainda.</div> : null}
                {messages.map((message) => (
                  <article className={message.author === "viewer" ? "dm-message is-viewer" : "dm-message"} key={message.id}>
                    {message.author === "member" ? <Avatar member={selectedMember} size={36} /> : null}
                    {message.variant === "welcome" ? (
                      <div className="dm-message-actions" aria-label="Ações da mensagem">
                        <button type="button" aria-label="Reagir">
                          <CommunityIcon name="icon-20-reaction" size={17} />
                        </button>
                        <button type="button" aria-label="Salvar">
                          <CommunityIcon name="icon-20-bookmark-v3" size={17} />
                        </button>
                        <button type="button" aria-label="Comentar">
                          <CommunityIcon name="icon-20-comment" size={17} />
                        </button>
                        <button type="button" aria-label="Mais opções">
                          <CommunityIcon name="icon-16-menu-dots-horizontal" size={17} />
                        </button>
                      </div>
                    ) : null}
                    <div className={message.variant === "welcome" ? "dm-message-card is-welcome" : "dm-message-card"}>
                      {message.author === "member" ? (
                        <header>
                          <strong>{selectedMember.name}</strong>
                          <time>{message.time}</time>
                        </header>
                      ) : null}
                      {message.variant === "welcome" ? <WelcomeMessage /> : <p>{message.body}</p>}
                      {message.variant !== "welcome" ? <time>{message.time}</time> : null}
                    </div>
                  </article>
                ))}
              </div>
              <ChatComposer compact onSend={sendDirectMessage} />
            </>
          ) : (
            <div className="dm-empty">
              <CommunityIcon name="icon-20-message-v3" size={32} />
              <h2>Selecione uma conversa</h2>
              <p>As mensagens diretas aparecem aqui.</p>
            </div>
          )}
        </section>

        <aside className="dm-profile">
          {selectedMember ? (
            <>
              <header>
                <h2>Perfil</h2>
              </header>
              <div className="dm-profile-hero">
                <Avatar member={selectedMember} size={96} />
                <div>
                  <h3>{selectedMember.name}</h3>
                  <button type="button" aria-label="Copiar link do perfil">
                    <CommunityIcon name="icon-20-link" size={19} />
                  </button>
                </div>
              </div>
              {selectedMember.role === "admin" || selectedMember.role === "owner" ? <em className="admin-badge">ADMINISTRADOR</em> : null}
              <nav className="dm-profile-tabs" aria-label="Perfil">
                <button className="active" type="button">Sobre</button>
                <button type="button">Publicações</button>
                <button type="button">Comentários</button>
                <button type="button">Espaços</button>
              </nav>
              <dl>
                <div>
                  <dt><CommunityIcon name="icon-16-calendar-join-date" size={16} /> Membro desde {formatLongDate(selectedMember.joinedAt)}</dt>
                </div>
                <div>
                  <dt><CommunityIcon name="icon-16-clock" size={16} /> Visto pela última vez {compactLastSeen(selectedMember)}</dt>
                </div>
              </dl>
              <section>
                <h4>Tags</h4>
                <div className="member-tags">
                  {selectedMember.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </section>
              <button className="dm-profile-connection" type="button" onClick={() => void connect(selectedMember)}>
                {connected ? "Conectado" : "Conectar"}
              </button>
            </>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function WelcomeMessage() {
  return (
    <div className="dm-welcome-copy">
      <p><strong>Olá, Vítor Santos Araujo!</strong> Seja muito bem-vindo(a) ao <strong>Comunidade.</strong></p>
      <p>Parabéns por se tornar um <strong>Goat!</strong> Estamos muito felizes em ter você no Comunidade. Para começar com o pé direito, siga estes 3 passos essenciais:</p>
      <ol>
        <li><strong>Entre no Discord:</strong> <a>Clique aqui para entrar.</a></li>
      </ol>
      <ul>
        <li><em>Importante:</em> Para liberar seu acesso, insira o mesmo e-mail utilizado na compra. <span>( studiocibernetic@gmail.com )</span></li>
        <li><strong>Entrar no Discord facilita sua iniciação com nossos fóruns de ajuda entre membros.</strong> Não se esqueça de entrar!</li>
      </ul>
      <p>Você também consegue ver o progresso dos membros da comunidade</p>
      <ol start={2}>
        <li><strong>Conheça a Comunidade.</strong> Acesse a página Sobre Nós: <a>Clique Aqui</a></li>
      </ol>
      <blockquote>É o ponto de partida ideal para entender onde você acaba de entrar.</blockquote>
      <ol start={2}>
        <li><strong>Leia as Regras:</strong> <a>Clique Aqui</a></li>
      </ol>
      <blockquote>É fundamental para mantermos a ordem na casa.</blockquote>
      <p>Agora você faz parte de um universo de oportunidades. Aproveite cada uma delas!</p>
      <p>Não fique perdido: assista à s aulas do Método Comunidade aqui: <a>#Fulfillment by Merchant</a></p>
      <p>E não se esqueça de entrar no Discord e resgatar seu acesso para explorar os fóruns de ajuda da comunidade. Não perca tempo e comece agora!</p>
    </div>
  );
}

function Avatar({ member, size }: { member: DirectoryMember; size: number }) {
  if (member.avatar.startsWith("/") || member.avatar.startsWith("http") || member.avatar.startsWith("data:")) {
    return <img className="dm-avatar" src={member.avatar} alt="" style={{ width: size, height: size }} />;
  }

  return <span className="member-initials dm-avatar" style={{ width: size, height: size }}>{member.avatar.slice(0, 2)}</span>;
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value)).replace(".", ".");
}
