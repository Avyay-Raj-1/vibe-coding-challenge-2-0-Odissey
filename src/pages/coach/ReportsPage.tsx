import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllReadiness } from '../../lib/readiness';
import { getSessions } from '../../lib/sessions';
import { getMatches, getMatchParticipants } from '../../lib/matches';
import { getPlayers } from '../../lib/players';
import type { PlayerReadiness, Session, Match, Player } from '../../types';

/* ─── SVG Mini Bar Chart ─── */
function BarChart({ data, color = '#10b981', height = 120, label = '' }: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  label?: string;
}) {
  if (data.length === 0) return <p style={{ color: '#94a3b8', fontSize: 14 }}>No data yet</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(20, Math.min(48, Math.floor(360 / data.length) - 8));
  const totalW = data.length * (barW + 8);

  return (
    <div>
      {label && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>}
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalW, 300)} height={height + 32} style={{ display: 'block' }}>
          {data.map((d, i) => {
            const barH = max > 0 ? Math.round((d.value / max) * height) : 0;
            const x = i * (barW + 8) + 4;
            const y = height - barH;
            return (
              <g key={d.label}>
                <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
                <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize={10} fill="#64748b">
                  {d.label.length > 7 ? d.label.slice(0, 6) + '…' : d.label}
                </text>
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={color} fontWeight="bold">
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ─── Donut Chart ─── */
function DonutChart({ ready, notReady }: { ready: number; notReady: number }) {
  const total = ready + notReady;
  if (total === 0) return <p style={{ color: '#94a3b8', fontSize: 14 }}>No players yet</p>;
  const pct = Math.round((ready / total) * 100);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (ready / total) * circ;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="#e2e8f0" strokeWidth={16} />
        <circle
          cx={60} cy={60} r={r} fill="none"
          stroke="#10b981" strokeWidth={16}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x={60} y={56} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#0f172a">{pct}%</text>
        <text x={60} y={72} textAnchor="middle" fontSize={10} fill="#64748b">ready</text>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 13 }}>Ready: <strong>{ready}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }} />
          <span style={{ fontSize: 13 }}>Not Ready: <strong>{notReady}</strong></span>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Total: {total}</div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [readiness, setReadiness] = useState<PlayerReadiness[]>([]);
  const [topScorers, setTopScorers] = useState<{ name: string; avg: number; matches: number }[]>([]);

  useEffect(() => {
    const run = async () => {
      const [p, s, m, r] = await Promise.all([getPlayers(true), getSessions(), getMatches(), getAllReadiness()]);
      setPlayers(p);
      setSessions(s);
      setMatches(m);
      setReadiness(r);

      // compute top scorers
      const scoreMap: Record<string, { total: number; count: number; name: string }> = {};
      await Promise.all(m.map(async (match) => {
        const parts = await getMatchParticipants(match.id);
        parts.forEach(pt => {
          if (!scoreMap[pt.player_id]) {
            const pl = r.find(x => x.player_id === pt.player_id);
            scoreMap[pt.player_id] = { total: 0, count: 0, name: pl?.name ?? pt.player_id };
          }
          scoreMap[pt.player_id].total += Number(pt.score);
          scoreMap[pt.player_id].count += 1;
        });
      }));
      const scorers = Object.values(scoreMap)
        .map(x => ({ name: x.name, avg: x.count ? Math.round((x.total / x.count) * 10) / 10 : 0, matches: x.count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 10);
      setTopScorers(scorers);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Sport breakdown
  const sportMap: Record<string, number> = {};
  players.forEach(p => { sportMap[p.sport] = (sportMap[p.sport] ?? 0) + 1; });
  const sportData = Object.entries(sportMap).map(([label, value]) => ({ label, value }));

  // Monthly sessions
  const sessionsByMonth: Record<string, number> = {};
  sessions.filter(s => s.status === 'CLOSED').forEach(s => {
    const mo = s.session_date.slice(0, 7);
    sessionsByMonth[mo] = (sessionsByMonth[mo] ?? 0) + 1;
  });
  const sessionData = Object.entries(sessionsByMonth).sort().slice(-6).map(([label, value]) => ({
    label: label.slice(5),
    value,
  }));

  // Attendance % distribution
  const attBuckets = [
    { label: '0–25%', value: 0 }, { label: '25–50%', value: 0 },
    { label: '50–75%', value: 0 }, { label: '75–100%', value: 0 },
  ];
  readiness.forEach(r => {
    const pct = Number(r.attendance_percentage);
    if (pct < 25) attBuckets[0].value++;
    else if (pct < 50) attBuckets[1].value++;
    else if (pct < 75) attBuckets[2].value++;
    else attBuckets[3].value++;
  });

  const readyCount = readiness.filter(r => r.readiness_status === 'READY').length;
  const notReadyCount = readiness.length - readyCount;

  return (
    <div>
      {/* Summary row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Players', value: players.length, icon: '👥' },
          { label: 'Closed Sessions', value: sessions.filter(s => s.status === 'CLOSED').length, icon: '📋' },
          { label: 'Total Matches', value: matches.length, icon: '⚽' },
          { label: 'Ready Players', value: readyCount, icon: '🏆' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Players by Sport</h3>
          <BarChart data={sportData} color="#6366f1" />
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Trial Readiness</h3>
          <DonutChart ready={readyCount} notReady={notReadyCount} />
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Sessions (Last 6 Months)</h3>
          <BarChart data={sessionData} color="#10b981" />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Attendance Distribution</h3>
          <BarChart data={attBuckets} color="#f59e0b" height={100} />
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Top Scorers (Avg)</h3>
          {topScorers.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No match scores yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topScorers.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? ['#f59e0b', '#94a3b8', '#cd7c2f'][i] : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: i < 3 ? '#fff' : '#64748b',
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.matches} match{s.matches !== 1 ? 'es' : ''}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981', flexShrink: 0 }}>{s.avg}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Readiness table */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Full Player Readiness Report</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Player</th><th>Sport</th><th>Attendance</th>
                <th>Present</th><th>Absent</th><th>Matches</th><th>Avg Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {readiness.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No data</td></tr>
              ) : readiness.map(r => (
                <tr key={r.player_id}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.sport}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: `${Math.min(100, r.attendance_percentage)}%`, height: '100%', background: r.attendance_percentage >= 75 ? '#10b981' : '#ef4444', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.attendance_percentage >= 75 ? '#10b981' : '#ef4444', minWidth: 36 }}>
                        {Number(r.attendance_percentage).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>{r.present_sessions}</td>
                  <td>{r.absent_sessions}</td>
                  <td>{r.matches_played}</td>
                  <td>{r.avg_score != null ? Number(r.avg_score).toFixed(1) : '—'}</td>
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: r.readiness_status === 'READY' ? '#d1fae5' : '#fee2e2',
                      color: r.readiness_status === 'READY' ? '#065f46' : '#991b1b',
                    }}>
                      {r.readiness_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

