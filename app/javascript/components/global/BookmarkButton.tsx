import { useState } from "react";
import { CommunityIcon } from "../../design-system";
import { togglePostSave } from "../../lib/communityApi";

export function BookmarkButton({ postId, saved, onChange }: { postId: string; saved: boolean; onChange?: (saved: boolean) => void }) {
  const [optimistic, setOptimistic] = useState<{ postId: string; saved: boolean } | null>(null);
  const active = optimistic?.postId === postId ? optimistic.saved : saved;

  async function toggle() {
    const next = !active;
    setOptimistic({ postId, saved: next });
    onChange?.(next);

    if (postId.startsWith("fallback") || postId.startsWith("community-")) return;
    await togglePostSave(postId).catch(() => undefined);
  }

  return (
    <button className={active ? "active" : ""} type="button" aria-label={active ? "Remover dos salvos" : "Salvar"} onClick={toggle}>
      <CommunityIcon name={active ? "icon-20-bookmark-fill" : "icon-20-bookmark-v3"} size={21} />
    </button>
  );
}
