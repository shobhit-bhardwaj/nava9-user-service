import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

// ---------- API layer (matches the OpenAPI spec) ----------
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // FastAPI 422 returns { detail: [{ loc, msg, type }] }
    if (res.status === 422 && Array.isArray(data?.detail)) {
      throw new Error(
        data.detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join("; ")
      );
    }
    throw new Error(
      (typeof data?.detail === "string" && data.detail) ||
        `Request failed (${res.status})`
    );
  }
  return data;
}

const api = {
  info: () => request("/"),
  list: () => request("/users/"),
  get: (id) => request(`/users/${id}`),
  create: (user) => request("/users/", { method: "POST", body: JSON.stringify(user) }),
  update: (id, user) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(user) }),
  remove: (id) => request(`/users/${id}`, { method: "DELETE" }),
};

// The spec doesn't define the list response shape, so accept an array or { users: [] }.
const normalizeList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];

const emptyForm = { user_id: "", username: "", password: "" };

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(normalizeList(await api.list()));
      setOnline(true);
    } catch (e) {
      setOnline(false);
      setError(
        e instanceof TypeError
          ? `Can't reach the API at ${API_BASE}. Check that it's running and that CORS allows this origin.`
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (user) => {
    setEditingId(user.user_id);
    setForm({ user_id: user.user_id, username: user.username ?? "", password: "" });
    setError("");
    setConfirmingId(null);
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      user_id: Number(form.user_id),
      username: form.username.trim(),
      password: form.password,
    };
    try {
      if (editingId !== null) {
        await api.update(editingId, payload);
        flash("User updated");
      } else {
        await api.create(payload);
        flash("User added");
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.remove(id);
      if (editingId === id) resetForm();
      setConfirmingId(null);
      flash("User deleted");
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const isEditing = editingId !== null;

  return (
    <div className="shell">
      <header className="topbar">
        <h1>Nava9 User Application</h1>
        <div className="topbar-right">
          <span className={`status ${online === null ? "" : online ? "up" : "down"}`}>
            {online === null ? "Checking API" : online ? "API connected" : "API unreachable"}
          </span>
          <code className="base">{API_BASE}</code>
        </div>
      </header>

      <div className="live" role="status" aria-live="polite">
        {notice && <div className="banner ok">{notice}</div>}
        {error && (
          <div className="banner err" role="alert">
            {error}
          </div>
        )}
      </div>

      <main className="layout">
        <section className="panel">
          <div className="panel-head">
            <h2>{isEditing ? `Edit user ${editingId}` : "Add user"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="form">
            <label>
              User ID
              <input
                name="user_id"
                type="number"
                value={form.user_id}
                onChange={handleChange}
                required
                disabled={isEditing}
              />
            </label>
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              {isEditing && (
                <span className="hint">
                  The API requires a password on every update, so enter the current or a new one.
                </span>
              )}
            </label>
            <div className="actions">
              <button className="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : isEditing ? "Save changes" : "Add user"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>
              All users <span className="count">{users.length}</span>
            </h2>
            <button type="button" onClick={loadUsers} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>

          {users.length === 0 && !loading ? (
            <p className="empty">No users yet. Add the first one using the form.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className={editingId === u.user_id ? "active" : ""}>
                      <td className="num">{u.user_id}</td>
                      <td>{u.username}</td>
                      <td className="right">
                        {confirmingId === u.user_id ? (
                          <span className="confirm">
                            Delete {u.username}?{" "}
                            <button className="danger" onClick={() => handleDelete(u.user_id)}>
                              Delete
                            </button>{" "}
                            <button onClick={() => setConfirmingId(null)}>Keep</button>
                          </span>
                        ) : (
                          <>
                            <button onClick={() => startEdit(u)}>Edit</button>{" "}
                            <button onClick={() => setConfirmingId(u.user_id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
