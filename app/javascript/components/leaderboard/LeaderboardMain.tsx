import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info, Lock, Trophy, X } from "lucide-react";
import { loadLeaderboardData } from "../../lib/communityApi";
import type { LeaderboardData, LeaderboardEntry, LeaderboardPeriod } from "../../lib/communityApi";

const levels = [
  { level: 1, points: 0 },
  { level: 2, points: 10 },
  { level: 3, points: 20 },
  { level: 4, points: 40 },
  { level: 5, points: 80 },
  { level: 6, points: 160 },
  { level: 7, points: 320 },
  { level: 8, points: 640 },
  { level: 9, points: 1280 },
];

const periods: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: "7 dias", value: "7_days" },
  { label: "30 dias", value: "30_days" },
  { label: "PerÃ­odo Total", value: "all_time" },
];

function resolvePeriod(): LeaderboardPeriod {
  const url = new URL(window.location.href);
  const period = url.searchParams.get("period");
  if (period === "30_days" || period === "all_time") return period;
  return "7_days";
}

export function LeaderboardMain() {
  const [period, setPeriod] = useState<LeaderboardPeriod>(resolvePeriod);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    loadLeaderboardData(period).then(setLeaderboard).catch(() => setLeaderboard(null));
  }, [period]);

  useEffect(() => {
    const sync = () => setPeriod(resolvePeriod());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const selectPeriod = (next: LeaderboardPeriod) => {
    setPeriod(next);
    const url = new URL(window.location.href);
    url.pathname = "/leaderboard";
    url.search = "";
    url.searchParams.set("period", next);
    window.history.pushState({}, "", `${url.pathname}${url.search}`);
  };

  const currentUser = leaderboard?.currentUser || {
    id: "vitor-araujo",
    username: "vitor-araujo",
    name: "Vitor Santos Araujo",
    avatar: "VA",
    points: 0,
    level: 1,
    nextLevel: 2,
    pointsToNextLevel: 10,
  };
  const entries = leaderboard?.entries || [];

  return (
    <main className="leaderboard-main" aria-label="ConteÃºdo principal">
      <header className="leaderboard-header" aria-label="CabeÃ§alho da pÃ¡gina">
        <h1>Ranking</h1>
      </header>

      <div className="leaderboard-scroll">
        <div className="leaderboard-shell">
          <section className="leaderboard-user-card">
            <div className="leaderboard-user-top">
              <div className="leaderboard-profile">
                <AvatarLarge src={currentUser.avatar} name={currentUser.name} />
                <span className="leaderboard-level-bubble">{currentUser.level}</span>
                <h2>{currentUser.name}</h2>
              </div>
              <div className="leaderboard-current-level">
                <span><Trophy size={13} fill="currentColor" /> {currentUser.level} <i /> Level {currentUser.level}</span>
                <p>{formatPointsToNext(currentUser.pointsToNextLevel)} <Info size={12} /></p>
              </div>
            </div>

            <div className="leaderboard-levels">
              {levels.map((item) => (
                <div className={levelClassName(item.level, currentUser.level)} key={item.level}>
                  <span>{item.level <= currentUser.level ? item.level : <Lock size={15} />}</span>
                  <p>
                    <strong>Level {item.level}</strong>
                    <small>{formatPoints(item.points)}</small>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="leaderboard-table-area">
            <div className="leaderboard-period-row">
              <div className="leaderboard-period-tabs">
                {periods.map((item) => (
                  <button className={period === item.value ? "active" : ""} key={item.value} type="button" onClick={() => selectPeriod(item.value)}>
                    {item.label}
                  </button>
                ))}
              </div>
              <button className="leaderboard-help" type="button" onClick={() => setShowPoints(true)}>
                Como funcionam os pontos?
              </button>
            </div>

            <div className="leaderboard-list">
              {entries.map((entry, index) => (
                <LeaderboardRow entry={entry} index={index} key={entry.id || entry.username} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {showPoints ? <PointsModal onClose={() => setShowPoints(false)} /> : null}
    </main>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const rank = index + 1;

  return (
    <div className="leaderboard-row">
      <div className={rank <= 3 ? `leaderboard-rank medal medal-${rank}` : "leaderboard-rank"}>
        {rank}
      </div>
      <button className="leaderboard-member" type="button">
        <Avatar src={entry.avatar} name={entry.name} />
        <span>
          <strong>{entry.name}</strong>
          {entry.subtitle ? <small>{entry.subtitle}</small> : null}
        </span>
      </button>
      <strong className="leaderboard-points">+{entry.points}</strong>
    </div>
  );
}

function PointsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className="leaderboard-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="leaderboard-modal" role="dialog" aria-modal="true" aria-label="Como funcionam os pontos?">
        <header>
          <h2>Como funcionam os pontos?</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="leaderboard-modal-body">
          <section>
            <h3>1 curtida = 1 ponto</h3>
            <p>Cada curtida que vocÃª recebe numa publicaÃ§Ã£o ou comentÃ¡rio te recompensa com um ponto. Isso incentiva membros a fazer contribuiÃ§Ãµes valiosas e a recompensar os outros ao curtir suas contribuiÃ§Ãµes.</p>
          </section>
          <section>
            <h3>Recompensas</h3>
            <p>De vez em quando, vocÃª pode receber pontos como recompensa de um administrador da comunidade. Os seus pontos ficam visÃ­veis no seu perfil.</p>
          </section>
          <section>
            <h3>NÃ­veis</h3>
            <p>Ã€ medida que vocÃª junta pontos, vocÃª avanÃ§a pelos nÃ­veis de 1 a 9. Seu nÃ­vel atual Ã© exibido no seu avatar, e os pontos necessÃ¡rios para o prÃ³ximo nÃ­vel sÃ£o exibidos na sua pÃ¡gina de perfil.</p>
          </section>
          <div className="leaderboard-modal-levels">
            {levels.map((item) => (
              <div className={`modal-level modal-level-${Math.ceil(item.level / 3)}`} key={item.level}>
                <strong>Level {item.level}</strong>
                <span>{formatPoints(item.points)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  if (src === "p6") return <span className="leaderboard-avatar cs-black">p6</span>;
  if (src.startsWith("/") || src.startsWith("http")) return <img className="leaderboard-avatar" src={src} alt="" />;
  return <span className="leaderboard-avatar">{initials(name)}</span>;
}

function AvatarLarge({ src, name }: { src: string; name: string }) {
  if (src.startsWith("/") || src.startsWith("http")) return <img className="leaderboard-avatar-lg" src={src} alt="" />;
  return <span className="leaderboard-avatar-lg">{initials(name)}</span>;
}

function formatPoints(points: number) {
  return `${new Intl.NumberFormat("pt-BR").format(points)} pontos`;
}

function formatPointsToNext(points: number) {
  if (points <= 0) return "NÃ­vel mÃ¡ximo";
  return `${new Intl.NumberFormat("pt-BR").format(points)} ${points === 1 ? "ponto" : "pontos"} para subir de nÃ­vel`;
}

function levelClassName(level: number, currentLevel: number) {
  if (level === currentLevel) return "leaderboard-level is-active";
  if (level < currentLevel) return "leaderboard-level is-unlocked";
  return "leaderboard-level";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => /[\p{L}\p{N}]/u.test(part))
    .filter((_, index, parts) => index === 0 || index === parts.length - 1)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "VA";
}
