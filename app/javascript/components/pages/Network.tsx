import { useState } from "react";
import type { ChatMessage } from "../../data/chatData";
import { ChatMain } from "../chat/ChatMain";
import type { ChatRightPanel } from "../chat/ChatLayout";
import { ChatThreadPanel } from "../chat/ChatThreadPanel";
import { DetailsPanel } from "../chat/DetailsPanel";

const networkFallbackMessages: Record<string, ChatMessage[]> = {
  network: [
    {
      id: "network-source-1",
      author: "Davi",
      avatar: "D",
      time: "13:44",
      createdAt: "2026-04-18T13:44:00-03:00",
      text: "Como funciona a confirmaÃ§Ã£o de entrega da Amazon e o pagamento?",
      divider: "18 DE ABR.",
    },
    {
      id: "network-source-2",
      author: "Lucas Sales",
      avatar: "/community-assets/IMG_2459.jpeg-20e76166eb1c.jpg",
      time: "14:05",
      createdAt: "2026-04-18T14:05:00-03:00",
      text: "Depois que o pedido aparece como entregue, acompanha pelo Seller Central. O repasse costuma entrar no prÃ³ximo ciclo disponÃ­vel da conta.",
    },
    {
      id: "network-source-3",
      author: "Rian",
      avatar: "R",
      time: "16:18",
      createdAt: "2026-04-18T16:18:00-03:00",
      text: "Boa tarde pessoal, realmente nÃ£o dÃ¡ para baixar a tabela de frete. AlguÃ©m consegue enviar o link para baixar?",
      highlighted: true,
    },
    {
      id: "network-source-4",
      author: "Praga",
      avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg",
      time: "17:20",
      createdAt: "2026-04-18T17:20:00-03:00",
      text: "Boa pessoal, nome de loja do Amazon afeta muito nas vendas? Alguma sugestÃ£o?",
    },
  ],
  "network-033efe": [
    {
      id: "network-info-source-1",
      author: "Praga",
      avatar: "/community-assets/d0f92b7a6b87e4692dfd1c8e88c5df4e-3a8ff1ea6fcf.jpg",
      time: "10:12",
      createdAt: "2026-04-20T10:12:00-03:00",
      text: "Pessoal, alguÃ©m conseguiu validar a esteira de info com criativo direto para checkout?",
      divider: "20 DE ABR.",
    },
    {
      id: "network-info-source-2",
      author: "o_cuervo",
      avatar: "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg",
      time: "10:34",
      createdAt: "2026-04-20T10:34:00-03:00",
      text: "Testa primeiro com orÃ§amento pequeno e acompanha retenÃ§Ã£o. Se o pixel nÃ£o aprender, pausa e ajusta o Ã¢ngulo antes de escalar.",
    },
    {
      id: "network-info-source-3",
      author: "Night",
      avatar: "/community-assets/Cindy.jpeg-33fa075ae954.jpg",
      time: "12:08",
      createdAt: "2026-04-20T12:08:00-03:00",
      text: "A copy precisa deixar claro o mecanismo. Sem promessa forte e sem prova, o CTR atÃ© vem, mas a conversÃ£o morre.",
      highlighted: true,
    },
  ],
  "network-ae9544": [
    {
      id: "network-facebook-source-1",
      author: "Mateus",
      avatar: "M",
      time: "09:22",
      createdAt: "2026-04-22T09:22:00-03:00",
      text: "AlguÃ©m rodando Face Ads com BM novo? Estou testando aquecimento mais lento para nÃ£o tomar limite cedo.",
      divider: "22 DE ABR.",
    },
    {
      id: "network-facebook-source-2",
      author: "Refzinho",
      avatar: "/community-assets/9745dcfe727b27ce8d8aea9cc7814732-de56d9dd231c.jpg",
      time: "10:01",
      createdAt: "2026-04-22T10:01:00-03:00",
      text: "Aqui funcionou melhor subir conjunto com verba menor, deixar engajar e sÃ³ depois duplicar. Criativo agressivo derruba rÃ¡pido.",
    },
    {
      id: "network-facebook-source-3",
      author: "Vohes",
      avatar: "/community-assets/eu-0ce4791927fa.jpg",
      time: "11:16",
      createdAt: "2026-04-22T11:16:00-03:00",
      text: "No meu caso, domÃ­nio novo foi o que mais pegou. Troquei pÃ¡gina, deixei polÃ­tica visÃ­vel e estabilizou.",
    },
  ],
};

export function Network() {
  const [rightPanel, setRightPanel] = useState<ChatRightPanel>("details");
  const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const roomSlug = window.location.pathname.split("/").filter(Boolean).at(-1) || "network";
  const fallbackMessages = networkFallbackMessages[roomSlug] || networkFallbackMessages.network;

  return (
    <>
      <ChatMain
        roomSlug={roomSlug}
        title="Network"
        fallbackMessages={fallbackMessages}
        rightPanel={rightPanel}
        onRightPanelChange={setRightPanel}
        onMessagesChange={setMessages}
        onOpenThread={(message) => {
          setThreadMessage(message);
          setRightPanel("thread");
        }}
      />
      {rightPanel === "thread" && threadMessage ? (
        <ChatThreadPanel parent={threadMessage} messages={messages} onClose={() => setRightPanel("details")} />
      ) : rightPanel ? (
        <DetailsPanel mode={rightPanel} onClose={() => setRightPanel(null)} />
      ) : null}
    </>
  );
}
