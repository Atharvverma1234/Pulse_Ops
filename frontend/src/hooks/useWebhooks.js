// frontend/src/hooks/useWebhooks.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useWebhooks = () => {
  const [log,      setLog]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [firing,   setFiring]   = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchLog = useCallback(async () => {
    try {
      const res = await api.get('/webhooks/log');
      setLog(res.data.data);
    } catch (err) {
      console.error('Webhook log error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadLog = async () => {
      await fetchLog();
    };

    void loadLog();
    // Auto-refresh log every 10 seconds
    const interval = setInterval(fetchLog, 10000);
    return () => clearInterval(interval);
  }, [fetchLog]);

  const fireTest = async (event) => {
    setFiring(true);
    setTestResult(null);
    try {
      const res = await api.post('/webhooks/test', { event });
      setTestResult({ success: true, message: res.data.message });
      fetchLog();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setFiring(false);
    }
  };

  const successCount = log.filter((e) => e.success).length;
  const failCount    = log.filter((e) => !e.success).length;

  return {
    log,
    loading,
    firing,
    testResult,
    successCount,
    failCount,
    fireTest,
    refresh: fetchLog,
  };
};

export default useWebhooks;