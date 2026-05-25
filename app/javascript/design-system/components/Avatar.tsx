type AvatarProps = {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "away";
  className?: string;
};

const sizes = {
  sm: 32,
  md: 36,
  lg: 40,
};

export function Avatar({ src, name, size = "md", status, className = "" }: AvatarProps) {
  const px = sizes[size];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`cs-avatar ${className}`.trim()} style={{ width: px, height: px }}>
      {src ? <img src={src} alt={name} /> : initials}
      {status ? <i className={`cs-avatar-status ${status === "away" ? "is-away" : ""}`} /> : null}
    </span>
  );
}
