import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Copy, Trash2, ExternalLink, FileText } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Input, Modal, Tabs, Select } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate, generateId, generateQuoteNumber } from '../utils/format';
import type { Quotation, QuotationStage, RiskLevel } from '../types';

export function Quotations() {
  const { quotations, customers, createQuotation, deleteQuotation, recalculateQuotation } = useAppData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const stageTabs = [
    { label: 'All Quotes', value: 'all', count: quotations.length },
    { label: 'Draft', value: 'Draft', count: quotations.filter((q) => q.stage === 'Draft').length },
    { label: 'Pending Approval', value: 'Pending Approval', count: quotations.filter((q) => q.stage === 'Pending Approval').length },
    { label: 'Approved', value: 'Approved', count: quotations.filter((q) => q.stage === 'Approved').length },
    { label: 'Negotiation', value: 'Negotiation', count: quotations.filter((q) => q.stage === 'Negotiation').length },
    { label: 'Confirmed', value: 'Confirmed', count: quotations.filter((q) => q.stage === 'Confirmed').length },
    { label: 'Fulfillment', value: 'Fulfillment', count: quotations.filter((q) => q.stage === 'Fulfillment').length },
  ];

  const filteredQuotes = quotations.filter((quote) => {
    if (activeTab !== 'all' && quote.stage !== activeTab) return false;
    if (riskFilter !== 'all' && quote.riskLevel !== riskFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = quote.quoteNumber.toLowerCase().includes(q);
      const matchCust = quote.customerName.toLowerCase().includes(q);
      const matchRep = quote.salesRepName.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchRep) return false;
    }
    return true;
  });

  const handleCreateQuote = () => {
    if (!selectedCustomerId) {
      showError('Please select a customer');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const newQuote: Quotation = {
      id: generateId('q'),
      quoteNumber: generateQuoteNumber(quotations.length + 1),
      customerId: customer.id,
      customerName: customer.company || customer.name,
      customerTier: customer.tier,
      salesRepId: user?.id || 'u-alex',
      salesRepName: user?.name || 'Alex Chen',
      stage: 'Draft',
      lines: [],
      orderDiscount: 0,
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
      margin: 0,
      marginPercent: 0,
      riskScore: 0,
      riskLevel: 'LOW',
      riskBreakdown: {
        discountExcess: 0,
        financialImpact: 0,
        violations: 0,
      },
      approvalLevel: 'none',
      approvalChain: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: quoteNotes,
      internalNotes: '',
      negotiations: [],
    };

    const recalculated = recalculateQuotation(newQuote);
    createQuotation(recalculated);
    setCreateModalOpen(false);
    setSelectedCustomerId('');
    setQuoteNotes('');
    showSuccess('Draft quotation created');
    navigate(`/quotations/${recalculated.id}`);
  };

  const handleDuplicate = (quote: Quotation) => {
    const dup: Quotation = {
      ...quote,
      id: generateId('q'),
      quoteNumber: generateQuoteNumber(quotations.length + 1),
      stage: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      negotiations: [],
    };
    const recalculated = recalculateQuotation(dup);
    createQuotation(recalculated);
    showSuccess(`Duplicated ${quote.quoteNumber} as ${recalculated.quoteNumber}`);
  };

  const handleDelete = (id: string, quoteNumber: string) => {
    if (window.confirm(`Are you sure you want to delete quotation ${quoteNumber}?`)) {
      deleteQuotation(id);
      showSuccess(`Deleted quotation ${quoteNumber}`);
    }
  };

  return (
    <AppLayout
      title="Quotations & Orders"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Quotations' }]}
      actions={
        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Quotation
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Stage Filter Tabs */}
        <Tabs tabs={stageTabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quote #, customer, rep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Margin</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Sales Rep</th>
                  <th className="py-3 px-4">Expiration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No quotations match the active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/quotations/${quote.id}`)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-teal-700">
                        {quote.quoteNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{quote.customerName}</div>
                        <span className="text-xs text-slate-400">{quote.customerTier} Tier</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={quote.stage} />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={quote.marginPercent < 20 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                          {quote.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={quote.riskLevel} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{quote.salesRepName}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">{formatDate(quote.expirationDate)}</td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Duplicate"
                            onClick={() => handleDuplicate(quote)}
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            title="Open Detail"
                            onClick={() => navigate(`/quotations/${quote.id}`)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDelete(quote.id, quote.quoteNumber)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Quote Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Quotation"
        description="Select an existing customer account to initialize a CPQ draft."
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Account</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name}) — {c.tier} Tier
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quotation Title / Notes</label>
            <input
              type="text"
              placeholder="e.g. Annual IT hardware refresh + Pro Cloud licenses"
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateQuote}>
              Create & Open Builder
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
