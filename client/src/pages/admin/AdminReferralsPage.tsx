import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Share2,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { AdminReferralRecord, AdminReferralStats } from '../../types';

export const AdminReferralsPage: React.FC = () => {
  const [records, setRecords] = useState<AdminReferralRecord[]>([]);
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        api.get('/admin/referrals', {
          params: {
            page,
            limit: 15,
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          },
        }),
        api.get('/admin/referrals/stats'),
      ]);

      if (listRes.data?.success) {
        setRecords(listRes.data.data.records);
        setTotalPages(listRes.data.data.totalPages);
        setTotalCount(listRes.data.data.total);
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin referrals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-rose-400" />
            <span>Referral Program & Records</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Track customer referral relationships, audit reward distributions, and recognize top brand advocates.
          </p>
        </div>

        <button
          onClick={fetchReferrals}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Total Referrals</span>
            <Users className="w-4 h-4 text-stone-500" />
          </div>
          <span className="font-serif-display text-3xl font-bold text-stone-100 block">
            {stats?.overview.totalReferrals ?? 0}
          </span>
          <span className="text-[11px] text-stone-500">Attributed relationships</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">Rewards Granted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-serif-display text-3xl font-bold text-emerald-400 block">
            {stats?.overview.grantedRewards ?? 0}
          </span>
          <span className="text-[11px] text-stone-500">Completed milestone rewards</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Pending Rewards</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-serif-display text-3xl font-bold text-amber-400 block">
            {stats?.overview.pendingRewards ?? 0}
          </span>
          <span className="text-[11px] text-stone-500">Awaiting referee first order</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-medium">Top Ambassador</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-serif-display text-xl font-bold text-stone-100 truncate block mt-1">
            {stats?.topReferrers?.[0]?.name || '—'}
          </span>
          <span className="text-[11px] text-stone-400">
            {stats?.topReferrers?.[0]
              ? `${stats.topReferrers[0].totalReferrals} invites (${stats.topReferrers[0].grantedReferrals} rewarded)`
              : 'No referrals yet'}
          </span>
        </div>
      </div>

      {/* Top Referrers Leaderboard Widget */}
      {stats?.topReferrers && stats.topReferrers.length > 0 && (
        <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-sm font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-400" />
              <span>Top Brand Ambassadors</span>
            </h3>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider">
              Leaderboard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.topReferrers.slice(0, 4).map((top, idx) => (
              <div
                key={top.memberId}
                className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : idx === 1
                        ? 'bg-stone-300/20 text-stone-300 border border-stone-400/40'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-stone-200 block truncate max-w-[110px]">
                      {top.name}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500">
                      Code: {top.referralCode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-rose-400 font-mono text-sm block">
                    {top.totalReferrals}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {top.grantedReferrals} rewarded
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by referrer or referee name, phone, or code..."
              className="w-full pl-9 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          {['all', 'granted', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-stone-400 hover:bg-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Referral Records Table */}
      <div className="bg-stone-950/80 rounded-2xl border border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900/80 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Referrer (Inviter)</th>
                <th className="py-3 px-4 font-semibold">Referee (Invited Friend)</th>
                <th className="py-3 px-4 font-semibold">Trigger Rule</th>
                <th className="py-3 px-4 font-semibold">Reward Status</th>
                <th className="py-3 px-4 font-semibold">Reward Details</th>
                <th className="py-3 px-4 font-semibold">Granted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-500">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full" />
                    <p className="mt-2 text-xs">Loading referral records...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-500">
                    No referral relationships found matching query.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-900/50 transition-colors">
                    {/* Referrer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-100">
                        {r.referrer?.name || 'Unknown'}
                      </div>
                      <div className="font-mono text-[10px] text-stone-400">
                        {r.referrer?.phone}
                      </div>
                      <span className="font-mono text-[10px] text-rose-400">
                        Code: {r.referrer?.referralCode}
                      </span>
                    </td>

                    {/* Referee */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-200">
                        {r.referee?.name || 'Customer'}
                      </div>
                      <div className="font-mono text-[10px] text-stone-400">
                        {r.referee?.phone}
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        Joined {new Date(r.referee?.createdAt || r.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Trigger */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-stone-300 font-medium">
                        {r.trigger === 'registration'
                          ? 'On Registration'
                          : "Referee's 1st Order"}
                      </span>
                      {r.order && (
                        <span className="block text-[10px] font-mono text-stone-500">
                          Order #{r.order.orderNumber}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {r.rewardStatus === 'granted' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Reward Issued</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Trigger</span>
                        </span>
                      )}
                    </td>

                    {/* Reward Details */}
                    <td className="py-3.5 px-4">
                      {r.rewardStatus === 'granted' ? (
                        <div className="space-y-0.5 text-[11px]">
                          {r.rewardDetails?.referrerPoints && (
                            <span className="text-rose-400 block font-semibold">
                              Referrer: +{r.rewardDetails.referrerPoints} pts
                            </span>
                          )}
                          {r.rewardDetails?.refereePoints && (
                            <span className="text-emerald-400 block">
                              Referee: +{r.rewardDetails.refereePoints} pts
                            </span>
                          )}
                          {r.rewardDetails?.referrerVoucherCode && (
                            <span className="text-amber-300 block font-mono text-[10px]">
                              Voucher: {r.rewardDetails.referrerVoucherCode}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-500">
                          Configured: {r.rewardValue || 50} pts
                        </span>
                      )}
                    </td>

                    {/* Granted Date */}
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {r.grantedAt ? (
                        <>
                          <span className="block text-stone-200">
                            {new Date(r.grantedAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {new Date(r.grantedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>
            Showing {records.length} of {totalCount} total referral records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
