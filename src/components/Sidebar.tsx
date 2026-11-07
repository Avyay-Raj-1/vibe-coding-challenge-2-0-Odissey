import type { CoachPage, Profile } from '../types';

interface SidebarProps {
  activePage: CoachPage;
  onNavigate: (page: CoachPage) => void;
  profile: Profile;
  onSignOut: () => void;
  onClose?: () => void;
}

const NAV: { page: CoachPage; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Overview', icon: '📊' },
  { page: 'players', label: 'Players', icon: '👥' },
  { page: 'attendance', label: 'Attendance', icon: '✅' },
  { page: 'matches', label: 'Matches', icon: '⚽' },
  { page: 'ready', label: 'Ready Players', icon: '🏆' },
  { page: 'reports', label: 'Reports', icon: '📈' },
  { page: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activePage, onNavigate, profile, onSignOut, onClose }: SidebarProps) {
  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      height: '100%',
      overflowY: 'auto',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#10b981', fontWeight: 800, fontSize: 17, letterSpacing: 0.3 }}>
              🏅 academy desk
            </div>
            <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Sports Management</div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }} aria-label="Close">
              ✕
            </button>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map(({ page, label, icon }) => {
          const active = activePage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 20px',
                background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                borderLeft: `3px solid ${active ? '#10b981' : 'transparent'}`,
                border: 'none', borderRight: 'none',
                color: active ? '#10b981' : '#94a3b8',
                fontSize: 14, fontWeight: active ? 700 : 400,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 16, width: 20, flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '14px 20px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
          }}>
            {profile.name[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</div>
            <div style={{ color: '#475569', fontSize: 11, textTransform: 'capitalize' }}>{profile.role}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{
          width: '100%', padding: '8px 12px', background: '#1e293b',
          border: '1px solid #334155', borderRadius: 8, color: '#94a3b8',
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
        }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
