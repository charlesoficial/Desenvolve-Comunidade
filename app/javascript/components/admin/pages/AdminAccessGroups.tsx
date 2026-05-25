import { useEffect, useReducer, useState } from "react";
import {
  createAdminAccessGroup,
  deleteAdminAccessGroup,
  loadAdminAccessGroups,
  loadAdminSpaces,
  updateAdminAccessGroup,
  type AdminAccessGroup,
  type AdminSpace,
} from "../../../lib/adminApi";

// /settings/access_groups - pacotes de espacos+permissoes.

const roleLabels: Record<AdminAccessGroup["default_role"], string> = {
  owner: "Owner",
  admin: "Admin",
  moderator: "Moderador",
  member: "Membro",
};

type State = { phase: "loading" | "ready" | "error"; groups: AdminAccessGroup[]; spaces: AdminSpace[]; message?: string };
type Action =
  | { type: "load_success"; groups: AdminAccessGroup[]; spaces: AdminSpace[] }
  | { type: "load_error"; message: string }
  | { type: "append"; group: AdminAccessGroup }
  | { type: "patch"; group: AdminAccessGroup }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", groups: action.groups, spaces: action.spaces };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, groups: [action.group, ...state.groups] };
    case "patch":        return { ...state, groups: state.groups.map(g => g.id === action.group.id ? action.group : g) };
    case "remove":       return { ...state, groups: state.groups.filter(g => g.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", groups: [], spaces: [] };

export function AdminAccessGroups() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultRole, setDefaultRole] = useState<AdminAccessGroup["default_role"]>("member");
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadAdminAccessGroups(), loadAdminSpaces()])
      .then(([groups, spaces]) => {
        if (!cancelled) dispatch({ type: "load_success", groups, spaces });
      })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar." }); });
    return () => { cancelled = true; };
  }, []);

  const toggleSpace = (id: string) => {
    setSelectedSpaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const group = await createAdminAccessGroup({
        name: name.trim(),
        description,
        default_role: defaultRole,
        space_ids: Array.from(selectedSpaces),
        active: true,
      });
      dispatch({ type: "append", group });
      setName(""); setDescription(""); setDefaultRole("member"); setSelectedSpaces(new Set());
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (group: AdminAccessGroup) => {
    setSavingId(group.id);
    try {
      const updated = await updateAdminAccessGroup(group.id, { active: !group.active });
      dispatch({ type: "patch", group: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (group: AdminAccessGroup) => {
    if (!window.confirm(`Excluir o grupo "${group.name}"?`)) return;
    setSavingId(group.id);
    try {
      await deleteAdminAccessGroup(group.id);
      dispatch({ type: "remove", id: group.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Grupos de acesso</h1>
          <p className="admin-page-subtitle">
            Pacotes de espaços + permissões que podem ser atribuídos em massa
            via tag, plano ou compra de paywall.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo grupo</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="ag-name">Nome</label>
              <input id="ag-name" type="text" className="admin-form-input"
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="Ex.: Membros Pro" />
            </div>
            <div>
              <label className="admin-form-label" htmlFor="ag-role">Função padrão</label>
              <select id="ag-role" className="admin-form-select"
                value={defaultRole} onChange={e => setDefaultRole(e.target.value as AdminAccessGroup["default_role"])}>
                <option value="member">Membro</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="ag-desc">Descrição</label>
            <input id="ag-desc" type="text" className="admin-form-input"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label">Espaços liberados</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, maxHeight: 280, overflowY: "auto", padding: 8, border: "1px solid #e7e9ec", borderRadius: 8 }}>
              {state.spaces.map(space => (
                <label key={space.id} className="admin-form-help" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedSpaces.has(space.id)} onChange={() => toggleSpace(space.id)} />
                  {space.name}
                </label>
              ))}
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar grupo"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Função</th>
                <th>Espaços</th>
                <th>Membros</th>
                <th>Status</th>
                <th style={{ width: 200 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.groups.length === 0 ? (
                <tr><td colSpan={6} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum grupo cadastrado."}
                </td></tr>
              ) : state.groups.map(group => (
                <tr key={group.id}>
                  <td>
                    <strong>{group.name}</strong>
                    {group.description ? (
                      <p className="admin-form-help" style={{ margin: 0 }}>{group.description}</p>
                    ) : null}
                  </td>
                  <td className="admin-table-muted">{roleLabels[group.default_role]}</td>
                  <td className="admin-table-muted">{group.space_count}</td>
                  <td className="admin-table-muted">{group.members_count}</td>
                  <td>
                    <span className={group.active ? "admin-badge admin-badge-green" : "admin-badge admin-badge-gray"}>
                      {group.active ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleToggle(group)} disabled={savingId === group.id}
                        style={{ height: 28, fontSize: 12 }}>
                        {group.active ? "Pausar" : "Ativar"}
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost"
                        onClick={() => handleDelete(group)} disabled={savingId === group.id}
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
