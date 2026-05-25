import { useEffect, useReducer, useState } from "react";
import {
  loadAdminGamification,
  updateAdminGamification,
  type AdminGamification,
} from "../../../lib/adminApi";

// /settings/gamification - configuracoes de pontos, niveis e regras.

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: AdminGamification }
  | { phase: "error"; message: string };

type Action =
  | { type: "load_success"; data: AdminGamification }
  | { type: "load_error"; message: string }
  | { type: "patch"; data: AdminGamification };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", data: action.data };
    case "load_error":   return { phase: "error", message: action.message };
    case "patch":        return { phase: "ready", data: action.data };
    default:             return state;
  }
}

export function AdminGamification() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading" } as State);
  const [draft, setDraft] = useState<AdminGamification | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminGamification()
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", data });
        setDraft(data);
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar gamificação." }); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await updateAdminGamification({
        enabled: draft.enabled,
        points_per_post: draft.points_per_post,
        points_per_comment: draft.points_per_comment,
        points_per_reaction_received: draft.points_per_reaction_received,
        points_per_login: draft.points_per_login,
        level_curve: draft.level_curve,
        level_step: draft.level_step,
      });
      dispatch({ type: "patch", data: updated });
      setDraft(updated);
      setSavedAt(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Gamificação</h1>
          <p className="admin-page-subtitle">
            Defina quantos pontos cada ação dá e como os níveis crescem.
            Membros sobem de nível conforme acumulam pontos.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        {state.phase === "loading" || !draft ? (
          <div className="admin-empty-card"><p>Carregando configurações...</p></div>
        ) : (
          <form className="admin-form" onSubmit={handleSave}>
            <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={draft.enabled}
                onChange={e => setDraft({ ...draft, enabled: e.target.checked })} />
              <strong style={{ fontWeight: 600 }}>Gamificação ativa na comunidade</strong>
            </label>

            <h2 style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 700, color: "#717680", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Pontos por ação
            </h2>
            <div className="admin-form-row admin-form-row-grid">
              <div>
                <label className="admin-form-label" htmlFor="g-post">Publicar post</label>
                <input id="g-post" type="number" min={0} className="admin-form-input"
                  value={draft.points_per_post}
                  onChange={e => setDraft({ ...draft, points_per_post: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="admin-form-label" htmlFor="g-comment">Comentar</label>
                <input id="g-comment" type="number" min={0} className="admin-form-input"
                  value={draft.points_per_comment}
                  onChange={e => setDraft({ ...draft, points_per_comment: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="admin-form-row admin-form-row-grid">
              <div>
                <label className="admin-form-label" htmlFor="g-react">Receber reação</label>
                <input id="g-react" type="number" min={0} className="admin-form-input"
                  value={draft.points_per_reaction_received}
                  onChange={e => setDraft({ ...draft, points_per_reaction_received: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="admin-form-label" htmlFor="g-login">Login diário</label>
                <input id="g-login" type="number" min={0} className="admin-form-input"
                  value={draft.points_per_login}
                  onChange={e => setDraft({ ...draft, points_per_login: Number(e.target.value) || 0 })} />
              </div>
            </div>

            <h2 style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 700, color: "#717680", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Curva de níveis
            </h2>
            <div className="admin-form-row admin-form-row-grid">
              <div>
                <label className="admin-form-label" htmlFor="g-curve">Tipo de curva</label>
                <select id="g-curve" className="admin-form-select"
                  value={draft.level_curve}
                  onChange={e => setDraft({ ...draft, level_curve: e.target.value as AdminGamification["level_curve"] })}>
                  <option value="linear">Linear (50, 100, 150, 200...)</option>
                  <option value="exponential">Exponencial (50, 150, 350, 750...)</option>
                  <option value="custom">Personalizada</option>
                </select>
              </div>
              <div>
                <label className="admin-form-label" htmlFor="g-step">Passo (pontos por nível)</label>
                <input id="g-step" type="number" min={1} className="admin-form-input"
                  value={draft.level_step}
                  onChange={e => setDraft({ ...draft, level_step: Number(e.target.value) || 1 })} />
              </div>
            </div>

            <div className="admin-form-actions">
              {savedAt ? (
                <span className="admin-form-help" style={{ alignSelf: "center", color: "#047857" }}>
                  Salvo às {new Date(savedAt).toLocaleTimeString("pt-BR")}
                </span>
              ) : null}
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
