import { ArrowUp, AtSign, Hash, Image, Mic, Paperclip, Smile } from "lucide-react";
import { useRef, useState } from "react";

type ComposerTool = "image" | "emoji" | "channel" | "mention" | "gif" | "attachment" | "audio" | null;

const emojis = ["\u{1F600}", "\u{1F525}", "\u{1F44F}", "\u{1F440}", "\u{2705}", "\u{1F4AC}", "\u{1F680}", "\u{2764}\u{FE0F}"];
const mentions = ["Night", "reiltuo", "bruniin"];
const channels = ["Chat Geral", "Feed Geral", "Politica Nacional"];

export function ChatComposer({ onSend, compact = false }: { onSend?: (body: string) => Promise<void> | void; compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [activeTool, setActiveTool] = useState<ComposerTool>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [fileMode, setFileMode] = useState<"image" | "attachment">("attachment");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = message.trim().length > 0 || isRecording;

  function toggleTool(tool: Exclude<ComposerTool, null>) {
    setActiveTool((current) => (current === tool ? null : tool));
  }

  function insertText(text: string) {
    setMessage((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${text}`);
    setActiveTool(null);
  }

  function pickFile(mode: "image" | "attachment") {
    setFileMode(mode);
    fileInputRef.current?.click();
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return;
    insertText(`${fileMode === "image" ? "[imagem" : "[anexo"}: ${file.name}]`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendMessage() {
    if (!canSend) return;
    const body = isRecording ? "Mensagem de voz" : message.trim();
    setMessage("");
    setIsRecording(false);
    setActiveTool(null);
    await onSend?.(body);
  }

  return (
    <div className={compact ? "chat-composer-wrap is-thread-composer" : "chat-composer-wrap"}>
      <div className="chat-composer cs-composer">
        <input
          placeholder="Digite uma mensagem..."
          aria-label="Digite uma mensagem"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onFocus={() => setActiveTool(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="composer-tools">
          <div>
            <button className={activeTool === "image" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Adicionar imagem" aria-expanded={activeTool === "image"} onClick={() => toggleTool("image")}><Image size={21} /></button>
            <button className={activeTool === "emoji" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Adicionar emoji" aria-expanded={activeTool === "emoji"} onClick={() => toggleTool("emoji")}><Smile size={21} /></button>
            <button className={activeTool === "channel" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Link para publicacao, evento, aula ou espaco" aria-expanded={activeTool === "channel"} onClick={() => toggleTool("channel")}><Hash size={21} /></button>
            <button className={activeTool === "mention" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Adicionar mencao" aria-expanded={activeTool === "mention"} onClick={() => toggleTool("mention")}><AtSign size={21} /></button>
            <button className={activeTool === "gif" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Adicionar GIF" aria-expanded={activeTool === "gif"} onClick={() => toggleTool("gif")}><span className="gif-chip">GIF</span></button>
            <button className={activeTool === "attachment" ? "cs-toolbar-button active" : "cs-toolbar-button"} type="button" aria-label="Anexar arquivos" aria-expanded={activeTool === "attachment"} onClick={() => toggleTool("attachment")}><Paperclip size={21} /></button>
            <button
              className={isRecording ? "cs-toolbar-button active" : "cs-toolbar-button"}
              type="button"
              aria-label="Gravar mensagem de voz"
              aria-expanded={activeTool === "audio"}
              onClick={() => {
                setIsRecording((current) => !current);
                setActiveTool("audio");
              }}
            >
              <Mic size={21} />
            </button>
          </div>
          <button className={canSend ? "send-button cs-send-button active" : "send-button cs-send-button"} type="button" aria-label="Enviar mensagem" onClick={sendMessage}>
            <ArrowUp size={18} strokeWidth={3} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          className="composer-file-input"
          type="file"
          accept={fileMode === "image" ? "image/*" : undefined}
          aria-label="Selecionar arquivo"
          onChange={(event) => handleFileChange(event.currentTarget.files?.[0])}
        />
        {activeTool ? <ComposerToolPopover tool={activeTool} isRecording={isRecording} onInsert={insertText} onPickFile={pickFile} /> : null}
      </div>
    </div>
  );
}

function ComposerToolPopover({
  tool,
  isRecording,
  onInsert,
  onPickFile,
}: {
  tool: Exclude<ComposerTool, null>;
  isRecording: boolean;
  onInsert: (text: string) => void;
  onPickFile: (mode: "image" | "attachment") => void;
}) {
  if (tool === "emoji") {
    return (
      <div className="composer-popover emoji-popover" role="menu">
        {emojis.map((emoji) => (
          <button type="button" key={emoji} onClick={() => onInsert(emoji)}>{emoji}</button>
        ))}
      </div>
    );
  }

  if (tool === "gif") {
    return (
      <div className="composer-popover composer-search-popover">
        <input aria-label="Pesquisar GIF" placeholder="Pesquisar GIF" />
        <span>GIFs populares aparecem aqui.</span>
      </div>
    );
  }

  if (tool === "mention") {
    return (
      <div className="composer-popover composer-list-popover" role="menu">
        {mentions.map((name) => <button type="button" key={name} onClick={() => onInsert(`@${name}`)}>@{name}</button>)}
      </div>
    );
  }

  if (tool === "channel") {
    return (
      <div className="composer-popover composer-list-popover" role="menu">
        {channels.map((name) => <button type="button" key={name} onClick={() => onInsert(`# ${name}`)}># {name}</button>)}
      </div>
    );
  }

  if (tool === "audio") {
    return (
      <div className="composer-popover composer-status-popover">
        <span className={isRecording ? "recording-dot is-on" : "recording-dot"} />
        {isRecording ? "Gravando mensagem de voz..." : "Clique no microfone para gravar."}
      </div>
    );
  }

  return (
    <div className="composer-popover composer-list-popover" role="menu">
      <button type="button" onClick={() => onPickFile(tool === "image" ? "image" : "attachment")}>{tool === "image" ? "Enviar imagem" : "Anexar arquivo"}</button>
      <button type="button" onClick={() => onInsert("https://")}>Colar URL</button>
    </div>
  );
}
