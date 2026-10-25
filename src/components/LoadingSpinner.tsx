export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9998a9' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e4e2eb', borderTopColor: '#7066f5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
      <p style={{ fontSize: 13, margin: 0 }}>{label}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
