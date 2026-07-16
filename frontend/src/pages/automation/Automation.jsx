// frontend/src/pages/automation/Automation.jsx
import { useState }  from 'react';
import useWebhooks   from '../../hooks/useWebhooks';
import Spinner       from '../../components/ui/Spinner';

const EVENT_OPTIONS = [
  { value: 'incident.created',  label: 'Incident Created',  icon: '📋', color: 'text-indigo-400' },
  { value: 'incident.updated',  label: 'Incident Updated',  icon: '✏️', color: 'text-yellow-400' },
  { value: 'incident.resolved', label: 'Incident Resolved', icon: '✅', color: 'text-green-400'  },
  { value: 'alert.critical',    label: 'Critical Alert',    icon: '🔴', color: 'text-red-400'    },
  { value: 'alert.high',        label: 'High Alert',        icon: '🟠', color: 'text-orange-400' },
  { value: 'anomaly.detected',  label: 'Anomaly Detected',  icon: '🧠', color: 'text-purple-400' },
];

const CHANNELS = [
  {
    name:     'Slack',
    icon:     '💬',
    status:   'connected',
    workflows: ['Incident Created', 'Critical Alert'],
    color:    'green',
  },
  {
    name:     'Telegram',
    icon:     '✈️',
    status:   'connected',
    workflows: ['Incident Created', 'Critical Alert'],
    color:    'green',
  },
  {
    name:     'Email',
    icon:     '📧',
    status:   'connected',
    workflows: ['Incident Resolved', 'Daily Digest'],
    color:    'green',
  },
];

export default function Automation() {
  const {
    log, loading, firing, testResult,
    successCount, failCount,
    fireTest, refresh,
  } = useWebhooks();

  const [selectedEvent, setSelectedEvent] = useState('incident.created');

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Automation</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            n8n workflows · webhook delivery log
          </p>
        </div>
        
        <a
          href="http://localhost:5678"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Open n8n →
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="xl:col-span-1 flex flex-col gap-4">

          {/* Delivery stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0e1a] border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-slate-500 text-xs mb-1">Delivered</p>
              <p className="text-2xl font-bold text-green-400">{successCount}</p>
            </div>
            <div className="bg-[#0a0e1a] border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-slate-500 text-xs mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{failCount}</p>
            </div>
          </div>

          {/* Channel status */}
          <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Channels</h2>
            <div className="flex flex-col gap-3">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.name}
                  className="flex items-start gap-3 p-3 bg-[#0f1629] rounded-xl"
                >
                  <span className="text-xl">{ch.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">{ch.name}</p>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <p className="text-slate-600 text-xs mt-1">
                      {ch.workflows.join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook tester */}
          <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-2">Webhook Tester</h2>
            <p className="text-slate-500 text-xs mb-4">
              Fire a test webhook to verify n8n workflows are working
            </p>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-[#0f1629] text-white border border-indigo-900/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 mb-3"
            >
              {EVENT_OPTIONS.map((ev) => (
                <option key={ev.value} value={ev.value}>
                  {ev.icon} {ev.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => fireTest(selectedEvent)}
              disabled={firing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {firing ? 'Firing...' : 'Fire Test Webhook'}
            </button>

            {testResult && (
              <div
                className={`mt-3 px-3 py-2 rounded-lg text-xs ${
                  testResult.success
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                {testResult.success ? '✓' : '✗'} {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Right column — delivery log */}
        <div className="xl:col-span-2">
          <div className="bg-[#0a0e1a] border border-indigo-900/40 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">
                Webhook Delivery Log
              </h2>
              <button
                onClick={refresh}
                className="text-slate-500 hover:text-white text-sm transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : log.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <p className="text-slate-500 text-sm">No webhooks fired yet</p>
                <p className="text-slate-600 text-xs">
                  Create an incident or fire a test webhook above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-900/40">
                      <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Event</th>
                      <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Status</th>
                      <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Destination</th>
                      <th className="px-3 py-2 text-left text-slate-400 text-xs font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-indigo-900/20 hover:bg-indigo-900/10"
                      >
                        <td className="px-3 py-2">
                          <span className="text-slate-300 text-xs font-mono">
                            {entry.event}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {entry.success ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {entry.statusCode}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-slate-500 text-xs truncate max-w-xs block">
                            {entry.url?.replace('http://n8n:5678', 'n8n')}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}