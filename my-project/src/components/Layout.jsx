import { NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/teams', label: 'Teams', icon: '👥' },
  { to: '/rounds', label: 'Rounds', icon: '📝' },
  { to: '/scoring', label: 'Scoring', icon: '🎯' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/results', label: 'Results', icon: '🏅' },
  { to: '/live', label: 'Live Display', icon: '📺' },
];

export default function Layout() {
  const location = useLocation();
  const isLive = location.pathname === '/live';

  // Live display gets a full-screen layout without the sidebar
  if (isLive) {
    return <Outlet />;
  }

  return (
    <div className="app-layout" id="app-layout">
      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">⚡</span>
          <h2>Business Quiz</h2>
        </div>
        <nav className="sidebar-nav" id="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>Business Quiz v2.0</small>
        </div>
      </aside>

      {/* Content */}
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
