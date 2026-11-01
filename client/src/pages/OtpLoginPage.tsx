import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smartphone, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const OtpLoginPage: React.FC = () => {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const msg = await requestOtp(phone.trim());
      setMessage(msg);
      setStep('verify');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send verification code. Ensure your phone number is registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { needsPassword } = await verifyOtp(phone.trim(), code.trim());
      if (needsPassword) {
        navigate('/set-password', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo and Header */}
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
              心聊甜香 • Quick Verification
            </span>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
              {step === 'phone' ? 'SMS Code Sign In' : 'Enter Verification Code'}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {step === 'phone'
                ? 'Enter your mobile number to receive a secure sign-in code.'
                : `A 6-digit code was sent to ${phone}.`}
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

          {message && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[var(--color-sage)] text-[var(--color-primary-dark)] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="012-345 6789"
                  required
                  className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-xs !min-h-[46px]"
              >
                {loading ? 'Sending Code...' : 'Send SMS Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
                  6-Digit SMS PIN
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-lg font-mono tracking-widest font-bold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-xs !min-h-[46px]"
              >
                {loading ? 'Verifying...' : 'Verify Code & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="btn-ghost w-full text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Mobile Number</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] text-center">
            <Link to="/login" className="text-xs text-[var(--color-primary-dark)] font-bold hover:underline">
              ← Return to Standard Password Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
