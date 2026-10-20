import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { SettingItem } from '../../types';
import { Save, AlertCircle, CheckCircle2, Upload, Trash2, Image, RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings: refreshPublicSettings } = useSettings();
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data?.data?.settings) {
        setSettings(res.data.data.settings);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueChange = (key: string, newValue: any) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
    );
  };

  const saveSetting = async (key: string) => {
    setError('');
    setSuccessMessage('');
    setSavingKey(key);

    const setting = settings.find((s) => s.key === key);
    if (!setting) return;

    try {
      await api.put(`/admin/settings/${key}`, { value: setting.value });
      setSuccessMessage(`Updated "${setting.label}" successfully`);
      await refreshPublicSettings();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to save ${key}`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'soultalk_pastry/brand');

    try {
      const res = await api.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data?.url) {
        const newUrl = res.data.data.url;
        handleValueChange('brand_logo', newUrl);
        await api.put('/admin/settings/brand_logo', { value: newUrl });
        await refreshPublicSettings();
        setSuccessMessage('Brand logo uploaded and updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload brand logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const groups = ['all', ...Array.from(new Set(settings.map((s) => s.group)))];

  const filteredSettings =
    activeGroup === 'all'
      ? settings
      : settings.filter((s) => s.group === activeGroup);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-stone-700 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-100">
            System & Store Settings
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Dynamic settings governing points ratios, delivery rules, WhatsApp contact and brand aesthetics.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Settings</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Brand Visuals Quick Card */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Image className="w-4 h-4" />
          <span>Brand Visuals & Logo (Cloudinary Upload)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Logo preview and upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden shrink-0">
              {settings.find((s) => s.key === 'brand_logo')?.value ? (
                <img
                  src={settings.find((s) => s.key === 'brand_logo')?.value}
                  alt="Brand Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-stone-600 text-xs text-center p-2">No logo</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLogo ? 'Uploading to Cloudinary...' : 'Upload Logo via Cloudinary'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-stone-500">JPG, PNG, WebP up to 5MB.</p>
            </div>
          </div>

          {/* Primary Color Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.find((s) => s.key === 'brand_primary_color')?.value || '#D4708F'}
                onChange={(e) => handleValueChange('brand_primary_color', e.target.value)}
                className="w-12 h-10 rounded-xl bg-stone-900 border border-stone-700 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={settings.find((s) => s.key === 'brand_primary_color')?.value || ''}
                onChange={(e) => handleValueChange('brand_primary_color', e.target.value)}
                placeholder="#D4708F"
                className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-mono uppercase w-32"
              />
              <button
                onClick={() => saveSetting('brand_primary_color')}
                disabled={savingKey === 'brand_primary_color'}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-800/80">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              activeGroup === group
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSettings.map((setting) => (
          <div
            key={setting.key}
            className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm text-stone-200 block">
                  {setting.label}
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  {setting.key} • {setting.group}
                </span>
              </div>
              {setting.isPublic && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  Public
                </span>
              )}
            </div>

            {/* Input by type */}
            <div>
              {setting.type === 'boolean' ? (
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={!!setting.value}
                    onChange={(e) => handleValueChange(setting.key, e.target.checked)}
                    className="w-4 h-4 rounded-md accent-rose-500"
                  />
                  <span className="text-xs text-stone-300">
                    {setting.value ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : setting.type === 'number' ? (
                <input
                  type="number"
                  step="any"
                  value={setting.value ?? ''}
                  onChange={(e) =>
                    handleValueChange(setting.key, parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:ring-1 focus:ring-rose-400"
                />
              ) : setting.type === 'array' ? (
                <textarea
                  rows={2}
                  value={
                    Array.isArray(setting.value)
                      ? setting.value.join(', ')
                      : setting.value ?? ''
                  }
                  onChange={(e) =>
                    handleValueChange(
                      setting.key,
                      e.target.value.split(',').map((v) => v.trim())
                    )
                  }
                  placeholder="Comma-separated values"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:ring-1 focus:ring-rose-400"
                />
              ) : setting.type === 'json' ? (
                <textarea
                  rows={3}
                  value={
                    typeof setting.value === 'object'
                      ? JSON.stringify(setting.value, null, 2)
                      : setting.value ?? ''
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleValueChange(setting.key, parsed);
                    } catch {
                      // Allow raw typing
                      handleValueChange(setting.key, e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:ring-1 focus:ring-rose-400"
                />
              ) : (
                <input
                  type="text"
                  value={setting.value ?? ''}
                  onChange={(e) => handleValueChange(setting.key, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:ring-1 focus:ring-rose-400"
                />
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => saveSetting(setting.key)}
                disabled={savingKey === setting.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/40 transition-colors disabled:opacity-50"
              >
                {savingKey === setting.key ? (
                  <div className="w-3.5 h-3.5 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
