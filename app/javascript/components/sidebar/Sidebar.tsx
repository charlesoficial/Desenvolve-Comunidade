import { sidebarSections } from "../../data/communityData";
import { SidebarSection } from "./SidebarSection";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark" aria-label="Project Six">
          <span />
        </div>
        <button className="brand-caret" type="button" aria-label="Abrir comunidades">
          <span />
        </button>
      </div>
      <div className="sidebar-scroll">
        {sidebarSections.map((section) => (
          <SidebarSection section={section} key={section.id} />
        ))}
      </div>
    </aside>
  );
}
