import { useEffect } from 'react';

export function Toast({ message, show, onClose, state = 'success' }: { message: string; show: boolean; onClose: () => void; state?: 'success' | 'error' | 'info' }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  // Verde per success, rosso per error, blu/grigio per info
  let bg = 'rgba(34,197,94,0.95)'; // success
  let border = '2px solid #22c55e';
  let color = '#fff';
  if (state === 'error') {
    bg = 'rgba(239,68,68,0.95)';
    border = '2px solid #ef4444';
  } else if (state === 'info') {
    bg = 'rgba(59,130,246,0.95)'; // blu
    border = '2px solid #3b82f6';
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        background: bg,
        color,
        padding: '1rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontWeight: 500,
        fontSize: '1rem',
        border,
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
