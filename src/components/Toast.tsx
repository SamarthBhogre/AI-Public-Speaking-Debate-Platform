import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps { message: string; type?: 'success' | 'error'; onClose?: () => void; }

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;
  return (
    <div className="toast" role="status" style={type === 'error' ? { background: '#d63031' } : undefined} onClick={onClose}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      {message}
    </div>
  );
}
