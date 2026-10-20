import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Share2, Copy, Check, User, Phone, Mail, Calendar, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { member, logout, isAdmin } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const referralLink = `${window.location.origin}/register?ref=${member.referralCode}`;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-rose-400 to-rose-300 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-2xl font-bold text-stone-900">
                {member.name}
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500">Member since {new Date(member.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Points Display */}
        <div className="w-full sm:w-auto bg-rose-50 border border-rose-200/60 p-4 rounded-2xl flex items-center justify-between sm:justify-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider font-semibold text-rose-600">
              Reward Points
            </span>
            <span className="font-serif-display text-2xl font-bold text-rose-950">
              {member.pointsBalance} <span className="text-sm font-sans font-normal text-rose-700">pts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-display text-lg font-bold text-stone-900">
              Your Referral Link
            </h2>
            <p className="text-xs text-stone-500">
              Invite friends with your unique code and both get rewards on their first bakery order!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
          <div className="flex-1 px-4 py-3 bg-stone-100 rounded-xl font-mono text-xs text-stone-700 truncate select-all border border-stone-200">
            {referralLink}
          </div>
          <button
            onClick={copyReferral}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-2">
          <span>Referral Code:</span>
          <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
            {member.referralCode}
          </span>
        </div>
      </div>

      {/* Member Details */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
        <h2 className="font-serif-display text-lg font-bold text-stone-900 mb-2">
          Account Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl">
            <Phone className="w-4 h-4 text-stone-400" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-stone-400">Phone</span>
              <span className="font-medium text-stone-800">{member.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl">
            <Mail className="w-4 h-4 text-stone-400" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-stone-400">Email</span>
              <span className="font-medium text-stone-800">{member.email || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl">
            <Calendar className="w-4 h-4 text-stone-400" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-stone-400">Birthday</span>
              <span className="font-medium text-stone-800">
                {member.birthday ? new Date(member.birthday).toLocaleDateString() : 'Not provided'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl">
            <User className="w-4 h-4 text-stone-400" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-stone-400">Status</span>
              <span className="capitalize font-medium text-emerald-600 font-semibold">{member.status}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100">
          {isAdmin && (
            <Link
              to="/admin/settings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl border border-purple-200 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Go to Admin Settings
            </Link>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors ml-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
