import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, ArrowRight, Smartphone, Mail, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  // Toggle between Phone and Email as primary contact
  const [primaryContactMode, setPrimaryContactMode] = useState<'phone' | 'email'>('phone');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    birthday: '',
    referralCode: '',
    verificationCode: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get('ref') || localStorage.getItem('soultalk_referral_code');
    if (refCode) {
      const clean = refCode.trim().toUpperCase();
      setFormData((prev) => ({ ...prev, referralCode: clean }));
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
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <img
              src="/brand/soultalk-logo.png"
              alt="SoulTalk Pastry Logo"
              className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-xs"
            />
          </Link>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-[var(--color-primary-dark)] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>50 Welcome Points on Sign-Up</span>
            </div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
              Join SoulTalk Club
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
              Create your account to unlock member discounts, earn rewards on cakes, and receive celebratory surprises.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="soultalk-card p-6 sm:p-8 rounded-[var(--radius-large)] shadow-[var(--shadow-card)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[var(--color-blush)]/60 border border-[var(--color-secondary)] text-[var(--color-error)] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Phone / Email Toggle */}
          <div className="flex rounded-full bg-[var(--color-surface-soft)] p-1 border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPrimaryContactMode('phone')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                primaryContactMode === 'phone'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Registration</span>
            </button>
            <button
              type="button"
              onClick={() => setPrimaryContactMode('email')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                primaryContactMode === 'email'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Registration</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sarah Tan"
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="012-345 6789"
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                Email Address {primaryContactMode === 'email' ? '*' : '(Optional)'}
              </label>
              <input
                type="email"
                name="email"
                required={primaryContactMode === 'email'}
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Birthday */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                  Birthday (for birthday reward)
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                  Referral Code (Optional)
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="e.g. ST-7890"
                  className="w-full px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-mono font-bold text-[var(--color-text)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Verification Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                Verification Code (If provided)
              </label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="SMS / Email 6-digit code"
                className="w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs !min-h-[46px] shadow-sm mt-2"
            >
              {loading ? (
                <span>Creating Member Profile...</span>
              ) : (
                <>
                  <span>Create Account & Claim 50 Pts</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Member */}
        <div className="text-center text-xs text-[var(--color-text-muted)]">
          Already a SoulTalk member?{' '}
          <Link to="/login" className="text-[var(--color-primary-dark)] font-extrabold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
