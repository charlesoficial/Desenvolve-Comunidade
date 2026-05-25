import {
  BarChart3,
  Bot,
  ChartLine,
  CreditCard,
  FileText,
  Files,
  Globe,
  Home,
  Layers,
  Mail,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import type { AdminSection } from "./AdminSecondarySidebar";

type Item = {
  id: AdminSection;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  path: string;
};

// Estrutura espelha o painel Circle Admin /settings/*.
// Ordem confirmada via captura Playwright em 25/05/2026.
const items: Item[] = [
  { id: "general",     label: "Geral",            Icon: Settings,    path: "/settings" },
  { id: "dashboard",   label: "Dashboard",        Icon: Home,        path: "/settings/dashboard" },
  { id: "audience",    label: "Membros",          Icon: Users,       path: "/audience/manage" },
  { id: "content",     label: "Conteúdo",         Icon: Layers,      path: "/settings/spaces" },
  { id: "files",       label: "Mídia",            Icon: Files,       path: "/settings/files" },
  { id: "emails",      label: "E-mails",          Icon: Mail,        path: "/settings/emails" },
  { id: "workflows",   label: "Automações",       Icon: Workflow,    path: "/settings/workflows" },
  { id: "analytics",   label: "Analytics",        Icon: ChartLine,   path: "/settings/analytics" },
  { id: "ai-agents",   label: "IA",               Icon: Bot,         path: "/settings/ai-agents/knowledge" },
  { id: "paywalls",    label: "Paywalls",         Icon: CreditCard,  path: "/settings/paywalls" },
  { id: "affiliates",  label: "Afiliados",        Icon: Sparkles,    path: "/settings/affiliates_settings" },
  { id: "plans",       label: "Planos",           Icon: BarChart3,   path: "/settings/plans" },
  { id: "home",        label: "Página inicial",   Icon: Globe,       path: "/settings/home" },
  { id: "api",         label: "API",              Icon: FileText,    path: "/settings/api" },
];

type Props = {
  active: AdminSection;
  onNavigate: (path: string) => void;
};

export function AdminPrimarySidebar({ active, onNavigate }: Props) {
  return (
    <nav className="admin-primary-sidebar" aria-label="Configurações">
      {items.map(({ id, label, Icon, path }) => (
        <button
          key={id}
          type="button"
          className={id === active ? "admin-primary-item is-active" : "admin-primary-item"}
          aria-label={label}
          aria-current={id === active ? "page" : undefined}
          onClick={() => onNavigate(path)}
        >
          <Icon size={20} />
          <span className="admin-primary-tooltip">{label}</span>
        </button>
      ))}
    </nav>
  );
}
