import { createElement, type ComponentType } from "react";
import { P6Icon, type P6GlyphProps } from "./P6Icon";

export function makeP6Icon(name: string, sprite: "app" | "compass" = "app"): ComponentType<P6GlyphProps> {
  function P6Glyph({ size = 20, className = "", style }: P6GlyphProps) {
    return createElement(P6Icon, { name, sprite, size, className, style });
  }

  P6Glyph.displayName = `P6Icon(${name})`;
  return P6Glyph;
}
