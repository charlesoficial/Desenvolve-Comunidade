type ChatAvatarProps = {
  avatar: string;
  name: string;
  size?: "sm" | "md";
  status?: "green" | "yellow";
};

export function ChatAvatar({ avatar, name, size = "md", status }: ChatAvatarProps) {
  const isImage = avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:");

  return (
    <span className={`chat-avatar ${size}`}>
      {isImage ? <img src={avatar} alt={name} /> : <strong>{avatar}</strong>}
      {status ? <i className={status} /> : null}
    </span>
  );
}
