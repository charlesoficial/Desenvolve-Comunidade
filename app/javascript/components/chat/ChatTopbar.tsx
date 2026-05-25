import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  Clock3,
  Edit3,
  ExternalLink,
  Link2,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { IconButton, SearchInput } from "../../design-system";
import { clearStoredAuthSession } from "../../lib/auth";
import {
  archiveNotification,
  loadAccountSettings,
  loadNotifications,
  loadViewerProfileSummary,
  markAllNotificationsRead,
  saveAccountSettings,
  searchCommunity,
  uploadProfileAvatar,
} from "../../lib/communityApi";
import type { AccountNotificationKey, AccountSettings, CommunityNotification, CommunitySearchResult, ViewerProfileSummary } from "../../lib/communityApi";

const nav = ["Home", "Cursos", "Aulas", "Membros", "Ranking"];
type TopbarOverlay = "notifications" | "dms" | "connections" | "favorites" | "profile" | null;
type DmTab = "inbox" | "unread" | "agents";
type ConnectionsTab = "discover" | "mine";
type ChatView = "feed" | "chat" | "politica" | "members" | "progress" | "leaderboard" | "courses" | "events" | "hackingTec";

const avatars = {
  night: "/community-assets/Cindy.jpeg-33fa075ae954.jpg",
  livy: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg",
  lulu: "/community-assets/IMG_7929.jpeg-ecc736f53778.jpg",
  cabritinho: "/community-assets/photo_2025-12-05_16-06-52-9c0423940f33.jpg",
};

