export default function LoadingSpinner({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid #e2e8f0`,
        borderTopColor: '#10b981',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

