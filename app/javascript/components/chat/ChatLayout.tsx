import { useCallback, useEffect, useState } from "react";
import { LoginPanel } from "../auth/LoginPanel";
import { CoursesMain } from "../courses/CoursesMain";
import { EventsMain } from "../events/EventsMain";
import { FeedGeralMain } from "../feedGeral/FeedGeralMain";
import { HackingTecMain } from "../hackingTec/HackingTecMain";
import { LeaderboardMain } from "../leaderboard/LeaderboardMain";
import { MembersMain } from "../members/MembersMain";
import { AulasGravadas } from "../pages/AulasGravadas";
import { Avisos } from "../pages/Avisos";
import { CanalLayout } from "../pages/CanalLayout";
import { canalConfigs } from "../pages/canalConfigs";
import { CentralDeAjuda } from "../pages/CentralDeAjuda";
import { ComoComecar } from "../pages/ComoComecar";
import { CourseSpacePage } from "../pages/CourseSpacePage";
import { EventoAula } from "../pages/EventoAula";
import { MembersConnections } from "../pages/MembersConnections";
import { MembersMap } from "../pages/MembersMap";
import { Network } from "../pages/Network";
import { Ofertas } from "../pages/Ofertas";
import { OpsecAccessPage } from "../pages/OpsecAccessPage";
import { PostDetail } from "../pages/PostDetail";
import { SeuProgresso } from "../pages/SeuProgresso";
import { ProgressMain } from "../progress/ProgressMain";
import { SpaceFeedMain } from "../space/SpaceFeedMain";
import { ChatMain } from "./ChatMain";
import { ChatSidebar } from "./ChatSidebar";
import { ChatThreadPanel } from "./ChatThreadPanel";
import { ChatTopbar } from "./ChatTopbar";
import { DetailsPanel } from "./DetailsPanel";
import type { ChatMessage } from "../../data/chatData";

export type ChatRightPanel = "details" | "search" | "thread" | null;
type ChatView = "feed" | "chat" | "politica" | "members" | "progress" | "leaderboard" | "courses" | "events" | "hackingTec" | "login";

const routeViewByPath: Record<string, ChatView> = {
  "/": "feed",
  "/feed": "feed",
  "/courses": "courses",
  "/events": "events",
  "/members": "members",
  "/members/map": "members",
  "/members/connections": "members",
  "/messages": "members",
  "/direct-messages": "members",
  "/leaderboard": "leaderboard",
  "/c/feed-geral": "feed",
  "/c/chat-geral": "chat",
  "/c/avisos": "feed",
  "/c/avisos-4e37a7": "feed",
  "/c/membros": "members",
  "/c/seu-progresso": "progress",
  "/c/evento-aula": "events",
  "/c/aulas-gravadas": "courses",
  "/c/aulas-nvl1": "courses",
  "/c/metodop6": "courses",
  "/c/central-de-ajuda-fbm": "courses",
  "/c/fba": "courses",
  "/c/network": "members",
  "/c/network-033efe": "members",
  "/c/network-7e232a": "courses",
  "/c/network-ae9544": "members",
  "/c/ofertas": "feed",
  "/c/como-comecar": "courses",
  "/c/como-comecar-a4b99e": "courses",
  "/c/hacking": "hackingTec",
  "/c/chat-3b19c1": "hackingTec",
  "/c/chat-8e7b7e": "hackingTec",
  "/c/feed": "feed",
  "/c/tools-e-tutoriais": "hackingTec",
  "/c/criptomoedas": "hackingTec",
  "/c/biblioteca": "hackingTec",
  "/c/torrents": "hackingTec",
  "/c/news-hacking": "hackingTec",
  "/c/opsec-2026": "courses",
  "/c/sistemas": "hackingTec",
  "/c/geral": "politica",
  "/c/geopolitica": "politica",
  "/c/politica-nacional": "politica",
  "/c/economia": "politica",
  "/c/criptomoedas-08edfd": "politica",
  "/c/ia-news": "politica",
  "/c/marketing-digital": "politica",
  "/c/mr-robot": "hackingTec",
  "/c/influencer-ia-tiktok-dark": "courses",
};

const defaultPathByView: Record<Exclude<ChatView, "login">, string> = {
  feed: "/c/feed-geral",
  chat: "/c/chat-geral",
  politica: "/c/politica-nacional",
  members: "/members",
  progress: "/c/seu-progresso",
  leaderboard: "/leaderboard",
  courses: "/courses",
  events: "/events",
  hackingTec: "/c/mr-robot",
};

function viewFromCurrentLocation(): ChatView {
  const params = new URLSearchParams(window.location.search);
  if (params.get("auth") === "login") return "login";

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const mapped = routeViewByPath[pathname];
  if (mapped) return mapped;
  if (pathname.startsWith("/messages/")) return "members";

  const postMatch = pathname.match(/^\/c\/([^/]+)\/[^/]+$/);
  if (postMatch) {
    const spaceSlug = postMatch[1];
    if (spaceSlug === "seu-progresso") return "progress";
    if (spaceSlug === "politica-nacional" || spaceSlug === "geral" || spaceSlug === "geopolitica" || spaceSlug === "economia") return "politica";
    return "feed";
  }

  const legacyView = params.get("v") || window.location.hash.replace("#", "");
  if (legacyView === "login" || legacyView === "entrar") return "login";
  if (legacyView === "feed") return "feed";
  if (legacyView === "members" || legacyView === "membros") return "members";
  if (legacyView === "progress" || legacyView === "progresso") return "progress";
  if (legacyView === "leaderboard" || legacyView === "ranking") return "leaderboard";
  if (legacyView === "courses" || legacyView === "cursos") return "courses";
  if (legacyView === "events" || legacyView === "aulas") return "events";
  if (legacyView === "chat") return "chat";
  if (legacyView === "politica") return "politica";
  if (legacyView === "hacking-tec" || legacyView === "hackingTec" || legacyView === "mr-robot") return "hackingTec";

  return "feed";
}

