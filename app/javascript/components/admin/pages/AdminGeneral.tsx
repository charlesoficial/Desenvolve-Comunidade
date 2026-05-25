import { useEffect, useState } from "react";
import { loadAdminCommunity, updateAdminCommunity, type AdminCommunity } from "../../../lib/adminApi";

// Pagina /settings (Geral) — agora le e grava direto no Rails via
// /api/v1/admin/community. Mantem fallback de leitura silencioso quando
// o backend ainda nao esta pronto, pra UI nao quebrar.
type SaveState = "idle" | "saving" | "saved" | "error";

const emptyCommunity: AdminCommunity = {
  id: null,
  name: "Comunidade",
  description: "",
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",
};

export function AdminGeneral() {
  const [community, setCommunity] = useState<AdminCommunity>(emptyCommunity);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminCommunity()
      .then((data) => {
        if (!cancelled) setCommunity({ ...emptyCommunity, ...data });
      })
      .catch(() => {
        if (!cancelled) setErrorMessage("Não foi possível carregar as configurações da comunidade.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = <K extends keyof AdminCommunity>(key: K, value: AdminCommunity[K]) => {
    setCommunity((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveState("saving");
    setErrorMessage(null);
    try {
      const updated = await updateAdminCommunity({
        name: community.name,
        description: community.description,
        locale: community.locale,
        timezone: community.timezone,
      });
      setCommunity({ ...emptyCommunity, ...updated });
      setSaveState("saved");
    } catch (err) {
      console.error(err);
      setSaveState("error");
      setErrorMessage("Não foi possível salvar agora. Tente novamente.");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Geral</h1>
        <p className="admin-page-subtitle">
          Configurações principais da comunidade. Estas informações aparecem
          em e-mails, no app móvel e na página inicial pública.
        </p>
      </header>

      <section className="admin-page-body">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="community-name">
              Nome da comunidade
            </label>
            <input
              id="community-name"
              type="text"
              className="admin-form-input"
              value={community.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex.: Comunidade do Charles"
              disabled={loading}
            />
            <p className="admin-form-help">
              Aparece na barra do navegador, em e-mails e no header do app.
            </p>
          </div>

          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="community-description">
              Descrição
            </label>
            <textarea
              id="community-description"
              className="admin-form-textarea"
              rows={3}
              value={community.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva sua comunidade em uma ou duas frases."
              disabled={loading}
            />
          </div>

          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="community-locale">
                Idioma padrão
              </label>
              <select
                id="community-locale"
                className="admin-form-select"
                value={community.locale}
                onChange={(e) => handleChange("locale", e.target.value)}
                disabled={loading}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="admin-form-label" htmlFor="community-timezone">
                Fuso horário
              </label>
              <select
                id="community-timezone"
                className="admin-form-select"
                value={community.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                disabled={loading}
              >
                <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                <option value="America/Bahia">America/Bahia</option>
                <option value="America/Manaus">America/Manaus</option>
              </select>
            </div>
          </div>

          {errorMessage ? (
            <p className="admin-form-help" style={{ color: "#b91c1c" }}>
              {errorMessage}
            </p>
          ) : null}

          <div className="admin-form-actions">
            {saveState === "saved" ? (
              <span className="admin-form-help" style={{ alignSelf: "center", color: "#047857" }}>
                Alterações salvas
              </span>
            ) : null}
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading || saveState === "saving"}
            >
              {saveState === "saving" ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
