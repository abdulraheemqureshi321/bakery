import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  FileSpreadsheet,
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Users,
  HelpCircle,
  FileText,
  RotateCcw,
  Plus,
} from 'lucide-react';

interface ColumnMapping {
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
}

interface ParsedRow {
  rowNumber: number;
  name?: string;
  phone?: string;
  email?: string;
  birthday?: string;
  isValid: boolean;
  isDuplicateInFile?: boolean;
  isDuplicateInDb?: boolean;
  errors: string[];
}

interface ImportSummary {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
}

interface FailedRow {
  rowNumber: number;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  reason: string;
}

export const AdminMemberImportPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 2 Preview data
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: '',
    phone: '',
    email: '',
    birthday: '',
  });
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Strategy
  const [onDuplicate, setOnDuplicate] = useState<'skip' | 'update'>('skip');

  // Step 3 Result data
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);

  // Current Step: 1 = Upload, 2 = Preview & Mapping, 3 = Complete
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMsg('');
    }
  };

  const handleUploadAndPreview = async (mappingOverride?: ColumnMapping) => {
    if (!file) {
      setErrorMsg('Please select a spreadsheet file first.');
      return;
    }

    setLoadingPreview(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (mappingOverride) {
        formData.append('columnMapping', JSON.stringify(mappingOverride));
      }

      const res = await api.post('/admin/members/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setHeaders(data.headers || []);
        setColumnMapping(data.suggestedMapping || { name: '', phone: '', email: '', birthday: '' });
        setTotalRows(data.totalRows || 0);
        setValidCount(data.validCount || 0);
        setDuplicateCount(data.duplicateCount || 0);
        setErrorCount(data.errorCount || 0);
        setPreviewRows(data.rows || []);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to parse file. Please verify file format.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!file) return;

    setImporting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      formData.append('onDuplicate', onDuplicate);

      const res = await api.post('/admin/members/import/execute', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        setImportSummary(res.data.data.summary);
        setFailedRows(res.data.data.failedRows || []);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Import execution failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrorCsv = async () => {
    if (!failedRows.length) return;

    try {
      const res = await api.post(
        '/admin/members/import/download-errors',
        { failedRows },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `failed_member_import_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // client-side fallback
      const headers = ['Row Number', 'Name', 'Phone', 'Email', 'Birthday', 'Failure Reason'];
      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const rows = failedRows.map((r) => [
        escape(r.rowNumber),
        escape(r.name),
        escape(r.phone),
        escape(r.email),
        escape(r.birthday),
        escape(r.reason),
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `failed_member_import_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const handleReset = () => {
    setFile(null);
    setCurrentStep(1);
    setImportSummary(null);
    setFailedRows([]);
    setPreviewRows([]);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mb-1">
            <Link to="/admin/members" className="hover:underline">
              Members
            </Link>
            <span>/</span>
            <span>Bulk Import</span>
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-rose-400" />
            <span>Customer Excel & CSV Bulk Import</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Import existing bakery customers from .xlsx, .xls, or .csv spreadsheets with automatic column detection and validation preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/members"
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors"
          >
            Back to Member List
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs font-semibold">
        <div
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 ${
            currentStep === 1
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Upload File</span>
        </div>

        <div
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 ${
            currentStep === 2
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Mapping & Preview</span>
        </div>

        <div
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 ${
            currentStep === 3
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Summary & Report</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD FILE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-stone-950/80 border-2 border-dashed border-stone-800 hover:border-rose-500/50 rounded-3xl p-8 sm:p-12 text-center transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-md">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-stone-100">
                  {file ? file.name : 'Choose or drop your customer spreadsheet here'}
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                  Accepts Excel workbooks (<code className="text-rose-300">.xlsx</code>,{' '}
                  <code className="text-rose-300">.xls</code>) or comma-separated values (
                  <code className="text-rose-300">.csv</code>) up to 10MB.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>{file ? 'Replace Selected File' : 'Browse Files'}</span>
              </span>
            </label>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-stone-950/60 rounded-2xl border border-stone-800">
            <div className="text-xs text-stone-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-stone-500 shrink-0" />
              <span>
                Need test data? You can use the generated sample files in{' '}
                <code className="text-rose-300 font-mono">/samples/members_sample.xlsx</code> and{' '}
                <code className="text-rose-300 font-mono">/samples/members_sample.csv</code>.
              </span>
            </div>

            <button
              onClick={() => handleUploadAndPreview()}
              disabled={!file || loadingPreview}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>{loadingPreview ? 'Inspecting File...' : 'Inspect & Preview File'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Fallback note */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-400 flex items-center justify-between">
            <span>If your spreadsheet cannot be read or formatted, you can manually add members anytime.</span>
            <Link
              to="/admin/members"
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Add Fallback</span>
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING & VALIDATION PREVIEW */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
              <span className="block text-[11px] font-semibold text-stone-400 uppercase">Total Rows</span>
              <span className="font-mono text-2xl font-bold text-stone-100">{totalRows}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
              <span className="block text-[11px] font-semibold text-emerald-400 uppercase">Valid Rows</span>
              <span className="font-mono text-2xl font-bold text-emerald-300">{validCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60">
              <span className="block text-[11px] font-semibold text-amber-400 uppercase">Duplicates</span>
              <span className="font-mono text-2xl font-bold text-amber-300">{duplicateCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60">
              <span className="block text-[11px] font-semibold text-rose-400 uppercase">Errors</span>
              <span className="font-mono text-2xl font-bold text-rose-300">{errorCount}</span>
            </div>
          </div>

          {/* Interactive Column Mapping Box */}
          <div className="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-display text-sm font-bold text-stone-100">
                  Header & Column Mapping
                </h3>
                <p className="text-[11px] text-stone-400">
                  We automatically matched your spreadsheet headers. Adjust dropdowns if any field maps incorrectly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUploadAndPreview(columnMapping)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
              >
                Re-validate with new mapping
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Name Column <span className="text-rose-400">*</span>
                </label>
                <select
                  value={columnMapping.name}
                  onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Select Header --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Phone Column <span className="text-rose-400">*</span>
                </label>
                <select
                  value={columnMapping.phone}
                  onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Select Header --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Email Column</label>
                <select
                  value={columnMapping.email || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Optional / None --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Birthday Column</label>
                <select
                  value={columnMapping.birthday || ''}
                  onChange={(e) => setColumnMapping({ ...columnMapping, birthday: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Optional / None --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Duplicate Phone Strategy Selector */}
          <div className="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 space-y-3">
            <h3 className="font-serif-display text-sm font-bold text-stone-100">
              Duplicate Phone Handling Strategy
            </h3>
            <p className="text-[11px] text-stone-400">
              When a row contains a phone number that is already registered in the database:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  onDuplicate === 'skip'
                    ? 'bg-rose-500/10 border-rose-500/40 text-stone-100'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <input
                  type="radio"
                  name="duplicateStrategy"
                  checked={onDuplicate === 'skip'}
                  onChange={() => setOnDuplicate('skip')}
                  className="mt-0.5 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold block text-stone-200">Skip Existing Members (Recommended)</span>
                  <span className="text-[11px] text-stone-400">
                    Existing member profiles remain untouched. Only new unique customers are added.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                  onDuplicate === 'update'
                    ? 'bg-rose-500/10 border-rose-500/40 text-stone-100'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400'
                }`}
              >
                <input
                  type="radio"
                  name="duplicateStrategy"
                  checked={onDuplicate === 'update'}
                  onChange={() => setOnDuplicate('update')}
                  className="mt-0.5 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold block text-stone-200">Update Existing Records</span>
                  <span className="text-[11px] text-stone-400">
                    Overwrites the existing member's Name, Email, and Birthday with values from the spreadsheet.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Rows Preview Table */}
          <div className="bg-stone-950/80 rounded-2xl border border-stone-800 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300">
                Data Preview (First {previewRows.length} rows)
              </span>
              <span className="text-[11px] text-stone-500">
                Invalid or duplicate rows will be flagged below
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900/90 text-stone-400 sticky top-0 border-b border-stone-800">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Birthday</th>
                    <th className="py-2.5 px-3">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-stone-300">
                  {previewRows.map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={
                        !r.isValid
                          ? 'bg-rose-950/20'
                          : r.isDuplicateInDb || r.isDuplicateInFile
                          ? 'bg-amber-950/20'
                          : 'hover:bg-stone-900/30'
                      }
                    >
                      <td className="py-2.5 px-3 font-mono text-stone-500">#{r.rowNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-200">{r.name || '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-300">{r.phone || '—'}</td>
                      <td className="py-2.5 px-3 text-stone-400">{r.email || '—'}</td>
                      <td className="py-2.5 px-3 text-stone-400">
                        {r.birthday ? new Date(r.birthday).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        {!r.isValid ? (
                          <div className="flex items-center gap-1.5 text-rose-400">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px]">{r.errors.join('; ')}</span>
                          </div>
                        ) : r.isDuplicateInDb ? (
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px]">
                              Existing in DB ({onDuplicate === 'skip' ? 'will skip' : 'will update'})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px]">Valid new customer</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between p-4 bg-stone-950/80 rounded-2xl border border-stone-800">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
            >
              Cancel & Pick Another File
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{importing ? 'Processing Import...' : 'Proceed with Import'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUMMARY & REPORT */}
      {currentStep === 3 && importSummary && (
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-serif-display text-xl font-bold text-stone-100">
                  Import Process Completed
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Imported members received a unique referral code and no password. They can claim their account right away using OTP login!
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/80">
                <span className="block text-[11px] uppercase font-bold text-emerald-400">
                  New Imported
                </span>
                <span className="font-mono text-3xl font-bold text-emerald-200 mt-1 block">
                  {importSummary.imported}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-1 block">
                  Ready for OTP claim
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-800/80">
                <span className="block text-[11px] uppercase font-bold text-blue-400">
                  Updated
                </span>
                <span className="font-mono text-3xl font-bold text-blue-200 mt-1 block">
                  {importSummary.updated}
                </span>
                <span className="text-[10px] text-blue-400/80 mt-1 block">
                  Existing records updated
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/80">
                <span className="block text-[11px] uppercase font-bold text-amber-400">
                  Skipped
                </span>
                <span className="font-mono text-3xl font-bold text-amber-200 mt-1 block">
                  {importSummary.skipped}
                </span>
                <span className="text-[10px] text-amber-400/80 mt-1 block">
                  Unchanged existing members
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/80">
                <span className="block text-[11px] uppercase font-bold text-rose-400">
                  Failed Rows
                </span>
                <span className="font-mono text-3xl font-bold text-rose-200 mt-1 block">
                  {importSummary.failed}
                </span>
                <span className="text-[10px] text-rose-400/80 mt-1 block">
                  Validation errors
                </span>
              </div>
            </div>

            {/* Failed Rows & CSV Download */}
            {failedRows.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed Rows ({failedRows.length})</span>
                  </span>
                  <button
                    onClick={handleDownloadErrorCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Failed Rows CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto max-h-56 bg-stone-900/60 rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="py-2 px-3">Row</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Phone</th>
                        <th className="py-2 px-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                      {failedRows.map((f, i) => (
                        <tr key={i} className="hover:bg-stone-800/30">
                          <td className="py-2 px-3 font-mono text-stone-500">#{f.rowNumber}</td>
                          <td className="py-2 px-3 font-medium text-stone-200">{f.name || '—'}</td>
                          <td className="py-2 px-3 font-mono text-stone-300">{f.phone || '—'}</td>
                          <td className="py-2 px-3 text-rose-400 text-[11px]">{f.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Next Action Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-white text-xs font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Import Another File</span>
              </button>

              <Link
                to="/admin/members"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>View Member Management Table</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
