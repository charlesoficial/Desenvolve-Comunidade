import { P6Icon } from "../../design-system";
import type { SidebarSection as SidebarSectionType } from "../../types/community";
import { SidebarItem } from "./SidebarItem";

type Props = {
  section: SidebarSectionType;
};

export function SidebarSection({ section }: Props) {
  return (
    <section className="sidebar-section">
      <div className="sidebar-section-header">
        <span>
          {section.title}
          {section.collapsible ? <P6Icon name="icon-12-chevron-down-v3" size={13} /> : null}
        </span>
        {section.menu ? <P6Icon name="icon-16-menu-dots-horizontal" size={17} /> : null}
      </div>
      <div className="sidebar-section-items">
        {section.items.map((item) => (
          <SidebarItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}
