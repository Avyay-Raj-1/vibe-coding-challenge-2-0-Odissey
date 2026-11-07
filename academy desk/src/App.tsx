import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { ensureDefaultCoach } from './lib/auth';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/coach/DashboardPage';
import PlayersPage from './pages/coach/PlayersPage';
import AttendancePage from './pages/coach/AttendancePage';
import MatchesPage from './pages/coach/MatchesPage';
import ReadyPlayersPage from './pages/coach/ReadyPlayersPage';
import ReportsPage from './pages/coach/ReportsPage';
import SettingsPage from './pages/coach/SettingsPage';
import ScoutDashboard from './pages/scout/ScoutDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import type { CoachPage } from './types';

export default function App() {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [coachPage, setCoachPage] = useState<CoachPage>('dashboard');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    ensureDefaultCoach().finally(() => setInitialized(true));
  }, []);

  if (loading || !initialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
          <div style={{ color: '#10b981', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>academy desk</div>
          <LoadingSpinner size={28} />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPage onSignIn={signIn} />;
  }

  if (profile.role === 'scout') return <ScoutDashboard profile={profile} onSignOut={signOut} />;
  if (profile.role === 'player') return <PlayerDashboard profile={profile} onSignOut={signOut} />;

  const renderPage = () => {
    switch (coachPage) {
      case 'dashboard':  return <DashboardPage />;
      case 'players':    return <PlayersPage />;
      case 'attendance': return <AttendancePage />;
      case 'matches':    return <MatchesPage />;
      case 'ready':      return <ReadyPlayersPage />;
      case 'reports':    return <ReportsPage />;
      case 'settings':   return <SettingsPage profile={profile} onSignOut={signOut} />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <Layout profile={profile} onSignOut={signOut} activePage={coachPage} onNavigate={setCoachPage}>
      {renderPage()}
    </Layout>
  );
}
