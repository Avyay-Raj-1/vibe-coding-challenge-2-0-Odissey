import { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPlayers } from '../../lib/players';
import { getSessions } from '../../lib/sessions';
import { getMatches } from '../../lib/matches';
import { getReadySummary } from '../../lib/readiness';
import type { Player, Session, Match } from '../../types';
import { fmtDate } from '../../lib/utils';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [readySummary, setReadySummary] = useState({ total: 0, ready: 0, sports: [] as string[] });

  useEffect(() => {
    Promise.all([getPlayers(true), getSessions(), getMatches(), getReadySummary()])
      .then(([p, s, m, r]) => { setPlayers(p); setSessions(s); setMatches(m); setReadySummary(r); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const openSessions = sessions.filter(s => s.status === 'OPEN').length;
  const recentSessions = sessions.slice(0, 5);
  const recentMatches = matches.slice(0, 5);

  const sportCounts: Record<string, number> = {};
  players.forEach(p => { sportCounts[p.sport] = (sportCounts[p.sport] ?? 0) + 1; });
  const sportEntries = Object.entries(sportCounts);
  const maxCount = Math.max(...sportEntries.map(([, v]) => v), 1);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Active Players" value={players.length} icon="👥" accent="#10b981" />
        <StatCard label="Open Sessions" value={openSessions} icon="📋" accent="#f59e0b" sub="Practice sessions" />
        <StatCard label="Total Matches" value={matches.length} icon="⚽" accent="#6366f1" />
        <StatCard label="Ready Players" value={readySummary.ready} icon="🏆" accent="#10b981" sub={`of ${readySummary.total} total`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Players by sport */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Players by Sport</h3>
          {sportEntries.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No players added yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sportEntries.map(([sport, count]) => (
                <div key={sport}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{sport}</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: '#10b981', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No sessions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentSessions.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.sport}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{fmtDate(s.session_date)}</div>
                  </div>
                  <Badge value={s.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>Recent Matches</h3>
        {recentMatches.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No matches recorded yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sport</th>
                  <th>Opponent</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map(m => (
                  <tr key={m.id}>
                    <td>{fmtDate(m.match_date)}</td>
                    <td>{m.sport}</td>
                    <td>vs {m.opponent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
