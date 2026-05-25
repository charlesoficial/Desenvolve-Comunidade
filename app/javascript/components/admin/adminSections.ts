import {
  BarChart3,
  Bot,
  ChartLine,
  Code,
  CreditCard,
  Globe,
  Handshake,
  Layers,
  Send,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

// Constantes e helpers da estrutura admin separados em arquivo próprio
// pra atender o lint do Vite (fast-refresh exige que arquivos exportem
// somente componentes React).

export type AdminSection =
  | "dashboard"
  | "audience"
  | "content"
  | "emails"
  | "workflows"
  | "analytics"
  | "ai-agents"
  | "paywalls"
  | "affiliates"
  | "plans"
  | "home"
  | "api"
  | "general";

export type AdminGroup = {
  title?: string;
  items: { label: string; path: string; badge?: string }[];
};

export type AdminSectionDescriptor = {
  id: AdminSection;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  primaryPath: string;
  groups: AdminGroup[];
};

// Estrutura espelhando o painel Circle real (capturado em 25/05/2026).
export const adminSections: AdminSectionDescriptor[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    Icon: ChartLine,
    primaryPath: "/settings/dashboard",
    groups: [{ items: [{ label: "Visão geral", path: "/settings/dashboard" }] }],
  },
  {
    id: "audience",
    label: "Membros",
    Icon: Users,
    primaryPath: "/audience/manage",
    groups: [
      {
        items: [
          { label: "Gerenciar audiência", path: "/audience/manage" },
          { label: "Convites", path: "/audience/invites" },
          { label: "Solicitações", path: "/audience/requests" },
          { label: "Grupos de acesso", path: "/settings/access_groups" },
          { label: "Segmentos", path: "/settings/segments" },
          { label: "Tags", path: "/settings/member_tags" },
          { label: "Onboarding", path: "/members/onboarding" },
          { label: "Gamificação", path: "/settings/gamification" },
          { label: "Campos de perfil", path: "/members/profile_fields" },
          { label: "Links de convite", path: "/members/invitation_links" },
          { label: "Registros em massa", path: "/settings/members/bulk_import_tasks" },
          { label: "Registros de atividades", path: "/settings/members/activity_logs" },
        ],
      },
    ],
  },
  {
    id: "content",
    label: "Conteúdo",
    Icon: Layers,
    primaryPath: "/settings/files",
    groups: [
      {
        items: [
          { label: "Mídia", path: "/settings/files", badge: "Novo" },
          { label: "Publicações", path: "/settings/posts" },
          { label: "Páginas", path: "/settings/pages" },
          { label: "Espaços", path: "/settings/spaces" },
          { label: "Tópicos", path: "/settings/topics" },
          { label: "Moderação", path: "/settings/moderation" },
          { label: "Ao vivo", path: "/settings/live_streams" },
          { label: "Registros em massa", path: "/settings/posts/bulk_actions" },
        ],
      },
    ],
  },
  {
    id: "emails",
    label: "E-mails",
    Icon: Send,
    primaryPath: "/settings/emails",
    groups: [{ items: [{ label: "Templates", path: "/settings/emails" }] }],
  },
  {
    id: "workflows",
    label: "Automações",
    Icon: Workflow,
    primaryPath: "/settings/workflows",
    groups: [{ items: [{ label: "Automações", path: "/settings/workflows" }] }],
  },
  {
    id: "analytics",
    label: "Analytics",
    Icon: BarChart3,
    primaryPath: "/settings/analytics",
    groups: [
      {
        items: [
          { label: "Visão geral", path: "/settings/analytics" },
          { label: "Membros", path: "/settings/analytics/members" },
          { label: "Site", path: "/settings/analytics/website" },
          { label: "Espaços", path: "/settings/analytics/spaces" },
          { label: "Publicações & comentários", path: "/settings/analytics/post_comments" },
          { label: "Mensagens", path: "/settings/analytics/messages" },
          { label: "Dispositivos", path: "/settings/analytics/devices" },
          { label: "Eventos", path: "/settings/analytics/events" },
          { label: "Pagamentos", path: "/settings/analytics/payments" },
          { label: "Cursos", path: "/settings/analytics/courses" },
        ],
      },
    ],
  },
  {
    id: "ai-agents",
    label: "IA",
    Icon: Bot,
    primaryPath: "/settings/ai-agents/knowledge",
    groups: [
      {
        items: [
          { label: "Hub de conhecimento", path: "/settings/ai-agents/knowledge" },
          { label: "Agentes", path: "/settings/ai-agents" },
          { label: "Inbox da IA", path: "/settings/ai-agents/inbox" },
        ],
      },
    ],
  },
  {
    id: "paywalls",
    label: "Paywalls",
    Icon: CreditCard,
    primaryPath: "/settings/paywalls",
    groups: [
      {
        items: [
          { label: "Paywalls", path: "/settings/paywalls" },
          { label: "Cupons", path: "/settings/coupons" },
          { label: "Grupos de assinatura", path: "/settings/paywall_groups" },
          { label: "Transações", path: "/settings/paywall_charges" },
          { label: "Assinaturas", path: "/settings/paywall_subscriptions" },
          { label: "Impostos", path: "/settings/paywall_tax_settings" },
          { label: "Registros em massa", path: "/settings/paywall_bulk_logs" },
        ],
      },
    ],
  },
  {
    id: "affiliates",
    label: "Afiliados",
    Icon: Handshake,
    primaryPath: "/settings/affiliates_settings",
    groups: [{ items: [{ label: "Afiliados", path: "/settings/affiliates_settings" }] }],
  },
  {
    id: "plans",
    label: "Planos",
    Icon: Sparkles,
    primaryPath: "/settings/plans",
    groups: [{ items: [{ label: "Planos", path: "/settings/plans" }] }],
  },
  {
    id: "home",
    label: "Página inicial",
    Icon: Globe,
    primaryPath: "/settings/home",
    groups: [{ items: [{ label: "Padrões", path: "/settings/home" }] }],
  },
  {
    id: "api",
    label: "API",
    Icon: Code,
    primaryPath: "/settings/api",
    groups: [{ items: [{ label: "Tokens", path: "/settings/api" }] }],
  },
  {
    id: "general",
    label: "Geral",
    Icon: Settings,
    primaryPath: "/settings",
    groups: [
      { items: [{ label: "Geral", path: "/settings" }] },
      {
        title: "Personalização",
        items: [
          { label: "Domínio personalizado", path: "/settings/custom_domain" },
          { label: "IA para comunidades", path: "/settings/community_ai" },
          { label: "Aplicativo móvel", path: "/settings/mobile_app" },
          { label: "Resumo semanal", path: "/settings/weekly_digest" },
          { label: "Incorporar", path: "/settings/embed" },
        ],
      },
      {
        title: "Acesso",
        items: [
          { label: "Single sign-on (SSO)", path: "/settings/sso" },
          { label: "Conexões", path: "/settings/connect" },
          { label: "Jurídico", path: "/settings/legal" },
        ],
      },
    ],
  },
];

export const adminSectionTitles: Record<AdminSection, string> = Object.fromEntries(
  adminSections.map((s) => [s.id, s.label]),
) as Record<AdminSection, string>;

// Reverse lookup: dado um pathname, retorna a seção primária correspondente.
export function resolveAdminSection(pathname: string): AdminSection {
  for (const section of adminSections) {
    if (section.primaryPath === pathname) return section.id;
    for (const group of section.groups) {
      if (group.items.some((item) => item.path === pathname)) return section.id;
    }
  }
  if (pathname.startsWith("/audience/") || pathname.startsWith("/members/")) {
    return "audience";
  }
  if (pathname.startsWith("/settings/analytics")) return "analytics";
  if (pathname.startsWith("/settings/paywall") || pathname === "/settings/coupons") return "paywalls";
  if (pathname.startsWith("/settings/ai-agents")) return "ai-agents";
  if (pathname.startsWith("/settings")) return "general";
  return "general";
}
