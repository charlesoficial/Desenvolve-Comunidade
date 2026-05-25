import type { CSSProperties, SVGAttributes } from "react";

type CommunityIconProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
  name: string;
  size?: number;
  sprite?: "app" | "compass";
};

export type P6GlyphProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

const spriteMap = {
  app: "/app-sprite.svg",
  compass: "/compass-sprite.svg",
} as const;

export function CommunityIcon({ name, size = 20, sprite = "app", className = "", style, ...props }: CommunityIconProps) {
  const href = `${spriteMap[sprite]}#${name}`;

  return (
    <svg
      className={`cs-icon ${className}`.trim()}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none", ...style }}
      {...props}
    >
      <use href={href} xlinkHref={href} />
    </svg>
  );
}
