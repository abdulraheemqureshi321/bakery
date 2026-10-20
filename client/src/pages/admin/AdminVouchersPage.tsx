import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Ticket,
  Plus,
  Send,
  Edit,
  CheckCircle,
  Calendar,
  Users,
  Search,
  X,
  AlertCircle,
  Percent,
  DollarSign,
} from 'lucide-react';
import { Voucher } from '../../types';

interface MemberSummary {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
}

export const AdminVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Create / Edit modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'fixed' as 'fixed' | 'percentage',
    value: 10,
    minOrderAmount: 0,
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalUsageLimit: '',
    perMemberLimit: 1,
    isActive: true,
  });

  // Issue Voucher Modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedVoucherForIssue, setSelectedVoucherForIssue] = useState<Voucher | null>(null);
  const [issueTarget, setIssueTarget] = useState<'all' | 'specific'>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [membersList, setMembersList] = useState<MemberSummary[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueLoadingMembers, setIssueLoadingMembers] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/vouchers');
      if (res.data?.success) {
        setVouchers(res.data.data.vouchers || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'fixed',
      value: 10,
      minOrderAmount: 0,
      maxDiscount: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalUsageLimit: '',
      perMemberLimit: 1,
      isActive: true,
    });
    setError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description || '',
      type: v.type,
      value: v.value,
      minOrderAmount: v.minOrderAmount,
      maxDiscount: v.maxDiscount ? String(v.maxDiscount) : '',
      validFrom: v.validFrom ? new Date(v.validFrom).toISOString().split('T')[0] : '',
      validUntil: v.validUntil ? new Date(v.validUntil).toISOString().split('T')[0] : '',
      totalUsageLimit: v.totalUsageLimit ? String(v.totalUsageLimit) : '',
      perMemberLimit: v.perMemberLimit ?? 1,
      isActive: v.isActive,
    });
    setError('');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError('');

    const payload: any = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      value: Number(formData.value),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      perMemberLimit: Number(formData.perMemberLimit) || 1,
      isActive: formData.isActive,
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
    };

    if (formData.maxDiscount) {
      payload.maxDiscount = Number(formData.maxDiscount);
    }
    if (formData.totalUsageLimit) {
      payload.totalUsageLimit = Number(formData.totalUsageLimit);
    }

    try {
      if (editingVoucher) {
        const res = await api.put(`/admin/vouchers/${editingVoucher._id}`, payload);
        if (res.data?.success) {
          setSuccessMessage(`Voucher "${payload.code}" updated successfully!`);
        }
      } else {
        const res = await api.post('/admin/vouchers', payload);
        if (res.data?.success) {
          setSuccessMessage(`Voucher "${payload.code}" created successfully!`);
        }
      }

      setIsFormModalOpen(false);
      fetchVouchers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save voucher');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (v: Voucher) => {
    try {
      await api.put(`/admin/vouchers/${v._id}`, { isActive: !v.isActive });
      setSuccessMessage(`Voucher "${v.code}" ${!v.isActive ? 'activated' : 'deactivated'}`);
      fetchVouchers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update voucher status');
    }
  };

  const openIssueModal = async (v: Voucher) => {
    setSelectedVoucherForIssue(v);
    setIssueTarget('all');
    setSelectedMemberIds([]);
    setMemberSearch('');
    setError('');
    setIsIssueModalOpen(true);

    try {
      setIssueLoadingMembers(true);
      const res = await api.get('/admin/members', { params: { limit: 100 } });
      if (res.data?.success && res.data?.data?.members) {
        setMembersList(res.data.data.members);
      }
    } catch {
      // silent
    } finally {
      setIssueLoadingMembers(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucherForIssue) return;

    if (issueTarget === 'specific' && selectedMemberIds.length === 0) {
      setError('Please select at least one member to issue the voucher to.');
      return;
    }

    setIssueSubmitting(true);
    setError('');

    try {
      const res = await api.post('/admin/vouchers/issue', {
        voucherId: selectedVoucherForIssue._id,
        allMembers: issueTarget === 'all',
        memberIds: issueTarget === 'specific' ? selectedMemberIds : undefined,
      });

      if (res.data?.success) {
        setSuccessMessage(
          `Voucher issued successfully! ${res.data.data.issuedCount} member wallet(s) credited.`
        );
        setIsIssueModalOpen(false);
        fetchVouchers();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue voucher');
    } finally {
      setIssueSubmitting(false);
    }
  };

  const filteredMembers = membersList.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.includes(memberSearch) ||
      (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-rose-400" />
            <span>Voucher Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Create discount vouchers, configure spend rules, and issue them directly to member wallets.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Voucher</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-stone-950/80 rounded-2xl border border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900/80 text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Voucher / Code</th>
                <th className="py-3 px-4 font-semibold">Discount</th>
                <th className="py-3 px-4 font-semibold">Min Spend</th>
                <th className="py-3 px-4 font-semibold">Usage & Limits</th>
                <th className="py-3 px-4 font-semibold">Validity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full" />
                    <p className="mt-2 text-xs">Loading vouchers...</p>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500">
                    No vouchers found. Click "Create New Voucher" to get started.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const isExpired = v.validUntil && new Date(v.validUntil) < new Date();
                  return (
                    <tr key={v._id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/40 text-[11px]">
                            {v.code}
                          </span>
                        </div>
                        <div className="font-medium text-stone-200 mt-1">{v.name}</div>
                        {v.description && (
                          <div className="text-[11px] text-stone-400 truncate max-w-xs">
                            {v.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-100 flex items-center gap-1">
                          {v.type === 'percentage' ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-rose-400" />
                              <span>{v.value}% OFF</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                              <span>RM {v.value} OFF</span>
                            </>
                          )}
                        </span>
                        {v.maxDiscount && (
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            Capped at RM {v.maxDiscount}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {v.minOrderAmount > 0 ? (
                          <span className="text-stone-300">RM {v.minOrderAmount}</span>
                        ) : (
                          <span className="text-stone-400">No minimum</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-stone-300">
                          Used: <span className="font-semibold text-stone-100">{v.totalUsed || 0}</span>
                          {v.totalUsageLimit ? ` / ${v.totalUsageLimit}` : ' (Unlimited)'}
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {v.perMemberLimit || 1} per member
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-stone-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>
                            {v.validUntil
                              ? new Date(v.validUntil).toLocaleDateString()
                              : 'No expiry'}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[10px] font-semibold text-rose-400">Expired</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(v)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                            v.isActive && !isExpired
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {v.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openIssueModal(v)}
                            title="Issue to Members"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Issue</span>
                          </button>

                          <button
                            onClick={() => openEditModal(v)}
                            title="Edit Voucher"
                            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display text-lg font-bold text-stone-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-rose-400" />
                <span>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</span>
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Voucher Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. TASTE20"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono font-bold uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 20% Off Welcome Treat"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Terms & conditions or celebration note..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="fixed">Fixed RM Deduction</option>
                    <option value="percentage">Percentage (%) Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Discount Value ({formData.type === 'percentage' ? '%' : 'RM'}){' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    required
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Min Spend (RM)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Max Discount Cap (RM) <span className="text-stone-400">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Leave empty for uncapped"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Total Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Usage Limit Per Member
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perMemberLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, perMemberLimit: parseInt(e.target.value || '1', 10) })
                    }
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded-sm accent-rose-500"
                  />
                  <span className="text-stone-300">Voucher is Active and usable</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs disabled:opacity-60"
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingVoucher
                    ? 'Update Voucher'
                    : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE VOUCHER TO MEMBERS MODAL */}
      {isIssueModalOpen && selectedVoucherForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif-display text-lg font-bold text-stone-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-rose-400" />
                <span>Issue Voucher to Members</span>
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {selectedVoucherForIssue.code}
                </span>
                <span className="text-stone-400 block mt-0.5">{selectedVoucherForIssue.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-stone-200">
                  {selectedVoucherForIssue.type === 'percentage'
                    ? `${selectedVoucherForIssue.value}% OFF`
                    : `RM ${selectedVoucherForIssue.value} OFF`}
                </span>
                <span className="text-stone-400 block text-[10px]">
                  Min RM {selectedVoucherForIssue.minOrderAmount}
                </span>
              </div>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-stone-300 font-medium">Recipient Target</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIssueTarget('all')}
                    className={`p-3 rounded-2xl border text-left transition-colors ${
                      issueTarget === 'all'
                        ? 'bg-rose-500/20 border-rose-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-rose-400" />
                      <span>All Active Members</span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-1">
                      Issue 1 voucher each to all registered active members.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIssueTarget('specific')}
                    className={`p-3 rounded-2xl border text-left transition-colors ${
                      issueTarget === 'specific'
                        ? 'bg-rose-500/20 border-rose-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <Edit className="w-4 h-4 text-rose-400" />
                      <span>Specific Members</span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-1">
                      Choose individual customer accounts from list.
                    </span>
                  </button>
                </div>
              </div>

              {issueTarget === 'specific' && (
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search member by name, phone, or email..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-2xl bg-stone-950 border border-stone-800 divide-y divide-stone-900">
                    {issueLoadingMembers ? (
                      <div className="text-center py-4 text-stone-500">Loading members...</div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-4 text-stone-500">No members found.</div>
                    ) : (
                      filteredMembers.map((m) => {
                        const isSelected = selectedMemberIds.includes(m._id);
                        return (
                          <div
                            key={m._id}
                            onClick={() => {
                              setSelectedMemberIds((prev) =>
                                isSelected ? prev.filter((id) => id !== m._id) : [...prev, m._id]
                              );
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-rose-950/40 text-rose-200'
                                : 'hover:bg-stone-900 text-stone-300'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-stone-100">{m.name}</div>
                              <span className="font-mono text-[10px] text-stone-400">{m.phone}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-4 h-4 rounded-sm accent-rose-500 pointer-events-none"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Selected: <span className="text-rose-400 font-semibold">{selectedMemberIds.length}</span> member(s)
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{issueSubmitting ? 'Issuing...' : 'Confirm & Issue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
