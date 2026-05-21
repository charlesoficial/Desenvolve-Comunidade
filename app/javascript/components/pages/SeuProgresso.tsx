import { ProgressMain } from "../progress/ProgressMain";

export function SeuProgresso({ onNavigate }: { onNavigate: (view: "feed" | "chat" | "politica" | "members" | "progress" | "leaderboard" | "courses" | "events" | "hackingTec", path?: string) => void }) {
  return <ProgressMain onNavigate={onNavigate} />;
}
