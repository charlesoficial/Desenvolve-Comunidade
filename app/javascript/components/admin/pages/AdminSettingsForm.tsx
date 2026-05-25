import { useEffect, useMemo, useReducer, useState } from "react";
import {
  loadAdminSettings,
  updateAdminSettings,
  type AdminSettingsBag,
} from "../../../lib/adminApi";

// Componente generico para sub-paginas de Geral que so configuram um
// punhado de chaves no jsonb communities.settings[key].
// Renderiza um input apropriado por tipo do default (boolean, number, string, array).

type Props = {
  configKey: string;
  title: string;
  subtitle: string;
  fieldLabels?: Record<string, string>;
  fieldHelp?: Record<string, string>;
  fieldOptions?: Record<string, Array<{ value: string; label: string }>>;
};

type Phase = "loading" | "ready" | "error";
type LoadState = { phase: Phase; defaults: AdminSettingsBag; draft: AdminSettingsBag };
type LoadAction =
  | { type: "start" }
  | { type: "success"; defaults: AdminSettingsBag; settings: AdminSettingsBag }
  | { type: "error" }
  | { type: "set"; key: string; value: unknown }
  | { type: "save_success"; settings: AdminSettingsBag };

function reducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case "start":
      return { phase: "loading", defaults: state.defaults, draft: state.draft };
    case "success":
      return { phase: "ready", defaults: action.defaults, draft: action.settings };
    case "error":
      return { phase: "error", defaults: state.defaults, draft: state.draft };
    case "set":
      return { ...state, draft: { ...state.draft, [action.key]: action.value } };
    case "save_success":
      return { ...state, draft: action.settings };
    default:
      return state;
  }
}

function inferType(value: unknown): "boolean" | "number" | "array" | "string" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  return "string";
}

function humanize(key: string) {
  return key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function AdminSettingsForm({
  configKey,
  title,
  subtitle,
  fieldLabels = {},
  fieldHelp = {},
  fieldOptions = {},
}: Props) {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", defaults: {}, draft: {} });
  const { phase, defaults, draft } = state;
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });
    loadAdminSettings(configKey)
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: "success", defaults: data.defaults, settings: data.settings });
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar as configurações.");
        dispatch({ type: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [configKey]);

  const fieldKeys = useMemo(() => Object.keys(defaults), [defaults]);

  const setValue = (key: string, value: unknown) => {
    dispatch({ type: "set", key, value });
    setSavedAt(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateAdminSettings(configKey, draft);
      dispatch({ type: "save_success", settings: result.settings });
      setSavedAt(new Date().toISOString());
    } catch {
      setError("Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>{title}</h1>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
      </header>

      <section className="admin-page-body">
        {error ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{error}</p>
        ) : null}

        {phase === "loading" ? (
          <div className="admin-empty-card"><p>Carregando configurações...</p></div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            {fieldKeys.map((key) => {
              const defaultValue = defaults[key];
              const value = draft[key];
              const inputId = `settings-${configKey}-${key}`;
              const label = fieldLabels[key] || humanize(key);
              const help = fieldHelp[key];
              const type = inferType(defaultValue);
              const options = fieldOptions[key];

              return (
                <div className="admin-form-row" key={key}>
                  {type === "boolean" ? (
                    <label
                      className="admin-form-help"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setValue(key, e.target.checked)}
                      />
                      <strong style={{ fontWeight: 600 }}>{label}</strong>
                    </label>
                  ) : (
                    <>
                      <label className="admin-form-label" htmlFor={inputId}>{label}</label>
                      {options ? (
                        <select
                          id={inputId}
                          className="admin-form-select"
                          value={String(value ?? "")}
                          onChange={(e) => setValue(key, e.target.value)}
                        >
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : type === "number" ? (
                        <input
                          id={inputId}
                          type="number"
                          className="admin-form-input"
                          value={Number(value ?? 0)}
                          onChange={(e) => setValue(key, Number(e.target.value) || 0)}
                        />
                      ) : type === "array" ? (
                        <textarea
                          id={inputId}
                          className="admin-form-textarea"
                          rows={3}
                          value={Array.isArray(value) ? value.join("\n") : ""}
                          onChange={(e) =>
                            setValue(
                              key,
                              e.target.value
                                .split("\n")
                                .map((v) => v.trim())
                                .filter((v) => v.length > 0),
                            )
                          }
                          placeholder="Um valor por linha"
                        />
                      ) : (
                        <input
                          id={inputId}
                          type="text"
                          className="admin-form-input"
                          value={String(value ?? "")}
                          onChange={(e) => setValue(key, e.target.value)}
                        />
                      )}
                    </>
                  )}
                  {help ? <p className="admin-form-help">{help}</p> : null}
                </div>
              );
            })}

            <div className="admin-form-actions">
              {savedAt ? (
                <span className="admin-form-help" style={{ alignSelf: "center", color: "#047857" }}>
                  Alterações salvas
                </span>
              ) : null}
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
