export type AdminSection =
  | "general"
  | "dashboard"
  | "audience"
  | "content"
  | "files"
  | "emails"
  | "workflows"
  | "analytics"
  | "ai-agents"
  | "paywalls"
  | "affiliates"
  | "plans"
  | "home"
  | "api";

type SecondaryGroup = {
  title?: string;
  items: { label: string; path: string }[];
};

// Sub-itens de cada secao da sidebar primaria.
// Estrutura segue o painel Circle real (capturado em 25/05/2026).
const groupsBySection: Record<AdminSection, SecondaryGroup[]> = {
  general: [
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

  dashboard: [{ items: [{ label: "Visão geral", path: "/settings/dashboard" }] }],

  audience: [
    {
      items: [
        { label: "Gerenciar audiência", path: "/audience/manage" },
        { label: "Convites", path: "/audience/invites" },
        { label: "Solicitações", path: "/audience/requests" },
      ],
    },
  ],

  content: [
    { items: [{ label: "Espaços", path: "/settings/spaces" }] },
    {
      title: "Publicações",
      items: [
        { label: "Publicações", path: "/settings/posts" },
        { label: "Páginas", path: "/settings/pages" },
        { label: "Tópicos", path: "/settings/topics" },
        { label: "Moderação", path: "/settings/moderation" },
        { label: "Ao vivo", path: "/settings/live_streams" },
        { label: "Registros em massa", path: "/settings/posts/bulk_actions" },
      ],
    },
  ],

  files:    [{ items: [{ label: "Mídia",       path: "/settings/files" }] }],
  emails:   [{ items: [{ label: "E-mails",     path: "/settings/emails" }] }],
  workflows: [{ items: [{ label: "Automações", path: "/settings/workflows" }] }],
  analytics: [{ items: [{ label: "Analytics",  path: "/settings/analytics" }] }],

  "ai-agents": [
    {
      items: [
        { label: "Conhecimento", path: "/settings/ai-agents/knowledge" },
        { label: "Agentes",      path: "/settings/ai-agents" },
      ],
    },
  ],

  paywalls:   [{ items: [{ label: "Paywalls",  path: "/settings/paywalls" }] }],
  affiliates: [{ items: [{ label: "Afiliados", path: "/settings/affiliates_settings" }] }],
  plans:      [{ items: [{ label: "Planos",    path: "/settings/plans" }] }],
  home:       [{ items: [{ label: "Padrões",   path: "/settings/home" }] }],
  api:        [{ items: [{ label: "API",       path: "/settings/api" }] }],
};

const sectionTitles: Record<AdminSection, string> = {
  general:     "Configurações",
  dashboard:   "Dashboard",
  audience:    "Membros",
  content:     "Conteúdo",
  files:       "Mídia",
  emails:      "E-mails",
  workflows:   "Automações",
  analytics:   "Analytics",
  "ai-agents": "IA",
  paywalls:    "Paywalls",
  affiliates:  "Afiliados",
  plans:       "Planos",
  home:        "Página inicial",
  api:         "API",
};

type Props = {
  active: AdminSection;
  activeSubpath: string;
  onNavigate: (path: string) => void;
};

export function AdminSecondarySidebar({ active, activeSubpath, onNavigate }: Props) {
  const groups = groupsBySection[active] ?? [];
  const title = sectionTitles[active] ?? "";

  return (
    <aside className="admin-secondary-sidebar" aria-label={title}>
      <header className="admin-secondary-header">
        <h2>{title}</h2>
      </header>
      <nav className="admin-secondary-nav">
        {groups.map((group, idx) => (
          <section key={idx} className="admin-secondary-group">
            {group.title ? <h3 className="admin-secondary-group-title">{group.title}</h3> : null}
            <ul>
              {group.items.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={item.path === activeSubpath ? "admin-secondary-link is-active" : "admin-secondary-link"}
                    onClick={() => onNavigate(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