export function ChatLayout() {
  const resolveView = useCallback(() => viewFromCurrentLocation(), []);

  const [activeView, setActiveView] = useState<ChatView>(viewFromCurrentLocation);
  const [locationKey, setLocationKey] = useState(() => `${window.location.pathname}${window.location.search}`);
  const [rightPanel, setRightPanel] = useState<ChatRightPanel>("details");
  const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const syncFromUrl = () => {
      setActiveView(resolveView());
      setLocationKey(`${window.location.pathname}${window.location.search}`);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [resolveView]);

  const handleNavigate = (view: ChatView, path?: string) => {
    setActiveView(view);
    const targetPath = path || (view === "login" ? "/?auth=login" : defaultPathByView[view]);
    window.history.pushState({}, "", targetPath);
    setLocationKey(`${window.location.pathname}${window.location.search}`);
  };

  if (activeView === "login") {
    return <LoginPanel />;
  }

  const pathname = locationKey.split("?")[0].replace(/\/$/, "") || "/";
  const shouldShowSidebar = pathname.startsWith("/c/") || !["leaderboard", "members", "courses", "events"].includes(activeView);
  const postMatch = pathname.match(/^\/c\/([^/]+)\/([^/]+)$/);
  const routeContent = postMatch ? (
    <PostDetail spaceSlug={postMatch[1]} postId={postMatch[2]} />
  ) : pathname === "/feed" ? (
    <FeedGeralMain
      spaceSlug="feed"
      title="Feed"
      showHero={false}
      showTopics={false}
      memberExtra="+856"
      magicLabel="Resumir"
    />
  ) : pathname === "/c/membros" ? (
    <MembersMain withSidebar />
  ) : pathname === "/c/avisos" ? (
    <Avisos />
  ) : pathname === "/c/avisos-4e37a7" ? (
    <Avisos empty />
  ) : pathname === "/c/evento-aula" ? (
    <EventoAula />
  ) : pathname === "/c/seu-progresso" ? (
    <SeuProgresso onNavigate={handleNavigate} />
  ) : pathname === "/c/aulas-gravadas" ? (
    <AulasGravadas />
  ) : pathname === "/c/aulas-nvl1" ? (
    <CourseSpacePage slug="aulas-nvl1" />
  ) : pathname === "/c/network-7e232a" ? (
    <ComoComecar />
  ) : pathname === "/c/network" || pathname.startsWith("/c/network-") ? (
    <Network />
  ) : pathname === "/c/ofertas" ? (
    <Ofertas />
  ) : pathname === "/c/como-comecar" || pathname === "/c/como-comecar-a4b99e" ? (
    <ComoComecar />
  ) : pathname === "/c/central-de-ajuda-fbm" ? (
    <CentralDeAjuda />
  ) : pathname === "/members/map" ? (
    <MembersMap />
  ) : pathname === "/members/connections" || pathname === "/messages" || pathname.startsWith("/messages/") || pathname === "/direct-messages" ? (
    <MembersConnections />
  ) : pathname === "/c/metodop6" ? (
    <CourseSpacePage slug="metodop6" />
  ) : pathname === "/c/fba" ? (
    <CourseSpacePage slug="fba" />
  ) : pathname === "/c/opsec-2026" ? (
    <OpsecAccessPage />
  ) : pathname === "/c/influencer-ia-tiktok-dark" ? (
    <CourseSpacePage slug="influencer-ia-tiktok-dark" />
  ) : pathname === "/c/chat-3b19c1" ? (
    <CanalLayout slug="hacking" />
  ) : pathname === "/c/chat-8e7b7e" ? (
    <CanalLayout slug="sistemas" />
  ) : pathname.startsWith("/c/") && canalConfigs[pathname.slice(3)] ? (
    <CanalLayout slug={pathname.slice(3)} />
  ) : null;

  return (
    <div className="p6-chat-shell">
      <ChatTopbar activeView={activeView} onNavigate={handleNavigate} />
      {shouldShowSidebar ? (
        <ChatSidebar activeView={activeView} currentPath={pathname} onNavigate={handleNavigate} />
      ) : null}
      {routeContent || (activeView === "feed" ? (
        <FeedGeralMain />
      ) : activeView === "members" ? (
        <MembersMain />
      ) : activeView === "leaderboard" ? (
        <LeaderboardMain />
      ) : activeView === "courses" ? (
        <CoursesMain />
      ) : activeView === "events" ? (
        <EventsMain />
      ) : activeView === "progress" ? (
        <ProgressMain onNavigate={handleNavigate} />
      ) : activeView === "chat" ? (
        <>
          <ChatMain
            rightPanel={rightPanel}
            onRightPanelChange={setRightPanel}
            onMessagesChange={setChatMessages}
            onOpenThread={(message) => {
              setThreadMessage(message);
              setRightPanel("thread");
            }}
          />
          {rightPanel === "thread" && threadMessage ? (
            <ChatThreadPanel parent={threadMessage} messages={chatMessages} onClose={() => setRightPanel("details")} />
          ) : rightPanel ? (
            <DetailsPanel messages={chatMessages} mode={rightPanel} onClose={() => setRightPanel(null)} />
          ) : null}
        </>
      ) : (
        activeView === "hackingTec" ? <HackingTecMain /> : <SpaceFeedMain />
      ))}
    </div>
  );
}
