// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
      <div className="w-full max-w-md bg-[#0f1629] border border-indigo-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">PulseOps</h1>
        <p className="text-slate-400 mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full bg-[#1a2040] text-white border border-indigo-900 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-[#1a2040] text-white border border-indigo-900 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}