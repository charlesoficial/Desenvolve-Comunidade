community = Community.find_or_create_by!(slug: "project-six") do |record|
  record.name = "Comunidade"
  record.brand_color = "#e11d48"
end

viewer = User.find_or_create_by!(email: "vitor-araujo@example.local") do |record|
  record.username = "vitor-araujo"
  record.display_name = "Vitor Santos Araujo"
  record.status = "online"
end

night = User.find_or_create_by!(email: "night@example.local") do |record|
  record.username = "night"
  record.display_name = "Night"
  record.avatar_url = "/community-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg"
  record.role = "admin"
  record.status = "offline"
  record.last_seen_at = 2.days.ago
end

goat = User.find_or_create_by!(email: "goat@example.local") do |record|
  record.username = "goat"
  record.display_name = "Goat Jornalista"
  record.role = "admin"
  record.status = "offline"
end

reiltuo = User.find_or_create_by!(email: "reiltuo@example.local") do |record|
  record.username = "reiltuo"
  record.display_name = "reiltuo"
  record.status = "online"
end

henrik = User.find_or_create_by!(email: "henrik@example.local") do |record|
  record.username = "henrik"
  record.display_name = "henrik"
  record.status = "online"
end

[viewer, night, goat, reiltuo, henrik].each do |user|
  Membership.find_or_create_by!(community:, user:) do |record|
    record.role = user.role == "admin" ? "admin" : "member"
    record.level = user.username == "night" ? 7 : 2
  end
end

spaces = [
  ["Feed", "feed", "feed", 1],
  ["Avisos", "avisos", "feed", 2],
  ["Feed Geral", "feed-geral", "feed", 3],
  ["Chat Geral", "chat-geral", "chat", 4],
  ["Membros", "membros", "members", 5],
  ["Seu Progresso", "seu-progresso", "progress", 6],
  ["PolÃ­tica Nacional", "politica-nacional", "feed", 20],
  ["Economia", "economia", "feed", 21],
  ["Criptomoedas", "criptomoedas", "feed", 22],
  ["IA News", "ia-news", "feed", 23],
  ["Marketing Digital", "marketing-digital", "feed", 24],
  ["Hacking/Tec", "hacking-tec", "feed", 25]
]

spaces.each do |name, slug, kind, position|
  Space.find_or_create_by!(community:, slug:) do |record|
    record.name = name
    record.kind = kind
    record.position = position
  end
end

politica = Space.find_by!(community:, slug: "politica-nacional")
chat = Space.find_by!(community:, slug: "chat-geral")

[
  [
    "Mara Maravilha Internada na UTI em SÃ£o Paulo: Motivo Ã© Desconhecido",
    "A apresentadora Mara Maravilha foi internada na Unidade de Terapia Intensiva (UTI) em SÃ£o Paulo. A notÃ­cia se espalhou rapidamente apÃ³s a divulgaÃ§Ã£o de um atestado mÃ©dico nas redes sociais da artista.\n\nO atestado, embora confirme a internaÃ§Ã£o, nÃ£o Ã©..."
  ],
  [
    "Alcolumbre Defende Congresso e Manda Indireta ao Governo Lula: \"Paz NÃ£o Ã‰ OmissÃ£o\"",
    "O presidente do Senado, Davi Alcolumbre (UniÃ£o Brasil-AP), defendeu a autonomia do Congresso Nacional nesta segunda-feira (2), durante a cerimÃ´nia de abertura do ano legislativo de 2026.\n\nEle ressaltou que a busca por harmonia entre os Poderes nÃ£o..."
  ]
].each do |title, body|
  Post.find_or_create_by!(space: politica, title:) do |record|
    record.user = goat
    record.body = body
    record.published_at = Time.current
  end
end

[
  [henrik, "2 kkk", 2.hours.ago],
  [reiltuo, "Clica na logo da comunidade na parte superior esquerda, lÃ¡ irÃ¡ aparecer a opÃ§Ã£o de troca de tema.", 1.hour.ago],
  [henrik, "quando o comprovante Ã© negado 3 vezes na amazon ja era ne", 45.minutes.ago],
  [henrik, "so outro cpf agora", 44.minutes.ago]
].each do |user, body, created_at|
  Message.find_or_create_by!(space: chat, user:, body:) do |record|
    record.created_at = created_at
    record.updated_at = created_at
  end
end

night_conversation = DirectConversation.find_or_create_by!(id: "e30a3f49-fbac-4b43-9b19-4dc57b2e3c68") do |record|
  record.created_by = night
  record.last_message_at = "2026-04-26 12:00:00"
end

[viewer, night].each do |user|
  DirectConversationParticipant.find_or_create_by!(direct_conversation: night_conversation, user:) do |record|
    record.last_read_at = user == viewer ? nil : Time.current
  end
end

welcome = DirectMessage.find_or_create_by!(direct_conversation: night_conversation, sender: night, body: "Ola, Vitor Santos Araujo! Seja muito bem-vindo(a) ao Comunidade.") do |record|
  record.metadata = { variant: "welcome" }
  record.created_at = "2026-04-26 12:00:00"
  record.updated_at = "2026-04-26 12:00:00"
end

night_conversation.update!(last_message: welcome, last_message_at: welcome.created_at)
