import { AlertCircle } from 'lucide-react';

interface ErrorStateProps { message: string; onRetry?: () => void; }

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 48, height: 48, background: '#fff0f0', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#e07272' }}>
        <AlertCircle size={22} />
      </div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 18 }}>{message}</p>
      {onRetry && <button className="secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}
