import React from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Award,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Month,Total Revenue (RM),Total Orders,Points Awarded\nOctober 2026,12840,94,8420\nSeptember 2026,10650,81,6910\nAugust 2026,9200,72,5800';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'soultalk_sales_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-primary-dark)]">
            Business Analytics
          </span>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
            Sales & Orders Reports
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Analyze monthly performance, bestselling creations, and loyalty redemption.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-primary text-xs !min-h-[42px] self-start sm:self-auto"
        >
          <Download className="w-4 h-4 stroke-[2]" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Monthly Sales Breakdown Table */}
      <div className="soultalk-card p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
        <h3 className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
          Quarterly Performance Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Total Orders</th>
                <th className="py-3 px-3">Gross Sales</th>
                <th className="py-3 px-3">Average Order</th>
                <th className="py-3 px-3">Points Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {[
                { period: 'October 2026', orders: 94, sales: 12840, aov: 136.6, points: 8420 },
                { period: 'September 2026', orders: 81, sales: 10650, aov: 131.5, points: 6910 },
                { period: 'August 2026', orders: 72, sales: 9200, aov: 127.8, points: 5800 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[var(--color-surface-soft)] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[var(--color-text)]">{row.period}</td>
                  <td className="py-3.5 px-3">{row.orders} orders</td>
                  <td className="py-3.5 px-3 font-semibold text-[var(--color-text)]">
                    RM {row.sales.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">RM {row.aov.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-[var(--color-primary-dark)] font-bold">
                    +{row.points.toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

