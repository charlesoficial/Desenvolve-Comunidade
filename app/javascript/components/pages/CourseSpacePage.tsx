import { CommunityIcon } from "../../design-system";

type Lesson = {
  title: string;
  duration?: string;
};

type CourseSection = {
  title: string;
  meta: string;
  lessons: Lesson[];
};

type CourseSpaceConfig = {
  title: string;
  iconUrl: string;
  heading: string;
  showStart?: boolean;
  progressText: string;
  progressPercent: number;
  contentMeta?: string;
  collapseLabel?: string;
  sections: CourseSection[];
  emptyTitle?: string;
  emptyBody?: string;
};

const sampleAsset = (fileName: string) => `/community-assets/${fileName}`;

export type CourseSpaceSlug = "basico" | "metodo-comunidade" | "fba" | "aulas-nvl1" | "influencer-ia-tiktok-dark";

const courseSpaces: Record<CourseSpaceSlug, CourseSpaceConfig> = {
  basico: {
    title: "BÃ¡sico",
    iconUrl: sampleAsset("awaxoue0o2mtkhmm0ck56a1sr18h-500e2eba57dc.png"),
    heading: "Boas-vindas, VÃ­tor.",
    showStart: true,
    progressText: "0 de 6 aulas concluÃ­das",
    progressPercent: 0,
    contentMeta: "5 seÃ§Ãµes â€¢ 6 aulas â€¢ 1 h 49 min",
    collapseLabel: "Ocultar todas as seÃ§Ãµes",
    sections: [
      {
        title: "Nicho HOT",
        meta: "2 aulas â€¢ 39 min",
        lessons: [
          { title: "IntroduÃ§Ã£o pt1", duration: "17:09" },
          { title: "IntroduÃ§Ã£o pt2", duration: "22:06" },
        ],
      },
      {
        title: "Instagram",
        meta: "1 aula â€¢ 41 min",
        lessons: [{ title: "EstruturaÃ§Ã£o", duration: "41:33" }],
      },
      {
        title: "Criando Bot",
        meta: "1 aula â€¢ 9 min",
        lessons: [{ title: "VooHot", duration: "09:19" }],
      },
      {
        title: "MineraÃ§Ã£o",
        meta: "1 aula â€¢ 19 min",
        lessons: [{ title: "Minerar modelos no telegram", duration: "19:19" }],
      },
      {
        title: "Prompt Gemini/Grok",
        meta: "1 aula",
        lessons: [{ title: "prompts" }],
      },
    ],
  },
  "metodo-comunidade": {
    title: "Fulfillment by Merchant",
    iconUrl: sampleAsset("vgl6iyzpzt0b3kohtuntebcbhiox-f7d84f25043f.png"),
    heading: "Boas-vindas, VitÃ³r.",
    showStart: true,
    progressText: "0 de 14 aulas concluÃ­das",
    progressPercent: 0,
    contentMeta: "2 mÃ³dulos â€¢ 14 aulas â€¢ 3 h 21 min",
    collapseLabel: "Ocultar todos os mÃ³dulos",
    sections: [
      {
        title: "Amazon CPF",
        meta: "6 aulas â€¢ 1 h 36 min",
        lessons: [
          { title: "VisÃ£o Geral do MÃ©todo", duration: "02:12" },
          { title: "Criando sua Conta Seller", duration: "10:41" },
          { title: "Configurando Sua OperaÃ§Ã£o", duration: "04:18" },
          { title: "MineraÃ§Ã£o de Produtos Lucrativos", duration: "30:32" },
          { title: "Processamento e Envio dos Primeiros Pedidos", duration: "36:33" },
          { title: "Como Emitir um Rembolso/DevoluÃ§Ã£o | Extras", duration: "11:52" },
        ],
      },
      {
        title: "Amazon CNPJ",
        meta: "8 aulas â€¢ 1 h 45 min",
        lessons: [
          { title: "VisÃ£o Geral do MÃ©todo", duration: "00:46" },
          { title: "Abertura da sua Empresa", duration: "05:06" },
          { title: "Criando sua Conta Seller", duration: "08:39" },
          { title: "Configurando Sua OperaÃ§Ã£o", duration: "04:18" },
          { title: "ConfiguraÃ§Ã£o Fiscal", duration: "07:27" },
          { title: "MineraÃ§Ã£o de Produtos Lucrativos", duration: "30:32" },
          { title: "Processamento e Envio dos Primeiros Pedidos", duration: "36:33" },
          { title: "Como Emitir um Rembolso/DevoluÃ§Ã£o | Extras", duration: "11:52" },
        ],
      },
    ],
  },
  fba: {
    title: "FBA",
    iconUrl: sampleAsset("ljt8d56p7ibeexgh0bj5ddmlen0a-9a3e46db5669.png"),
    heading: "ConcluÃ­do! ðŸŽ‰",
    showStart: false,
    progressText: "0 de 0 aulas concluÃ­das",
    progressPercent: 0,
    sections: [],
    emptyTitle: "ConteÃºdo do curso",
    emptyBody: "Este curso ainda nÃ£o possui nenhum conteÃºdo publicado.",
  },
  "aulas-nvl1": {
    title: "Aulas",
    iconUrl: sampleAsset("4xtp50z2f2kdtlw8e0g34w1jqvht-02bd1f4360d4.png"),
    heading: "Boas-vindas, VitÃ³r.",
    showStart: true,
    progressText: "0 de 6 aulas concluÃ­das",
    progressPercent: 0,
    contentMeta: "4 seÃ§Ãµes â€¢ 6 aulas â€¢ 18 min",
    collapseLabel: "Ocultar todas as seÃ§Ãµes",
    sections: [
      {
        title: "Editar e subir oferta",
        meta: "1 aula â€¢ 18 min",
        lessons: [{ title: "Como subir oferta (bÃ¡sico)", duration: "18:45" }],
      },
      {
        title: "META ADS",
        meta: "3 aulas",
        lessons: [
          { title: "Meta (pÃ³s andromeda)" },
          { title: "Estrutura para testar oferta" },
          { title: "PrÃ© Escala" },
        ],
      },
      {
        title: "UGC / Lipsync",
        meta: "1 aula",
        lessons: [{ title: "Tutorial UGC / Lipsync" }],
      },
      {
        title: "X1 Whatsapp",
        meta: "1 aula",
        lessons: [{ title: "Tudo (ou quase tudo) sobre x1" }],
      },
    ],
  },
  "influencer-ia-tiktok-dark": {
    title: "Influencer IA & TikTok Dark",
    iconUrl: sampleAsset("t1l74hojbmqzn2bz0lf4qfo61vqz-fe900685ddcf.png"),
    heading: "Boas-vindas, VitÃ³r.",
    showStart: true,
    progressText: "0 de 27 aulas concluÃ­das",
    progressPercent: 0,
    contentMeta: "10 seÃ§Ãµes â€¢ 27 aulas â€¢ 5 h 43 min",
    collapseLabel: "Ocultar todas as seÃ§Ãµes",
    sections: [
      {
        title: "COMECE AQUI",
        meta: "1 aula â€¢ 1 min",
        lessons: [{ title: "Boas Vindas", duration: "01:15" }],
      },
      {
        title: "VEO 3 DE GRAÃ‡A",
        meta: "1 aula â€¢ 9 min",
        lessons: [{ title: "GOOGLE VEO 3 DE GRAÃ‡A ILIMITADO | METODO ATUALIZADO 2026", duration: "09:15" }],
      },
      {
        title: "CRIAÃ‡ÃƒO DE INFLUENCER",
        meta: "4 aulas â€¢ 1 h 9 min",
        lessons: [
          { title: "Criando sua Influencer IA do zero", duration: "22:07" },
          { title: "Criando sua Influencer IA do zero pt.2", duration: "17:10" },
          { title: "Criando VÃ­deo com a Influencer IA", duration: "16:57" },
          { title: "Influencer IA em CenÃ¡rios Reais", duration: "13:37" },
        ],
      },
      {
        title: "NICHOS VIRAIS",
        meta: "4 aulas â€¢ 39 min",
        lessons: [
          { title: "OS MELHORES NICHOS PARA VIRALIZAR!!", duration: "18:29" },
          { title: "NICHO LIFESYLE MILIONÃRIO + BÃ”NUS!!", duration: "03:05" },
          { title: "NICHO RELIGIOSO E NICHO PET!!", duration: "11:15" },
          { title: "NOVO NICHO VIRAL PARA VIRALIZAR EM MENOS DE 24 HORAS | VÃDEOS IA COM BEBÃŠ", duration: "06:37" },
        ],
      },
      {
        title: "ESTRUTURA DE PERFIL",
        meta: "5 aulas â€¢ 59 min",
        lessons: [
          { title: "NOME CRIATIVO E BIOGRAFIA PERSUASIVA PARA O SEU PERFIL DARK!!", duration: "09:31" },
          { title: "CRIANDO CONTAS NAS REDES SOCIAIS!!", duration: "08:26" },
          { title: "COMO CRIAR LOGO PROFISSIONAL PARA O SEU PERFIL DARK!!", duration: "14:00" },
          { title: "COMO CRIAR LINK NA BIO PROFISSIONAL!!", duration: "06:20" },
          { title: "COMO CRIAR UM EBOOK PARA VENDER NO LINK DA BIO!", duration: "21:36" },
        ],
      },
      {
        title: "CRIANDO CONTEÃšDOS VIRAIS",
        meta: "4 aulas â€¢ 1 h 9 min",
        lessons: [
          { title: "CRIANDO UM CONTEÃšDO VIRAL DO ZERO - PARTE 1", duration: "40:36" },
          { title: "CONTINUAÃ‡ÃƒO: CRIANDO CONTEÃšDO VIRAL", duration: "05:46" },
          { title: "COMO EU CRIO MEUS CONTEÃšDOS VIRAIS | IDEIAS DE VÃDEO !!", duration: "15:56" },
          { title: "COMO ENCONTRAR CONTEÃšDOS VIRAIS PARA REPRODUZIR 100X MELHOR!!", duration: "06:43" },
        ],
      },
      {
        title: "DOMINE O VEO 3",
        meta: "3 aulas â€¢ 54 min",
        lessons: [
          { title: "COMO CRIAR UM PROMPT VIRAL DE QUALQUER VÃDEO DO ZERO!!", duration: "16:58" },
          { title: "COMO CLONAR QUALQUER VÃDEO VIRAL", duration: "16:58" },
          { title: "COMO CRIAR SUA INFLUENCER IA", duration: "20:15" },
        ],
      },
      {
        title: "EDIÃ‡ÃƒO DE VÃDEOS",
        meta: "2 aulas â€¢ 22 min",
        lessons: [
          { title: "COMO EDITAR VÃDEOS PELO PC!!", duration: "15:51" },
          { title: "COMO EDITAR VÃDEOS PELO CELULAR!!", duration: "06:40" },
        ],
      },
      {
        title: "ESTRATÃ‰GIAS PARA VIRALIZAR",
        meta: "2 aulas â€¢ 9 min",
        lessons: [
          { title: "ESTRATÃ‰GIA TAGS E HASHTAG", duration: "04:59" },
          { title: "ESTRATÃ‰GIA PARA VIRALIZAR O PERFIL MAIS RÃPIDO!!", duration: "04:41" },
        ],
      },
      {
        title: "IA PARA VOZ",
        meta: "1 aula â€¢ 8 min",
        lessons: [{ title: "A MELHOR IA DE VOZ PARA CRIAR CONTEÃšDOS!!", duration: "08:12" }],
      },
    ],
  },
};

