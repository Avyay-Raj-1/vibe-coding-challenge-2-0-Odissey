interface BadgeProps {
  value: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, { bg: string; color: string }> = {
  READY: { bg: '#d1fae5', color: '#065f46' },
  'NOT READY': { bg: '#fee2e2', color: '#991b1b' },
  PRESENT: { bg: '#d1fae5', color: '#065f46' },
  ABSENT: { bg: '#fee2e2', color: '#991b1b' },
  OPEN: { bg: '#dbeafe', color: '#1e40af' },
  CLOSED: { bg: '#f1f5f9', color: '#475569' },
  coach: { bg: '#fef3c7', color: '#92400e' },
  scout: { bg: '#ede9fe', color: '#5b21b6' },
  player: { bg: '#d1fae5', color: '#065f46' },
};

export default function Badge({ value, size = 'md' }: BadgeProps) {
  const style = colorMap[value] ?? { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: 20,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600,
      letterSpacing: 0.3,
      whiteSpace: 'nowrap' as const,
      display: 'inline-block',
    }}>
      {value}
    </span>
  );
}