export function ChatTopbar({ activeView = "feed", onNavigate }: { activeView?: ChatView; onNavigate?: (view: ChatView, path?: string) => void }) {
  const [activeOverlay, setActiveOverlay] = useState<TopbarOverlay>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState<AccountSettingsTab>("profile");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewerSummary, setViewerSummary] = useState<ViewerProfileSummary | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const topbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!topbarRef.current?.contains(event.target as Node)) {
        setActiveOverlay(null);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveOverlay(null);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    function openSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveOverlay(null);
        setShowSearchModal(true);
      }
    }

    document.addEventListener("keydown", openSearch);
    return () => document.removeEventListener("keydown", openSearch);
  }, []);

  useEffect(() => {
    let alive = true;
    loadViewerProfileSummary().then((summary) => {
      if (alive) setViewerSummary(summary);
    }).catch(() => {
      if (alive) setViewerSummary(null);
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    loadNotifications().then((rows) => {
      if (alive) setNotificationCount(unreadNotificationCount(rows));
    }).catch(() => {
      if (alive) setNotificationCount(0);
    });

    return () => { alive = false; };
  }, []);

  function toggleOverlay(overlay: Exclude<TopbarOverlay, null>) {
    setActiveOverlay((current) => (current === overlay ? null : overlay));
  }

  function signOut() {
    clearStoredAuthSession();
    setActiveOverlay(null);
    const url = new URL(window.location.href);
    url.searchParams.set("v", "login");
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const topbarAvatar = viewerSummary?.avatar || "VA";

  return (
    <header className="chat-topbar" ref={topbarRef}>
      <div className="chat-brand">
        <img className="cs-logo" src="/community-assets/rji72k58i9o4ujxgb0n0wqpf12pf-b4d4c257bd35.png" alt="Comunidade" />
        <ChevronDown size={15} />
      </div>

      <nav className="chat-nav" aria-label="Navegação principal">
        {nav.map((item) => (
          <button
            className={`cs-nav-pill ${navItemIsActive(item, activeView) ? "active" : ""}`}
            key={item}
            type="button"
            onClick={() => {
              if (item === "Membros") onNavigate?.("members");
              if (item === "Home") onNavigate?.("feed");
              if (item === "Ranking") onNavigate?.("leaderboard");
              if (item === "Cursos") onNavigate?.("courses");
              if (item === "Aulas") onNavigate?.("events");
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="chat-top-actions">
        <IconButton
          aria-label="Pesquisar"
          className="mobile-search-trigger"
          onClick={() => {
            setActiveOverlay(null);
            setShowSearchModal(true);
          }}
        >
          <Search size={17} />
        </IconButton>
        <SearchInput
          className="chat-search"
          label="Pesquisar no topo"
          onFocus={() => { setActiveOverlay(null); setShowSearchModal(true); }}
          onMouseDown={(event) => {
            event.preventDefault();
            setActiveOverlay(null);
            setShowSearchModal(true);
          }}
        />
        <IconButton
          aria-expanded={activeOverlay === "notifications"}
          aria-label="Notificações"
          className={activeOverlay === "notifications" ? "topbar-trigger active" : "topbar-trigger"}
          onClick={() => toggleOverlay("notifications")}
        >
          <Bell size={16} />
          {notificationCount > 0 ? <span className="topbar-notification-badge">{notificationCount > 9 ? "9+" : notificationCount}</span> : null}
        </IconButton>
        <IconButton
          aria-expanded={activeOverlay === "dms"}
          aria-label="Mensagens"
          className={activeOverlay === "dms" ? "topbar-trigger active" : "topbar-trigger"}
          onClick={() => toggleOverlay("dms")}
        >
          <MessageCircle size={17} />
        </IconButton>
        <IconButton
          aria-expanded={activeOverlay === "connections"}
          aria-label="Conexões"
          className={activeOverlay === "connections" ? "topbar-trigger active" : "topbar-trigger"}
          onClick={() => toggleOverlay("connections")}
        >
          <UserRoundPlus size={16} />
        </IconButton>
        <IconButton
          aria-expanded={activeOverlay === "favorites"}
          aria-label="Salvos"
          className={activeOverlay === "favorites" ? "topbar-trigger active" : "topbar-trigger"}
          onClick={() => toggleOverlay("favorites")}
        >
          <Bookmark size={16} />
        </IconButton>
        <button
          aria-expanded={activeOverlay === "profile"}
          className="va-avatar cs-avatar"
          type="button"
          aria-label="Perfil"
          onClick={() => toggleOverlay("profile")}
        >
          {topbarAvatar.startsWith("/") || topbarAvatar.startsWith("http")
            ? <img className="topbar-avatar-img" src={topbarAvatar} alt="" />
            : topbarAvatar.slice(0, 2)}
        </button>
        {activeOverlay === "profile" ? (
          <ProfileMenu
            onEditProfile={() => { setActiveOverlay(null); setAccountInitialTab("profile"); setShowAccountSettings(true); }}
            onNotifications={() => { setActiveOverlay(null); setAccountInitialTab("notifications"); setShowAccountSettings(true); }}
            onViewProfile={() => { setActiveOverlay(null); setShowProfileModal(true); }}
            onSignOut={signOut}
          />
        ) : null}
        {activeOverlay === "favorites" ? <FavoritesPanel /> : null}
        {activeOverlay === "connections" ? <ConnectionsPanel onClose={() => setActiveOverlay(null)} /> : null}
        {activeOverlay === "dms" ? <DmsPanel /> : null}
        {activeOverlay === "notifications" ? <NotificationsPanel onUnreadChange={setNotificationCount} /> : null}
      </div>
      {showProfileModal ? <ViewerProfileModal onClose={() => setShowProfileModal(false)} /> : null}
      {showAccountSettings ? <AccountSettingsModal initialTab={accountInitialTab} onClose={() => setShowAccountSettings(false)} /> : null}
      {showSearchModal ? (
        <GlobalSearchModal
          onClose={() => setShowSearchModal(false)}
          onNavigate={(result) => {
            setShowSearchModal(false);
            if (result.path) {
              window.history.pushState({}, "", result.path);
              window.dispatchEvent(new PopStateEvent("popstate"));
              return;
            }
            if (result.targetView) onNavigate?.(result.targetView);
          }}
        />
      ) : null}
    </header>
  );
}

function navItemIsActive(item: string, activeView: ChatView) {
  if (item === "Home") return activeView === "feed" || activeView === "chat" || activeView === "progress" || activeView === "politica";
  if (item === "Cursos") return activeView === "courses";
  if (item === "Aulas") return activeView === "events";
  if (item === "Membros") return activeView === "members";
  if (item === "Ranking") return activeView === "leaderboard";
  return false;
}

function GlobalSearchModal({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (result: CommunitySearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommunitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      searchCommunity(query)
        .then((rows) => {
          if (alive) setResults(rows);
        })
        .catch(() => {
          if (alive) setResults([]);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 180);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return createPortal(
    <div
      className="global-search-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="global-search-modal" role="dialog" aria-modal="true" aria-label="Pesquisar na comunidade">
        <div className="global-search-input">
          <Search size={21} />
          <input ref={inputRef} value={query} placeholder="Pesquisar na comunidade" onChange={(event) => setQuery(event.target.value)} />
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="global-search-body">
          {!query.trim() ? (
            <p>Pesquisar na comunidade</p>
          ) : loading ? (
            <p>Pesquisando...</p>
          ) : results.length ? (
            <div className="global-search-results">
              {results.map((result) => (
                <button
                  type="button"
                  key={result.id}
                  onClick={() => onNavigate(result)}
                >
                  <SearchAvatar value={result.avatar} title={result.title} />
                  <span>
                    <strong>{result.title}</strong>
                    <small>{result.subtitle}</small>
                  </span>
                  <em>{searchTypeLabel(result.type)}</em>
                </button>
              ))}
            </div>
          ) : (
            <p>Nenhum resultado encontrado</p>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function SearchAvatar({ title, value }: { title: string; value: string }) {
  const isImage = value.startsWith("/") || value.startsWith("http") || value.startsWith("data:");
  if (isImage) return <img className="global-search-avatar" src={value} alt="" />;
  return <span className="global-search-avatar">{value.slice(0, 2).toUpperCase() || title.slice(0, 2).toUpperCase()}</span>;
}

function searchTypeLabel(type: CommunitySearchResult["type"]) {
  return {
    member: "Membro",
    post: "Publicação",
    space: "Espaço",
    course: "Curso",
    lesson: "Aula",
  }[type];
}

function ProfileMenu({
  onEditProfile,
  onNotifications,
  onSignOut,
  onViewProfile,
}: {
  onEditProfile: () => void;
  onNotifications: () => void;
  onSignOut: () => void;
  onViewProfile: () => void;
}) {
  return (
    <div className="topbar-menu profile-popover" role="menu" aria-label="Menu do perfil">
      <button type="button" role="menuitem" onClick={onViewProfile}><UserRound size={18} /> Ver perfil</button>
      <button type="button" role="menuitem" onClick={onEditProfile}><Edit3 size={18} /> Editar perfil</button>
      <button type="button" role="menuitem" onClick={onNotifications}><Bell size={18} /> Notificações</button>
      <div className="topbar-menu-separator" />
      <button type="button" role="menuitem" onClick={onSignOut}><LogOut size={18} /> Sair</button>
    </div>
  );
}

type ProfileTab = "about" | "posts" | "comments" | "spaces" | "rewards";

const fallbackProfile: ViewerProfileSummary = {
  id: "vitor-araujo",
  username: "vitor-araujo",
  name: "Vítor Santos Araujo",
  avatar: "VA",
  lastSeen: "Visto pela última vez há 3 minutos",
  joinedAt: "26 de abril de 2026",
  level: 1,
  points: 0,
  pointsToNextLevel: 10,
  posts: 0,
  comments: 0,
  spaces: 26,
  rewards: 0,
  tags: ["p6 Goat"],
};

function ViewerProfileModal({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState<ViewerProfileSummary>(fallbackProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>("about");

  useEffect(() => {
    let alive = true;
    loadViewerProfileSummary().then((summary) => {
      if (alive) setProfile(summary);
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="viewer-profile-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="viewer-profile-modal" role="dialog" aria-modal="true" aria-label="Perfil">
        <header className="viewer-profile-header">
          <h2>Perfil</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="viewer-profile-body">
          <aside className="viewer-profile-aside">
            <div className="viewer-profile-aside-main">
              <div className="viewer-profile-avatar-wrap">
                <ViewerAvatar profile={profile} size="large" />
                <span>{profile.level}</span>
              </div>
              <h3>{profile.name}</h3>
              <p><Clock3 size={16} /> {profile.lastSeen}</p>
              <p><CalendarDays size={16} /> Membro desde {profile.joinedAt}</p>
              <div className="viewer-profile-tags centered">
                {profile.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="viewer-profile-actions">
                <button type="button">Editar</button>
                <button type="button" aria-label="Copiar link"><Link2 size={20} /></button>
              </div>
            </div>
          </aside>
          <section className="viewer-profile-content">
            <nav className="viewer-profile-tabs" aria-label="Perfil">
              <button className={activeTab === "about" ? "active" : ""} type="button" onClick={() => setActiveTab("about")}>Sobre</button>
              <button className={activeTab === "posts" ? "active" : ""} type="button" onClick={() => setActiveTab("posts")}>Publicações</button>
              <button className={activeTab === "comments" ? "active" : ""} type="button" onClick={() => setActiveTab("comments")}>Comentários</button>
              <button className={activeTab === "spaces" ? "active" : ""} type="button" onClick={() => setActiveTab("spaces")}>Espaços <span>{profile.spaces}</span></button>
              <button className={activeTab === "rewards" ? "active" : ""} type="button" onClick={() => setActiveTab("rewards")}>Recompensas</button>
            </nav>
            <div className="viewer-profile-panel">
              {activeTab === "about" ? <ViewerProfileAbout profile={profile} /> : <ViewerProfileEmpty tab={activeTab} />}
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ViewerProfileAbout({ profile }: { profile: ViewerProfileSummary }) {
  return (
    <>
      <div className="viewer-profile-level">
        <Trophy size={13} fill="currentColor" />
        <b>{profile.level}</b>
        <i />
        <strong>Level {profile.level}</strong>
      </div>
      <p className="viewer-profile-points">
        {profile.points} ponto{profile.points === 1 ? "" : "s"} <span>•</span> {profile.pointsToNextLevel} para subir de nível
      </p>
      <section className="viewer-profile-section">
        <h4>Tags</h4>
        <div className="viewer-profile-tags">
          {profile.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </section>
    </>
  );
}

function ViewerProfileEmpty({ tab }: { tab: ProfileTab }) {
  const label = {
    posts: "As publicações deste membro serão exibidas aqui.",
    comments: "Os comentários deste membro serão exibidos aqui.",
    spaces: "Os espaços deste membro serão exibidos aqui.",
    rewards: "As recompensas deste membro serão exibidas aqui.",
    about: "",
  }[tab];

  return <div className="viewer-profile-empty"><p>{label}</p></div>;
}

function ViewerAvatar({ profile, size }: { profile: ViewerProfileSummary; size: "large" | "small" }) {
  const isImage = profile.avatar.startsWith("/") || profile.avatar.startsWith("http") || profile.avatar.startsWith("data:");
  const className = size === "large" ? "viewer-avatar-lg" : "viewer-avatar-sm";
  if (isImage) return <img className={className} src={profile.avatar} alt="" />;
  return <span className={className}>{profile.avatar.slice(0, 2)}</span>;
}

type AccountSettingsTab = "profile" | "notifications" | "privacy";

const accountNotificationRows: Array<{ key: AccountNotificationKey; label: string }> = [
  { key: "post_comments", label: "Comentários nas minhas publicações" },
  { key: "comment_replies", label: "Respostas aos meus comentários" },
  { key: "mentions", label: "Menções" },
  { key: "dms", label: "DMs" },
  { key: "weekly_digest", label: "Resumo semanal às quintas-feiras" },
  { key: "post_likes", label: "Curtidas nas minhas publicações" },
  { key: "comment_likes", label: "Curtidas nos meus comentários" },
  { key: "live_rooms", label: "Transmissões ao vivo/salas" },
  { key: "course_content", label: "Novo conteúdo do curso" },
  { key: "polls", label: "Enquetes" },
];

const fallbackAccountSettings: AccountSettings = {
  id: "vitor-araujo",
  username: "vitor-araujo",
  name: "Vítor Santos Araujo",
  avatarUrl: null,
  timezone: "(GMT -03:00) Brasilia",
  language: "Português (Brasil)",
  headline: "",
  bio: "",
  location: "",
  links: { website: "", twitter: "", facebook: "", instagram: "", linkedin: "" },
  emailUpdates: true,
  notifications: Object.fromEntries(accountNotificationRows.map(({ key }, index) => [
    key,
    {
      email: index < 5 || key === "course_content",
      platform: !["dms", "weekly_digest"].includes(key),
    },
  ])) as AccountSettings["notifications"],
  privacy: { showInDirectory: true, preventMessages: false },
};

function AccountSettingsModal({ initialTab = "profile", onClose }: { initialTab?: AccountSettingsTab; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<AccountSettingsTab>(initialTab);
  const [initialSettings, setInitialSettings] = useState<AccountSettings>(fallbackAccountSettings);
  const [settings, setSettings] = useState<AccountSettings>(fallbackAccountSettings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    loadAccountSettings().then((loaded) => {
      if (!alive) return;
      setInitialSettings(loaded);
      setSettings(loaded);
    });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function cancel() {
    setSettings(initialSettings);
    onClose();
  }

  async function save() {
    const snapshot = collectAccountSettingsFromDom(settings);
    setSaving(true);
    try {
      const saved = await saveAccountSettings(snapshot);
      setInitialSettings(saved);
      setSettings(saved);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfileAvatar(file);
      setSettings((current) => ({ ...current, avatarUrl: url }));
    } finally {
      setUploading(false);
    }
  }

  return createPortal(
    <div className="account-settings-backdrop">
      <button className="account-settings-close" type="button" aria-label="Fechar" onClick={onClose}><X size={20} /></button>
      <section className="account-settings-modal" role="dialog" aria-modal="true" aria-label="Configurações da conta">
        <header className="account-settings-header">
          <h2>Configurações da conta</h2>
          <nav aria-label="Configurações da conta">
            {[
              ["profile", "Perfil"],
              ["notifications", "Notificações"],
              ["privacy", "Privacidade"],
            ].map(([key, label]) => (
              <button
                className={activeTab === key ? "active" : ""}
                key={key}
                type="button"
                onClick={() => setActiveTab(key as AccountSettingsTab)}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>
        <main className="account-settings-scroll">
          {activeTab === "profile" ? (
            <AccountProfileTab
              fileRef={fileRef}
              onAvatarUpload={handleAvatarUpload}
              settings={settings}
              uploading={uploading}
            />
          ) : null}
          {activeTab === "notifications" ? <AccountNotificationsTab settings={settings} setSettings={setSettings} /> : null}
          {activeTab === "privacy" ? <AccountPrivacyTab settings={settings} setSettings={setSettings} /> : null}
        </main>
        <footer className="account-settings-footer">
          <div>
            {activeTab === "notifications" ? (
              <button
                className="account-danger-button"
                type="button"
                onClick={() => setSettings((current) => ({
                  ...current,
                  emailUpdates: false,
                  notifications: Object.fromEntries(accountNotificationRows.map(({ key }) => [key, { email: false, platform: false }])) as AccountSettings["notifications"],
                }))}
              >
                Desativar todas as notificações da comunidade
              </button>
            ) : <span />}
            <span className="account-footer-actions">
              {activeTab !== "notifications" ? <button className="account-cancel-button" type="button" onClick={cancel}>Cancelar</button> : null}
              <button className="account-save-button" type="button" onClick={save} disabled={saving || uploading}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </span>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function collectAccountSettingsFromDom(settings: AccountSettings): AccountSettings {
  const value = (name: string, fallback: string) => {
    const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`);
    return field?.value ?? fallback;
  };

  return {
    ...settings,
    name: value("account-name", settings.name),
    timezone: value("account-timezone", settings.timezone),
    language: value("account-language", settings.language),
    headline: value("account-headline", settings.headline),
    bio: value("account-bio", settings.bio),
    location: value("account-location", settings.location),
    links: {
      website: value("account-website", settings.links.website),
      twitter: value("account-twitter", settings.links.twitter),
      facebook: value("account-facebook", settings.links.facebook),
      instagram: value("account-instagram", settings.links.instagram),
      linkedin: value("account-linkedin", settings.links.linkedin),
    },
  };
}

function AccountProfileTab({
  fileRef,
  onAvatarUpload,
  settings,
  uploading,
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  onAvatarUpload: (file?: File) => void;
  settings: AccountSettings;
  uploading: boolean;
}) {
  return (
    <section className="account-settings-content account-profile-content">
      <h3>Perfil</h3>
      <div className="account-form" key={`${settings.id}-${settings.name}-${settings.headline}-${settings.bio}-${settings.location}`}>
        <div className="account-photo-row">
          <span>
            <label>Foto de perfil</label>
            <small>Tamanho recomendado: 300 x 300</small>
          </span>
          <button type="button" onClick={() => fileRef.current?.click()}>{uploading ? "Enviando..." : "Fazer upload de foto"}</button>
          <input
            ref={fileRef}
            accept="image/*"
            hidden
            type="file"
            onChange={(event) => onAvatarUpload(event.target.files?.[0])}
          />
        </div>
        <AccountField required label="Nome completo">
          <input name="account-name" defaultValue={settings.name} />
        </AccountField>
        <AccountField required label="Fuso horário">
          <select name="account-timezone" defaultValue={settings.timezone}>
            <option>(GMT -03:00) Brasilia</option>
            <option>(GMT -03:00) Buenos Aires</option>
            <option>(GMT -04:00) Santiago</option>
            <option>(GMT -05:00) Eastern Time (US & Canada)</option>
            <option>(GMT +00:00) UTC</option>
            <option>(GMT +01:00) London</option>
          </select>
        </AccountField>
        <AccountField required label="Idioma">
          <select name="account-language" defaultValue={settings.language}>
            <option>Inglês</option>
            <option>Francês</option>
            <option>Italiano</option>
            <option>Espanhol</option>
            <option>Português (Brasil)</option>
            <option>Português (Portugal)</option>
          </select>
        </AccountField>
        <AccountField label="Headline" info>
          <input name="account-headline" placeholder="Add your headline" defaultValue={settings.headline} />
        </AccountField>
        <AccountField label="Bio" info>
          <textarea name="account-bio" placeholder="Tell us a bit about yourself" defaultValue={settings.bio} />
        </AccountField>
        <AccountField label="Location" info>
          <input name="account-location" defaultValue={settings.location} />
        </AccountField>
        <div className="account-location-note">
          <Upload size={20} />
          <span>
            <strong>Atualize sua localidade para acessar mais recursos</strong>
            <p>Atualizamos nosso sistema de localização para oferecer melhores experiências na comunidade. Compartilhar sua localidade nos ajuda a personalizar sua experiência e, aos poucos, liberar novas funcionalidades relevantes para você.</p>
          </span>
        </div>
        <AccountField label="Website" info><input name="account-website" type="url" defaultValue={settings.links.website} /></AccountField>
        <AccountField label="Twitter URL" info><input name="account-twitter" type="url" defaultValue={settings.links.twitter} /></AccountField>
        <AccountField label="Facebook URL" info><input name="account-facebook" type="url" defaultValue={settings.links.facebook} /></AccountField>
        <AccountField label="Instagram URL" info><input name="account-instagram" type="url" defaultValue={settings.links.instagram} /></AccountField>
        <AccountField label="Linkedin URL" info><input name="account-linkedin" type="url" defaultValue={settings.links.linkedin} /></AccountField>
      </div>
    </section>
  );
}

function AccountField({ children, info, label, required }: { children: ReactNode; info?: boolean; label: string; required?: boolean }) {
  return (
    <label className="account-field">
      <span>{label}{required ? <b>*</b> : null}{info ? <i>?</i> : null}</span>
      {children}
    </label>
  );
}

function AccountNotificationsTab({ settings, setSettings }: { settings: AccountSettings; setSettings: Dispatch<SetStateAction<AccountSettings>> }) {
  const toggleNotification = (key: AccountNotificationKey, channel: "email" | "platform") => {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: {
          ...current.notifications[key],
          [channel]: !current.notifications[key][channel],
        },
      },
    }));
  };

  return (
    <section className="account-settings-content account-notifications-content">
      <h3>Notificações</h3>
      <h4>Preferências de e-mail</h4>
      <label className="account-checkbox-row">
        <AccountCheckbox checked={settings.emailUpdates} onChange={() => setSettings((current) => ({ ...current, emailUpdates: !current.emailUpdates }))} />
        <span>Ofertas, novidades e atualizações por e-mail</span>
      </label>
      <hr />
      <h4>Notificações da comunidade</h4>
      <div className="account-notification-grid">
        <strong>Nova atividade</strong>
        <span>E-mail</span>
        <span>Na<br />plataforma</span>
        {accountNotificationRows.map((row) => (
          <AccountNotificationRow
            key={row.key}
            label={row.label}
            email={settings.notifications[row.key].email}
            platform={settings.notifications[row.key].platform}
            onEmail={() => toggleNotification(row.key, "email")}
            onPlatform={() => toggleNotification(row.key, "platform")}
          />
        ))}
      </div>
    </section>
  );
}

function AccountNotificationRow({ email, label, onEmail, onPlatform, platform }: { email: boolean; label: string; onEmail: () => void; onPlatform: () => void; platform: boolean }) {
  return (
    <>
      <p>{label}</p>
      <AccountCheckbox checked={email} onChange={onEmail} />
      <AccountCheckbox checked={platform} onChange={onPlatform} />
    </>
  );
}

function AccountPrivacyTab({ settings, setSettings }: { settings: AccountSettings; setSettings: Dispatch<SetStateAction<AccountSettings>> }) {
  const togglePrivacy = (field: keyof AccountSettings["privacy"]) => {
    setSettings((current) => ({ ...current, privacy: { ...current.privacy, [field]: !current.privacy[field] } }));
  };

  return (
    <section className="account-settings-content account-privacy-content">
      <h3>Privacidade</h3>
      <h4>Visibilidade</h4>
      <label className="account-toggle-row">
        <AccountToggle checked={settings.privacy.showInDirectory} onChange={() => togglePrivacy("showInDirectory")} />
        <span>Mostrar meu perfil no diretório de membros <i>?</i></span>
      </label>
      <h4>Mensagens</h4>
      <label className="account-toggle-row">
        <AccountToggle checked={settings.privacy.preventMessages} onChange={() => togglePrivacy("preventMessages")} />
        <span>Impedir membros de me enviarem mensagens <i>?</i></span>
      </label>
      <h5>Membros bloqueados</h5>
      <div className="account-blocked-empty">
        <Users size={18} />
        <p>Nenhum membro bloqueado. Membros bloqueados não podem enviar mensagens para você.</p>
      </div>
    </section>
  );
}

function AccountCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button className={checked ? "account-checkbox checked" : "account-checkbox"} type="button" aria-pressed={checked} onClick={onChange}>
      {checked ? <Check size={12} strokeWidth={3} /> : null}
    </button>
  );
}

function AccountToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button className={checked ? "account-toggle checked" : "account-toggle"} type="button" aria-pressed={checked} onClick={onChange}>
      <span>{checked ? <Check size={12} strokeWidth={3} /> : null}</span>
    </button>
  );
}

function FavoritesPanel() {
  return (
    <div className="topbar-panel favorites-panel">
      <div className="topbar-panel-header topbar-panel-header-static">
        <h2>Favoritos</h2>
      </div>
      <div className="topbar-tabs" role="tablist" aria-label="Tipos de favoritos">
        {["Publicações", "Comentários", "Eventos", "Aulas", "Mensagens"].map((tab, index) => (
          <button className={index === 0 ? "active" : ""} key={tab} type="button" role="tab">
            {tab}
          </button>
        ))}
      </div>
      <div className="topbar-empty-state favorites-empty-state">
        <h3>Nenhuma publicação adicionada aos favoritos</h3>
        <p>Comece a adicionar publicações aos favoritos para mantê-las organizadas.</p>
      </div>
    </div>
  );
}

function ConnectionsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<ConnectionsTab>("discover");

  return (
    <div className="topbar-panel connections-panel">
      <div className="topbar-panel-header">
        <h2>Conexões</h2>
        <button className="topbar-close" type="button" aria-label="Fechar conexões" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="segmented-tabs" role="tablist" aria-label="Conexões">
        <button className={tab === "discover" ? "active" : ""} type="button" role="tab" onClick={() => setTab("discover")}>
          Discover
        </button>
        <button className={tab === "mine" ? "active" : ""} type="button" role="tab" onClick={() => setTab("mine")}>
          Minhas conexões
        </button>
      </div>
      <div className="connection-empty">
        <ConnectionIllustration />
        <h3>{tab === "discover" ? "Tudo em dia" : "Nenhuma conexão ainda"}</h3>
        <p>
          {tab === "discover"
            ? "Volte mais tarde para ver novas solicitações de conexão e recomendações. Explore o diretório de membros para descobrir mais pessoas"
            : "Conecte-se com os membros da comunidade para criar relacionamentos significativos e descobrir novas oportunidades de crescimento conjunto."}
        </p>
        <button className="outline-pill" type="button">Explorar membros</button>
      </div>
    </div>
  );
}

function ConnectionIllustration() {
  return (
    <div className="connection-illustration" aria-hidden="true">
      <div className="connection-card side-card left">
        <FigureAvatar className="is-blue" />
        <span className="figure-line short" />
        <span className="figure-line" />
      </div>
      <div className="connection-card main-card">
        <FigureAvatar className="is-peach is-online" />
        <span className="figure-line short" />
        <span className="figure-line" />
        <div><i /><i /><i /></div>
      </div>
      <div className="connection-card side-card right">
        <FigureAvatar className="is-gold" />
        <span className="figure-line short" />
        <span className="figure-line" />
      </div>
    </div>
  );
}

function DmsPanel() {
  const [tab, setTab] = useState<DmTab>("inbox");

  return (
    <div className="topbar-panel dms-panel">
      <div className="topbar-panel-header">
        <h2>DMs</h2>
        <div className="dms-header-actions">
          <button type="button" aria-label="Marcar tudo como lido"><ChevronsDown size={18} /></button>
          <button type="button" aria-label="Nova mensagem"><Plus size={20} /></button>
        </div>
      </div>
      <div className="topbar-tabs" role="tablist" aria-label="Mensagens diretas">
        <button className={tab === "inbox" ? "active" : ""} type="button" role="tab" onClick={() => setTab("inbox")} onMouseDown={() => setTab("inbox")}>Inbox</button>
        <button className={tab === "unread" ? "active" : ""} type="button" role="tab" onClick={() => setTab("unread")} onMouseDown={() => setTab("unread")}>Não lidas</button>
        <button className={tab === "agents" ? "active" : ""} type="button" role="tab" onClick={() => setTab("agents")} onMouseDown={() => setTab("agents")}><Sparkles size={14} fill="currentColor" /> Agentes</button>
      </div>
      {tab === "inbox" ? <DmInbox /> : null}
      {tab === "unread" ? <p className="center-message">Sem mensagens</p> : null}
      {tab === "agents" ? <DmAgents /> : null}
    </div>
  );
}

function DmInbox() {
  return (
    <button className="dm-row" type="button">
      <AvatarImage src={avatars.night} name="Night" />
      <span>
        <strong>Night</strong> <time>8 h</time>
        <small>Olá, Vítor Santos Araujo! Seja muito bem-vindo(a) a...</small>
      </span>
    </button>
  );
}

function DmAgents() {
  const agents = [
    { name: "Livy Seller", avatar: avatars.livy, text: "Estou aqui para te ajudar a vender no Facebook Marketplace" },
    { name: "Lulu Amazon", avatar: avatars.lulu, text: "Me pergunte qualquer coisa sobre o método Amazon aqui do p6!" },
    { name: "Cabritinho", avatar: avatars.cabritinho, text: "Olá, sou o cabritinho e estou aqui para te guiar no Comunidade" },
  ];

  return (
    <div className="agent-list">
      <p>Comece uma conversa com um agente:</p>
      {agents.map((agent) => (
        <button className="agent-card" key={agent.name} type="button">
          <AvatarImage src={agent.avatar} name={agent.name} />
          <span>
            <strong>{agent.name}</strong>
            <small>{agent.text}</small>
          </span>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>
  );
}

type NotificationTab = "inbox" | "mentions" | "following" | "all" | "archived";

const notificationTabs: Array<{ id: NotificationTab; label: string }> = [
  { id: "inbox", label: "Caixa de entrada" },
  { id: "mentions", label: "Menções" },
  { id: "following", label: "Seguindo" },
  { id: "all", label: "Todas" },
  { id: "archived", label: "Arquivadas" },
];

function NotificationsPanel({ onUnreadChange }: { onUnreadChange: (count: number) => void }) {
  const [tab, setTab] = useState<NotificationTab>("inbox");
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void Promise.resolve().then(async () => {
      if (!alive) return;
      setLoading(true);

      try {
        const rows = await loadNotifications();
        if (alive) {
          setNotifications(rows);
          onUnreadChange(unreadNotificationCount(rows));
        }
      } catch {
        if (alive) {
          setNotifications([]);
          onUnreadChange(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    });

    return () => { alive = false; };
  }, [onUnreadChange]);

  const visibleNotifications = notifications.filter((notification) => notificationMatchesTab(notification, tab));

  async function readAll() {
    await markAllNotificationsRead();
    const timestamp = new Date().toISOString();
    setNotifications((current) => current.map((notification) => (
      notification.archived ? notification : { ...notification, readAt: notification.readAt || timestamp }
    )));
    onUnreadChange(0);
  }

  async function archive(item: CommunityNotification) {
    const archived = tab !== "archived";
    setNotifications((current) => {
      const next = current.map((notification) => (
        notification.id === item.id ? { ...notification, archived } : notification
      ));
      onUnreadChange(unreadNotificationCount(next));
      return next;
    });
    await archiveNotification(item.id, archived);
  }

  return (
    <div className="topbar-panel notifications-panel">
      <div className="topbar-panel-header">
        <h2>Notificações</h2>
        <div className="dms-header-actions">
          <button type="button" aria-label="Marcar tudo como lido" onClick={readAll}><ChevronsDown size={18} /></button>
          <button type="button" aria-label="Abrir notificações"><ExternalLink size={16} /></button>
          <button type="button" aria-label="Configurações"><Settings size={16} /></button>
        </div>
      </div>
      <div className="topbar-tabs notification-tabs" role="tablist" aria-label="Notificações">
        {notificationTabs.map((item) => (
          <button className={tab === item.id ? "active" : ""} key={item.id} type="button" role="tab" onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="topbar-empty-state notifications-empty-state">
          <h3>Carregando notificações</h3>
          <p>Buscando suas atualizações.</p>
        </div>
      ) : visibleNotifications.length ? (
        <div className="notifications-list">
          {visibleNotifications.map((notification) => (
            <article className={notification.readAt ? "notification-row" : "notification-row unread"} key={notification.id}>
              <span className="notification-icon"><Bell size={16} /></span>
              <div>
                <strong>{notification.title}</strong>
                {notification.body ? <p>{notification.body}</p> : null}
                <time dateTime={notification.createdAt}>{notificationTimeLabel(notification.createdAt)}</time>
              </div>
              <button type="button" onClick={() => archive(notification)}>
                {tab === "archived" ? "Restaurar" : "Arquivar"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="topbar-empty-state notifications-empty-state">
          <h3>Sem notificações</h3>
          <p>As notificações aparecerão aqui.</p>
        </div>
      )}
    </div>
  );
}

function notificationMatchesTab(notification: CommunityNotification, tab: NotificationTab) {
  if (tab === "archived") return notification.archived;
  if (notification.archived) return false;
  if (tab === "mentions") return notification.kind === "mentions";
  if (tab === "following") return notification.kind === "following";
  return true;
}

function unreadNotificationCount(rows: CommunityNotification[]) {
  return rows.filter((row) => !row.archived && !row.readAt).length;
}

function notificationTimeLabel(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} d`;
}

function AvatarImage({ src, name }: { src: string; name: string }) {
  return <img className="topbar-avatar-img" src={src} alt={name} />;
}

function FigureAvatar({ className }: { className: string }) {
  return <span className={`figure-avatar ${className}`.trim()} />;
}
