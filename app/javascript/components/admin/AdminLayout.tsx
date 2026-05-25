import { useEffect, useState } from "react";
import { AdminPrimarySidebar } from "./AdminPrimarySidebar";
import { AdminSecondarySidebar, type AdminSection } from "./AdminSecondarySidebar";
import { AdminTopbar } from "./AdminTopbar";
import { AdminGeneral } from "./pages/AdminGeneral";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminAudience } from "./pages/AdminAudience";
import { AdminPaywalls } from "./pages/AdminPaywalls";
import { AdminPlans } from "./pages/AdminPlans";
import { AdminSpaces } from "./pages/AdminSpaces";
import { AdminPlaceholder } from "./pages/AdminPlaceholder";

// Mapeia rotas /settings/* e /audience/manage para a secao da sidebar primaria.
const routeToSection: Record<string, AdminSection> = {
  "/settings": "general",
  "/settings/dashboard": "dashboard",
  "/audience/manage": "audience",
  "/settings/files": "files",
  "/settings/emails": "emails",
  "/settings/workflows": "workflows",
  "/settings/analytics": "analytics",
  "/settings/ai-agents/knowledge": "ai-agents",
  "/settings/paywalls": "paywalls",
  "/settings/affiliates_settings": "affiliates",
  "/settings/plans": "plans",
  "/settings/home": "home",
  "/settings/api": "api",

  // subitems do Geral
  "/settings/custom_domain": "general",
  "/settings/community_ai": "general",
  "/settings/mobile_app": "general",
  "/settings/weekly_digest": "general",
  "/settings/embed": "general",
  "/settings/sso": "general",
  "/settings/connect": "general",
  "/settings/legal": "general",

  // conteudo
  "/settings/posts": "content",
  "/settings/pages": "content",
  "/settings/spaces": "content",
  "/settings/topics": "content",
  "/settings/moderation": "content",
  "/settings/live_streams": "content",
};

function resolveSection(pathname: string): AdminSection {
  return routeToSection[pathname] ?? "general";
}

function resolveSubpath(pathname: string): string {
  return pathname;
}

export function AdminLayout() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const section = resolveSection(pathname);
  const subpath = resolveSubpath(pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (target: string) => {
    setPathname(target);
    window.history.pushState({}, "", target);
  };

  return (
    <div className="admin-shell">
      <AdminTopbar />
      <div className="admin-body">
        <AdminPrimarySidebar active={section} onNavigate={navigate} />
        <AdminSecondarySidebar
          active={section}
          activeSubpath={subpath}
          onNavigate={navigate}
        />
        <main className="admin-main">{renderPage(subpath)}</main>
      </div>
    </div>
  );
}

function renderPage(pathname: string) {
  switch (pathname) {
    case "/settings":
      return <AdminGeneral />;
    case "/settings/dashboard":
      return <AdminDashboard />;
    case "/audience/manage":
      return <AdminAudience />;
    case "/settings/paywalls":
      return <AdminPaywalls />;
    case "/settings/plans":
      return <AdminPlans />;
    case "/settings/spaces":
      return <AdminSpaces />;
    default:
      return <AdminPlaceholder route={pathname} />;
  }
}
