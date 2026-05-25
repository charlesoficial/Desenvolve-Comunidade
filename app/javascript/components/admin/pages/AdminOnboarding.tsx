import { useEffect, useReducer, useState } from "react";
import {
  createAdminOnboardingStep,
  deleteAdminOnboardingStep,
  loadAdminOnboardingSteps,
  updateAdminOnboardingStep,
  type AdminOnboardingStep,
} from "../../../lib/adminApi";

// /settings/onboarding - sequencia de telas iniciais para novos membros.

const stepTypeLabels: Record<AdminOnboardingStep["step_type"], string> = {
  welcome: "Boas-vindas",
  form: "Formulário",
  video: "Vídeo",
  redirect: "Redirecionar para espaço",
  profile_field: "Perguntar campo de perfil",
};

type State = { phase: "loading" | "ready" | "error"; steps: AdminOnboardingStep[]; message?: string };
type Action =
  | { type: "load_success"; steps: AdminOnboardingStep[] }
  | { type: "load_error"; message: string }
  | { type: "append"; step: AdminOnboardingStep }
  | { type: "patch"; step: AdminOnboardingStep }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", steps: action.steps };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, steps: [...state.steps, action.step] };
    case "patch":        return { ...state, steps: state.steps.map(s => s.id === action.step.id ? action.step : s) };
    case "remove":       return { ...state, steps: state.steps.filter(s => s.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", steps: [] };

export function AdminOnboarding() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stepType, setStepType] = useState<AdminOnboardingStep["step_type"]>("form");
  const [required, setRequired] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminOnboardingSteps()
      .then(steps => { if (!cancelled) dispatch({ type: "load_success", steps }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const step = await createAdminOnboardingStep({
        title: title.trim(),
        description: description.trim() || null,
        step_type: stepType,
        required,
      });
      dispatch({ type: "append", step });
      setTitle(""); setDescription(""); setStepType("form"); setRequired(true);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (step: AdminOnboardingStep) => {
    setSavingId(step.id);
    try {
      const updated = await updateAdminOnboardingStep(step.id, { archived: !step.archived });
      dispatch({ type: "patch", step: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (step: AdminOnboardingStep) => {
    if (!window.confirm(`Excluir o passo "${step.title}"?`)) return;
    setSavingId(step.id);
    try {
      await deleteAdminOnboardingStep(step.id);
      dispatch({ type: "remove", id: step.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Onboarding</h1>
          <p className="admin-page-subtitle">
            Configure a sequência de telas que novos membros veem ao entrar na comunidade.
            Você pode coletar campos, mostrar vídeos ou direcionar para um espaço.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo passo</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="ob-title">Título</label>
              <input id="ob-title" type="text" className="admin-form-input"
                value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Ex.: Conte um pouco sobre você" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="ob-type">Tipo</label>
              <select id="ob-type" className="admin-form-select"
                value={stepType} onChange={e => setStepType(e.target.value as AdminOnboardingStep["step_type"])}>
                {Object.entries(stepTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="ob-desc">Descrição</label>
            <input id="ob-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
              Obrigatório (membro não pode pular)
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Adicionando..." : "Adicionar passo"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Passo</th>
                <th>Tipo</th>
                <th>Obrigatório</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.steps.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum passo cadastrado."}
                </td></tr>
              ) : state.steps.map((step, idx) => (
                <tr key={step.id}>
                  <td className="admin-table-muted">{idx + 1}</td>
                  <td>
                    <strong>{step.title}</strong>
                    {step.description ? <p className="admin-form-help" style={{ margin: 0 }}>{step.description}</p> : null}
                  </td>
                  <td className="admin-table-muted">{stepTypeLabels[step.step_type]}</td>
                  <td className="admin-table-muted">{step.required ? "Sim" : "Não"}</td>
                  <td>
                    <span className={step.archived ? "admin-badge admin-badge-gray" : "admin-badge admin-badge-green"}>
                      {step.archived ? "Arquivado" : "Ativo"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggle(step)} disabled={savingId === step.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {step.archived ? "Reativar" : "Arquivar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(step)} disabled={savingId === step.id}
                        style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
