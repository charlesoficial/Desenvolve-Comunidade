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
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { AdminWorkflows } from "./pages/AdminWorkflows";
import { AdminMembershipQueue } from "./pages/AdminMembershipQueue";
import { AdminApiTokens } from "./pages/AdminApiTokens";
import { AdminPosts } from "./pages/AdminPosts";
import { AdminAiKnowledge } from "./pages/AdminAiKnowledge";
import { AdminEmails } from "./pages/AdminEmails";
import { AdminFiles } from "./pages/AdminFiles";
import { AdminAffiliates } from "./pages/AdminAffiliates";
import { AdminSettingsForm } from "./pages/AdminSettingsForm";
import { AdminLiveStreams } from "./pages/AdminLiveStreams";
import { AdminBulkActions } from "./pages/AdminBulkActions";
import { AdminStaticPages } from "./pages/AdminStaticPages";
import { AdminTopics } from "./pages/AdminTopics";
import { AdminPlaceholder } from "./pages/AdminPlaceholder";

// Mapeia rotas /settings/* e /audience/manage para a secao da sidebar primaria.
const routeToSection: Record<string, AdminSection> = {
  "/settings": "general",
  "/settings/dashboard": "dashboard",
  "/audience/manage": "audience",
  "/audience/invites": "audience",
  "/audience/requests": "audience",
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
    case "/audience/invites":
      return <AdminMembershipQueue variant="invites" />;
    case "/audience/requests":
      return <AdminMembershipQueue variant="requests" />;
    case "/settings/paywalls":
      return <AdminPaywalls />;
    case "/settings/plans":
      return <AdminPlans />;
    case "/settings/spaces":
      return <AdminSpaces />;
    case "/settings/analytics":
      return <AdminAnalytics />;
    case "/settings/workflows":
      return <AdminWorkflows />;
    case "/settings/api":
      return <AdminApiTokens />;
    case "/settings/posts":
    case "/settings/moderation":
      return <AdminPosts />;
    case "/settings/pages":
      return <AdminStaticPages />;
    case "/settings/topics":
      return <AdminTopics />;
    case "/settings/live_streams":
      return <AdminLiveStreams />;
    case "/settings/posts/bulk_actions":
      return <AdminBulkActions />;
    case "/settings/ai-agents/knowledge":
    case "/settings/ai-agents":
      return <AdminAiKnowledge />;
    case "/settings/emails":
      return <AdminEmails />;
    case "/settings/files":
      return <AdminFiles />;
    case "/settings/affiliates_settings":
    case "/settings/affiliates":
      return <AdminAffiliates />;
    case "/settings/custom_domain":
      return (
        <AdminSettingsForm
          configKey="custom_domain"
          title="Domínio personalizado"
          subtitle="Aponte um domínio próprio para a comunidade. Configure o DNS antes de salvar."
          fieldLabels={{ domain: "Domínio", force_https: "Forçar HTTPS" }}
          fieldHelp={{
            domain: "Ex.: comunidade.suaempresa.com — adicione um CNAME para comunidade-com.fly.dev.",
          }}
        />
      );
    case "/settings/community_ai":
      return (
        <AdminSettingsForm
          configKey="community_ai"
          title="IA para comunidades"
          subtitle="Ajuste o assistente da comunidade que responde no chat e no feed."
          fieldLabels={{
            enabled: "Ativar IA",
            system_prompt: "Prompt do sistema",
            default_temperature: "Temperatura padrão (0 a 1)",
          }}
        />
      );
    case "/settings/mobile_app":
      return (
        <AdminSettingsForm
          configKey="mobile_app"
          title="Aplicativo móvel"
          subtitle="Configure os links das stores e a cor principal usada no app."
          fieldLabels={{
            enabled: "Habilitar app móvel",
            ios_url: "Link na App Store",
            android_url: "Link na Play Store",
            branding_color: "Cor de destaque",
          }}
        />
      );
    case "/settings/weekly_digest":
      return (
        <AdminSettingsForm
          configKey="weekly_digest"
          title="Resumo semanal"
          subtitle="E-mail enviado uma vez por semana com os destaques da comunidade."
          fieldLabels={{
            enabled: "Enviar resumo semanal",
            send_day: "Dia da semana",
            send_hour: "Hora (0 a 23)",
            include_top_posts: "Incluir posts mais populares",
            include_new_members: "Incluir novos membros",
          }}
          fieldOptions={{
            send_day: [
              { value: "monday", label: "Segunda" },
              { value: "tuesday", label: "Terça" },
              { value: "wednesday", label: "Quarta" },
              { value: "thursday", label: "Quinta" },
              { value: "friday", label: "Sexta" },
              { value: "saturday", label: "Sábado" },
              { value: "sunday", label: "Domingo" },
            ],
          }}
        />
      );
    case "/settings/embed":
      return (
        <AdminSettingsForm
          configKey="embed"
          title="Incorporar"
          subtitle="Permita exibir a comunidade dentro de outros sites via iframe."
          fieldLabels={{
            enabled: "Permitir embed",
            allowed_origins: "Origens autorizadas",
          }}
          fieldHelp={{
            allowed_origins: "Uma URL por linha. Ex.: https://meu-site.com",
          }}
        />
      );
    case "/settings/sso":
      return (
        <AdminSettingsForm
          configKey="sso"
          title="Single Sign-On (SSO)"
          subtitle="Integre com seu provedor SAML ou OIDC corporativo."
          fieldLabels={{
            enabled: "Ativar SSO",
            provider: "Provedor",
            metadata_url: "URL de metadados",
            entity_id: "Entity ID / Client ID",
          }}
          fieldOptions={{
            provider: [
              { value: "saml", label: "SAML 2.0" },
              { value: "oidc", label: "OpenID Connect" },
              { value: "google_workspace", label: "Google Workspace" },
              { value: "azure_ad", label: "Microsoft Entra (Azure AD)" },
            ],
          }}
        />
      );
    case "/settings/connect":
      return (
        <AdminSettingsForm
          configKey="connect"
          title="Conexões"
          subtitle="Webhooks de saída para automações em Zapier, n8n, Discord e Slack."
          fieldLabels={{
            zapier_enabled: "Ativar Zapier",
            n8n_webhook_url: "Webhook n8n",
            discord_webhook_url: "Webhook Discord",
            slack_webhook_url: "Webhook Slack",
          }}
        />
      );
    case "/settings/legal":
      return (
        <AdminSettingsForm
          configKey="legal"
          title="Jurídico"
          subtitle="URLs dos termos, política de privacidade e canal de suporte."
          fieldLabels={{
            terms_url: "Termos de uso",
            privacy_url: "Política de privacidade",
            cookies_url: "Política de cookies",
            support_email: "E-mail de suporte",
          }}
        />
      );
    case "/settings/home":
      return (
        <AdminSettingsForm
          configKey="home"
          title="Página inicial"
          subtitle="Personalize o que aparece para visitantes não autenticados."
          fieldLabels={{
            headline: "Título principal",
            subheadline: "Subtítulo",
            cta_text: "Texto do botão",
            cta_path: "Destino do botão",
            show_member_count: "Exibir contagem de membros",
          }}
        />
      );
    default:
      return <AdminPlaceholder route={pathname} />;
  }
}
