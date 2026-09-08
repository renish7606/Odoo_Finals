import { useState } from 'react';
import { Receipt, DollarSign, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import type { Invoice } from '../types';

export function Billing() {
  const { invoices, recordPayment } = useAppData();
  const { showSuccess, showError } = useToast();

  const [filter, setFilter] = useState<string>('all');
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    invoice: Invoice | null;
  }>({
    open: false,
    invoice: null,
  });
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank Transfer');

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((acc, inv) => acc + inv.total, 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'Overdue').length;

  const filteredInvoices = invoices.filter((inv) => {
    if (filter !== 'all' && inv.status !== filter) return false;
    return true;
  });

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentModal({ open: true, invoice: inv });
    setPayAmount(inv.total);
  };

  const handleRecordPayment = () => {
    if (!paymentModal.invoice) return;
    recordPayment(paymentModal.invoice.id, Number(payAmount), payMethod);
    showSuccess(`Payment of ${formatCurrency(payAmount)} recorded`);
    setPaymentModal({ open: false, invoice: null });
  };

  return (
    <AppLayout
      title="Invoices & Accounts Receivable"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Billing' }]}
    >
      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Receivables</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Balance</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(totalPending)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Overdue Accounts</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{overdueCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {['all', 'Pending', 'Paid', 'Overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All Invoices' : f}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader title="Invoices Directory" subtitle="Billing statements and collection status" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Billing Type</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-teal-700">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{inv.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-500 capitalize">{inv.type.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status !== 'Paid' ? (
                        <Button variant="primary" size="sm" onClick={() => handleOpenPayment(inv)}>
                          <DollarSign className="w-3.5 h-3.5 mr-1" /> Record Payment
                        </Button>
                      ) : (
                        <span className="text-xs text-teal-700 font-medium">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, invoice: null })}
        title="Record Payment Receipt"
        description={`Invoice ${paymentModal.invoice?.invoiceNumber} for ${paymentModal.invoice?.customerName}`}
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Amount Received</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="Credit Card">Corporate Credit Card</option>
              <option value="UPI">UPI / NetBanking</option>
              <option value="Cheque">Bank Cheque</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setPaymentModal({ open: false, invoice: null })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRecordPayment}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
