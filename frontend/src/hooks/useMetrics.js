// frontend/src/hooks/useMetrics.js
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
const MAX_HISTORY = 20; // keep last 20 readings per host for charts

const useMetrics = () => {
  const [hostMetrics, setHostMetrics] = useState({});
  // hostMetrics shape: { "server-01": [metric1, metric2, ...], ... }

  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Initial snapshot when dashboard first loads
    socket.on('metrics:initial', (metrics) => {
      const grouped = {};
      metrics.forEach((m) => {
        grouped[m.host] = [m];
      });
      setHostMetrics(grouped);
      setLastUpdated(new Date());
    });

    // Live updates every 3 seconds from flush worker
    socket.on('metrics:update', (metrics) => {
      setHostMetrics((prev) => {
        const updated = { ...prev };
        metrics.forEach((m) => {
          const existing = updated[m.host] || [];
          updated[m.host] = [...existing, m].slice(-MAX_HISTORY);
        });
        return updated;
      });
      setLastUpdated(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Derive flat list of hosts from hostMetrics keys
  const hosts = Object.keys(hostMetrics);

  // Get latest reading for a host
  const getLatest = (host) => {
    const arr = hostMetrics[host];
    return arr ? arr[arr.length - 1] : null;
  };

  // Get chart history for a host
  const getHistory = (host) => hostMetrics[host] || [];

  return { hosts, getLatest, getHistory, connected, lastUpdated };
};

export default useMetrics;