import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Plus, KanbanSquare } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency } from '../utils/format';
import type { QuotationStage } from '../types';

export function Pipeline() {
  const { quotations, updateQuotationStage } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const stages: { stage: QuotationStage; label: string; color: string }[] = [
    { stage: 'Draft', label: 'Draft', color: 'border-t-slate-400' },
    { stage: 'Pending Approval', label: 'Pending Approval', color: 'border-t-amber-500' },
    { stage: 'Approved', label: 'Approved', color: 'border-t-teal-600' },
    { stage: 'Negotiation', label: 'Negotiation', color: 'border-t-blue-500' },
    { stage: 'Confirmed', label: 'Confirmed', color: 'border-t-emerald-600' },
    { stage: 'Fulfillment', label: 'Fulfillment', color: 'border-t-indigo-600' },
    { stage: 'Completed', label: 'Completed', color: 'border-t-purple-600' },
  ];

  const filteredQuotes = quotations.filter((q) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return q.quoteNumber.toLowerCase().includes(s) || q.customerName.toLowerCase().includes(s);
  });

  return (
    <AppLayout
      title="Deal Pipeline & Opportunity Flow"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Pipeline' }]}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/quotations')}>
            <Plus className="w-4 h-4 mr-1" /> New Quote
          </Button>
        </div>
      }
    >
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {stages.map((col) => {
          const colQuotes = filteredQuotes.filter((q) => q.stage === col.stage);
          const colSum = colQuotes.reduce((acc, q) => acc + q.total, 0);

          return (
            <div
              key={col.stage}
              className={`flex-shrink-0 w-72 bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col border-t-4 ${col.color}`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{col.label}</h3>
                  <p className="text-[11px] text-slate-500">{formatCurrency(colSum, true)}</p>
                </div>
                <span className="px-2 py-0.5 bg-white text-slate-700 rounded-full text-xs font-semibold shadow-xs border border-slate-200">
                  {colQuotes.length}
                </span>
              </div>

              {/* Cards Stream */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                {colQuotes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    No deals
                  </div>
                ) : (
                  colQuotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-card hover:shadow-card-hover hover:border-teal-500 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-teal-700">{q.quoteNumber}</span>
                        <StatusBadge status={q.riskLevel} />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 truncate">{q.customerName}</p>
                      <p className="text-xs text-slate-500 mb-2">{q.lines.length} items • Rep: {q.salesRepName}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">{formatCurrency(q.total)}</span>
                        <span className={`font-semibold ${q.marginPercent < 20 ? 'text-red-600' : 'text-slate-600'}`}>
                          {q.marginPercent.toFixed(0)}% margin
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
