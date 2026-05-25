import { useEffect, useReducer, useState } from "react";
import {
  loadAdminEmailTemplates,
  updateAdminEmailTemplate,
  type AdminEmailTemplate,
} from "../../../lib/adminApi";

// Pagina /settings/emails - editor dos 4 templates default + customizados.

const labelByKey: Record<string, string> = {
  welcome: "Boas-vindas",
  post_reply: "Resposta em publicação",
  weekly_digest: "Resumo semanal",
  paywall_thanks: "Confirmação de compra",
};

type State = { phase: "loading" | "ready" | "error"; templates: AdminEmailTemplate[]; message?: string };
type Action =
  | { type: "load_success"; templates: AdminEmailTemplate[] }
  | { type: "load_error"; message: string }
  | { type: "patch"; template: AdminEmailTemplate };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", templates: action.templates };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "patch":        return { ...state, templates: state.templates.map(t => t.id === action.template.id ? action.template : t) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", templates: [] };

export function AdminEmails() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string; enabled: boolean }>({ subject: "", body: "", enabled: true });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminEmailTemplates()
      .then(templates => {
        if (!cancelled) {
          dispatch({ type: "load_success", templates });
          if (templates.length > 0) {
            setActiveId(templates[0].id);
            setDraft({ subject: templates[0].subject, body: templates[0].body, enabled: templates[0].enabled });
          }
        }
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os templates." }); });
    return () => { cancelled = true; };
  }, []);

  const active = state.templates.find(t => t.id === activeId) || null;

  const selectTemplate = (template: AdminEmailTemplate) => {
    setActiveId(template.id);
    setDraft({ subject: template.subject, body: template.body, enabled: template.enabled });
    setSavedAt(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    setSaving(true);
    try {
      const updated = await updateAdminEmailTemplate(active.id, draft);
      dispatch({ type: "patch", template: updated });
      setSavedAt(new Date().toISOString());
    } catch {
      dispatch({ type: "load_error", message: "Falha ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>E-mails</h1>
          <p className="admin-page-subtitle">
            Edite os templates enviados pela comunidade. Use {"{{name}}"}, {"{{community_name}}"} e {"{{author}}"} como variáveis.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
          <div className="admin-table-wrap" style={{ padding: 6 }}>
            {state.templates.map(t => (
              <button
                key={t.id}
                type="button"
                className={t.id === activeId ? "admin-secondary-link is-active" : "admin-secondary-link"}
                onClick={() => selectTemplate(t)}
                style={{ width: "100%" }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <strong>{labelByKey[t.key] || t.key}</strong>
                  <span className="admin-form-help" style={{ margin: 0 }}>{t.enabled ? "Ativo" : "Pausado"}</span>
                </div>
              </button>
            ))}
          </div>

          {active ? (
            <form className="admin-form" onSubmit={handleSave}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{labelByKey[active.key] || active.key}</h2>
              <div className="admin-form-row">
                <label className="admin-form-label" htmlFor="email-subject">Assunto</label>
                <input
                  id="email-subject"
                  type="text"
                  className="admin-form-input"
                  value={draft.subject}
                  onChange={e => setDraft({ ...draft, subject: e.target.value })}
                />
              </div>
              <div className="admin-form-row">
                <label className="admin-form-label" htmlFor="email-body">Corpo</label>
                <textarea
                  id="email-body"
                  className="admin-form-textarea"
                  rows={10}
                  value={draft.body}
                  onChange={e => setDraft({ ...draft, body: e.target.value })}
                />
              </div>
              <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={e => setDraft({ ...draft, enabled: e.target.checked })}
                />
                Disparar este e-mail automaticamente
              </label>
              <div className="admin-form-actions">
                {savedAt ? (
                  <span className="admin-form-help" style={{ alignSelf: "center", color: "#047857" }}>
                    Salvo às {new Date(savedAt).toLocaleTimeString("pt-BR")}
                  </span>
                ) : null}
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar template"}
                </button>
              </div>
            </form>
          ) : (
            <div className="admin-empty-card">
              <p>Selecione um template para editar.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
