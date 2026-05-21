import type { InputHTMLAttributes } from "react";
import { P6Icon } from "./P6Icon";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({ label = "Pesquisar", className = "", ...props }: SearchInputProps) {
  return (
    <label className={`p6-search-field ${className}`.trim()}>
      <P6Icon name="icon-20-flux-search" size={18} />
      <input aria-label={label} placeholder="Pesquisar" {...props} />
    </label>
  );
}
