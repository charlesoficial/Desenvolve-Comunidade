import { useEffect, useReducer, useState } from "react";
import {
  createAdminProfileField,
  deleteAdminProfileField,
  loadAdminProfileFields,
  updateAdminProfileField,
  type AdminProfileField,
} from "../../../lib/adminApi";

// /members/profile_fields - campos extras do perfil dos membros.

const fieldTypeOptions: Array<{ value: AdminProfileField["field_type"]; label: string }> = [
  { value: "text", label: "Texto curto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "dropdown", label: "Lista (escolha única)" },
  { value: "multi_select", label: "Lista (múltipla escolha)" },
  { value: "date", label: "Data" },
  { value: "url", label: "URL" },
];

const visibilityOptions: Array<{ value: AdminProfileField["visibility"]; label: string }> = [
  { value: "public", label: "Público" },
  { value: "members", label: "Apenas membros" },
  { value: "admin", label: "Apenas admin" },
];

type State = { phase: "loading" | "ready" | "error"; fields: AdminProfileField[]; message?: string };
type Action =
  | { type: "load_success"; fields: AdminProfileField[] }
  | { type: "load_error"; message: string }
  | { type: "append"; field: AdminProfileField }
  | { type: "patch"; field: AdminProfileField }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", fields: action.fields };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, fields: [...state.fields, action.field] };
    case "patch":        return { ...state, fields: state.fields.map(f => f.id === action.field.id ? action.field : f) };
    case "remove":       return { ...state, fields: state.fields.filter(f => f.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", fields: [] };

export function AdminProfileFields() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<AdminProfileField["field_type"]>("text");
  const [required, setRequired] = useState(false);
  const [showInOnboarding, setShowInOnboarding] = useState(false);
  const [visibility, setVisibility] = useState<AdminProfileField["visibility"]>("members");
  const [optionsRaw, setOptionsRaw] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminProfileFields()
      .then(fields => { if (!cancelled) dispatch({ type: "load_success", fields }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os campos." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !label.trim()) return;
    setCreating(true);
    try {
      const options = ["dropdown", "multi_select"].includes(fieldType)
        ? optionsRaw.split("\n").map(o => o.trim()).filter(Boolean)
        : [];
      const field = await createAdminProfileField({
        key: key.trim(),
        label: label.trim(),
        field_type: fieldType,
        required,
        show_in_onboarding: showInOnboarding,
        visibility,
        options,
      });
      dispatch({ type: "append", field });
      setKey(""); setLabel(""); setFieldType("text"); setRequired(false);
      setShowInOnboarding(false); setVisibility("members"); setOptionsRaw("");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleArchived = async (field: AdminProfileField) => {
    setSavingId(field.id);
    try {
      const updated = await updateAdminProfileField(field.id, { archived: !field.archived });
      dispatch({ type: "patch", field: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (field: AdminProfileField) => {
    if (!window.confirm(`Excluir o campo "${field.label}"? Os valores existentes serão perdidos.`)) return;
    setSavingId(field.id);
    try {
      await deleteAdminProfileField(field.id);
      dispatch({ type: "remove", id: field.id });
    } finally {
      setSavingId(null);
    }
  };

  const showOptionsField = ["dropdown", "multi_select"].includes(fieldType);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Campos de perfil</h1>
          <p className="admin-page-subtitle">
            Adicione campos extras ao perfil dos membros (cidade, profissão, redes sociais).
            Apareçam no onboarding ou só na edição do perfil.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo campo</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="pf-key">Chave (snake_case)</label>
              <input id="pf-key" type="text" className="admin-form-input"
                value={key} onChange={e => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                required pattern="[a-z0-9_]+" placeholder="ex.: cidade" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="pf-label">Rótulo visível</label>
              <input id="pf-label" type="text" className="admin-form-input"
                value={label} onChange={e => setLabel(e.target.value)} required
                placeholder="Cidade onde mora" />
            </div>
          </div>

          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="pf-type">Tipo</label>
              <select id="pf-type" className="admin-form-select"
                value={fieldType} onChange={e => setFieldType(e.target.value as AdminProfileField["field_type"])}>
                {fieldTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-form-label" htmlFor="pf-vis">Visibilidade</label>
              <select id="pf-vis" className="admin-form-select"
                value={visibility} onChange={e => setVisibility(e.target.value as AdminProfileField["visibility"])}>
                {visibilityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {showOptionsField ? (
            <div className="admin-form-row">
              <label className="admin-form-label" htmlFor="pf-options">Opções (uma por linha)</label>
              <textarea id="pf-options" className="admin-form-input" rows={4}
                value={optionsRaw} onChange={e => setOptionsRaw(e.target.value)}
                placeholder={"Iniciante\nIntermediário\nAvançado"} />
            </div>
          ) : null}

          <div className="admin-form-row" style={{ display: "flex", gap: 16 }}>
            <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
              Obrigatório
            </label>
            <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={showInOnboarding} onChange={e => setShowInOnboarding(e.target.checked)} />
              Exibir no onboarding
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Adicionar campo"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Tipo</th>
                <th>Visibilidade</th>
                <th>Onboarding</th>
                <th>Status</th>
                <th style={{ width: 180 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.fields.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum campo cadastrado."}
                </td></tr>
              ) : state.fields.map(field => (
                <tr key={field.id}>
                  <td>
                    <strong>{field.label}</strong>
                    <p className="admin-form-help" style={{ margin: 0 }}>
                      <code style={{ fontSize: 11 }}>{field.key}</code>
                      {field.required ? " · Obrigatório" : ""}
                    </p>
                  </td>
                  <td className="admin-table-muted">{fieldTypeOptions.find(o => o.value === field.field_type)?.label || field.field_type}</td>
                  <td className="admin-table-muted">{visibilityOptions.find(o => o.value === field.visibility)?.label}</td>
                  <td className="admin-table-muted">{field.show_in_onboarding ? "Sim" : "Não"}</td>
                  <td>
                    <span className={field.archived ? "admin-badge admin-badge-gray" : "admin-badge admin-badge-green"}>
                      {field.archived ? "Arquivado" : "Ativo"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggleArchived(field)} disabled={savingId === field.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {field.archived ? "Reativar" : "Arquivar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(field)} disabled={savingId === field.id}
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
