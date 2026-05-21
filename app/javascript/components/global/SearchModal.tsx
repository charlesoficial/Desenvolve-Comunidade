import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { searchCommunity, type CommunitySearchResult } from "../../lib/communityApi";

export function SearchModal({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (result: CommunitySearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CommunitySearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      searchCommunity(query)
        .then((rows) => {
          if (alive) setResults(rows);
        })
        .catch(() => {
          if (alive) setResults([]);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 180);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return createPortal(
    <div className="global-search-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="global-search-modal" role="dialog" aria-modal="true" aria-label="Pesquisar na comunidade">
        <div className="global-search-input">
          <Search size={21} />
          <input ref={inputRef} value={query} placeholder="Pesquisar na comunidade" onChange={(event) => setQuery(event.target.value)} />
          <button type="button" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="global-search-body">
          {!query.trim() ? <p>Pesquisar na comunidade</p> : null}
          {query.trim() && loading ? <p>Pesquisando...</p> : null}
          {query.trim() && !loading && results.length ? (
            <div className="global-search-results">
              {results.map((result) => (
                <button type="button" key={result.id} onClick={() => onNavigate(result)}>
                  <SearchAvatar value={result.avatar} title={result.title} />
                  <span><strong>{result.title}</strong><small>{result.subtitle}</small></span>
                  <em>{searchTypeLabel(result.type)}</em>
                </button>
              ))}
            </div>
          ) : null}
          {query.trim() && !loading && !results.length ? <p>Nenhum resultado encontrado</p> : null}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function SearchAvatar({ title, value }: { title: string; value: string }) {
  const isImage = value.startsWith("/") || value.startsWith("http") || value.startsWith("data:");
  if (isImage) return <img className="global-search-avatar" src={value} alt="" />;
  return <span className="global-search-avatar">{value.slice(0, 2).toUpperCase() || title.slice(0, 2).toUpperCase()}</span>;
}

function searchTypeLabel(type: CommunitySearchResult["type"]) {
  return {
    member: "Membro",
    post: "Publicação",
    space: "Espaço",
    course: "Curso",
    lesson: "Aula",
  }[type];
}
