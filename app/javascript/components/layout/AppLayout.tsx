import { useEffect, useState } from "react";
import { AdminLayout } from "../admin/AdminLayout";
import { ChatLayout } from "../chat/ChatLayout";
import { consumeOAuthCallback } from "../../lib/auth";

// Rotas que pertencem ao painel administrativo. Espelha a estrutura da
// Circle (todas as rotas /settings/* + /audience/manage).
function isAdminPath(pathname: string) {
  if (pathname === "/audience/manage") return true;
  if (pathname.startsWith("/audience/")) return true;
  if (pathname.startsWith("/settings")) return true;
  return false;
}

export function AppLayout() {
  const [pathname, setPathname] = useState(() => {
    // Captura sessao OAuth devolvida no hash (#access_token=...) e
    // normaliza /auth/callback antes do primeiro render.
    consumeOAuthCallback();
    if (window.location.pathname === "/auth/callback") {
      window.history.replaceState({}, "", "/");
      return "/";
    }
    return window.location.pathname;
  });

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (isAdminPath(pathname)) {
    return <AdminLayout />;
  }

  return <ChatLayout />;
}
