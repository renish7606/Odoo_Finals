import { useState } from 'react';
import { CalendarClock, Check, Edit2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import type { SubscriptionPlan } from '../../types';

export function AdminSubscriptionPlans() {
  const { subscriptionPlans, updateSubscriptionPlan } = useAppData();
  const { showSuccess } = useToast();

  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [price, setPrice] = useState(0);

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setPrice(plan.price);
  };

  const handleSave = () => {
    if (!editPlan) return;
    updateSubscriptionPlan(editPlan.id, { price: Number(price) });
    showSuccess(`Updated plan ${editPlan.name}`);
    setEditPlan(null);
  };

  return (
    <AppLayout
      title="Recurring Subscription Plans"
      breadcrumb={[{ label: 'Admin' }, { label: 'Subscription Plans' }]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{plan.billingFrequency} billing</p>
                  </div>
                  <Badge variant="teal" dot>{plan.status}</Badge>
                </div>

                <div className="text-2xl font-bold text-teal-700">
                  {formatCurrency(plan.price)}
                  <span className="text-xs text-slate-500 font-normal"> / {plan.billingFrequency}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div><strong>Proration:</strong> {plan.prorationRule}</div>
                  <div><strong>Cancellation:</strong> {plan.cancellationRule}</div>
                  <div><strong>Refund Policy:</strong> {plan.refundRule}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(plan)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Pricing
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editPlan}
        onClose={() => setEditPlan(null)}
        title={`Edit Plan Price: ${editPlan?.name}`}
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditPlan(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Price
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
