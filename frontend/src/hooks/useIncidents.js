// frontend/src/hooks/useIncidents.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useIncidents = () => {
  const [incidents,  setIncidents]  = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filters,    setFilters]    = useState({
    status: '', severity: '', search: '', page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.append('status',   filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search)   params.append('search',   filters.search);
      params.append('page',  filters.page);
      params.append('limit', 10);

      const res = await api.get(`/incidents?${params.toString()}`);
      setIncidents(res.data.data);
      setPagination({ total: res.data.total, pages: res.data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/incidents/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Stats error:', err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchIncidents();
    })();
  }, [fetchIncidents]);

  useEffect(() => {
    (async () => {
      await fetchStats();
    })();
  }, [fetchStats]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const createIncident = async (data) => {
    const res = await api.post('/incidents', data);
    fetchIncidents();
    fetchStats();
    return res.data.data;
  };

  const updateIncident = async (id, data) => {
    const res = await api.patch(`/incidents/${id}`, data);
    fetchIncidents();
    fetchStats();
    return res.data.data;
  };

  const addNote = async (id, note) => {
    const res = await api.post(`/incidents/${id}/timeline`, { note });
    return res.data;
  };

  const deleteIncident = async (id) => {
    await api.delete(`/incidents/${id}`);
    fetchIncidents();
    fetchStats();
  };

  return {
    incidents,
    stats,
    loading,
    error,
    filters,
    pagination,
    updateFilter,
    createIncident,
    updateIncident,
    addNote,
    deleteIncident,
    refetch: fetchIncidents,
  };
};

export default useIncidents;