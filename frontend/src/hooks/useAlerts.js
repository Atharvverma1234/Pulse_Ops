// frontend/src/hooks/useAlerts.js
import { useState, useEffect, useCallback } from 'react';
import { io }  from 'socket.io-client';
import api     from '../utils/api';

const useAlerts = () => {
  const [alerts,     setAlerts]     = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({
    status: '', severity: '', host: '', page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.append('status',   filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.host)     params.append('host',     filters.host);
      params.append('page',  filters.page);
      params.append('limit', 15);

      const res = await api.get(`/alerts?${params.toString()}`);
      setAlerts(res.data.data);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch (err) {
      console.error('Alerts fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/alerts/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Alert stats error:', err.message);
    }
  }, []);

  useEffect(() => {
    // Defer calling fetchAlerts to avoid synchronous setState inside effect
    const t = setTimeout(() => { fetchAlerts(); }, 0);
    return () => clearTimeout(t);
  }, [fetchAlerts]);
  useEffect(() => {
    const t = setTimeout(() => { fetchStats(); }, 0);
    return () => clearTimeout(t);
  }, [fetchStats]);

  // Live updates via Socket.IO
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('alert:fired', () => {
      fetchAlerts();
      fetchStats();
    });

    socket.on('alert:acknowledged', () => fetchAlerts());
    socket.on('alert:resolved',     () => fetchAlerts());

    return () => socket.disconnect();
  }, [fetchAlerts]);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const acknowledge = async (id) => {
    await api.patch(`/alerts/${id}/acknowledge`);
    fetchAlerts();
    fetchStats();
  };

  const resolve = async (id) => {
    await api.patch(`/alerts/${id}/resolve`);
    fetchAlerts();
    fetchStats();
  };

  return {
    alerts,
    stats,
    loading,
    filters,
    pagination,
    updateFilter,
    acknowledge,
    resolve,
    refetch: fetchAlerts,
  };
};

export default useAlerts;