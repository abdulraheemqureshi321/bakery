import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

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
      navigate('/account', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to set password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/">
            <img
              src="/brand/soultalk-logo.png"
              alt="SoulTalk Pastry Logo"
              className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-xs"
            />
          </Link>
          <div className="space-y-1">
            <span className="font-script text-2xl text-[var(--color-secondary-dark)] font-semibold block">
              心聊甜香 • Security
            </span>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
              Set Your Account Password
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Choose a secure password to sign in directly without needing SMS PINs.
            </p>
          </div>
        </div>

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
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPasswordState(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs !min-h-[46px] shadow-sm"
            >
              {loading ? (
                <span>Setting Password...</span>
              ) : (
                <>
                  <span>Save Password & Enter Member Center</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
