import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import { getScoutReadyPlayers } from '../../lib/readiness';
import type { PlayerReadiness, Profile } from '../../types';
import { SPORTS } from '../../lib/utils';

interface ScoutDashboardProps {
  profile: Profile;
  onSignOut: () => void;
}

export default function ScoutDashboard({ profile, onSignOut }: ScoutDashboardProps) {
  const [players, setPlayers] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getScoutReadyPlayers({
        sport: sportFilter || undefined,
        minAge: minAge ? parseInt(minAge) : undefined,
        maxAge: maxAge ? parseInt(maxAge) : undefined,
        search: search || undefined,
      });
      setPlayers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, sportFilter, minAge, maxAge]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Bar */}
      <header style={{
        background: '#0f172a', padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ color: '#10b981', fontWeight: 800, fontSize: 17 }}>🏅 academy desk</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
            {profile.name[0]?.toUpperCase()}
          </div>
          <span style={{ color: '#94a3b8', fontSize: 13, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</span>
          <button onClick={onSignOut} className="btn btn-sm" style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Scout Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>Players with 75%+ attendance and 2+ matches</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name..." />
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
            <option value="">All Sports</option>
            {SPORTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <input className="form-input" type="number" value={minAge} onChange={e => setMinAge(e.target.value)} placeholder="Min Age" min={5} max={60} style={{ maxWidth: 100 }} />
          <input className="form-input" type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} placeholder="Max Age" min={5} max={60} style={{ maxWidth: 100 }} />
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
              {players.length} ready player{players.length !== 1 ? 's' : ''} found
            </div>
            {players.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>No READY players match your filters</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {players.map(p => (
                  <div key={p.player_id} className="card" style={{ padding: 22, borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p.sport} · Age {p.age}</div>
                      </div>
                      <Badge value="READY" />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                        <span>Attendance</span>
                        <span>{p.present_sessions}/{p.total_sessions}</span>
                      </div>
                      <ProgressBar value={p.attendance_percentage} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        { label: 'Matches', value: p.matches_played },
                        { label: 'Avg Score', value: p.avg_score != null ? Number(p.avg_score).toFixed(1) : '—' },
                        { label: 'Best', value: p.max_score ?? '—' },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
