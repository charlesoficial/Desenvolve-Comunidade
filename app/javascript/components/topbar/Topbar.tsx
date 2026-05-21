import { P6Icon } from "../../design-system";
import { topNav } from "../../data/communityData";
import { SearchBox } from "./SearchBox";

export function Topbar() {
  const actions = ["icon-20-bell-v3", "icon-20-message-v3", "icon-20-connections", "icon-20-flux-bookmark"];

  return (
    <header className="topbar">
      <nav className="topbar-nav" aria-label="Navegacao principal">
        {topNav.map((item) => (
          <button className={`topbar-nav-item ${item === "Home" ? "is-active" : ""}`} key={item} type="button">
            {item}
          </button>
        ))}
      </nav>
      <div className="topbar-actions">
        <SearchBox />
        <button className="topbar-icon mobile-search" type="button" aria-label="Pesquisar">
          <P6Icon name="icon-20-flux-search" size={17} />
        </button>
        {actions.map((iconName, index) => (
          <button className="topbar-icon" type="button" aria-label="Ação" key={index}>
            <P6Icon name={iconName} size={17} />
          </button>
        ))}
        <button className="profile-button" type="button" aria-label="Perfil">
          VA
        </button>
      </div>
    </header>
  );
}
