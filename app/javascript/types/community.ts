import type { ComponentType } from "react";
import type { P6GlyphProps } from "../design-system/components/P6Icon";

export type SidebarItem = {
  id: string;
  label: string;
  icon: ComponentType<P6GlyphProps>;
  count?: string;
  active?: boolean;
  locked?: boolean;
  truncated?: boolean;
};

export type SidebarSection = {
  id: string;
  title: string;
  collapsible?: boolean;
  menu?: boolean;
  items: SidebarItem[];
};

export type Member = {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
};

export type Post = {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
    level: string;
    joinedAt: string;
  };
  excerpt: string[];
  date: string;
  comments: number;
  likes?: number;
};
