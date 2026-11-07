interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, color = '#10b981', height = 8, showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = clamped >= 75 ? '#10b981' : clamped >= 50 ? '#f59e0b' : '#ef4444';
  const c = color === '#10b981' ? barColor : color;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{
        flex: 1,
        height,
        background: '#e2e8f0',
        borderRadius: height,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          background: c,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 600, color: c, minWidth: 36, textAlign: 'right' }}>
          {clamped.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

