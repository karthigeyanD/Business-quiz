import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Teams() {
  const { teams, addTeam, updateTeam, removeTeam } = useQuiz();
  const [form, setForm] = useState({ name: '', member1: '', member2: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm({ name: '', member1: '', member2: '' });
    setEditId(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, member1, member2 } = form;
    if (!name.trim() || !member1.trim() || !member2.trim()) {
      setError('All fields are required.');
      return;
    }
    try {
      if (editId) {
        updateTeam(editId, { name: name.trim(), member1: member1.trim(), member2: member2.trim() });
      } else {
        addTeam(name.trim(), member1.trim(), member2.trim());
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({ name: t.name, member1: t.member1, member2: t.member2 });
    setError('');
  };

  const handleRemove = (id) => {
    if (window.confirm('Remove this team? Their scores will also be deleted.')) {
      removeTeam(id);
      if (editId === id) resetForm();
    }
  };

  const remaining = 20 - teams.length;

  return (
    <div className="page teams-page">
      <header className="page-header">
        <h1>Team Registration</h1>
        <p className="subtitle">
          {teams.length} / 20 teams registered
          {remaining > 0 && <span className="badge">{remaining} slots left</span>}
        </p>
      </header>

      {/* Form */}
      <section className="card" id="team-form-card">
        <h2>{editId ? 'Edit Team' : 'Register New Team'}</h2>
        <form onSubmit={handleSubmit} className="team-form" id="team-form">
          <div className="form-group">
            <label htmlFor="team-name">Team Name</label>
            <input
              id="team-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. The Strategists"
              maxLength={60}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="member-1">Member 1</label>
              <input
                id="member-1"
                value={form.member1}
                onChange={(e) => setForm({ ...form, member1: e.target.value })}
                placeholder="Full name"
                maxLength={60}
              />
            </div>
            <div className="form-group">
              <label htmlFor="member-2">Member 2</label>
              <input
                id="member-2"
                value={form.member2}
                onChange={(e) => setForm({ ...form, member2: e.target.value })}
                placeholder="Full name"
                maxLength={60}
              />
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn primary" id="team-submit-btn">
              {editId ? 'Save Changes' : 'Register Team'}
            </button>
            {editId && (
              <button type="button" className="btn ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List */}
      <section className="card" id="team-list-card">
        <h2>Registered Teams</h2>
        {teams.length === 0 ? (
          <p className="empty-state">No teams yet — register one above.</p>
        ) : (
          <div className="team-list" id="team-list">
            {teams.map((t, i) => (
              <div className="team-row" key={t.id}>
                <span className="team-number">{i + 1}</span>
                <div className="team-info">
                  <strong>{t.name}</strong>
                  <span className="members">{t.member1} &amp; {t.member2}</span>
                </div>
                <div className="team-actions">
                  <button
                    className="btn small ghost"
                    onClick={() => startEdit(t)}
                    aria-label={`Edit ${t.name}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn small danger"
                    onClick={() => handleRemove(t.id)}
                    aria-label={`Remove ${t.name}`}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
