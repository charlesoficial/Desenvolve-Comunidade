import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  badge?: string | number;
};

export function IconButton({ children, badge, className = "", ...props }: IconButtonProps) {
  return (
    <button className={`cs-icon-button ${className}`.trim()} type="button" {...props}>
      {children}
      {badge ? <span className="cs-notification-badge">{badge}</span> : null}
    </button>
  );
}
