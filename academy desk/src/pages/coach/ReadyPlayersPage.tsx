import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import { getAllReadiness } from '../../lib/readiness';
import type { PlayerReadiness } from '../../types';
import { fmtDate, SPORTS } from '../../lib/utils';

export default function ReadyPlayersPage() {
  const [data, setData] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'READY' | 'NOT READY'>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllReadiness().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const sports = ['All', ...SPORTS.filter(s => data.some(p => p.sport === s))];
  const filtered = data.filter(p => {
    const matchSport = sportFilter === 'All' || p.sport === sportFilter;
    const matchStatus = statusFilter === 'All' || p.readiness_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.player_id.toLowerCase().includes(q);
    return matchSport && matchStatus && matchSearch;
  });

  const readyCount = data.filter(p => p.readiness_status === 'READY').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: '#d1fae5', borderRadius: 10, padding: '7px 14px', color: '#065f46', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          🏆 {readyCount} / {data.length} READY
        </div>
        <div style={{ flex: 1 }} />
        <input
          className="form-input"
          style={{ maxWidth: 180 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search..."
        />
        <select className="form-select" style={{ width: 'auto', minWidth: 130 }} value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
          {sports.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="All">All Status</option>
          <option value="READY">READY</option>
          <option value="NOT READY">NOT READY</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div>No players match the selected filters</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div key={p.player_id} className="card" style={{
              padding: 20,
              borderTop: `4px solid ${p.readiness_status === 'READY' ? '#10b981' : '#e2e8f0'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ minWidth: 0, marginRight: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{p.player_id} · Age {p.age}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>{p.sport} · {fmtDate(p.joining_date)}</div>
                </div>
                <Badge value={p.readiness_status} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                  <span>Attendance</span>
                  <span>{p.present_sessions}/{p.total_sessions} sessions</span>
                </div>
                <ProgressBar value={p.attendance_percentage} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                  { label: 'Matches', value: p.matches_played },
                  { label: 'Avg Score', value: p.avg_score != null ? Number(p.avg_score).toFixed(1) : '—' },
                  { label: 'Best', value: p.max_score ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '7px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{value}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{label}</div>
                  </div>
                ))}
              </div>

              {p.readiness_status === 'NOT READY' && (
                <div style={{ marginTop: 10, padding: '7px 10px', background: '#fffbeb', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
                  {p.attendance_percentage < 75 && p.matches_played < 2
                    ? `+${Math.ceil(75 - p.attendance_percentage)}% attendance & ${2 - p.matches_played} match(es)`
                    : p.attendance_percentage < 75
                    ? `+${Math.ceil(75 - p.attendance_percentage)}% attendance needed`
                    : `${2 - p.matches_played} more match(es) needed`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
