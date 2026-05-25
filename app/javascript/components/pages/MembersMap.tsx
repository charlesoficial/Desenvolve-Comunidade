import { useCallback, useEffect, useMemo, useState } from "react";
import { CommunityIcon } from "../../design-system";
import { loadDirectoryMembers, type DirectoryMember } from "../../lib/communityApi";

const mapClusters = [
  { id: "us-west", label: "2", left: 5.6, top: 37.7 },
  { id: "us-central", label: "4", left: 15.6, top: 32.8 },
  { id: "uk-ireland", label: "3", left: 45.9, top: 24.2 },
  { id: "iberia", label: "9", left: 45.8, top: 37.7 },
  { id: "europe-south", label: "2", left: 51.1, top: 36.2 },
  { id: "europe-east", label: "5", left: 56.4, top: 24.2 },
  { id: "east-asia", label: "2", left: 94.4, top: 37.1 },
  { id: "br-north", label: "12", left: 24.5, top: 58.3 },
  { id: "br-south", label: "122", left: 30.6, top: 66.1 },
  { id: "ar-chile", label: "2", left: 23.9, top: 76.2 },
];

const mapPins = [
  { left: 24.1, top: 33.9 },
  { left: 44.7, top: 13.9 },
  { left: 66.3, top: 14.6 },
  { left: 59.4, top: 33.8 },
  { left: 74.3, top: 47.4 },
  { left: 28.4, top: 67.2 },
  { left: 50.4, top: 49.2 },
];

const osmTiles = Array.from({ length: 16 }, (_, index) => {
  const x = index % 4;
  const y = Math.floor(index / 4);
  return { id: `${x}-${y}`, src: `https://tile.openstreetmap.org/2/${x}/${y}.png` };
});

export function MembersMap() {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [selected, setSelected] = useState<DirectoryMember | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let alive = true;
    loadDirectoryMembers("oldest").then((rows) => {
      if (alive) setMembers(rows);
    });

    return () => {
      alive = false;
    };
  }, []);

  const located = useMemo(() => members.filter((member) => member.location).slice(0, 7), [members]);
  const closeMap = useCallback(() => {
    window.history.pushState({}, "", "/members");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMap();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeMap]);

  return (
    <main className="members-map-page">
      <section className="members-map-modal-shell" role="dialog" aria-modal="true" aria-label="VisualizaÃ§Ã£o do mapa">
        <header className="members-map-modal-header">
          <h1>VisualizaÃ§Ã£o do mapa</h1>
          <button type="button" aria-label="Fechar mapa" onClick={closeMap}>
            <CommunityIcon name="icon-20-close" size={22} />
          </button>
        </header>
        <div className="members-map-modal-body">
          <div className="members-map-canvas is-live-reference" aria-label="Mapa visual de membros">
            <div className="members-map-zoom">
              <button type="button" aria-label="Aproximar" onClick={() => setZoom((value) => Math.min(3, value + 0.25))}>+</button>
              <button type="button" aria-label="Afastar" onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>-</button>
            </div>
            <div className="members-map-logo" aria-hidden="true">mapbox</div>
            <div className="members-map-attribution">Â© Mapbox Â© OpenStreetMap <strong>Improve this map</strong></div>
            <div className="members-map-world" style={{ transform: `scale(${zoom})` }} aria-hidden="true">
              <div className="members-map-tile-grid">
                {osmTiles.map((tile) => <img src={tile.src} alt="" key={tile.id} loading="eager" referrerPolicy="no-referrer" />)}
              </div>
              <span className="members-map-tile" />
              <span className="members-map-land north-america" />
              <span className="members-map-land central-america" />
              <span className="members-map-land south-america" />
              <span className="members-map-land europe" />
              <span className="members-map-land africa" />
              <span className="members-map-land asia" />
              <span className="members-map-land australia" />
              <span className="members-map-land antarctica" />
              <span className="members-map-label north-atlantic">North Atlantic Ocean</span>
              <span className="members-map-label pacific">Pacific Ocean</span>
              <span className="members-map-label south-atlantic">South Atlantic Ocean</span>
              <span className="members-map-label africa-label">Africa</span>
              <span className="members-map-label europe-label">Europe</span>
            </div>
            {mapClusters.map((cluster) => (
              <button
                className="members-map-cluster"
                style={{ left: `${cluster.left}%`, top: `${cluster.top}%` }}
                type="button"
                key={cluster.id}
                aria-label={`${cluster.label} membros nesta regiÃ£o`}
              >
                {cluster.label}
              </button>
            ))}
            {located.map((member, index) => (
              <button
                className="members-map-pin"
                style={{
                  left: `${mapPins[index % mapPins.length].left}%`,
                  top: `${mapPins[index % mapPins.length].top}%`,
                }}
                type="button"
                key={member.id}
                title={`${member.name} - ${member.location}`}
                onClick={() => setSelected(member)}
              >
                {member.avatar.startsWith("/") ? <img src={member.avatar} alt="" /> : member.avatar.slice(0, 2)}
              </button>
            ))}
            {selected ? (
              <article className="members-map-popover">
                <button type="button" aria-label="Fechar membro" onClick={() => setSelected(null)}>
                  <CommunityIcon name="icon-20-close" size={16} />
                </button>
                <strong>{selected.name}</strong>
                <span>{selected.location || "Localidade nÃ£o informada"}</span>
                <small>{selected.status === "online" ? "Online agora" : selected.lastSeen}</small>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
