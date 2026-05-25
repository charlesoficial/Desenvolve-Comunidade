import { createElement, type ComponentType } from "react";
import { CommunityIcon, type P6GlyphProps } from "./CommunityIcon";

export function makeCommunityIcon(name: string, sprite: "app" | "compass" = "app"): ComponentType<P6GlyphProps> {
  function P6Glyph({ size = 20, className = "", style }: P6GlyphProps) {
    return createElement(CommunityIcon, { name, sprite, size, className, style });
  }

  P6Glyph.displayName = `CommunityIcon(${name})`;
  return P6Glyph;
}
