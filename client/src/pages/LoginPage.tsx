import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Smartphone, AlertCircle, ArrowRight, User } from 'lucide-react';

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
          'Failed to sign in. Please check your phone/email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo & Brand Greeting */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/brand/soultalk-logo.png"
              alt="SoulTalk Pastry Logo"
              className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-xs"
            />
          </Link>
          <div className="space-y-1">
            <span className="font-script text-2xl text-[var(--color-secondary-dark)] font-semibold block">
              心聊甜香 • SoulTalk Club
            </span>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
              Welcome Back
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Sign in to manage your reward points, vouchers, and cake orders.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="soultalk-card p-6 sm:p-8 rounded-[var(--radius-large)] shadow-[var(--shadow-card)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[var(--color-blush)]/60 border border-[var(--color-secondary)] text-[var(--color-error)] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
                Phone Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="012-345 6789 or you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Password
                </label>
                <Link
                  to="/otp-login"
                  className="text-xs text-[var(--color-primary-dark)] hover:underline font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs !min-h-[46px] shadow-sm"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </form>

          {/* Quick OTP or Claim Account */}
          <div className="pt-2 border-t border-[var(--color-border)] text-center">
            <Link
              to="/otp-login"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-bold transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Sign in with SMS One-Time PIN instead</span>
            </Link>
          </div>
        </div>

        {/* Register Prompt */}
        <div className="text-center text-xs text-[var(--color-text-muted)]">
          Don't have a SoulTalk account yet?{' '}
          <Link to="/register" className="text-[var(--color-primary-dark)] font-extrabold hover:underline">
            Register for Free Points
          </Link>
        </div>
      </div>
    </div>
  );
};
