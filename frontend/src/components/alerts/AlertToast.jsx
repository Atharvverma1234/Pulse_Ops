// frontend/src/components/alerts/AlertToast.jsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SEVERITY_STYLES = {
  critical: 'border-red-500    bg-red-500/10    text-red-300',
  high:     'border-orange-500 bg-orange-500/10 text-orange-300',
  medium:   'border-yellow-500 bg-yellow-500/10 text-yellow-300',
  low:      'border-green-500  bg-green-500/10  text-green-300',
};

const SEVERITY_EMOJI = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🟢',
};

export default function AlertToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('alert:fired', ({ alert }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, alert }]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    });

    return () => socket.disconnect();
  }, []);

  const dismiss = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-sm w-full">
      {toasts.map(({ id, alert }) => (
        <div
          key={id}
          className={`border rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm flex items-start gap-3 ${
            SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.medium
          }`}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {SEVERITY_EMOJI[alert.severity]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              {alert.severity?.toUpperCase()} Alert
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {alert.metricType?.toUpperCase()} on {alert.host} —{' '}
              {alert.triggeredValue?.toFixed(1)}%
            </p>
          </div>
          <button
            onClick={() => dismiss(id)}
            className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0 text-sm"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}