import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import { getPlayerReadiness } from '../../lib/readiness';
import { getPlayerAttendance } from '../../lib/attendance';
import { getPlayerMatches } from '../../lib/matches';
import type { Profile, PlayerReadiness, AttendanceRecord, MatchParticipant } from '../../types';
import { fmtDate } from '../../lib/utils';

interface PlayerDashboardProps {
  profile: Profile;
  onSignOut: () => void;
}

type AttWithSession = AttendanceRecord & { sessions: { session_date: string; sport: string; status: string } };
type MatchWithInfo = MatchParticipant & { matches: { match_date: string; sport: string; opponent: string } };

export default function PlayerDashboard({ profile, onSignOut }: PlayerDashboardProps) {
  const [readiness, setReadiness] = useState<PlayerReadiness | null>(null);
  const [attendance, setAttendance] = useState<AttWithSession[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'attendance' | 'matches'>('attendance');

  useEffect(() => {
    if (!profile.player_id) { setLoading(false); return; }
    Promise.all([
      getPlayerReadiness(profile.player_id),
      getPlayerAttendance(profile.player_id),
      getPlayerMatches(profile.player_id),
    ]).then(([r, a, m]) => {
      setReadiness(r);
      setAttendance(a as AttWithSession[]);
      setMatchHistory(m as MatchWithInfo[]);
    }).finally(() => setLoading(false));
  }, [profile.player_id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
    </div>
  );

  if (!profile.player_id) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Account not linked</div>
        <div style={{ fontSize: 14, marginTop: 6 }}>Your account is not linked to a player profile. Please contact your coach.</div>
        <button onClick={onSignOut} className="btn btn-danger" style={{ marginTop: 20 }}>Sign Out</button>
      </div>
    </div>
  );

  const closedAttendance = attendance.filter(a => a.sessions?.status === 'CLOSED');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: '#0f172a', padding: '0 20px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ color: '#10b981', fontWeight: 800, fontSize: 17 }}>🏅 academy desk</div>
        <button onClick={onSignOut} className="btn btn-sm" style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
          Sign Out
        </button>
      </header>

      <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Welcome, {profile.name}! 👋</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {readiness?.sport ?? ''} · ID: {profile.player_id}
          </p>
        </div>

        {/* Readiness card */}
        {readiness && (
          <div className="card" style={{
            padding: 22, marginBottom: 20,
            borderTop: `4px solid ${readiness.readiness_status === 'READY' ? '#10b981' : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Trial Readiness</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>75%+ attendance & 2+ matches required</div>
              </div>
              <Badge value={readiness.readiness_status} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Attendance Rate</span>
                <span style={{ fontWeight: 700 }}>{readiness.present_sessions}/{readiness.total_sessions} sessions</span>
              </div>
              <ProgressBar value={readiness.attendance_percentage} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: 10 }}>
              {[
                { label: 'Present', value: readiness.present_sessions, color: '#10b981' },
                { label: 'Absent', value: readiness.absent_sessions, color: '#ef4444' },
                { label: 'Matches', value: readiness.matches_played, color: '#6366f1' },
                { label: 'Avg Score', value: readiness.avg_score != null ? Number(readiness.avg_score).toFixed(1) : '—', color: '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {(['attendance', 'matches'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: 7, border: 'none',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#0f172a' : '#64748b',
              fontWeight: tab === t ? 700 : 400,
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              {t === 'attendance' ? '📋 Attendance' : '⚽ Matches'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'attendance' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Sport</th><th>Status</th></tr>
              </thead>
              <tbody>
                {closedAttendance.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No attendance records yet</td></tr>
                ) : closedAttendance.map(a => (
                  <tr key={a.id}>
                    <td>{fmtDate(a.sessions?.session_date)}</td>
                    <td>{a.sessions?.sport}</td>
                    <td><Badge value={a.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'matches' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Sport</th><th>Opponent</th><th>Score</th></tr>
              </thead>
              <tbody>
                {matchHistory.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No match records yet</td></tr>
                ) : matchHistory.map(m => (
                  <tr key={m.id}>
                    <td>{fmtDate(m.matches?.match_date)}</td>
                    <td>{m.matches?.sport}</td>
                    <td>vs {m.matches?.opponent}</td>
                    <td>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                        {m.score} pts
                      </span>
                    </td>
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
