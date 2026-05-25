import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { resolveAdminSection } from "./adminSections";
import { AdminTopbar } from "./AdminTopbar";
import { AdminGeneral } from "./pages/AdminGeneral";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminAudience } from "./pages/AdminAudience";
import { AdminPaywalls } from "./pages/AdminPaywalls";
import { AdminPlans } from "./pages/AdminPlans";
import { AdminSpaces } from "./pages/AdminSpaces";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { AdminWorkflows } from "./pages/AdminWorkflows";
import { AdminMembershipQueue } from "./pages/AdminMembershipQueue";
import { AdminApiTokens } from "./pages/AdminApiTokens";
import { AdminPosts } from "./pages/AdminPosts";
import { AdminAiKnowledge } from "./pages/AdminAiKnowledge";
import { AdminEmails } from "./pages/AdminEmails";
import { AdminFiles } from "./pages/AdminFiles";
import { AdminAffiliates } from "./pages/AdminAffiliates";
import { AdminSettingsForm } from "./pages/AdminSettingsForm";
import { AdminLiveStreams } from "./pages/AdminLiveStreams";
import { AdminBulkActions } from "./pages/AdminBulkActions";
import { AdminStaticPages } from "./pages/AdminStaticPages";
import { AdminTopics } from "./pages/AdminTopics";
import { AdminPlaceholder } from "./pages/AdminPlaceholder";
import { AdminFeatureStub } from "./pages/AdminFeatureStub";
import { AdminMemberTags } from "./pages/AdminMemberTags";
import { AdminCoupons } from "./pages/AdminCoupons";

export function AdminLayout() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const section = resolveAdminSection(pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (target: string) => {
    setPathname(target);
    window.history.pushState({}, "", target);
  };

  return (
    <div className="admin-shell">
      <AdminTopbar />
      <div className="admin-body">
        <AdminSidebar active={section} activeSubpath={pathname} onNavigate={navigate} />
        <main className="admin-main">{renderPage(pathname)}</main>
      </div>
    </div>
  );
}

