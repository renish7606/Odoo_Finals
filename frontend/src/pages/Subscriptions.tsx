import { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import type { Subscription } from '../types';

export function Subscriptions() {
  const { subscriptions, cancelSubscription } = useAppData();
  const { showSuccess } = useToast();

  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    sub: Subscription | null;
  }>({
    open: false,
    sub: null,
  });
  const [cancelMode, setCancelMode] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [cancelReason, setCancelReason] = useState('');

  const totalMRR = subscriptions
    .filter((s) => s.status === 'Active' || s.status === 'Trial')
    .reduce((acc, s) => {
      if (s.billingCycle === 'yearly') return acc + s.amount / 12;
      if (s.billingCycle === 'quarterly') return acc + s.amount / 3;
      return acc + s.amount;
    }, 0);

  const activeCount = subscriptions.filter((s) => s.status === 'Active').length;

  const handleConfirmCancel = () => {
    if (!cancelModal.sub) return;
    cancelSubscription(cancelModal.sub.id, cancelMode, cancelReason || 'Customer requested');
    showSuccess(`Subscription ${cancelModal.sub.subscriptionNumber} updated`);
    setCancelModal({ open: false, sub: null });
    setCancelReason('');
  };

  return (
    <AppLayout
      title="Recurring Subscriptions & SaaS Contracts"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Subscriptions' }]}
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Estimated Monthly MRR</p>
            <p className="text-2xl font-bold text-teal-700 mt-2">{formatCurrency(totalMRR)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Annual Run-rate (ARR)</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalMRR * 12)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Subscribers</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{activeCount}</p>
          </div>
        </div>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader title="Subscription Accounts" subtitle="Active, trial, and scheduled contracts" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Subscription #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Next Billing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-teal-700">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{sub.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-700">{sub.planName}</td>
                    <td className="py-3.5 px-4 text-slate-500 capitalize">{sub.billingCycle}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(sub.amount)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(sub.nextBilling)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === 'Active' || sub.status === 'Trial' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setCancelModal({ open: true, sub })}
                        >
                          Cancel Plan
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={cancelModal.open}
        onClose={() => setCancelModal({ open: false, sub: null })}
        title="Cancel Subscription"
        description={`Configure cancellation policy for ${cancelModal.sub?.subscriptionNumber}`}
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Cancellation Timing</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cancelMode"
                  checked={cancelMode === 'end_of_period'}
                  onChange={() => setCancelMode('end_of_period')}
                  className="text-teal-600"
                />
                <span>Schedule at end of current billing period</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cancelMode"
                  checked={cancelMode === 'immediate'}
                  onChange={() => setCancelMode('immediate')}
                  className="text-teal-600"
                />
                <span>Cancel immediately (prorated credit)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Reason for Cancellation</label>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Client downsizing licenses..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCancelModal({ open: false, sub: null })}>
              Back
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
