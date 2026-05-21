import { useState } from "react";
import { P6Icon } from "../../design-system";
import { togglePostSave } from "../../lib/communityApi";

export function BookmarkButton({ postId, saved, onChange }: { postId: string; saved: boolean; onChange?: (saved: boolean) => void }) {
  const [optimistic, setOptimistic] = useState<{ postId: string; saved: boolean } | null>(null);
  const active = optimistic?.postId === postId ? optimistic.saved : saved;

  async function toggle() {
    const next = !active;
    setOptimistic({ postId, saved: next });
    onChange?.(next);

    if (postId.startsWith("fallback") || postId.startsWith("source-six-")) return;
    await togglePostSave(postId).catch(() => undefined);
  }

  return (
    <button className={active ? "active" : ""} type="button" aria-label={active ? "Remover dos salvos" : "Salvar"} onClick={toggle}>
      <P6Icon name={active ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={21} />
    </button>
  );
}
