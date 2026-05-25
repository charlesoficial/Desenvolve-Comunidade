import type { InputHTMLAttributes } from "react";
import { CommunityIcon } from "./CommunityIcon";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({ label = "Pesquisar", className = "", ...props }: SearchInputProps) {
  return (
    <label className={`cs-search-field ${className}`.trim()}>
      <CommunityIcon name="icon-20-flux-search" size={18} />
      <input aria-label={label} placeholder="Pesquisar" {...props} />
    </label>
  );
}
