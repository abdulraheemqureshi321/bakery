import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    email: '',
    birthday: '',
    referralCode: '',
  });
  const [hasReferralParam, setHasReferralParam] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get('ref') || localStorage.getItem('soultalk_referral_code');
    if (refCode) {
      const clean = refCode.trim().toUpperCase();
      setFormData((prev) => ({ ...prev, referralCode: clean }));
      setHasReferralParam(true);
      // Persist in localStorage so it survives page reloads
      localStorage.setItem('soultalk_referral_code', clean);
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        birthday: formData.birthday || undefined,
        referralCode: formData.referralCode.trim() || undefined,
      });
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join & Earn Perks</span>
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-900 tracking-tight">
            Create Your Member Account
          </h1>
          <p className="text-sm text-stone-600">
            Earn points on every bakery order, receive birthday surprises, and unlock exclusive rewards.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alice Tan"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="012-345 6789"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Password (min 6 characters) *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alice@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Birthday <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Referral Code <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                {formData.referralCode && (
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Invite Perks Applied ✨
                  </span>
                )}
              </div>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="e.g. REF12345"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm uppercase placeholder:normal-case focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-mono"
              />
              {hasReferralParam && (
                <p className="text-[11px] text-emerald-600 mt-1">
                  🎁 Referral code pre-filled from your friend's invitation link!
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
