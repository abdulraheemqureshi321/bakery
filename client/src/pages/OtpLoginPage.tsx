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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
            {step === 'phone' ? 'Verification Code Login' : 'Enter 6-Digit Code'}
          </h1>
          <p className="text-sm text-stone-600">
            {step === 'phone'
              ? 'Enter your registered phone number to receive a secure SMS code.'
              : `A 6-digit code has been sent to ${phone}.`}
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Registered Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="012-345 6789"
                  required
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
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-center tracking-widest text-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Verify Code & Sign In</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change number</span>
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend code</span>
                </button>
              </div>
            </form>
          )}

          {/* Dev Notice */}
          <div className="p-3 rounded-xl bg-stone-100 text-[11px] text-stone-600 leading-relaxed border border-stone-200">
            💡 <strong>Dev Mode:</strong> OTP codes are logged in the backend server terminal (SmsProvider dev implementation).
          </div>
        </div>

        <p className="text-center text-xs text-stone-600">
          Prefer password login?{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
            Sign in with password
          </Link>
        </p>
      </div>
    </div>
  );
};
