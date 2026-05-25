import { useState } from "react";
import { CommunityIcon } from "../../design-system";

const eventAsset = (fileName: string) => `/community-assets/${fileName}`;

const pastEvents = [
  {
    title: "Aula de OPSEC",
    time: "SÃ¡bado, 10 de jan. 20:00 â€“ 23:00 -03",
    kind: "TransmissÃ£o ao vivo",
    imageUrl: eventAsset("sda1cascas-46899b37902e.png"),
  },
  {
    title: "Amazon FBM",
    time: "TerÃ§a-feira, 16 de dez. 21:00 â€“ 22:30 -03",
    kind: "TransmissÃ£o ao vivo",
    imageUrl: eventAsset("imagem_2025-12-16_171144554-7845e15ee295.png"),
  },
];

export function EventoAula() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  return (
    <main className="event-space-main">
      <header className="event-space-header">
        <span className="event-space-title-icon">
          <CommunityIcon name="icon-event" size={20} />
        </span>
        <h1>Agenda de aulas</h1>
        <div className="event-space-members" aria-label="Membros">
          <span>Membros</span>
          <i />
          <i />
          <i />
          <strong>+859</strong>
        </div>
      </header>
      <section className="event-space-scroll" aria-label="Agenda de aulas">
        <div className="event-space-container">
          <img
            className="event-space-hero"
            src={eventAsset("9emjen8d6v4xhuwfs5ag30m5kgs6-988b040beead.png")}
            alt=""
          />

          <div className="event-filter-row" aria-label="Filtros de eventos">
            <button className="event-filter-dropdown" type="button">
              Futuros
              <CommunityIcon name="icon-12-chevron-down-v3" size={12} />
            </button>
            <span aria-hidden="true" />
            {["Todos", "Amazon FBM"].map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <section className="event-empty-card" aria-label="Eventos futuros">
            <CommunityIcon name="icon-calendar" size={24} />
            <strong>Nenhum evento futuro</strong>
            <span>Os eventos futuros aparecerÃ£o aqui.</span>
          </section>

          <section className="event-past-section" aria-label="Eventos passados">
            <h2>Eventos passados</h2>
            <div className="event-card-stack">
              {pastEvents.map((event) => (
                <article className="event-list-card" key={event.title}>
                  <img src={event.imageUrl} alt="" />
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                    <small>{event.kind}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