function renderPage(pathname: string) {
  switch (pathname) {
    case "/settings":
      return <AdminGeneral />;
    case "/settings/dashboard":
      return <AdminDashboard />;
    case "/audience/manage":
      return <AdminAudience />;
    case "/audience/invites":
      return <AdminMembershipQueue variant="invites" />;
    case "/audience/requests":
      return <AdminMembershipQueue variant="requests" />;
    case "/settings/paywalls":
      return <AdminPaywalls />;
    case "/settings/plans":
      return <AdminPlans />;
    case "/settings/spaces":
      return <AdminSpaces />;
    case "/settings/analytics":
      return <AdminAnalytics />;
    case "/settings/workflows":
      return <AdminWorkflows />;
    case "/settings/api":
      return <AdminApiTokens />;
    case "/settings/posts":
    case "/settings/moderation":
      return <AdminPosts />;
    case "/settings/pages":
      return <AdminStaticPages />;
    case "/settings/topics":
      return <AdminTopics />;
    case "/settings/live_streams":
      return <AdminLiveStreams />;
    case "/settings/posts/bulk_actions":
      return <AdminBulkActions />;
    case "/settings/ai-agents/knowledge":
    case "/settings/ai-agents":
      return <AdminAiKnowledge />;
    case "/settings/emails":
      return <AdminEmails />;
    case "/settings/files":
      return <AdminFiles />;
    case "/settings/affiliates_settings":
    case "/settings/affiliates":
      return <AdminAffiliates />;
    case "/settings/custom_domain":
      return (
        <AdminSettingsForm
          configKey="custom_domain"
          title="Domínio personalizado"
          subtitle="Aponte um domínio próprio para a comunidade. Configure o DNS antes de salvar."
          fieldLabels={{ domain: "Domínio", force_https: "Forçar HTTPS" }}
          fieldHelp={{
            domain: "Ex.: comunidade.suaempresa.com — adicione um CNAME para comunidade-com.fly.dev.",
          }}
        />
      );
    case "/settings/community_ai":
      return (
        <AdminSettingsForm
          configKey="community_ai"
          title="IA para comunidades"
          subtitle="Ajuste o assistente da comunidade que responde no chat e no feed."
          fieldLabels={{
            enabled: "Ativar IA",
            system_prompt: "Prompt do sistema",
            default_temperature: "Temperatura padrão (0 a 1)",
          }}
        />
      );
    case "/settings/mobile_app":
      return (
        <AdminSettingsForm
          configKey="mobile_app"
          title="Aplicativo móvel"
          subtitle="Configure os links das stores e a cor principal usada no app."
          fieldLabels={{
            enabled: "Habilitar app móvel",
            ios_url: "Link na App Store",
            android_url: "Link na Play Store",
            branding_color: "Cor de destaque",
          }}
        />
      );
    case "/settings/weekly_digest":
      return (
        <AdminSettingsForm
          configKey="weekly_digest"
          title="Resumo semanal"
          subtitle="E-mail enviado uma vez por semana com os destaques da comunidade."
          fieldLabels={{
            enabled: "Enviar resumo semanal",
            send_day: "Dia da semana",
            send_hour: "Hora (0 a 23)",
            include_top_posts: "Incluir posts mais populares",
            include_new_members: "Incluir novos membros",
          }}
          fieldOptions={{
            send_day: [
              { value: "monday", label: "Segunda" },
              { value: "tuesday", label: "Terça" },
              { value: "wednesday", label: "Quarta" },
              { value: "thursday", label: "Quinta" },
              { value: "friday", label: "Sexta" },
              { value: "saturday", label: "Sábado" },
              { value: "sunday", label: "Domingo" },
            ],
          }}
        />
      );
    case "/settings/embed":
      return (
        <AdminSettingsForm
          configKey="embed"
          title="Incorporar"
          subtitle="Permita exibir a comunidade dentro de outros sites via iframe."
          fieldLabels={{
            enabled: "Permitir embed",
            allowed_origins: "Origens autorizadas",
          }}
          fieldHelp={{
            allowed_origins: "Uma URL por linha. Ex.: https://meu-site.com",
          }}
        />
      );
    case "/settings/sso":
      return (
        <AdminSettingsForm
          configKey="sso"
          title="Single Sign-On (SSO)"
          subtitle="Integre com seu provedor SAML ou OIDC corporativo."
          fieldLabels={{
            enabled: "Ativar SSO",
            provider: "Provedor",
            metadata_url: "URL de metadados",
            entity_id: "Entity ID / Client ID",
          }}
          fieldOptions={{
            provider: [
              { value: "saml", label: "SAML 2.0" },
              { value: "oidc", label: "OpenID Connect" },
              { value: "google_workspace", label: "Google Workspace" },
              { value: "azure_ad", label: "Microsoft Entra (Azure AD)" },
            ],
          }}
        />
      );
    case "/settings/connect":
      return (
        <AdminSettingsForm
          configKey="connect"
          title="Conexões"
          subtitle="Webhooks de saída para automações em Zapier, n8n, Discord e Slack."
          fieldLabels={{
            zapier_enabled: "Ativar Zapier",
            n8n_webhook_url: "Webhook n8n",
            discord_webhook_url: "Webhook Discord",
            slack_webhook_url: "Webhook Slack",
          }}
        />
      );
    case "/settings/legal":
      return (
        <AdminSettingsForm
          configKey="legal"
          title="Jurídico"
          subtitle="URLs dos termos, política de privacidade e canal de suporte."
          fieldLabels={{
            terms_url: "Termos de uso",
            privacy_url: "Política de privacidade",
            cookies_url: "Política de cookies",
            support_email: "E-mail de suporte",
          }}
        />
      );
    case "/settings/home":
      return (
        <AdminSettingsForm
          configKey="home"
          title="Página inicial"
          subtitle="Personalize o que aparece para visitantes não autenticados."
          fieldLabels={{
            headline: "Título principal",
            subheadline: "Subtítulo",
            cta_text: "Texto do botão",
            cta_path: "Destino do botão",
            show_member_count: "Exibir contagem de membros",
          }}
        />
      );

    /* ---------- Membros (sub-páginas faltantes) ---------- */
    case "/settings/access_groups":
      return (
        <AdminFeatureStub
          title="Grupos de acesso"
          subtitle="Defina conjuntos de espaços e permissões que podem ser atribuídos em massa a tags ou planos."
          cta={{ label: "Criar grupo de acesso" }}
          bullets={[
            "Lista de grupos com nome, descrição e contagem de membros",
            "Cada grupo libera espaços específicos + papéis (membro, mod, admin)",
            "Pode ser atribuído manualmente, via tag ou ao comprar paywall",
            "Histórico de mudanças e alterações em massa",
          ]}
        />
      );
    case "/settings/segments":
      return (
        <AdminFeatureStub
          title="Segmentos"
          subtitle="Listas dinâmicas de membros baseadas em filtros (ex.: ativos nos últimos 7 dias, plano Pro, sem post)."
          cta={{ label: "Criar segmento" }}
          bullets={[
            "Builder de filtros (atividade, posts, comentários, plano, tags)",
            "Contagem em tempo real do total de membros",
            "Exportar CSV ou usar como público de e-mail/automação",
            "Salvar como segmento favorito pra reutilizar",
          ]}
        />
      );
    case "/settings/member_tags":
      return <AdminMemberTags />;
    case "/members/onboarding":
      return (
        <AdminFeatureStub
          title="Onboarding"
          subtitle="Defina o questionário inicial que novos membros respondem ao entrar na comunidade."
          cta={{ label: "Editar fluxo" }}
          bullets={[
            "Sequência de telas com campos personalizados",
            "Coleta dados pra preencher o perfil automaticamente",
            "Encaminha pra espaços recomendados conforme respostas",
          ]}
        />
      );
    case "/settings/gamification":
      return (
        <AdminFeatureStub
          title="Gamificação"
          subtitle="Configure níveis, pontos e recompensas para engajamento dos membros."
          cta={{ label: "Configurar regras" }}
          bullets={[
            "Definição de pontos por ação (post, comentário, reação, login)",
            "Curva de níveis customizável (níveis 1-10 com nome e ícone)",
            "Badges por conquistas (primeiro post, 100 pontos etc)",
            "Leaderboard semanal/mensal/all-time",
          ]}
        />
      );
    case "/members/profile_fields":
      return (
        <AdminFeatureStub
          title="Campos de perfil"
          subtitle="Adicione campos extras ao perfil de cada membro (cidade, profissão, bio etc)."
          cta={{ label: "Novo campo" }}
          bullets={[
            "Tipos: texto, número, dropdown, multi-select, data",
            "Marcar como obrigatório no onboarding",
            "Visibilidade configurável (público, membros, admin)",
          ]}
        />
      );
    case "/members/invitation_links":
      return (
        <AdminFeatureStub
          title="Links de convite"
          subtitle="Crie URLs únicas para campanhas de convite com tracking de origem e limite de usos."
          cta={{ label: "Novo link" }}
          bullets={[
            "Cada link tem código único e contagem de usos",
            "Expirar por data ou número máximo de uses",
            "Atribui automaticamente um plano e/ou tags ao usar",
            "Relatório de conversão por origem",
          ]}
        />
      );
    case "/settings/members/bulk_import_tasks":
      return (
        <AdminFeatureStub
          title="Importações de membros"
          subtitle="Histórico de uploads de CSV, com status, total importado e erros."
          bullets={[
            "Upload de CSV com colunas e-mail, nome, tags, plano",
            "Validação prévia antes de processar",
            "Notificação por e-mail quando termina",
            "Download do log de erros",
          ]}
        />
      );
    case "/settings/members/activity_logs":
      return (
        <AdminFeatureStub
          title="Registros de atividades"
          subtitle="Auditoria de ações administrativas: quem mudou o que e quando."
          bullets={[
            "Filtro por admin, data e tipo de ação",
            "Inclui mudanças em planos, paywalls, configurações",
            "Detalhe diff (antes/depois) de cada alteração",
            "Exportável em CSV",
          ]}
        />
      );

    /* ---------- Paywalls (sub-páginas faltantes) ---------- */
    case "/settings/coupons":
      return <AdminCoupons />;
    case "/settings/paywall_groups":
      return (
        <AdminFeatureStub
          title="Grupos de assinatura"
          subtitle="Combine vários paywalls num único grupo (ex.: Mentoria + Curso = pacote)."
          cta={{ label: "Novo grupo" }}
          bullets={[
            "Membro paga 1 vez e ganha acesso a vários paywalls",
            "Preço com desconto vs comprar separado",
            "Trial period configurável",
          ]}
        />
      );
    case "/settings/paywall_charges":
      return (
        <AdminFeatureStub
          title="Transações"
          subtitle="Histórico de cobranças do Stripe (sucesso, falha, reembolso)."
          bullets={[
            "Filtro por data, paywall, status",
            "Detalhe de cada transação (cartão, valor, taxa)",
            "Reembolsar via Stripe sem sair do painel",
            "Total bruto/líquido por período",
          ]}
        />
      );
    case "/settings/paywall_subscriptions":
      return (
        <AdminFeatureStub
          title="Assinaturas"
          subtitle="Lista de assinantes ativos, pausados e cancelados."
          bullets={[
            "Status, próxima cobrança, valor mensal",
            "Cancelar/pausar via painel (sincroniza com Stripe)",
            "Métricas: MRR, churn, retention",
            "Exportar CSV pra análise externa",
          ]}
        />
      );
    case "/settings/paywall_tax_settings":
      return (
        <AdminFeatureStub
          title="Impostos"
          subtitle="Configure como impostos são calculados nas vendas."
          bullets={[
            "Modelo: incluso no preço ou adicionado no checkout",
            "Alíquotas por país/estado",
            "Integração com Stripe Tax (auto-cálculo)",
            "Notas fiscais por transação",
          ]}
        />
      );
    case "/settings/paywall_bulk_logs":
      return (
        <AdminFeatureStub
          title="Registros em massa de paywalls"
          subtitle="Logs das ações em massa em paywalls e assinaturas (cancelamentos, descontos, exports)."
        />
      );

    /* ---------- Analytics sub-páginas ---------- */
    case "/settings/analytics/members":
      return (
        <AdminFeatureStub
          title="Analytics — Membros"
          subtitle="Crescimento, ativação, retenção e churn da base de membros."
          bullets={[
            "Novos membros por dia/semana/mês",
            "DAU / WAU / MAU",
            "Coorte por semana de cadastro",
            "Top membros por engajamento",
          ]}
        />
      );
    case "/settings/analytics/website":
      return (
        <AdminFeatureStub
          title="Analytics — Site"
          subtitle="Visitas à página pública e funil de conversão de visitante para membro."
          bullets={["Pageviews, sessions, bounce rate", "Origens (referrer, UTM)", "Conversão visitante → cadastro"]}
        />
      );
    case "/settings/analytics/spaces":
      return (
        <AdminFeatureStub
          title="Analytics — Espaços"
          subtitle="Engajamento por espaço (posts, comentários, reações)."
          bullets={["Top espaços por atividade", "Membros ativos por espaço", "Taxa de retorno"]}
        />
      );
    case "/settings/analytics/post_comments":
      return (
        <AdminFeatureStub
          title="Analytics — Publicações & comentários"
          subtitle="Volume e qualidade das interações em conteúdo."
          bullets={["Top posts por reações/comentários", "Distribuição por hora/dia da semana", "Autores mais ativos"]}
        />
      );
    case "/settings/analytics/messages":
      return (
        <AdminFeatureStub
          title="Analytics — Mensagens"
          subtitle="Volume de DMs e mensagens em chat público."
          bullets={["Mensagens por dia", "DMs vs chat público", "Pares de membros mais ativos"]}
        />
      );
    case "/settings/analytics/devices":
      return (
        <AdminFeatureStub
          title="Analytics — Dispositivos"
          subtitle="Distribuição de uso por desktop, mobile, tablet, app nativo."
          bullets={["% por device", "Tempo médio de sessão por device", "Versão do sistema/navegador"]}
        />
      );
    case "/settings/analytics/events":
      return (
        <AdminFeatureStub
          title="Analytics — Eventos"
          subtitle="RSVP, presença, gravações assistidas."
          bullets={["Top eventos por inscrições", "Taxa de presença vs RSVP", "Visualizações pós-evento"]}
        />
      );
    case "/settings/analytics/payments":
      return (
        <AdminFeatureStub
          title="Analytics — Pagamentos"
          subtitle="Receita, MRR, ARR, churn financeiro."
          bullets={["MRR por mês", "Churn voluntário vs involuntário", "LTV médio por plano", "Receita por afiliado"]}
        />
      );
    case "/settings/analytics/courses":
      return (
        <AdminFeatureStub
          title="Analytics — Cursos"
          subtitle="Conclusão de aulas, drop-off, certificados emitidos."
          bullets={["Taxa de conclusão por curso", "Lições mais e menos vistas", "Tempo médio até conclusão"]}
        />
      );

    /* ---------- AI Agents sub-páginas ---------- */
    case "/settings/ai-agents/inbox":
      return (
        <AdminFeatureStub
          title="Inbox da IA"
          subtitle="Conversas que o agente teve com membros — útil pra revisar respostas e treinar."
          bullets={[
            "Lista de conversas com status (resolvida, escalada, aberta)",
            "Avaliações dos membros (👍 / 👎)",
            "Conversa completa em modo leitura",
            "Botão pra marcar resposta como base de conhecimento",
          ]}
        />
      );

    default:
      return <AdminPlaceholder route={pathname} />;
  }
}
