import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { archiveNotification, loadNotifications, markAllNotificationsRead, type CommunityNotification } from "../../lib/communityApi";

export function NotificationsPanel({ onUnreadChange }: { onUnreadChange?: (count: number) => void }) {
  const [items, setItems] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const rows = await loadNotifications();
      setItems(rows);
      onUnreadChange?.(unreadCount(rows));
    } catch {
      setError(true);
      setItems([]);
      onUnreadChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  async function markAll() {
    await markAllNotificationsRead().catch(() => undefined);
    const timestamp = new Date().toISOString();
    setItems((current) => current.map((item) => item.archived ? item : { ...item, readAt: item.readAt || timestamp }));
    onUnreadChange?.(0);
  }

  async function archive(id: string) {
    setItems((current) => {
      const next = current.map((item) => item.id === id ? { ...item, archived: true } : item);
      onUnreadChange?.(unreadCount(next));
      return next;
    });
    await archiveNotification(id).catch(() => undefined);
  }

  return (
    <section className="notifications-panel native-notifications-panel" aria-label="Notificações">
      <header className="topbar-panel-header">
        <h2>Notificações</h2>
        <button type="button" onClick={markAll}>Marcar todas como lidas</button>
      </header>
      <div className="notifications-list">
        {loading ? <div className="notifications-empty-state"><h3>Carregando notificações</h3><p>Buscando suas atualizações.</p></div> : null}
        {!loading && error ? <div className="notifications-empty-state"><h3>Não foi possível carregar</h3><p>Tente novamente em instantes.</p></div> : null}
        {!loading && !error ? items.filter((item) => !item.archived).map((item) => (
          <article className={item.readAt ? "notification-row" : "notification-row unread"} key={item.id}>
            <span className="notification-icon"><Bell size={16} /></span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <time dateTime={item.createdAt}>{new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(item.createdAt))}</time>
            </div>
            <button type="button" onClick={() => archive(item.id)}>Arquivar</button>
          </article>
        )) : null}
        {!loading && !error && !items.filter((item) => !item.archived).length ? (
          <div className="notifications-empty-state"><h3>Sem notificações</h3><p>Novas atividades aparecerão aqui.</p></div>
        ) : null}
      </div>
    </section>
  );
}

function unreadCount(items: CommunityNotification[]) {
  return items.filter((item) => !item.archived && !item.readAt).length;
}
