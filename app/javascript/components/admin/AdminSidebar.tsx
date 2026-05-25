import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { adminSections, adminSectionTitles, type AdminSection } from "./adminSections";

// Sidebar admin unificada que reproduz a estrutura real da Circle:
// um único <aside> de 368px contendo duas colunas internas — ícones
// (42×42 em x:11) + lista de sub-itens em texto (256px em x:84).

type Props = {
  active: AdminSection;
  activeSubpath: string;
  onNavigate: (path: string) => void;
};

export function AdminSidebar({ active, activeSubpath, onNavigate }: Props): ReactNode {
  const activeSection =
    adminSections.find((s) => s.id === active) ?? adminSections[adminSections.length - 1];
  const title = adminSectionTitles[active] ?? "";

  return (
    <aside className="admin-sidebar" aria-label="Painel administrativo">
      <nav className="admin-sidebar-icons" aria-label="Seções">
        <button
          type="button"
          className="admin-sidebar-icon admin-sidebar-icon-back"
          aria-label="Voltar para a comunidade"
          onClick={() => {
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        >
          <ArrowLeft size={20} />
          <span className="admin-sidebar-tooltip">Voltar</span>
        </button>
        {adminSections.map(({ id, label, Icon, primaryPath }) => (
          <button
            key={id}
            type="button"
            className={
              id === active
                ? "admin-sidebar-icon is-active"
                : "admin-sidebar-icon"
            }
            aria-label={label}
            aria-current={id === active ? "page" : undefined}
            onClick={() => onNavigate(primaryPath)}
          >
            <Icon size={20} />
            <span className="admin-sidebar-tooltip">{label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-text">
        <header className="admin-sidebar-header">
          <h2>{title}</h2>
        </header>
        <nav className="admin-sidebar-nav">
          {activeSection.groups.map((group, idx) => (
            <section key={idx} className="admin-sidebar-group">
              {group.title ? (
                <h3 className="admin-sidebar-group-title">{group.title}</h3>
              ) : null}
              <ul>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      className={
                        item.path === activeSubpath
                          ? "admin-sidebar-link is-active"
                          : "admin-sidebar-link"
                      }
                      onClick={() => onNavigate(item.path)}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="admin-sidebar-badge">{item.badge}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  );
}
