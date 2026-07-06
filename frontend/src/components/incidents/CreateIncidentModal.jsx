// frontend/src/components/incidents/CreateIncidentModal.jsx
import { useState } from 'react';

export default function CreateIncidentModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', severity: 'medium', host: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1629] border border-indigo-900 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Create Incident</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. CPU spike on server-01"
              className="w-full bg-[#1a2040] text-white border border-indigo-900/60 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What happened? What is the impact?"
              className="w-full bg-[#1a2040] text-white border border-indigo-900/60 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                Severity
              </label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full bg-[#1a2040] text-white border border-indigo-900/60 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Host</label>
              <input
                name="host"
                value={form.host}
                onChange={handleChange}
                placeholder="e.g. server-01"
                className="w-full bg-[#1a2040] text-white border border-indigo-900/60 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder-slate-600 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-indigo-900 text-slate-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}