type CourseSpacePageProps = {
  slug: CourseSpaceSlug;
};

export function CourseSpacePage({ slug }: CourseSpacePageProps) {
  const course = courseSpaces[slug];
  const hasContent = course.sections.length > 0;

  return (
    <main className="course-space-main">
      <header className="course-space-header">
        <span className="course-space-title-icon">
          <img src={course.iconUrl} alt="" />
        </span>
        <h1>{course.title}</h1>
      </header>
      <section className="course-space-scroll" aria-label={course.title}>
        <div className="course-space-content">
          <div className="course-space-welcome">
            <h2>{course.heading}</h2>
            {course.showStart ? <button type="button">Iniciar</button> : null}
          </div>

          <section className="course-progress-card" aria-label="Progresso do curso">
            <div>
              <strong>Progresso do curso</strong>
              <span>{course.progressText}</span>
            </div>
            <div className="course-progress-meter" aria-label={`${course.progressPercent}% concluÃ­do`}>
              <i style={{ width: `${course.progressPercent}%` }} />
            </div>
            <em>{course.progressPercent}%</em>
          </section>

          {hasContent ? (
            <section className="course-content-list" aria-label="ConteÃºdo">
              <div className="course-content-heading">
                <div>
                  <h2>ConteÃºdo</h2>
                  <span>{course.contentMeta}</span>
                </div>
                <button type="button">{course.collapseLabel}</button>
              </div>

              <div className="course-module-stack">
                {course.sections.map((section) => (
                  <article className="course-module-card" key={section.title}>
                    <button className="course-module-header" type="button">
                      <span>
                        <strong>{section.title}</strong>
                        <small>{section.meta}</small>
                      </span>
                      <CommunityIcon name="icon-12-chevron-down-v3" size={12} />
                    </button>
                    {section.lessons.map((lesson) => (
                      <button className="course-lesson-row" type="button" key={`${section.title}-${lesson.title}`}>
                        <CommunityIcon name="icon-circle-empty" size={16} />
                        <span>{lesson.title}</span>
                        {lesson.duration ? <time>{lesson.duration}</time> : null}
                      </button>
                    ))}
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="course-empty-content" aria-label={course.emptyTitle}>
              <strong>{course.emptyTitle}</strong>
              <span>{course.emptyBody}</span>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
