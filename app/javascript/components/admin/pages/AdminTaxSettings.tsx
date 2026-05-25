import { useEffect, useReducer, useState } from "react";
import {
  loadAdminTaxSetting,
  updateAdminTaxSetting,
  type AdminTaxSetting,
} from "../../../lib/adminApi";

// /settings/paywall_tax_settings - configuracoes de impostos.

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: AdminTaxSetting }
  | { phase: "error"; message: string };

type Action =
  | { type: "load_success"; data: AdminTaxSetting }
  | { type: "load_error"; message: string }
  | { type: "patch"; data: AdminTaxSetting };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", data: action.data };
    case "load_error":   return { phase: "error", message: action.message };
    case "patch":        return { phase: "ready", data: action.data };
    default:             return state;
  }
}

export function AdminTaxSettings() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading" } as State);
  const [draft, setDraft] = useState<AdminTaxSetting | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [newCountry, setNewCountry] = useState("BR");
  const [newRate, setNewRate] = useState("");
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadAdminTaxSetting()
      .then(data => {
        if (cancelled) return;
        dispatch({ type: "load_success", data });
        setDraft(data);
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const handleAddRate = () => {
    if (!draft || !newCountry.trim() || !newRate.trim()) return;
    const rate = Number(newRate.replace(",", "."));
    if (Number.isNaN(rate)) return;
    setDraft({
      ...draft,
      rates: [...draft.rates, { country: newCountry.trim().toUpperCase(), rate_pct: rate, label: newLabel.trim() || undefined }],
    });
    setNewCountry("BR"); setNewRate(""); setNewLabel("");
  };

  const handleRemoveRate = (idx: number) => {
    if (!draft) return;
    setDraft({ ...draft, rates: draft.rates.filter((_, i) => i !== idx) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await updateAdminTaxSetting({
        enabled: draft.enabled,
        model: draft.model,
        auto_calculate: draft.auto_calculate,
        default_country: draft.default_country,
        rates: draft.rates,
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
          <h1>Impostos</h1>
          <p className="admin-page-subtitle">
            Configure como impostos aparecem nas vendas. Se preferir cálculo
            automático, ative o Stripe Tax.
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
              <strong style={{ fontWeight: 600 }}>Cobrar impostos nas vendas</strong>
            </label>

            <div className="admin-form-row admin-form-row-grid">
              <div>
                <label className="admin-form-label" htmlFor="ts-model">Modelo de cálculo</label>
                <select id="ts-model" className="admin-form-select"
                  value={draft.model}
                  onChange={e => setDraft({ ...draft, model: e.target.value as AdminTaxSetting["model"] })}>
                  <option value="inclusive">Incluso no preço</option>
                  <option value="additive">Adicionado no checkout</option>
                </select>
              </div>
              <div>
                <label className="admin-form-label" htmlFor="ts-country">País padrão</label>
                <input id="ts-country" type="text" maxLength={2} className="admin-form-input"
                  value={draft.default_country}
                  onChange={e => setDraft({ ...draft, default_country: e.target.value.toUpperCase() })} />
              </div>
            </div>

            <label className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={draft.auto_calculate}
                onChange={e => setDraft({ ...draft, auto_calculate: e.target.checked })} />
              Cálculo automático via Stripe Tax
            </label>

            <h2 style={{ margin: "16px 0 0", fontSize: 14, fontWeight: 700, color: "#717680", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Alíquotas manuais
            </h2>
            {draft.rates.length === 0 ? (
              <p className="admin-form-help" style={{ margin: 0 }}>Nenhuma alíquota cadastrada.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>País</th>
                      <th>Estado</th>
                      <th>Alíquota</th>
                      <th>Rótulo</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.rates.map((rate, idx) => (
                      <tr key={`${rate.country}-${rate.state || idx}`}>
                        <td>{rate.country}</td>
                        <td className="admin-table-muted">{rate.state || "—"}</td>
                        <td>{rate.rate_pct}%</td>
                        <td className="admin-table-muted">{rate.label || "—"}</td>
                        <td>
                          <button type="button" className="admin-btn admin-btn-ghost"
                            onClick={() => handleRemoveRate(idx)}
                            style={{ height: 26, fontSize: 11, color: "#b91c1c" }}>Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-form-row admin-form-row-grid">
              <div>
                <label className="admin-form-label" htmlFor="ts-newcountry">Adicionar — País</label>
                <input id="ts-newcountry" type="text" maxLength={2} className="admin-form-input"
                  value={newCountry} onChange={e => setNewCountry(e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="admin-form-label" htmlFor="ts-newrate">Alíquota (%)</label>
                <input id="ts-newrate" type="text" inputMode="decimal" className="admin-form-input"
                  value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="9.5" />
              </div>
              <div>
                <label className="admin-form-label" htmlFor="ts-newlabel">Rótulo (opcional)</label>
                <input id="ts-newlabel" type="text" className="admin-form-input"
                  value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="ICMS" />
              </div>
            </div>
            <div>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={handleAddRate}>
                Adicionar alíquota
              </button>
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
