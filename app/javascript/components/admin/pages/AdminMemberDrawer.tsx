import { useEffect, useState } from "react";
import {
  loadAdminUser,
  updateAdminUser,
  type AdminUser,
  type AdminUserDetail,
} from "../../../lib/adminApi";

type Props = {
  userId: string;
  onClose: () => void;
  onUpdated: (user: AdminUserDetail) => void;
};

const roleOptions: Array<{ value: AdminUser["role"]; label: string }> = [
  { value: "owner",     label: "Owner" },
  { value: "admin",     label: "Admin" },
  { value: "moderator", label: "Moderador" },
  { value: "member",    label: "Membro" },
];

const statusOptions: Array<{ value: AdminUser["status"]; label: string }> = [
  { value: "online",  label: "Online" },
  { value: "away",    label: "Ausente" },
  { value: "offline", label: "Offline" },
];

// Drawer lateral com detalhe e edicao rapida de um membro.
// Usa /api/v1/admin/users/:id pra ler e atualizar role/status.
export function AdminMemberDrawer({ userId, onClose, onUpdated }: Props) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = phase === "loading";

  useEffect(() => {
    let cancelled = false;
    loadAdminUser(userId)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        setPhase("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar este membro.");
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleChange = async <K extends "role" | "status">(key: K, value: AdminUser[K]) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminUser(user.id, { [key]: value } as Partial<AdminUser>);
      setUser(updated);
      onUpdated(updated);
    } catch {
      setError("Falha ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <aside
        className="admin-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Detalhes do membro"
      >
        <header className="admin-drawer-header">
          <h2>Membro</h2>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="admin-drawer-body">
          {loading ? (
            <p className="admin-form-help">Carregando...</p>
          ) : !user ? (
            <p className="admin-form-help" style={{ color: "#b91c1c" }}>
              {error || "Membro não encontrado."}
            </p>
          ) : (
            <>
              <div className="admin-drawer-identity">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="admin-avatar" style={{ width: 48, height: 48 }} />
                ) : (
                  <span className="admin-avatar" aria-hidden="true" style={{ width: 48, height: 48, fontSize: 18 }}>
                    {(user.display_name || user.username).charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <strong style={{ fontSize: 16 }}>{user.display_name || user.username}</strong>
                  <p className="admin-form-help" style={{ margin: 0 }}>{user.email}</p>
                </div>
              </div>

              <dl className="admin-drawer-meta">
                <div>
                  <dt>Posts</dt>
                  <dd>{user.posts_count}</dd>
                </div>
                <div>
                  <dt>Comentários</dt>
                  <dd>{user.comments_count}</dd>
                </div>
                <div>
                  <dt>Conexões</dt>
                  <dd>{user.connections_count}</dd>
                </div>
              </dl>

              <div className="admin-form-row">
                <label className="admin-form-label" htmlFor="member-role">Função</label>
                <select
                  id="member-role"
                  className="admin-form-select"
                  value={user.role}
                  onChange={(e) => handleChange("role", e.target.value as AdminUser["role"])}
                  disabled={saving}
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-row">
                <label className="admin-form-label" htmlFor="member-status">Status</label>
                <select
                  id="member-status"
                  className="admin-form-select"
                  value={user.status}
                  onChange={(e) => handleChange("status", e.target.value as AdminUser["status"])}
                  disabled={saving}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {error ? (
                <p className="admin-form-help" style={{ color: "#b91c1c" }}>{error}</p>
              ) : null}
              {saving ? (
                <p className="admin-form-help">Salvando...</p>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
