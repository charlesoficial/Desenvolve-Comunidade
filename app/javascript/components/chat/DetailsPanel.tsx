import { MessageCircle, MoreHorizontal, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { offlineMembers, onlineMembers } from "../../data/chatData";
import type { ChatMessage, DetailMember } from "../../data/chatData";
import { loadMembers } from "../../lib/communityApi";
import type { ChatRightPanel } from "./ChatLayout";
import { ChatAvatar } from "./ChatAvatar";

export function DetailsPanel({ messages = [], mode, onClose }: { messages?: ChatMessage[]; mode: Exclude<ChatRightPanel, null>; onClose: () => void }) {
  const [members, setMembers] = useState({ online: onlineMembers, offline: offlineMembers, total: 879 });

  useEffect(() => {
    let ignore = false;

    loadMembers()
      .then((nextMembers) => {
        if (!ignore) setMembers(nextMembers);
      })
      .catch(() => {
        if (!ignore) setMembers({ online: onlineMembers, offline: offlineMembers, total: 879 });
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (mode === "search") {
    return <SearchPanel messages={messages} onClose={onClose} />;
  }

  if (mode === "thread") return null;

  return (
    <aside className="details-panel">
      <header className="details-header">
        <h2 className="p6-panel-title">Detalhes</h2>
        <div>
          <span>{members.total}</span>
          <Users size={17} />
        </div>
      </header>
      <div className="details-scroll">
        <MemberGroup title="ONLINE" members={members.online} />
        <MemberGroup title="OFFLINE" members={members.offline} />
      </div>
    </aside>
  );
}

function SearchPanel({ messages, onClose }: { messages: ChatMessage[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? messages.filter((message) => `${message.author} ${message.text}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 20)
    : [];

  return (
    <aside className="details-panel chat-search-panel">
      <div className="chat-side-search">
        <Search size={18} />
        <input autoFocus aria-label="Pesquisar em chat geral" placeholder="Pesquisar em chat geral" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="button" aria-label="Fechar busca" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {!query.trim() ? (
        <div className="chat-side-search-empty">
          <Search size={34} />
          <div>
            <span>Pesquisar mensagens em</span>
            <strong>Chat Geral</strong>
          </div>
        </div>
      ) : null}
      {query.trim() && !results.length ? (
        <div className="chat-side-search-empty">
          <Search size={34} />
          <div>
            <span>Nenhuma mensagem encontrada</span>
            <strong>{query}</strong>
          </div>
        </div>
      ) : null}
      {results.length ? (
        <div className="chat-side-search-results">
          {results.map((message) => (
            <article key={message.id}>
              <ChatAvatar avatar={message.avatar} name={message.author} />
              <div>
                <strong>{message.author}</strong>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function MemberGroup({ title, members }: { title: string; members: DetailMember[] }) {
  return (
    <section className="member-group">
      <h3>{title}</h3>
      {members.map((member) => (
        <div className="detail-member" key={member.id}>
          <ChatAvatar avatar={member.avatar} name={member.name} status={member.status} />
          <span>{member.name}</span>
          {member.admin ? <em className="p6-admin-badge">ADMINISTRADOR</em> : null}
          <div className="detail-member-actions">
            <button type="button" aria-label={`Mensagem para ${member.name}`}>
              <MessageCircle size={15} />
            </button>
            <button type="button" aria-label={`Mais ações de ${member.name}`}>
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
