import type { ChatMessage } from "../../data/chatData";
import { ChatThreadPanel } from "../chat/ChatThreadPanel";

export function ThreadPanel({ messages, onClose, parent }: { parent: ChatMessage; messages: ChatMessage[]; onClose: () => void }) {
  return <ChatThreadPanel parent={parent} messages={messages} onClose={onClose} />;
}
