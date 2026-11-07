interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, accent = '#10b981', sub }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minWidth: 0,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: accent + '1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

