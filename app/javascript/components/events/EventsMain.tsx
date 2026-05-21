import { useState } from "react";

export function EventsMain() {
  const [tab, setTab] = useState<"future" | "past">("future");

  return (
    <main className="events-main">
      <header className="events-header">
        <h1>Aulas</h1>
      </header>
      <section className="events-scroll" aria-label="Aulas">
        <div className="events-container">
          <div className="events-tabs" role="tablist" aria-label="Aulas">
            <button className={tab === "future" ? "active" : ""} type="button" role="tab" onClick={() => setTab("future")}>
              Futuros
            </button>
            <button className={tab === "past" ? "active" : ""} type="button" role="tab" onClick={() => setTab("past")}>
              Passados
            </button>
          </div>
          <div className="events-empty-card">
            <strong>{tab === "future" ? "Nenhum evento futuro" : "Nenhum evento passado"}</strong>
            <span>{tab === "future" ? "Os eventos futuros aparecerão aqui." : "Os eventos passados aparecerão aqui."}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
