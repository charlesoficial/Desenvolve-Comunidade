import { ArrowLeft, ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-topbar-back"
          aria-label="Voltar para a comunidade"
          onClick={() => {
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        >
          <ArrowLeft size={18} />
          <span>Voltar para a comunidade</span>
        </button>
      </div>
      <div className="admin-topbar-right">
        <a
          className="admin-topbar-link"
          href="https://docs.circle.so/"
          target="_blank"
          rel="noreferrer"
        >
          Documentação
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
