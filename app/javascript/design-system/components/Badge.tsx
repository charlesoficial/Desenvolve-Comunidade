import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "admin" | "brand";
};

export function Badge({ children, tone = "brand" }: BadgeProps) {
  return <span className={tone === "admin" ? "cs-admin-badge" : "author-badge"}>{children}</span>;
}
