import { useState } from 'react';
import { signUp } from '../lib/auth';
import type { UserRole } from '../types';

interface LoginPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSignIn: (email: string, password: string) => Promise<any>;
}

export default function LoginPage({ onSignIn }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('scout');
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await onSignIn(email.trim(), password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const resolvedPlayerId = role === 'player'
          ? (playerId.trim() || `PLY-${Math.floor(100 + Math.random() * 900)}`)
          : undefined;

        await signUp(email.trim(), password, name.trim(), role, resolvedPlayerId);
        setSuccess('Account created successfully! Logging you in...');
        await onSignIn(email.trim(), password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await onSignIn(demoEmail, demoPass);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 4 }}>🏅</div>
          <h1 style={{ color: '#10b981', fontWeight: 800, fontSize: 26, margin: 0, letterSpacing: '0.5px' }}>
            academy desk
          </h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: 13 }}>
            Dumka Sports Academy Management & Talent Discovery
          </p>
          <p style={{ color: '#64748b', marginTop: 2, fontSize: 12, fontStyle: 'italic' }}>
            Every Player. Every Practice. Every Performance.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          borderRadius: 16,
        }}>
          {/* Mode Switcher */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 4,
            marginBottom: 20,
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: 8,
                background: mode === 'login' ? '#fff' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#64748b',
                fontWeight: mode === 'login' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px 12px',
                border: 'none',
                borderRadius: 8,
                background: mode === 'register' ? '#fff' : 'transparent',
                color: mode === 'register' ? '#0f172a' : '#64748b',
                fontWeight: mode === 'register' ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Create Account
            </button>
          </div>

          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
            {mode === 'login' ? 'Sign In to Your Dashboard' : 'Register New Account'}
          </h2>

          {error && <div className="alert-error">⚠️ {error}</div>}
          {success && <div className="alert-success"><span>✅ {success}</span></div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                    {[
                      { r: 'scout' as UserRole, label: '🔍 Scout', desc: 'View ready players' },
                      { r: 'coach' as UserRole, label: '🧑‍🏫 Coach', desc: 'Manage academy' },
                      { r: 'player' as UserRole, label: '🏃 Player', desc: 'Track my records' },
                    ].map(({ r, label }) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          padding: '8px 6px',
                          border: `1.5px solid ${role === r ? '#10b981' : '#e2e8f0'}`,
                          borderRadius: 8,
                          background: role === r ? '#ecfdf5' : '#fff',
                          color: role === r ? '#065f46' : '#475569',
                          fontWeight: role === r ? 700 : 500,
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'player' && (
                  <div className="form-group">
                    <label className="form-label">Player ID (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={playerId}
                      onChange={e => setPlayerId(e.target.value)}
                      placeholder="e.g. PLY-101 (or auto-assigned)"
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@academydesk.in"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 15 }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating Account...')
                : (mode === 'login' ? 'Sign In →' : 'Complete Registration →')}
            </button>
          </form>

          {/* 1-Click Demo Login Presets */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              ⚡ 1-Click Instant Demo Logins
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('coach@academydesk.in', 'Coach@1234')}
                style={{
                  padding: '9px 8px',
                  background: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#166534',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div>🧑‍🏫 Coach</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#15803d', opacity: 0.85, marginTop: 2 }}>Head Coach</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('scout@academydesk.in', 'Scout@1234')}
                style={{
                  padding: '9px 8px',
                  background: '#eef2ff',
                  border: '1.5px solid #c7d2fe',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#4338ca',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div>🔍 Scout</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#4f46e5', opacity: 0.85, marginTop: 2 }}>Talent Scout</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('player@academydesk.in', 'Player@1234')}
                style={{
                  padding: '9px 8px',
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#92400e',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div>🏃 Player</div>
                <div style={{ fontSize: 10, fontWeight: 500, color: '#b45309', opacity: 0.85, marginTop: 2 }}>Rohit (Ready)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
