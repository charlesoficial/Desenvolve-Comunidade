import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef } from "react";
import { chatMenuSections } from "../../data/chatData";

type ChatView = "feed" | "chat" | "politica" | "members" | "progress" | "leaderboard" | "courses" | "events" | "hackingTec";

type Props = {
  activeView: ChatView;
  currentPath: string;
  onNavigate: (view: ChatView, path?: string) => void;
};

const activeSidebarItemByView: Partial<Record<ChatView, string>> = {
  feed: "feed-geral",
  chat: "chat-geral",
  members: "membros",
  progress: "progresso",
  courses: "gravadas",
  events: "agenda",
  politica: "politica-nacional",
  hackingTec: "hacking-tec",
};

export function ChatSidebar({ activeView, currentPath, onNavigate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const activeItem = container?.querySelector<HTMLElement>(".chat-menu-item.active");
    if (!container || !activeItem) return;

    const itemTop = activeItem.offsetTop;
    const itemBottom = itemTop + activeItem.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (itemTop < viewTop || itemBottom > viewBottom) {
      container.scrollTo({
        top: Math.max(0, itemTop - container.clientHeight / 2 + activeItem.offsetHeight / 2),
      });
    }
  }, [activeView]);

  const activeItemId = activeSidebarItemByView[activeView];

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-scroll" ref={scrollRef}>
        {chatMenuSections.map((section) => (
          <section className="chat-menu-section" key={section.id}>
            {section.title ? (
              <div className="chat-menu-heading">
                <span>{section.title}</span>
                {section.menu ? <MoreHorizontal size={18} /> : null}
              </div>
            ) : null}
            <div className="chat-menu-items">
              {section.items.map((item) => {
                const Icon = item.icon;
                const itemPath = item.path?.replace(/\/$/, "") || "";
                const isActive = itemPath ? itemPath === currentPath : item.id === activeItemId;
                return (
                  <button
                    className={`chat-menu-item p6-sidebar-item ${isActive ? "active" : ""}`}
                    type="button"
                    key={item.id}
                    onClick={() => item.view && onNavigate(item.view, item.path)}
                  >
                    {item.asset ? (
                      <img className="chat-menu-asset-icon" src={item.asset} alt="" aria-hidden="true" />
                    ) : Icon ? (
                      <Icon size={18} strokeWidth={2} />
                    ) : null}
                    <span>{item.label}</span>
                    {item.unreadCount ? <em className="chat-menu-badge">{item.unreadCount}</em> : null}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
