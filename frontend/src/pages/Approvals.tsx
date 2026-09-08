import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Check, X, AlertTriangle, ShieldAlert, ArrowLeft, Clock, FileText } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import type { Quotation } from '../types';

export function Approvals() {
  const { quotations, approveQuotation, rejectQuotation, returnQuotation } = useAppData();
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [reasonModal, setReasonModal] = useState<{
    open: boolean;
    quoteId: string;
    quoteNum: string;
    action: 'reject' | 'return';
  }>({
    open: false,
    quoteId: '',
    quoteNum: '',
    action: 'reject',
  });
  const [reasonText, setReasonText] = useState('');

  const pendingQuotes = quotations.filter((q) => q.stage === 'Pending Approval');
  const totalPendingValue = pendingQuotes.reduce((acc, q) => acc + q.total, 0);

  const handleApprove = (quote: Quotation) => {
    approveQuotation(quote.id, user?.name || 'Manager', 'Approved via Approvals Board');
    showSuccess(`Approved quotation ${quote.quoteNumber}`);
  };

  const handleConfirmAction = () => {
    if (reasonModal.action === 'reject') {
      rejectQuotation(reasonModal.quoteId, user?.name || 'Manager', reasonText || 'Rejected');
      showSuccess(`Rejected quotation ${reasonModal.quoteNum}`);
    } else {
      returnQuotation(reasonModal.quoteId, user?.name || 'Manager', reasonText || 'Returned');
      showSuccess(`Returned quotation ${reasonModal.quoteNum} to draft`);
    }
    setReasonModal({ ...reasonModal, open: false });
    setReasonText('');
  };

  return (
    <AppLayout
      title="Discount & Deal Approvals"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Approvals' }]}
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{pendingQuotes.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Exposure</span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalPendingValue)}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">High/Critical Deals</span>
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {pendingQuotes.filter((q) => q.riskLevel === 'HIGH' || q.riskLevel === 'CRITICAL').length}
            </p>
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {pendingQuotes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-card">
              <CheckSquare className="w-12 h-12 text-teal-600 mx-auto mb-3 opacity-70" />
              <h3 className="text-base font-semibold text-slate-900">All Approvals Clear</h3>
              <p className="text-sm text-slate-500 mt-1">There are no pending quotations awaiting review.</p>
            </div>
          ) : (
            pendingQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        onClick={() => navigate(`/quotations/${quote.id}`)}
                        className="text-base font-bold text-teal-700 hover:underline cursor-pointer"
                      >
                        {quote.quoteNumber}
                      </span>
                      <StatusBadge status={quote.riskLevel} />
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Requires {quote.approvalLevel.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 mt-1">
                      Customer: <span className="font-semibold text-slate-900">{quote.customerName}</span> ({quote.customerTier} Tier) • Submitted by: {quote.salesRepName}
                    </p>

                    {/* Violations notice */}
                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-4 flex-wrap">
                      <span>Total: <strong className="text-slate-900">{formatCurrency(quote.total)}</strong></span>
                      <span>Margin: <strong className={quote.marginPercent < 20 ? 'text-red-600' : 'text-teal-700'}>{quote.marginPercent.toFixed(1)}%</strong></span>
                      <span className="text-amber-700">Excess Discount: <strong>{quote.riskBreakdown.discountExcess}%</strong></span>
                      <span className="text-red-600">Violations: <strong>{quote.riskBreakdown.violations} lines</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/quotations/${quote.id}`)}
                    >
                      Review Lines
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setReasonModal({
                          open: true,
                          quoteId: quote.id,
                          quoteNum: quote.quoteNumber,
                          action: 'return',
                        })
                      }
                    >
                      Return
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setReasonModal({
                          open: true,
                          quoteId: quote.id,
                          quoteNum: quote.quoteNumber,
                          action: 'reject',
                        })
                      }
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(quote)}>
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reason Modal */}
      <Modal
        open={reasonModal.open}
        onClose={() => setReasonModal({ ...reasonModal, open: false })}
        title={reasonModal.action === 'reject' ? 'Reject Quotation' : 'Return for Revisions'}
        description={`Audit record for ${reasonModal.quoteNum}`}
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Action</label>
            <textarea
              rows={3}
              placeholder="State reason (e.g., Requested margin is below 18% minimum floor)..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setReasonModal({ ...reasonModal, open: false })}>
              Cancel
            </Button>
            <Button
              variant={reasonModal.action === 'reject' ? 'danger' : 'warning'}
              onClick={handleConfirmAction}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
