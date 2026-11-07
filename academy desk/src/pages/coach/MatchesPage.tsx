import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { getMatches, createMatch, addMatchParticipant, getMatchParticipants } from '../../lib/matches';
import { getSessionByDateSport, getSessionAttendance } from '../../lib/sessions';
import { getPlayerById } from '../../lib/players';
import type { Match, MatchParticipant, Player } from '../../types';
import { fmtDate, SPORTS } from '../../lib/utils';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), sport: 'Football', opponent: '' });
  const [presentPlayers, setPresentPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedParticipants, setExpandedParticipants] = useState<(MatchParticipant & { playerName?: string })[]>([]);
  const [loadingExpand, setLoadingExpand] = useState(false);

  const load = async () => {
    setLoading(true);
    const m = await getMatches();
    setMatches(m);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setShowModal(true);
    setStep(1);
    setCreateError('');
    setNewMatch(null);
    setPresentPlayers([]);
    setScores({});
    setForm({ date: new Date().toISOString().slice(0, 10), sport: 'Football', opponent: '' });
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const session = await getSessionByDateSport(form.date, form.sport);
      if (!session) throw new Error('No practice session found for this date and sport.');
      if (session.status !== 'CLOSED') throw new Error('The practice session must be CLOSED before recording a match.');

      const attendance = await getSessionAttendance(session.id);
      const presentIds = attendance.filter(a => a.status === 'PRESENT').map(a => a.player_id);
      if (presentIds.length === 0) throw new Error('No players were marked PRESENT in the session for this date.');

      const playerDetails = await Promise.all(presentIds.map(id => getPlayerById(id)));
      const validPlayers = playerDetails.filter(Boolean) as Player[];
      setPresentPlayers(validPlayers);

      const match = await createMatch(form.date, form.sport, form.opponent, session.id);
      setNewMatch(match);
      const initScores: Record<string, string> = {};
      validPlayers.forEach(p => { initScores[p.player_id] = ''; });
      setScores(initScores);
      setStep(2);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Error creating match');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveScores = async () => {
    if (!newMatch) return;
    setCreating(true);
    setCreateError('');
    const errors: string[] = [];
    for (const player of presentPlayers) {
      const scoreVal = scores[player.player_id];
      if (!scoreVal && scoreVal !== '0') continue;
      const score = parseFloat(scoreVal);
      if (isNaN(score)) continue;
      try {
        await addMatchParticipant(newMatch.id, player.player_id, score);
      } catch (err: unknown) {
        errors.push(`${player.name}: ${err instanceof Error ? err.message : 'error'}`);
      }
    }
    if (errors.length > 0) {
      setCreateError(errors.join('; '));
      setCreating(false);
      return;
    }
    setShowModal(false);
    await load();
    setCreating(false);
  };

  const toggleExpand = async (matchId: string) => {
    if (expandedId === matchId) { setExpandedId(null); return; }
    setExpandedId(matchId);
    setLoadingExpand(true);
    const parts = await getMatchParticipants(matchId);
    const withNames = await Promise.all(parts.map(async p => {
      const player = await getPlayerById(p.player_id);
      return { ...p, playerName: player?.name ?? p.player_id };
    }));
    setExpandedParticipants(withNames);
    setLoadingExpand(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={openModal}>+ New Match</button>
      </div>

      {/* Mobile card view + desktop table */}
      <>
        {/* Desktop table */}
        <div className="table-wrap hide-on-mobile">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Match Date', 'Sport', 'Opponent', 'Scores'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
                    No matches recorded yet. Create a session, mark attendance, close it, then add a match.
                  </td></tr>
                ) : matches.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{fmtDate(m.match_date)}</td>
                    <td>{m.sport}</td>
                    <td>vs {m.opponent}</td>
                    <td>
                      <button
                        onClick={() => toggleExpand(m.id)}
                        className="btn btn-sm"
                        style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}
                      >
                        {expandedId === m.id ? '▲ Hide' : '▼ Scores'}
                      </button>
                      {expandedId === m.id && (
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {loadingExpand ? (
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading...</span>
                          ) : expandedParticipants.length === 0 ? (
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>No scores recorded</span>
                          ) : expandedParticipants.map(ep => (
                            <div key={ep.id} style={{
                              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                              padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center',
                              fontSize: 13,
                            }}>
                              <span style={{ fontWeight: 600 }}>{ep.playerName}</span>
                              <span style={{ background: '#d1fae5', color: '#065f46', padding: '1px 8px', borderRadius: 20, fontWeight: 700 }}>
                                {ep.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="show-on-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {matches.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
              No matches yet. Create a session first.
            </div>
          ) : matches.map(m => (
            <div key={m.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>vs {m.opponent}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{m.sport} · {fmtDate(m.match_date)}</div>
                </div>
                <button
                  onClick={() => toggleExpand(m.id)}
                  className="btn btn-sm"
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}
                >
                  {expandedId === m.id ? '▲' : '▼ Scores'}
                </button>
              </div>
              {expandedId === m.id && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  {loadingExpand ? (
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading...</span>
                  ) : expandedParticipants.length === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>No scores recorded</span>
                  ) : expandedParticipants.map(ep => (
                    <div key={ep.id} style={{
                      background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8,
                      padding: '5px 12px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 600 }}>{ep.playerName}</span>
                      <span style={{ fontWeight: 700, color: '#065f46' }}>{ep.score} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-lg">
            {step === 1 ? (
              <>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Create Match Record</h2>
                {createError && <div className="alert-error">⚠️ {createError}</div>}
                <form onSubmit={handleStep1}>
                  <div className="form-group">
                    <label className="form-label">Match Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sport</label>
                    <select
                      className="form-select"
                      value={form.sport}
                      onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
                    >
                      {SPORTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Opponent</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.opponent}
                      onChange={e => setForm(f => ({ ...f, opponent: e.target.value }))}
                      required
                      placeholder="e.g. Dumka Tigers FC"
                    />
                  </div>
                  <div className="alert-info">
                    ℹ️ A <strong>CLOSED</strong> practice session must exist for the selected date and sport. Only players marked PRESENT will appear for scoring.
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                      {creating ? 'Loading...' : 'Next →'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Enter Scores</h2>
                <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px' }}>
                  vs {form.opponent} · {fmtDate(form.date)} · {form.sport}
                </p>
                {createError && <div className="alert-error">⚠️ {createError}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {presentPlayers.map(p => (
                    <div key={p.player_id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', background: '#f8fafc', borderRadius: 10,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.player_id}</div>
                      </div>
                      <Badge value="PRESENT" size="sm" />
                      <input
                        type="number"
                        value={scores[p.player_id] ?? ''}
                        onChange={e => setScores(s => ({ ...s, [p.player_id]: e.target.value }))}
                        placeholder="Score"
                        min={0} max={100} step={0.1}
                        style={{ width: 72, padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', flexShrink: 0 }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveScores} disabled={creating}>
                    {creating ? 'Saving...' : '💾 Save Match'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
