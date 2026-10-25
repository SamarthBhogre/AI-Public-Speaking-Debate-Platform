import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState('');
  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2800);
  }, []);
  return { toast, notify };
}
