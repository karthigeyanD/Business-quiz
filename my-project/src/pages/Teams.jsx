import { useMemo, useState } from 'react';
import { useQuiz } from '../context/QuizContext';

export default function Teams() {
  const { teams, competition, addTeam, updateTeam, removeTeam } = useQuiz();
  const [form, setForm] = useState({ name: '', member1: '', member2: '', college: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isRegistration = competition.status === 'registration';

  const resetForm = () => {
    setForm({ name: '', member1: '', member2: '', college: '' });
    setEditId(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, member1, member2, college } = form;
    if (!name.trim() || !member1.trim() || !member2.trim()) {
      setError('Team name and both participant names are required.');
      return;
    }
    if (!college.trim()) {
      setError('College / Institution is required.');
      return;
    }
    try {
      if (editId) {
        updateTeam(editId, {
          name: name.trim(),
          member1: member1.trim(),
          member2: member2.trim(),
          college: college.trim(),
        });
      } else {
        if (teams.length >= 20) {
          setError('Maximum 20 teams allowed.');
          return;
        }
        addTeam(name.trim(), member1.trim(), member2.trim(), college.trim());
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setForm({ name: t.name, member1: t.member1, member2: t.member2, college: t.college || '' });
    setError('');
  };

  const handleRemove = (id) => {
    if (!isRegistration) {
      if (!window.confirm('Competition is in progress. Removing this team will delete their scores. Continue?')) return;
    }
    if (window.confirm('Remove this team? Their scores will also be deleted.')) {
      removeTeam(id);
      if (editId === id) resetForm();
    }
  };

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.member1.toLowerCase().includes(q) ||
      t.member2.toLowerCase().includes(q) ||
      (t.college && t.college.toLowerCase().includes(q))
    );
  }, [teams, searchQuery]);

  const remaining = 20 - teams.length;
  const canAddMore = teams.length < 20 && isRegistration;

  const qualBadge = (status) => {
    const map = {
      active: { label: '🔵 Active', cls: 'qual-active' },
      qualified: { label: '✅ Qualified', cls: 'qual-qualified' },
      eliminated: { label: '🚫 Eliminated', cls: 'qual-eliminated' },
    };
    const info = map[status] || map.active;
    return <span className={`qual-badge ${info.cls}`}>{info.label}</span>;
  };

  return (
    <div className="page teams-page">
      <header className="page-header">
        <h1>Team Registration</h1>
        <p className="subtitle">
          <span className="team-count-badge">{teams.length}</span> / 20 teams registered
          {remaining > 0 && teams.length >= 5 && (
            <span className="badge">{remaining} slots left</span>
          )}
          {teams.length < 5 && (
            <span className="badge warn-badge">Need {5 - teams.length} more to start</span>
          )}
        </p>
      </header>

      {/* Registration Form */}
      <section className="card" id="team-form-card">
        <h2>{editId ? '✏️ Edit Team' : '➕ Register New Team'}</h2>
        {!canAddMore && !editId ? (
          <p className="form-info">
            {!isRegistration
              ? '⚠️ Competition is in progress. You can only edit existing teams.'
              : 'Maximum 20 teams reached.'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="team-form" id="team-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="team-name">Team Name *</label>
                <input
                  id="team-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. The Strategists"
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label htmlFor="team-college">College / Institution *</label>
                <input
                  id="team-college"
                  value={form.college}
                  onChange={(e) => setForm({ ...form, college: e.target.value })}
                  placeholder="e.g. IIM Bangalore"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="member-1">Participant 1 *</label>
                <input
                  id="member-1"
                  value={form.member1}
                  onChange={(e) => setForm({ ...form, member1: e.target.value })}
                  placeholder="Full name"
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label htmlFor="member-2">Participant 2 *</label>
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
        )}
      </section>

      {/* Search & Team List */}
      <section className="card" id="team-list-card">
        <div className="card-header-row">
          <h2>Registered Teams ({teams.length})</h2>
          <div className="search-box">
            <input
              type="search"
              placeholder="Search teams, members, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              id="team-search"
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <p className="empty-state">
            {teams.length === 0
              ? 'No teams yet — register one above.'
              : 'No teams match your search.'}
          </p>
        ) : (
          <div className="table-wrap">
            <table className="team-directory-table" id="team-directory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team Name</th>
                  <th>Participant 1</th>
                  <th>Participant 2</th>
                  <th>College</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((t) => (
                  <tr key={t.id} className={t.qualificationStatus === 'eliminated' ? 'row-eliminated' : ''}>
                    <td>
                      <span className="team-number">{t.teamNumber}</span>
                    </td>
                    <td className="team-name-cell">{t.name}</td>
                    <td>{t.member1}</td>
                    <td>{t.member2}</td>
                    <td className="member-cell">{t.college || '—'}</td>
                    <td>{qualBadge(t.qualificationStatus)}</td>
                    <td>
                      <div className="team-actions">
                        <button
                          className="btn small ghost"
                          onClick={() => startEdit(t)}
                          aria-label={`Edit ${t.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => handleRemove(t.id)}
                          aria-label={`Remove ${t.name}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
