import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Smartphone, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to log in. Please check your phone/email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
            Member Log In
          </h1>
          <p className="text-sm text-stone-600">
            Welcome back! Sign in to manage your rewards and orders.
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
                Phone Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="012-345 6789 or you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Password
                </label>
                <Link
                  to="/otp-login"
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Forgot or claim account?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick OTP Login Option */}
          <div className="pt-4 border-t border-stone-100 text-center space-y-3">
            <p className="text-xs text-stone-500">
              Imported member or prefer login via SMS code?
            </p>
            <Link
              to="/otp-login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium w-full justify-center transition-colors"
            >
              <Smartphone className="w-4 h-4 text-stone-500" />
              <span>Log in with Verification Code (OTP)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-stone-400" />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-stone-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-700">
            Join the Member Club
          </Link>
        </p>
      </div>
    </div>
  );
};
