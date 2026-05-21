import { P6Icon } from "../../design-system";

export function SearchBox() {
  return (
    <label className="search-box">
      <P6Icon name="icon-20-flux-search" size={15} />
      <input aria-label="Pesquisar" placeholder="Pesquisar" />
    </label>
  );
}
