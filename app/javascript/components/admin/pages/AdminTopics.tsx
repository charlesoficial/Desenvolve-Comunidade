import { useEffect, useReducer, useState } from "react";
import {
  createAdminTopic,
  deleteAdminTopic,
  loadAdminTopics,
  updateAdminTopic,
  type AdminTopic,
} from "../../../lib/adminApi";

// /settings/topics — topicos para classificar posts (com cor e contador).

type State = { phase: "loading" | "ready" | "error"; topics: AdminTopic[]; message?: string };
type Action =
  | { type: "load_success"; topics: AdminTopic[] }
  | { type: "load_error"; message: string }
  | { type: "append"; topic: AdminTopic }
  | { type: "patch"; topic: AdminTopic }
  | { type: "remove"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load_success": return { phase: "ready", topics: action.topics };
    case "load_error":   return { ...state, phase: "error", message: action.message };
    case "append":       return { ...state, topics: [...state.topics, action.topic] };
    case "patch":        return { ...state, topics: state.topics.map(t => t.id === action.topic.id ? action.topic : t) };
    case "remove":       return { ...state, topics: state.topics.filter(t => t.id !== action.id) };
    default:             return state;
  }
}

const initial: State = { phase: "loading", topics: [] };

const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

export function AdminTopics() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAdminTopics()
      .then(topics => { if (!cancelled) dispatch({ type: "load_success", topics }); })
      .catch(() => { if (!cancelled) dispatch({ type: "load_error", message: "Não foi possível carregar os tópicos." }); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const topic = await createAdminTopic({ name: name.trim(), description, color });
      dispatch({ type: "append", topic });
      setName(""); setDescription("");
    } finally {
      setCreating(false);
    }
  };

  const handleColorChange = async (topic: AdminTopic, newColor: string) => {
    setSavingId(topic.id);
    try {
      const updated = await updateAdminTopic(topic.id, { color: newColor });
      dispatch({ type: "patch", topic: updated });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (topic: AdminTopic) => {
    if (!window.confirm(`Excluir o tópico "${topic.name}"?`)) return;
    setSavingId(topic.id);
    try {
      await deleteAdminTopic(topic.id);
      dispatch({ type: "remove", id: topic.id });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Tópicos</h1>
          <p className="admin-page-subtitle">
            Categorias usadas para organizar publicações. Cada tópico tem cor própria e
            aparece como filtro no feed.
          </p>
        </div>
      </header>

      <section className="admin-page-body">
        {state.phase === "error" ? <p className="admin-form-help" style={{ color: "#b91c1c" }}>{state.message}</p> : null}

        <form className="admin-form" onSubmit={handleCreate}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Novo tópico</h2>
          <div className="admin-form-row admin-form-row-grid">
            <div>
              <label className="admin-form-label" htmlFor="topic-name">Nome</label>
              <input id="topic-name" type="text" className="admin-form-input"
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="Ex.: Lançamentos" />
            </div>
            <div>
              <label className="admin-form-label">Cor</label>
              <div style={{ display: "flex", gap: 6 }}>
                {colors.map(c => (
                  <button key={c} type="button" aria-label={`Cor ${c}`}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: c, border: c === color ? "2px solid #191b1f" : "1px solid #e7e9ec",
                      cursor: "pointer",
                    }} />
                ))}
              </div>
            </div>
          </div>
          <div className="admin-form-row">
            <label className="admin-form-label" htmlFor="topic-desc">Descrição</label>
            <textarea id="topic-desc" className="admin-form-textarea" rows={2}
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
              {creating ? "Criando..." : "Criar tópico"}
            </button>
          </div>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Posts</th>
                <th>Cor</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.topics.length === 0 ? (
                <tr><td colSpan={5} className="admin-table-muted" style={{ textAlign: "center", padding: 24 }}>
                  {state.phase === "loading" ? "Carregando..." : "Nenhum tópico cadastrado."}
                </td></tr>
              ) : state.topics.map(topic => (
                <tr key={topic.id}>
                  <td>
                    <span className="admin-badge" style={{ background: topic.color, color: "#fff" }}>
                      {topic.name}
                    </span>
                  </td>
                  <td className="admin-table-muted"><code style={{ fontSize: 12 }}>{topic.slug}</code></td>
                  <td className="admin-table-muted">{topic.posts_count}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {colors.map(c => (
                        <button key={c} type="button" aria-label={`Mudar cor para ${c}`}
                          onClick={() => handleColorChange(topic, c)} disabled={savingId === topic.id}
                          style={{
                            width: 18, height: 18, borderRadius: 4,
                            background: c, border: c === topic.color ? "2px solid #191b1f" : "1px solid transparent",
                            cursor: "pointer",
                          }} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-ghost"
                      onClick={() => handleDelete(topic)} disabled={savingId === topic.id}
                      style={{ height: 28, fontSize: 12, color: "#b91c1c" }}>Excluir</button>
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
