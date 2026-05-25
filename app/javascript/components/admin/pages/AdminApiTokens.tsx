import { useEffect, useReducer, useState } from "react";
import {
  createAdminApiToken,
  loadAdminApiTokens,
  revokeAdminApiToken,
  type AdminApiToken,
  type AdminApiTokenWithSecret,
} from "../../../lib/adminApi";

// Pagina /settings/api - lista API tokens, cria novos e revoga.
// Apos criar, mostra o token bruto UMA UNICA VEZ (nao pode ser exibido depois).

type State = { phase: "loading" | "ready" | "error"; tokens: AdminApiToken[]; message?: string };
type Action =
  | { type: "load_success"; tokens: AdminApiToken[] }
  | { type: "load_error"; message: string }
  | { type: "append"; token: AdminApiToken }
  | { type: "patch"; token: AdminApiToken };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success":
      return { phase: "ready", tokens: action.tokens };
    case "load_error":
      return { phase: "error", tokens: state.tokens, message: action.message };
    case "append":
      return { ...state, tokens: [action.token, ...state.tokens] };
    case "patch":
      return {
        ...state,
        tokens: state.tokens.map((t) => (t.id === action.token.id ? action.token : t)),
      };
    default:
      return state;
  }
}

const initial: State = { phase: "loading", tokens: [] };

const allScopes = [
  { value: "read", label: "Leitura" },
  { value: "write", label: "Escrita" },
  { value: "admin", label: "Admin" },
];

export function AdminApiTokens() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<AdminApiTokenWithSecret | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAdminApiTokens()
      .then((tokens) => {
        if (!cancelled) dispatch({ type: "load_success", tokens });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os tokens." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleScope = (value: string) => {
    setScopes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const token = await createAdminApiToken({ name: name.trim(), scopes });
      dispatch({ type: "append", token });
      setJustCreated(token);
      setName("");
      setScopes(["read"]);
    } catch {
      dispatch({ type: "load_error", message: "Falha ao criar token." });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (token: AdminApiToken) => {
    if (!window.confirm(`Revogar o token "${token.name}"? Integrações que usam esse token vão deixar de funcionar.`)) {
      return;
    }
    setSavingId(token.id);
    try {
      const updated = await revokeAdminApiToken(token.id);
      dispatch({ type: "patch", token: updated });
    } catch {
      dispatch({ type: "load_error", message: "Falha ao revogar token." });
    } finally {
      setSavingId(null);
    }
  };

  const copyToken = async () => {
    if (!justCreated) return;
    try {
      await navigator.clipboard.writeText(justCreated.token);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>API</h1>
          <p className="admin-page-subtitle">
            Tokens de acesso para integrações externas (Zapier, n8n, scripts próprios).
            Tokens revogados deixam de funcionar imediatamente.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? (
          <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p>
        ) : null}

        {justCreated ? (
          <div
            className="admin-form"
            style={{ borderColor: "#4f46e5", boxShadow: "0 0 0 1px #4f46e5" }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Token criado: {justCreated.name}
            </h2>
            <p className="admin-form-help">
              Copie agora — esta é a única vez que ele será exibido. Depois de fechar
              esta caixa não há como recuperar.
            </p>
            <code
              style={{
                display: "block",
                padding: 12,
                background: "var(--color-grey-100, #eef0f2)",
                borderRadius: 8,
                fontSize: 13,
                wordBreak: "break-all",
                userSelect: "all",
              }}
            >
              {justCreated.token}
            </code>
            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setJustCreated(null)}>
                Já copiei
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={copyToken}>
                {copied ? "Copiado!" : "Copiar token"}
              </button>
            </div>
          </div>
        ) : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo token</h2>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="token-name">Nome</label>
            <input
              id="token-name"
              type="text"
              className="admin-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Zapier produção"
              required
            />
            <p className="admin-form-help">
              Use um nome descritivo para identificar a integração. Não é exibido externamente.
            </p>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label">Permissões</label>
            <div style={{ display: "flex", gap: 16 }}>
              {allScopes.map((scope) => (
                <label
                  key={scope.value}
                  className="admin-form-help"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope.value)}
                    onChange={() => toggleScope(scope.value)}
                  />
                  {scope.label}
                </label>
              ))}
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating || scopes.length === 0}>
              {creating ? "Criando..." : "Criar token"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Prefixo</th>
                <th>Permissões</th>
                <th>Status</th>
                <th>Criado em</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.phase === "loading" && state.tokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Carregando...
                  </td>
                </tr>
              ) : state.tokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                    Nenhum token cadastrado.
                  </td>
                </tr>
              ) : (
                state.tokens.map((token) => (
                  <tr key={token.id}>
                    <td>{token.name}</td>
                    <td className="admin-table-muted">
                      <code style={{ fontSize: 12 }}>{token.token_prefix}…</code>
                    </td>
                    <td className="admin-table-muted">{token.scopes.join(", ")}</td>
                    <td>
                      <span
                        className={
                          token.revoked_at
                            ? "admin-badge admin-badge-gray"
                            : "admin-badge admin-badge-green"
                        }
                      >
                        {token.revoked_at ? "Revogado" : "Ativo"}
                      </span>
                    </td>
                    <td className="admin-table-muted">
                      {new Date(token.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      {token.revoked_at ? (
                        <span className="admin-form-help">—</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost"
                          onClick={() => handleRevoke(token)}
                          disabled={savingId === token.id}
                          style={{ height: 28, fontSize: 12, color: "#b91c1c" }}
                        >
                          Revogar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
