import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "../../data/chatData";
import { createThreadMessage } from "../../lib/communityApi";
import { ChatAvatar } from "./ChatAvatar";
import { ChatComposer } from "./ChatComposer";

export function ChatThreadPanel({
  parent,
  messages,
  onClose,
}: {
  parent: ChatMessage;
  messages: ChatMessage[];
  onClose: () => void;
}) {
  const [localReplies, setLocalReplies] = useState<ChatMessage[]>([]);
  const replies = useMemo(
    () => [...messages.filter((message) => message.parentId === parent.id), ...localReplies],
    [localReplies, messages, parent.id],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function sendReply(body: string) {
    const optimistic: ChatMessage = {
      id: `thread-local-${Date.now()}`,
      parentId: parent.id,
      author: "Vitor Santos Araujo",
      authorUsername: "vitor-araujo",
      time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      createdAt: new Date().toISOString(),
      avatar: "VA",
      text: body,
    };

    setLocalReplies((current) => [...current, optimistic]);

    try {
      const saved = await createThreadMessage(body, parent.id);
      setLocalReplies((current) => current.map((reply) => (reply.id === optimistic.id ? saved : reply)));
    } catch {
      setLocalReplies((current) => current.map((reply) => (reply.id === optimistic.id ? { ...reply, highlighted: true } : reply)));
    }
  }

  return (
    <aside className="details-panel thread-panel" aria-label="Thread da mensagem">
      <header className="thread-header">
        <h2>Thread</h2>
        <button type="button" aria-label="Fechar thread" onClick={onClose}>
          <X size={19} />
        </button>
      </header>
      <div className="thread-scroll">
        <ThreadMessage message={parent} />
        {replies.length ? (
          <div className="thread-replies">
            {replies.map((reply) => <ThreadMessage message={reply} key={reply.id} />)}
          </div>
        ) : null}
      </div>
      <div className="thread-composer-wrap">
        <ChatComposer onSend={sendReply} compact />
      </div>
    </aside>
  );
}

function ThreadMessage({ message }: { message: ChatMessage }) {
  return (
    <article className="thread-message">
      <ChatAvatar avatar={message.avatar} name={message.author} />
      <div>
        <div className="thread-message-author">
          <strong>{message.author}</strong>
          {message.createdAt ? <span>{formatThreadDate(message.createdAt)}</span> : null}
        </div>
        {message.text.split("\n").map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}
      </div>
    </article>
  );
}

function formatThreadDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
