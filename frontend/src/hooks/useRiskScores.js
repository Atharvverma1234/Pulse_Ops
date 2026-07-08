// frontend/src/hooks/useRiskScores.js
import { useState, useEffect, useCallback } from 'react';
import { io }  from 'socket.io-client';
import api     from '../utils/api';

const useRiskScores = () => {
  // riskMap shape: { "server-01": { score, isAnomaly, severity }, ... }
  const [riskMap,     setRiskMap]     = useState({});
  const [riskSummary, setRiskSummary] = useState([]);
  const [aiStatus,    setAiStatus]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  const fetchRiskSummary = useCallback(async () => {
    try {
      const res = await api.get('/ai/risk-summary');
      setRiskSummary(res.data.data);

      // Build riskMap from summary
      const map = {};
      res.data.data.forEach((h) => {
        map[h._id] = {
          score:      h.latestScore,
          isAnomaly:  h.latestIsAnomaly,
          riskLevel:  h.riskLevel,
          avgScore:   h.avgAnomalyScore,
          maxScore:   h.maxAnomalyScore,
          anomalyRate: h.anomalyRate,
          anomalyCount: h.anomalyCount,
        };
      });
      setRiskMap(map);
    } catch (err) {
      console.error('Risk summary error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIStatus = useCallback(async () => {
    try {
      const res = await api.get('/ai/status');
      setAiStatus(res.data);
    } catch (err) {
      console.error('AI status error:', err.message);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchRiskSummary();
      await fetchAIStatus();
    };

    init();
  }, [fetchRiskSummary, fetchAIStatus]);

  // Live updates from Socket.IO
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('ai:scores', (enrichedMetrics) => {
      setRiskMap((prev) => {
        const updated = { ...prev };
        enrichedMetrics.forEach((m) => {
          if (m.anomalyScore !== null && m.anomalyScore !== undefined) {
            updated[m.host] = {
              score:      m.anomalyScore,
              isAnomaly:  m.isAnomaly,
              riskLevel:  m.aiSeverity,
              avgScore:   m.anomalyScore,
              maxScore:   Math.max(
                m.anomalyScore,
                prev[m.host]?.maxScore || 0
              ),
              anomalyCount: m.isAnomaly
                ? (prev[m.host]?.anomalyCount || 0) + 1
                : prev[m.host]?.anomalyCount || 0,
            };
          }
        });
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  const getRisk = (host) => riskMap[host] || null;

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-500';
    if (score >= 0.85) return 'text-red-400';
    if (score >= 0.65) return 'text-orange-400';
    if (score >= 0.45) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreBg = (score) => {
    if (score === null || score === undefined) return 'bg-slate-500/10';
    if (score >= 0.85) return 'bg-red-500/10';
    if (score >= 0.65) return 'bg-orange-500/10';
    if (score >= 0.45) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  return {
    riskMap,
    riskSummary,
    aiStatus,
    loading,
    getRisk,
    getScoreColor,
    getScoreBg,
    refresh: fetchRiskSummary,
  };
};

export default useRiskScores;