import { Bookmark, MessageCircle, MoreHorizontal, Smile } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../../data/chatData";
import { ChatAvatar } from "./ChatAvatar";

type Props = {
  message: ChatMessage;
  onOpenThread: (message: ChatMessage) => void;
};

type RenderItem =
  | { type: "divider"; id: string; label: string }
  | { type: "message"; message: ChatMessage };

const quickReactions = ["👍", "❤️", "🎉", "🤣", "😮", "😰", "🙏"];

export function ChatMessageRow({ message, onOpenThread }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setReactionOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={`chat-message-row p6-message-row ${message.highlighted ? "highlighted is-highlighted" : ""}`}
      onMouseLeave={() => {
        setMenuOpen(false);
        setReactionOpen(false);
      }}
    >
      <ChatAvatar avatar={message.avatar} name={message.author} />
      <div className="chat-message-content">
        <div className="chat-message-author">
          <strong>{message.author}</strong>
          {message.time ? <span>{message.time}</span> : null}
        </div>
        {message.text.split("\n").map((line, index) => (
          <p key={`${message.id}-${index}`}>{line}</p>
        ))}
        {reaction ? <button className="message-reaction-pill" type="button">{reaction}</button> : null}
      </div>
      <FloatingMessageActions
        saved={saved}
        onReact={() => {
          setReactionOpen((current) => !current);
          setMenuOpen(false);
        }}
        onSave={() => setSaved((current) => !current)}
        onOpenThread={() => onOpenThread(message)}
        onMore={() => {
          setMenuOpen((current) => !current);
          setReactionOpen(false);
        }}
      />
      {reactionOpen ? <ReactionBar onPick={(emoji) => { setReaction(emoji); setReactionOpen(false); }} /> : null}
      {menuOpen ? <MessageActionMenu onOpenThread={() => onOpenThread(message)} onCopy={() => navigator.clipboard?.writeText(message.text)} /> : null}
    </div>
  );
}

function FloatingMessageActions({
  saved,
  onReact,
  onSave,
  onOpenThread,
  onMore,
}: {
  saved: boolean;
  onReact: () => void;
  onSave: () => void;
  onOpenThread: () => void;
  onMore: () => void;
}) {
  return (
    <div className="message-float-actions" aria-label="Ações da mensagem">
      <button type="button" aria-label="Reagir com emoji" data-tooltip="Reagir" onClick={onReact}>
        <Smile size={16} />
      </button>
      <button className={saved ? "is-saved" : ""} type="button" aria-label="Salvar mensagem" data-tooltip="Salvar" onClick={onSave}>
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </button>
      <button type="button" aria-label="Responder em thread" data-tooltip="Responder em thread" onClick={onOpenThread}>
        <MessageCircle size={16} />
      </button>
      <button type="button" aria-label="Mais opções da mensagem" data-tooltip="Mais" onClick={onMore}>
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}

function ReactionBar({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="message-reaction-bar" role="menu" aria-label="Reações rápidas">
      {quickReactions.map((emoji) => (
        <button type="button" role="menuitem" key={emoji} onClick={() => onPick(emoji)}>{emoji}</button>
      ))}
    </div>
  );
}

function MessageActionMenu({ onOpenThread, onCopy }: { onOpenThread: () => void; onCopy: () => void }) {
  return (
    <div className="message-action-menu" role="menu" aria-label="Mais opções da mensagem">
      <button type="button" role="menuitem" onClick={onCopy}>Copiar texto</button>
      <button type="button" role="menuitem" onClick={onOpenThread}>Responder</button>
      <button type="button" role="menuitem">Denunciar</button>
    </div>
  );
}

export function ChatMessages({ messages, onOpenThread }: { messages: ChatMessage[]; onOpenThread: (message: ChatMessage) => void }) {
  const endRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => groupMessagesByDay(messages), [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="chat-messages">
      {items.map((item) =>
        item.type === "divider" ? (
          <div className="chat-day-divider" key={item.id}>
            <span />
            <strong>{item.label}</strong>
            <span />
          </div>
        ) : (
          <ChatMessageRow message={item.message} key={item.message.id} onOpenThread={onOpenThread} />
        ),
      )}
      <div className="chat-composer-spacer" aria-hidden="true" />
      <div ref={endRef} />
    </div>
  );
}

function groupMessagesByDay(messages: ChatMessage[]): RenderItem[] {
  return messages.reduce<RenderItem[]>((items, message, index) => {
    const key = message.createdAt ? dateKey(message.createdAt) : "sem-data";
    const previous = messages[index - 1];
    const previousKey = previous?.createdAt ? dateKey(previous.createdAt) : undefined;

    if (index > 0 && key !== previousKey) {
      items.push({ type: "divider", id: `divider-${key}-${message.id}`, label: formatDividerLabel(message.createdAt) });
    }

    items.push({ type: "message", message });
    return items;
  }, []);
}

function dateKey(value: string) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function formatDividerLabel(value?: string) {
  if (!value) return "";

  const current = new Date(value);
  const today = dateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateKey(yesterdayDate.toISOString());
  const currentKey = dateKey(value);

  if (currentKey === today) return "HOJE";
  if (currentKey === yesterday) return "ONTEM";

  const month = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" })
    .format(current)
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();

  return `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" }).format(current)} DE ${month}.`;
}
