import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SetPasswordPage: React.FC = () => {
  const { setPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await setPassword(password);
      navigate('/profile', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to set password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
            Set Your Password
          </h1>
          <p className="text-sm text-stone-600">
            Account verified! Choose a password so you can sign in directly anytime.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Password & Continue</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
