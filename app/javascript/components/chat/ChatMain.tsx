import { ArrowRightFromLine, MessageCircle, MoreHorizontal, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { ChatMessage } from "../../data/chatData";
import { createChatMessage, loadChatMessages, subscribeToChatMessages } from "../../lib/communityApi";
import type { ChatRightPanel } from "./ChatLayout";
import { ChatComposer } from "./ChatComposer";
import { ChatMessages } from "./ChatMessageRow";

type RoomAction = "ai" | "more" | null;
const emptyChatMessages: ChatMessage[] = [];

type ChatMainProps = {
  rightPanel: ChatRightPanel;
  onRightPanelChange: (panel: ChatRightPanel) => void;
  onOpenThread: (message: ChatMessage) => void;
  onMessagesChange: (messages: ChatMessage[]) => void;
  roomSlug?: string;
  title?: string;
  fallbackMessages?: ChatMessage[];
};

export function ChatMain({
  rightPanel,
  onRightPanelChange,
  onOpenThread,
  onMessagesChange,
  roomSlug = "chat-geral",
  title = "Chat Geral",
  fallbackMessages = emptyChatMessages,
}: ChatMainProps) {
  const [activeAction, setActiveAction] = useState<RoomAction>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => fallbackMessages);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function refreshMessages() {
      try {
        const nextMessages = await loadChatMessages(roomSlug);
        const resolvedMessages = nextMessages.length ? nextMessages : fallbackMessages;
        if (!ignore) {
          setMessages(resolvedMessages);
          onMessagesChange(resolvedMessages);
          setLoadError(false);
        }
      } catch {
        if (!ignore) {
          setMessages(fallbackMessages);
          onMessagesChange(fallbackMessages);
          setLoadError(true);
        }
      }
    }

    refreshMessages();
    const refreshTimer = window.setInterval(refreshMessages, 4500);
    const unsubscribeRealtime = subscribeToChatMessages(refreshMessages);

    return () => {
      ignore = true;
      unsubscribeRealtime();
      window.clearInterval(refreshTimer);
    };
  }, [fallbackMessages, onMessagesChange, roomSlug]);

  function toggleAction(action: Exclude<RoomAction, null>) {
    setActiveAction((current) => (current === action ? null : action));
  }

  async function handleSendMessage(body: string) {
    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      author: "Vitor Santos Araujo",
      authorUsername: "vitor-araujo",
      time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      createdAt: new Date().toISOString(),
      avatar: "VA",
      text: body,
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      const savedMessage = await createChatMessage(body, roomSlug);
      setMessages((current) => {
        const next = current.map((message) => (message.id === optimisticMessage.id ? savedMessage : message));
        onMessagesChange(next);
        return next;
      });
    } catch {
      setMessages((current) => current.map((message) => (message.id === optimisticMessage.id ? { ...message, highlighted: true } : message)));
    }
  }

  return (
    <main className={rightPanel ? "chat-main" : "chat-main is-full-width"}>
      <div className="chat-room-header">
        <div className="chat-room-title">
          <MessageCircle size={22} />
          <h1>{title}</h1>
        </div>
        <div className="chat-room-actions">
          <button
            aria-expanded={activeAction === "ai"}
            className={`ai-button ${activeAction === "ai" ? "active" : ""}`}
            type="button"
            aria-label="Resumir"
            onClick={() => toggleAction("ai")}
          >
            <Sparkles size={21} fill="currentColor" />
          </button>
          <button
            aria-expanded={rightPanel === "search"}
            className={rightPanel === "search" ? "active" : ""}
            type="button"
            aria-label="Pesquisar mensagens"
            onClick={() => {
              setActiveAction(null);
              onRightPanelChange(rightPanel === "search" ? "details" : "search");
            }}
          >
            <Search size={21} />
          </button>
          <button
            aria-expanded={rightPanel !== null}
            className={rightPanel === null ? "is-collapsed" : ""}
            type="button"
            aria-label={rightPanel ? "Recolher a barra lateral" : "Abrir a barra lateral"}
            onClick={() => {
              setActiveAction(null);
              onRightPanelChange(rightPanel ? null : "details");
            }}
          >
            <ArrowRightFromLine size={21} />
          </button>
          <button
            aria-expanded={activeAction === "more"}
            className={activeAction === "more" ? "active" : ""}
            type="button"
            aria-label="Mais"
            onClick={() => toggleAction("more")}
          >
            <MoreHorizontal size={21} />
          </button>
          {activeAction ? <RoomActionPopover action={activeAction} /> : null}
        </div>
      </div>
      <div className="chat-scroll">
        {loadError ? <div className="chat-load-error">Não foi possível atualizar o chat agora.</div> : null}
        <ChatMessages messages={messages.filter((message) => !message.parentId)} onOpenThread={onOpenThread} />
      </div>
      <ChatComposer onSend={handleSendMessage} />
    </main>
  );
}

function RoomActionPopover({ action }: { action: Exclude<RoomAction, null> }) {
  if (action === "ai") {
    return (
      <div className="room-action-popover room-menu-popover room-ai-popover">
        <button type="button"><Sparkles size={15} /> Resumir mensagens</button>
        <button type="button">Resumir não lidas</button>
        <button type="button">Encontrar decisões</button>
      </div>
    );
  }

  return (
    <div className="room-action-popover room-menu-popover">
      <button type="button">Seguir</button>
      <button type="button">Silenciar notificações</button>
      <button type="button">Copiar link</button>
      <button type="button">Denunciar</button>
    </div>
  );
}
