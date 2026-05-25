import { useEffect, useMemo, useState } from "react";
import { CommunityIcon } from "../../design-system";
import { loadCourseOverview, type CourseOverviewCard } from "../../lib/communityApi";

const categories = [
  "Todos",
  "Anonimato",
  "Cibersegurança",
  "Criptomoedas",
  "Engenharia Social",
  "Hacking",
  "OPSEC",
  "Sistema Operacionais",
  "Swap",
  "Mais",
];

type CoursesMainProps = {
  initialCategory?: string;
  title?: string;
};

function getInitialCoursesTab() {
  if (typeof window === "undefined") return "all";
  return new URLSearchParams(window.location.search).get("filter") === "mine" ? "mine" : "all";
}

export function CoursesMain({ initialCategory = "Todos", title = "Cursos" }: CoursesMainProps = {}) {
  const [cards, setCards] = useState<CourseOverviewCard[]>([]);
  const [tab, setTab] = useState<"all" | "mine">(getInitialCoursesTab);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  function changeTab(nextTab: "all" | "mine") {
    setTab(nextTab);
    const url = new URL(window.location.href);
    url.searchParams.set("filter", nextTab === "all" ? "all" : "mine");
    window.history.replaceState({}, "", url);
  }

  useEffect(() => {
    let alive = true;

    loadCourseOverview()
      .then((rows) => {
        if (alive) setCards(rows);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  const visibleCards = useMemo(() => {
    const base = tab === "mine" ? cards.filter((card) => (card.progress || 0) > 0 || card.completed) : cards;
    if (category === "Todos" || category === "Mais") return base;

    const normalized = category.toLocaleLowerCase("pt-BR");
    return base.filter((card) => (
      card.title.toLocaleLowerCase("pt-BR").includes(normalized) ||
      card.section.toLocaleLowerCase("pt-BR").includes(normalized)
    ));
  }, [cards, category, tab]);

  return (
    <main className="courses-main">
      <header className="courses-header">
        <h1>{title}</h1>
      </header>
      <div className="courses-filter-strip">
        <div className="courses-tabs" aria-label="Mostrar todos os cursos ou apenas os meus cursos">
          <button className={tab === "all" ? "active" : ""} type="button" onClick={() => changeTab("all")}>
            Todos os cursos
          </button>
          <button className={tab === "mine" ? "active" : ""} type="button" onClick={() => changeTab("mine")}>
            Meus cursos
          </button>
        </div>
      </div>
      <section className="courses-scroll" aria-label="Cursos">
        <div className="courses-container">
          <div className="courses-chips" aria-label="Categorias de cursos">
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} key={item} type="button" onClick={() => setCategory(item)}>
                {item}
                {item === "Mais" ? <CommunityIcon name="icon-12-chevron-down-v3" size={14} /> : null}
              </button>
            ))}
          </div>

          {loading ? <CoursesSkeleton /> : null}
          {!loading && visibleCards.length ? (
            <div className="courses-grid">
              {visibleCards.map((card) => <CourseCard card={card} key={card.id} />)}
            </div>
          ) : null}
          {!loading && !visibleCards.length ? (
            <div className="courses-empty">
              <CommunityIcon name="icon-20-bookmark-v3" size={22} />
              <strong>Nenhum curso encontrado</strong>
              <span>Os cursos desta categoria aparecerão aqui.</span>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CourseCard({ card }: { card: CourseOverviewCard }) {
  return (
    <button className="course-card" type="button" aria-label={card.title}>
      <span className="course-card-image">
        {card.imageUrl ? <img src={card.imageUrl} alt="" /> : null}
      </span>
      <span className="course-card-body">
        <span className="course-card-title-row">
          <img className="course-card-title-icon" src={card.iconUrl} alt="" />
          <strong>{card.title}</strong>
        </span>
        <small>{card.section}</small>
        {card.progress !== null ? (
          <span className="course-progress">
            <i style={{ width: `${card.progress}%` }} />
            <em>{card.completed ? "Concluído" : `${card.progress}% Concluído`}</em>
          </span>
        ) : null}
        <span className="course-private">Espaço privado</span>
      </span>
    </button>
  );
}

function CoursesSkeleton() {
  return (
    <div className="courses-grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="course-card course-card-skeleton" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
