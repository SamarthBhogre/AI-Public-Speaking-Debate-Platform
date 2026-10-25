interface ScoreBarProps { label: string; value: number; color?: string; }

export function ScoreBar({ label, value, color = '#7066f5' }: ScoreBarProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#555' }}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div style={{ height: 8, background: '#f0eff4', borderRadius: 5 }}>
        <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 5, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}
