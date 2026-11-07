import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ProgressBar from '../../components/ProgressBar';
import { getPlayers, addPlayer, updatePlayer, deactivatePlayer } from '../../lib/players';
import { getAllReadiness } from '../../lib/readiness';
import type { Player, PlayerReadiness } from '../../types';
import { fmtDate, generatePlayerId, SPORTS } from '../../lib/utils';
import { signUp } from '../../lib/auth';

interface PlayerForm {
  name: string; age: string; sport: string;
  joining_date: string; email: string; password: string;
}

const defaultForm: PlayerForm = {
  name: '', age: '', sport: 'Football',
  joining_date: new Date().toISOString().slice(0, 10),
  email: '', password: '',
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [readiness, setReadiness] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState<PlayerForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([getPlayers(), getAllReadiness()]);
    setPlayers(p);
    setReadiness(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const readinessMap = Object.fromEntries(readiness.map(r => [r.player_id, r]));
  const sports = ['All', ...Array.from(new Set(players.map(p => p.sport)))];
  const filtered = players.filter(p => {
    const matchSport = sportFilter === 'All' || p.sport === sportFilter;
    const q = search.toLowerCase();
    return matchSport && (p.name.toLowerCase().includes(q) || p.player_id.toLowerCase().includes(q));
  });

  const openAdd = () => { setEditPlayer(null); setForm(defaultForm); setFormError(''); setShowModal(true); };
  const openEdit = (p: Player) => {
    setEditPlayer(p);
    setForm({ name: p.name, age: String(p.age), sport: p.sport, joining_date: p.joining_date, email: '', password: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editPlayer) {
        await updatePlayer(editPlayer.player_id, { name: form.name, age: parseInt(form.age), sport: form.sport, joining_date: form.joining_date });
        setSuccessMsg('Player updated successfully!');
      } else {
        const pid = generatePlayerId(form.name, form.sport);
        await addPlayer({ player_id: pid, name: form.name, age: parseInt(form.age), sport: form.sport, joining_date: form.joining_date });
        if (form.email && form.password) {
          await signUp(form.email, form.password, form.name, 'player', pid);
        }
        setSuccessMsg(`Player added! ID: ${pid}`);
      }
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving player');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (playerId: string) => {
    if (!confirm('Deactivate this player? They will no longer appear in sessions.')) return;
    await deactivatePlayer(playerId);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {successMsg && (
        <div className="alert-success">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#065f46' }}>×</button>
        </div>
      )}

      {/* Controls */}
      <div className="filter-bar">
        <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search players..." />
        <select className="form-select" style={{ width: 'auto', flex: 'none', minWidth: 130 }} value={sportFilter} onChange={e => setSportFilter(e.target.value)}>
          {sports.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Player</button>
      </div>

      {/* Desktop table */}
      <div className="table-wrap hide-on-mobile">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Age</th><th>Sport</th>
                <th>Joined</th><th>Attendance</th><th>Matches</th>
                <th>Readiness</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No players found</td></tr>
              ) : filtered.map(p => {
                const r = readinessMap[p.player_id];
                return (
                  <tr key={p.id}>
                    <td style={{ color: '#6366f1', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{p.player_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.sport}</td>
                    <td style={{ color: '#64748b' }}>{fmtDate(p.joining_date)}</td>
                    <td style={{ minWidth: 120 }}>{r ? <ProgressBar value={r.attendance_percentage} height={6} /> : '—'}</td>
                    <td>{r?.matches_played ?? '—'}</td>
                    <td>{r ? <Badge value={r.readiness_status} size="sm" /> : '—'}</td>
                    <td><Badge value={p.active ? 'OPEN' : 'CLOSED'} size="sm" /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(p)} className="btn btn-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>Edit</button>
                        {p.active && <button onClick={() => handleDeactivate(p.player_id)} className="btn btn-sm btn-danger">Off</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No players found</div>
        ) : filtered.map(p => {
          const r = readinessMap[p.player_id];
          return (
            <div key={p.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.player_id} · Age {p.age} · {p.sport}</div>
                </div>
                {r ? <Badge value={r.readiness_status} size="sm" /> : null}
              </div>
              {r && (
                <div style={{ marginBottom: 10 }}>
                  <ProgressBar value={r.attendance_percentage} height={6} />
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{r.present_sessions}/{r.total_sessions} sessions · {r.matches_played} matches</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => openEdit(p)} className="btn btn-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>Edit</button>
                {p.active && <button onClick={() => handleDeactivate(p.player_id)} className="btn btn-sm btn-danger">Deactivate</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
              {editPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            {formError && <div className="alert-error">⚠️ {formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required min={5} max={60} />
              </div>
              <div className="form-group">
                <label className="form-label">Sport</label>
                <select className="form-select" value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input className="form-input" type="date" value={form.joining_date} onChange={e => setForm(f => ({ ...f, joining_date: e.target.value }))} required />
              </div>
              {!editPlayer && (
                <>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, fontStyle: 'italic' }}>
                    Optional: Create a login account for this player
                  </div>
                  <div className="form-group">
                    <label className="form-label">Player Email (optional)</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="player@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password (optional)</label>
                    <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editPlayer ? 'Update' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
