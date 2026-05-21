type AvatarProps = {
  src: string;
  name: string;
  size?: "sm" | "md";
  online?: boolean;
};

export function Avatar({ src, name, size = "md", online }: AvatarProps) {
  const className = `avatar avatar-${size}`;
  const isImage = src.startsWith("http") || src.startsWith("/") || src.startsWith("data:");

  return (
    <span className={className} title={name}>
      {isImage ? <img src={src} alt={name} /> : <span>{src.slice(0, 1)}</span>}
      {online ? <i className="avatar-online" /> : null}
    </span>
  );
}
