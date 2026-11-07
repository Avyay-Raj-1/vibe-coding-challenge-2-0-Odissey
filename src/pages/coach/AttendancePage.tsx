import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { getSessions, createSession, closeSession, getSessionAttendance } from '../../lib/sessions';
import { getPlayersBySport } from '../../lib/players';
import { markAttendance } from '../../lib/attendance';
import type { Session, AttendanceRecord, Player } from '../../types';
import { fmtDate, SPORTS } from '../../lib/utils';

export default function AttendancePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'mark'>('list');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionPlayers, setSessionPlayers] = useState<Player[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newSport, setNewSport] = useState('Football');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [closing, setClosing] = useState(false);

  const load = async () => {
    setLoading(true);
    const s = await getSessions();
    setSessions(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openMarkAttendance = async (session: Session) => {
    setActiveSession(session);
    setView('mark');
    const [players, existing] = await Promise.all([
      getPlayersBySport(session.sport),
      getSessionAttendance(session.id),
    ]);
    setSessionPlayers(players);
    const att: Record<string, 'PRESENT' | 'ABSENT'> = {};
    players.forEach(p => { att[p.player_id] = 'ABSENT'; });
    (existing as AttendanceRecord[]).forEach(r => { att[r.player_id] = r.status; });
    setAttendance(att);
  };

  const toggleAttendance = async (playerId: string) => {
    if (activeSession?.status === 'CLOSED') return;
    const newStatus = attendance[playerId] === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    setSavingMap(m => ({ ...m, [playerId]: true }));
    try {
      await markAttendance(activeSession!.id, playerId, newStatus);
      setAttendance(a => ({ ...a, [playerId]: newStatus }));
    } catch (err) {
      console.error(err);
    }
    setSavingMap(m => ({ ...m, [playerId]: false }));
  };

  const handleClose = async () => {
    if (!activeSession) return;
    if (!confirm('Close this session? Attendance will be permanently locked.')) return;
    setClosing(true);
    try {
      await closeSession(activeSession.id);
      setActiveSession(s => s ? { ...s, status: 'CLOSED' } : null);
      await load();
    } catch (err) { console.error(err); }
    setClosing(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await createSession(newDate, newSport, 'coach');
      setShowNewModal(false);
      await load();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error creating session. It may already exist for that date/sport.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // ── MARK ATTENDANCE VIEW ──
  if (view === 'mark' && activeSession) {
    const presentCount = Object.values(attendance).filter(v => v === 'PRESENT').length;
    const isClosed = activeSession.status === 'CLOSED';

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => { setView('list'); setActiveSession(null); }}>
            ← Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {activeSession.sport} — {fmtDate(activeSession.session_date)}
            </h2>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {presentCount} / {sessionPlayers.length} Present
            </div>
          </div>
          <Badge value={activeSession.status} />
        </div>

        {isClosed && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#065f46', marginBottom: 16 }}>
            🔒 Session is closed. Attendance is locked.
          </div>
        )}

        {sessionPlayers.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
            No active {activeSession.sport} players found. Add players first.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {sessionPlayers.map(p => {
              const isPresent = attendance[p.player_id] === 'PRESENT';
              const isSaving = savingMap[p.player_id];
              return (
                <div key={p.player_id} style={{
                  background: '#fff',
                  border: `2px solid ${isPresent ? '#10b981' : '#fca5a5'}`,
                  borderRadius: 12, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ minWidth: 0, marginRight: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.player_id} · {p.age}y</div>
                  </div>
                  <button
                    onClick={() => toggleAttendance(p.player_id)}
                    disabled={isClosed || isSaving}
                    style={{
                      padding: '7px 14px',
                      background: isPresent ? '#10b981' : '#ef4444',
                      border: 'none', borderRadius: 8,
                      color: '#fff', fontWeight: 700, fontSize: 12,
                      cursor: isClosed ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1,
                      minWidth: 86, flexShrink: 0,
                      fontFamily: 'inherit',
                    }}
                  >
                    {isSaving ? '…' : isPresent ? '✓ PRESENT' : '✗ ABSENT'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!isClosed && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={handleClose} disabled={closing} style={{
              background: '#dc2626', color: '#fff', padding: '12px 28px', fontSize: 15,
            }}>
              {closing ? 'Closing...' : '🔒 Close & Lock Session'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── SESSION LIST VIEW ──
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>+ New Session</button>
      </div>

      {/* Desktop table */}
      <div className="table-wrap hide-on-mobile">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Sport</th><th>Status</th><th>Created</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                  No sessions yet. Click "+ New Session" to create one.
                </td></tr>
              ) : sessions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{fmtDate(s.session_date)}</td>
                  <td>{s.sport}</td>
                  <td><Badge value={s.status} size="sm" /></td>
                  <td style={{ color: '#94a3b8' }}>{fmtDate(s.created_at)}</td>
                  <td>
                    <button
                      onClick={() => openMarkAttendance(s)}
                      className="btn btn-sm"
                      style={{
                        background: s.status === 'OPEN' ? '#10b981' : '#f1f5f9',
                        color: s.status === 'OPEN' ? '#fff' : '#475569',
                      }}
                    >
                      {s.status === 'OPEN' ? '📝 Mark' : '👁 View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
        {sessions.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No sessions yet</div>
        ) : sessions.map(s => (
          <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{s.sport}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{fmtDate(s.session_date)}</div>
              <div style={{ marginTop: 4 }}><Badge value={s.status} size="sm" /></div>
            </div>
            <button
              onClick={() => openMarkAttendance(s)}
              className="btn btn-sm"
              style={{ background: s.status === 'OPEN' ? '#10b981' : '#f1f5f9', color: s.status === 'OPEN' ? '#fff' : '#475569', flexShrink: 0 }}
            >
              {s.status === 'OPEN' ? '📝 Mark' : '👁 View'}
            </button>
          </div>
        ))}
      </div>

      {/* New Session Modal */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>New Practice Session</h2>
            {createError && <div className="alert-error">⚠️ {createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sport</label>
                <select className="form-select" value={newSport} onChange={e => setNewSport(e.target.value)}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowNewModal(false); setCreateError(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
