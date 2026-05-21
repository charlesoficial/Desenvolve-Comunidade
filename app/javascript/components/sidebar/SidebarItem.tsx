import type { SidebarItem as SidebarItemType } from "../../types/community";

type Props = {
  item: SidebarItemType;
};

export function SidebarItem({ item }: Props) {
  const Icon = item.icon;

  return (
    <button className={`sidebar-item ${item.active ? "is-active" : ""}`} type="button">
      <span className="sidebar-item-main">
        <Icon size={17} strokeWidth={2.25} />
        <span className="sidebar-label">{item.label}</span>
      </span>
      {item.count ? <span className="sidebar-count">{item.count}</span> : null}
    </button>
  );
}
