type Props = {
  title: string;
  subtitle: string;
  illustration?: "members" | "analytics" | "paywall" | "ai" | "default";
  cta?: { label: string; onClick?: () => void };
  bullets?: string[];
};

// Stub mais polido pra páginas que ainda não têm dados reais. Mostra título,
// subtitle, lista de "o que vai aparecer aqui" e CTA opcional. Usa o mesmo
// look-and-feel do resto do admin pra não quebrar a experiência visual.
export function AdminFeatureStub({ title, subtitle, cta, bullets = [] }: Props) {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>{title}</h1>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
        {cta ? (
          <div className="admin-page-actions">
            <button type="button" className="admin-btn admin-btn-primary" onClick={cta.onClick}>
              {cta.label}
            </button>
          </div>
        ) : null}
      </header>

      <section className="admin-page-body">
        <div className="admin-empty-card" style={{ padding: 32 }}>
          <h2>O que aparece aqui</h2>
          {bullets.length > 0 ? (
            <ul style={{ margin: "12px 0 0", paddingLeft: 20, color: "#4b515a", fontSize: 14, lineHeight: 1.7 }}>
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <p>Conteúdo em breve.</p>
          )}
        </div>
      </section>
    </div>
  );
}
