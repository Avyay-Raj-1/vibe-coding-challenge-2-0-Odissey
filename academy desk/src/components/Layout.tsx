import { useState } from 'react';
import type { Profile, CoachPage } from '../types';
import Sidebar from './Sidebar';

interface LayoutProps {
  profile: Profile;
  onSignOut: () => void;
  activePage: CoachPage;
  onNavigate: (page: CoachPage) => void;
  children: React.ReactNode;
}

const pageLabels: Record<CoachPage, string> = {
  dashboard: 'Overview',
  players: 'Player Management',
  attendance: 'Attendance',
  matches: 'Match Records',
  ready: 'Ready Players',
  reports: 'Reports & Analytics',
  settings: 'Settings',
};

export default function Layout({ profile, onSignOut, activePage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar activePage={activePage} onNavigate={onNavigate} profile={profile} onSignOut={onSignOut} />
      </div>

      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-mobile-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar panel */}
      <div className={`sidebar-mobile-panel${sidebarOpen ? ' open' : ''}`}>
        <Sidebar
          activePage={activePage}
          onNavigate={(p) => { onNavigate(p); setSidebarOpen(false); }}
          profile={profile}
          onSignOut={onSignOut}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="app-main">
        {/* Top bar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              ☰
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {pageLabels[activePage]}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#10b981', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {profile.name[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
