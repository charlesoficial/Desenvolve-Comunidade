import type { CSSProperties, SVGAttributes } from "react";

type P6IconProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
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
  app: "/p6-app-sprite.svg",
  compass: "/p6-compass-sprite.svg",
} as const;

export function P6Icon({ name, size = 20, sprite = "app", className = "", style, ...props }: P6IconProps) {
  const href = `${spriteMap[sprite]}#${name}`;

  return (
    <svg
      className={`p6-icon ${className}`.trim()}
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
