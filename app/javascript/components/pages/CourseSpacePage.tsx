import { P6Icon } from "../../design-system";

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

const sourceSixAsset = (fileName: string) => `/source-six-assets/${fileName}`;

export type CourseSpaceSlug = "basico" | "metodop6" | "fba" | "aulas-nvl1" | "influencer-ia-tiktok-dark";

const courseSpaces: Record<CourseSpaceSlug, CourseSpaceConfig> = {
  basico: {
    title: "Básico",
    iconUrl: sourceSixAsset("awaxoue0o2mtkhmm0ck56a1sr18h-500e2eba57dc.png"),
    heading: "Boas-vindas, Vítor.",
    showStart: true,
    progressText: "0 de 6 aulas concluídas",
    progressPercent: 0,
    contentMeta: "5 seções • 6 aulas • 1 h 49 min",
    collapseLabel: "Ocultar todas as seções",
    sections: [
      {
        title: "Nicho HOT",
        meta: "2 aulas • 39 min",
        lessons: [
          { title: "Introdução pt1", duration: "17:09" },
          { title: "Introdução pt2", duration: "22:06" },
        ],
      },
      {
        title: "Instagram",
        meta: "1 aula • 41 min",
        lessons: [{ title: "Estruturação", duration: "41:33" }],
      },
      {
        title: "Criando Bot",
        meta: "1 aula • 9 min",
        lessons: [{ title: "VooHot", duration: "09:19" }],
      },
      {
        title: "Mineração",
        meta: "1 aula • 19 min",
        lessons: [{ title: "Minerar modelos no telegram", duration: "19:19" }],
      },
      {
        title: "Prompt Gemini/Grok",
        meta: "1 aula",
        lessons: [{ title: "prompts" }],
      },
    ],
  },
  metodop6: {
    title: "Fulfillment by Merchant",
    iconUrl: sourceSixAsset("vgl6iyzpzt0b3kohtuntebcbhiox-f7d84f25043f.png"),
    heading: "Boas-vindas, Vitór.",
    showStart: true,
    progressText: "0 de 14 aulas concluídas",
    progressPercent: 0,
    contentMeta: "2 módulos • 14 aulas • 3 h 21 min",
    collapseLabel: "Ocultar todos os módulos",
    sections: [
      {
        title: "Amazon CPF",
        meta: "6 aulas • 1 h 36 min",
        lessons: [
          { title: "Visão Geral do Método", duration: "02:12" },
          { title: "Criando sua Conta Seller", duration: "10:41" },
          { title: "Configurando Sua Operação", duration: "04:18" },
          { title: "Mineração de Produtos Lucrativos", duration: "30:32" },
          { title: "Processamento e Envio dos Primeiros Pedidos", duration: "36:33" },
          { title: "Como Emitir um Rembolso/Devolução | Extras", duration: "11:52" },
        ],
      },
      {
        title: "Amazon CNPJ",
        meta: "8 aulas • 1 h 45 min",
        lessons: [
          { title: "Visão Geral do Método", duration: "00:46" },
          { title: "Abertura da sua Empresa", duration: "05:06" },
          { title: "Criando sua Conta Seller", duration: "08:39" },
          { title: "Configurando Sua Operação", duration: "04:18" },
          { title: "Configuração Fiscal", duration: "07:27" },
          { title: "Mineração de Produtos Lucrativos", duration: "30:32" },
          { title: "Processamento e Envio dos Primeiros Pedidos", duration: "36:33" },
          { title: "Como Emitir um Rembolso/Devolução | Extras", duration: "11:52" },
        ],
      },
    ],
  },
  fba: {
    title: "FBA",
    iconUrl: sourceSixAsset("ljt8d56p7ibeexgh0bj5ddmlen0a-9a3e46db5669.png"),
    heading: "Concluído! 🎉",
    showStart: false,
    progressText: "0 de 0 aulas concluídas",
    progressPercent: 0,
    sections: [],
    emptyTitle: "Conteúdo do curso",
    emptyBody: "Este curso ainda não possui nenhum conteúdo publicado.",
  },
  "aulas-nvl1": {
    title: "Aulas",
    iconUrl: sourceSixAsset("4xtp50z2f2kdtlw8e0g34w1jqvht-02bd1f4360d4.png"),
    heading: "Boas-vindas, Vitór.",
    showStart: true,
    progressText: "0 de 6 aulas concluídas",
    progressPercent: 0,
    contentMeta: "4 seções • 6 aulas • 18 min",
    collapseLabel: "Ocultar todas as seções",
    sections: [
      {
        title: "Editar e subir oferta",
        meta: "1 aula • 18 min",
        lessons: [{ title: "Como subir oferta (básico)", duration: "18:45" }],
      },
      {
        title: "META ADS",
        meta: "3 aulas",
        lessons: [
          { title: "Meta (pós andromeda)" },
          { title: "Estrutura para testar oferta" },
          { title: "Pré Escala" },
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
    iconUrl: sourceSixAsset("t1l74hojbmqzn2bz0lf4qfo61vqz-fe900685ddcf.png"),
    heading: "Boas-vindas, Vitór.",
    showStart: true,
    progressText: "0 de 27 aulas concluídas",
    progressPercent: 0,
    contentMeta: "10 seções • 27 aulas • 5 h 43 min",
    collapseLabel: "Ocultar todas as seções",
    sections: [
      {
        title: "COMECE AQUI",
        meta: "1 aula • 1 min",
        lessons: [{ title: "Boas Vindas", duration: "01:15" }],
      },
      {
        title: "VEO 3 DE GRAÇA",
        meta: "1 aula • 9 min",
        lessons: [{ title: "GOOGLE VEO 3 DE GRAÇA ILIMITADO | METODO ATUALIZADO 2026", duration: "09:15" }],
      },
      {
        title: "CRIAÇÃO DE INFLUENCER",
        meta: "4 aulas • 1 h 9 min",
        lessons: [
          { title: "Criando sua Influencer IA do zero", duration: "22:07" },
          { title: "Criando sua Influencer IA do zero pt.2", duration: "17:10" },
          { title: "Criando Vídeo com a Influencer IA", duration: "16:57" },
          { title: "Influencer IA em Cenários Reais", duration: "13:37" },
        ],
      },
      {
        title: "NICHOS VIRAIS",
        meta: "4 aulas • 39 min",
        lessons: [
          { title: "OS MELHORES NICHOS PARA VIRALIZAR!!", duration: "18:29" },
          { title: "NICHO LIFESYLE MILIONÁRIO + BÔNUS!!", duration: "03:05" },
          { title: "NICHO RELIGIOSO E NICHO PET!!", duration: "11:15" },
          { title: "NOVO NICHO VIRAL PARA VIRALIZAR EM MENOS DE 24 HORAS | VÍDEOS IA COM BEBÊ", duration: "06:37" },
        ],
      },
      {
        title: "ESTRUTURA DE PERFIL",
        meta: "5 aulas • 59 min",
        lessons: [
          { title: "NOME CRIATIVO E BIOGRAFIA PERSUASIVA PARA O SEU PERFIL DARK!!", duration: "09:31" },
          { title: "CRIANDO CONTAS NAS REDES SOCIAIS!!", duration: "08:26" },
          { title: "COMO CRIAR LOGO PROFISSIONAL PARA O SEU PERFIL DARK!!", duration: "14:00" },
          { title: "COMO CRIAR LINK NA BIO PROFISSIONAL!!", duration: "06:20" },
          { title: "COMO CRIAR UM EBOOK PARA VENDER NO LINK DA BIO!", duration: "21:36" },
        ],
      },
      {
        title: "CRIANDO CONTEÚDOS VIRAIS",
        meta: "4 aulas • 1 h 9 min",
        lessons: [
          { title: "CRIANDO UM CONTEÚDO VIRAL DO ZERO - PARTE 1", duration: "40:36" },
          { title: "CONTINUAÇÃO: CRIANDO CONTEÚDO VIRAL", duration: "05:46" },
          { title: "COMO EU CRIO MEUS CONTEÚDOS VIRAIS | IDEIAS DE VÍDEO !!", duration: "15:56" },
          { title: "COMO ENCONTRAR CONTEÚDOS VIRAIS PARA REPRODUZIR 100X MELHOR!!", duration: "06:43" },
        ],
      },
      {
        title: "DOMINE O VEO 3",
        meta: "3 aulas • 54 min",
        lessons: [
          { title: "COMO CRIAR UM PROMPT VIRAL DE QUALQUER VÍDEO DO ZERO!!", duration: "16:58" },
          { title: "COMO CLONAR QUALQUER VÍDEO VIRAL", duration: "16:58" },
          { title: "COMO CRIAR SUA INFLUENCER IA", duration: "20:15" },
        ],
      },
      {
        title: "EDIÇÃO DE VÍDEOS",
        meta: "2 aulas • 22 min",
        lessons: [
          { title: "COMO EDITAR VÍDEOS PELO PC!!", duration: "15:51" },
          { title: "COMO EDITAR VÍDEOS PELO CELULAR!!", duration: "06:40" },
        ],
      },
      {
        title: "ESTRATÉGIAS PARA VIRALIZAR",
        meta: "2 aulas • 9 min",
        lessons: [
          { title: "ESTRATÉGIA TAGS E HASHTAG", duration: "04:59" },
          { title: "ESTRATÉGIA PARA VIRALIZAR O PERFIL MAIS RÁPIDO!!", duration: "04:41" },
        ],
      },
      {
        title: "IA PARA VOZ",
        meta: "1 aula • 8 min",
        lessons: [{ title: "A MELHOR IA DE VOZ PARA CRIAR CONTEÚDOS!!", duration: "08:12" }],
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
            <div className="course-progress-meter" aria-label={`${course.progressPercent}% concluído`}>
              <i style={{ width: `${course.progressPercent}%` }} />
            </div>
            <em>{course.progressPercent}%</em>
          </section>

          {hasContent ? (
            <section className="course-content-list" aria-label="Conteúdo">
              <div className="course-content-heading">
                <div>
                  <h2>Conteúdo</h2>
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
                      <P6Icon name="icon-12-chevron-down-v3" size={12} />
                    </button>
                    {section.lessons.map((lesson) => (
                      <button className="course-lesson-row" type="button" key={`${section.title}-${lesson.title}`}>
                        <P6Icon name="icon-circle-empty" size={16} />
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
