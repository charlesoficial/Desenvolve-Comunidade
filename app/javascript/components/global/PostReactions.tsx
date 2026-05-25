import { useEffect, useRef, useState } from "react";
import { CommunityIcon } from "../../design-system";
import { togglePostReaction } from "../../lib/communityApi";

const emojis = ["â¤ï¸", "ðŸ”¥", "ðŸ‘", "ðŸ’¡", "ðŸ‘€"];

export function PostReactions({
  liked,
  likes,
  postId,
  onChange,
}: {
  liked: boolean;
  likes: number;
  postId: string;
  onChange?: (liked: boolean, likes: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(liked);
  const [count, setCount] = useState(likes);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  async function react() {
    const next = !active;
    const nextCount = Math.max(0, count + (next ? 1 : -1));
    setActive(next);
    setCount(nextCount);
    onChange?.(next, nextCount);
    setOpen(false);

    if (postId.startsWith("fallback") || postId.startsWith("community-")) return;
    await togglePostReaction(postId).catch(() => undefined);
  }

  return (
    <div className="post-reactions" ref={rootRef}>
      <button
        className={active ? "liked" : ""}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <CommunityIcon name={active ? "icon-24-heart-red-fill" : "icon-24-heart-outline"} size={22} />
        <span>{count}</span>
      </button>
      {open ? (
        <div className="post-reaction-picker" role="menu" aria-label="ReaÃ§Ãµes">
          {emojis.map((emoji) => <button type="button" role="menuitem" key={emoji} onClick={react}>{emoji}</button>)}
        </div>
      ) : null}
    </div>
  );
}
