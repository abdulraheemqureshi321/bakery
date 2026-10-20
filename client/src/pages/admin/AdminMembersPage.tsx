import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Save,
  Phone,
  Mail,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface MemberItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  role: 'member' | 'admin';
  referralCode: string;
  pointsBalance: number;
  createdAt: string;
}

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Manual Add Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    pointsBalance: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Adjust Points Modal
  const [adjustingMember, setAdjustingMember] = useState<MemberItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // Notification message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/members', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page,
          limit: 15,
        },
      });

      if (res.data?.success) {
        setMembers(res.data.data.members);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalCount(res.data.data.pagination.total);
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      phone: '',
      email: '',
      birthday: '',
      status: 'active',
    });
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      const res = await api.post('/admin/members', addForm);
      if (res.data?.success) {
        setIsAddModalOpen(false);
        setNotification({ type: 'success', message: 'Member created successfully!' });
        fetchMembers();
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEdit = (m: MemberItem) => {
    setEditingMember(m);
    setEditForm({
      name: m.name,
      phone: m.phone,
      email: m.email || '',
      birthday: m.birthday ? new Date(m.birthday).toISOString().split('T')[0] : '',
      status: m.status || 'active',
      pointsBalance: m.pointsBalance || 0,
    });
    setEditError('');
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError('');
    setEditLoading(true);

    try {
      const res = await api.put(`/admin/members/${editingMember._id}`, editForm);
      if (res.data?.success) {
        setEditingMember(null);
        setNotification({ type: 'success', message: 'Member updated successfully!' });
        fetchMembers();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update member');
    } finally {
      setEditLoading(false);
    }
  };

  const handleQuickStatusToggle = async (m: MemberItem, targetStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      const res = await api.put(`/admin/members/${m._id}`, { status: targetStatus });
      if (res.data?.success) {
        setNotification({
          type: 'success',
          message: `Member status updated to ${targetStatus}`,
        });
        fetchMembers();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update status',
      });
    }
  };

  const handleOpenAdjust = (m: MemberItem) => {
    setAdjustingMember(m);
    setAdjustAmount(50);
    setAdjustReason('');
    setAdjustError('');
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMember) return;
    if (!adjustAmount || adjustAmount === 0) {
      setAdjustError('Adjustment amount cannot be zero.');
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError('A mandatory reason is required for points adjustments.');
      return;
    }

    setAdjustError('');
    setAdjustLoading(true);

    try {
      const res = await api.post('/admin/points/adjust', {
        memberId: adjustingMember._id,
        amount: Number(adjustAmount),
        reason: adjustReason.trim(),
      });

      if (res.data?.success) {
        setAdjustingMember(null);
        setNotification({
          type: 'success',
          message: `Successfully adjusted ${adjustAmount > 0 ? '+' : ''}${adjustAmount} points for ${adjustingMember.name}! New balance: ${res.data.data.newBalance}`,
        });
        fetchMembers();
      }
    } catch (err: any) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust points');
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-rose-400" />
            <span>Member Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Browse registered members, modify account details, or perform bulk customer spreadsheet imports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/members/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Bulk Import</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-rose-400" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-800 text-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
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
              placeholder="Search by member name, phone, email, or referral code..."
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
          {['all', 'active', 'inactive', 'suspended'].map((st) => (
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

      {/* Member Table */}
      <div className="bg-stone-950/80 rounded-2xl border border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900/80 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Birthday</th>
                <th className="py-3 px-4 font-semibold">Points</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full" />
                    <p className="mt-2 text-xs">Loading members...</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500">
                    No members found matching your query.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-100">{m.name}</div>
                      <span className="font-mono text-[10px] text-stone-500">
                        Code: {m.referralCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">{m.phone}</td>
                    <td className="py-3.5 px-4 text-stone-400">{m.email || '—'}</td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {m.birthday ? new Date(m.birthday).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-rose-400">
                        {m.pointsBalance ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          m.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : m.status === 'suspended'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(m)}
                          title="Adjust Points (Ledger)"
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/40 text-stone-300 hover:text-rose-400 transition-colors"
                        >
                          <Award className="w-3.5 h-3.5 text-rose-400" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Member"
                          className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {m.status === 'active' ? (
                          <button
                            onClick={() => handleQuickStatusToggle(m, 'inactive')}
                            title="Deactivate Member"
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusToggle(m, 'active')}
                            title="Activate Member"
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-emerald-950/40 text-stone-400 hover:text-emerald-400 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
            Showing {members.length} of {totalCount} total members
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

      {/* MODAL 1: ADD MEMBER MANUALLY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display text-lg font-bold text-stone-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                <span>Add Member Manually</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="e.g. 0123456789 or +60123456789"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. member@example.com"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Birthday</label>
                <input
                  type="date"
                  value={addForm.birthday}
                  onChange={(e) => setAddForm({ ...addForm, birthday: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs disabled:opacity-60"
                >
                  {addLoading ? 'Creating...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT MEMBER DETAILS */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display text-lg font-bold text-stone-100 flex items-center gap-2">
                <Edit className="w-5 h-5 text-rose-400" />
                <span>Edit Member Details</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Birthday</label>
                <input
                  type="date"
                  value={editForm.birthday}
                  onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Points Balance</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.pointsBalance}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pointsBalance: parseInt(e.target.value || '0', 10) })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs disabled:opacity-60"
                >
                  {editLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADJUST MEMBER POINTS (LEDGER) */}
      {adjustingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display text-lg font-bold text-stone-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-400" />
                <span>Adjust Member Points</span>
              </h3>
              <button
                onClick={() => setAdjustingMember(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member info card */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-200">{adjustingMember.name}</span>
                <span className="font-mono text-stone-400">{adjustingMember.phone}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-400">Current Balance:</span>
                <span className="font-mono font-bold text-rose-400">
                  {adjustingMember.pointsBalance || 0} pts
                </span>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Adjustment Points Amount <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value || '0', 10))}
                    placeholder="e.g. 50 or -20"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                  <span className="text-stone-400">
                    Use positive numbers to add, negative numbers to deduct.
                  </span>
                  <span className="text-stone-300 font-mono">
                    New Balance:{' '}
                    <strong
                      className={
                        (adjustingMember.pointsBalance || 0) + Number(adjustAmount) < 0
                          ? 'text-rose-500'
                          : 'text-emerald-400'
                      }
                    >
                      {(adjustingMember.pointsBalance || 0) + Number(adjustAmount)}
                    </strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">
                  Mandatory Adjustment Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Goodwill gesture, VIP bonus, customer service compensation..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'Customer goodwill gesture',
                    'Order service compensation',
                    'VIP anniversary bonus',
                    'Manual correction',
                  ].map((quickReason) => (
                    <button
                      key={quickReason}
                      type="button"
                      onClick={() => setAdjustReason(quickReason)}
                      className="px-2 py-0.5 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] transition-colors"
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setAdjustingMember(null)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    adjustLoading ||
                    (adjustingMember.pointsBalance || 0) + Number(adjustAmount) < 0
                  }
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {adjustLoading ? 'Applying...' : 'Save & Record in Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
