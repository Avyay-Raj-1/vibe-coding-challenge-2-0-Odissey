import type { Profile } from '../../types';

interface SettingsPageProps {
  profile: Profile;
  onSignOut: () => void;
}

export default function SettingsPage({ profile, onSignOut }: SettingsPageProps) {
  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#10b981', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24,
          }}>
            {profile.name[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', textTransform: 'capitalize' as const }}>{profile.role}</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{profile.email}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Account Info</h3>
          {[
            { label: 'Full Name', value: profile.name },
            { label: 'Email', value: profile.email },
            { label: 'Role', value: profile.role },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ color: '#0f172a', fontWeight: 600, textTransform: 'capitalize' as const }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#065f46', marginBottom: 20 }}>
            🏅 <strong>Academy Desk</strong> — Sports Performance & Talent Discovery Platform<br />
            <span style={{ color: '#6ee7b7' }}>Every Player. Every Practice. Every Performance.</span>
          </div>
          <button onClick={onSignOut} style={{
            width: '100%', padding: '12px', background: '#fee2e2',
            border: '1px solid #fca5a5', borderRadius: 8,
            color: '#dc2626', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

