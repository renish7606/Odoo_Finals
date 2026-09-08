import { useState } from 'react';
import { Percent, ShieldCheck, Edit2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import type { DiscountRule } from '../../types';

export function AdminDiscountRules() {
  const { discountRules, updateDiscountRule } = useAppData();
  const { showSuccess } = useToast();

  const [editRule, setEditRule] = useState<DiscountRule | null>(null);
  const [maxDisc, setMaxDisc] = useState(15);
  const [threshold, setThreshold] = useState(15);
  const [route, setRoute] = useState<'none' | 'manager' | 'finance'>('manager');

  const handleOpenEdit = (rule: DiscountRule) => {
    setEditRule(rule);
    setMaxDisc(rule.maxDiscount);
    setThreshold(rule.approvalThreshold);
    setRoute(rule.approvalRoute);
  };

  const handleSave = () => {
    if (!editRule) return;
    updateDiscountRule(editRule.id, {
      maxDiscount: Number(maxDisc),
      approvalThreshold: Number(threshold),
      approvalRoute: route,
    });
    showSuccess(`Updated rule for ${editRule.name}`);
    setEditRule(null);
  };

  return (
    <AppLayout
      title="Discount Governance & Approval Rules"
      breadcrumb={[{ label: 'Admin' }, { label: 'Discount Rules' }]}
    >
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Policy & Threshold Hierarchy"
            subtitle="Define maximum permissible discount percentages before triggering managerial or finance escalation"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Rule Target / Scope</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Max Allowed Disc %</th>
                  <th className="py-3 px-4">Approval Threshold %</th>
                  <th className="py-3 px-4">Escalation Route</th>
                  <th className="py-3 px-4 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discountRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{rule.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="slate">{rule.type}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rule.maxDiscount}%</td>
                    <td className="py-3.5 px-4 text-amber-700 font-semibold">{rule.approvalThreshold}%</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={rule.approvalRoute === 'finance' ? 'red' : 'teal'}>
                        {rule.approvalRoute.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(rule)}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Configure
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Rule Modal */}
      <Modal
        open={!!editRule}
        onClose={() => setEditRule(null)}
        title={`Configure Discount Rule: ${editRule?.name}`}
        description="Set maximum discount ceiling and mandatory approval route"
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Max Standard Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={maxDisc}
              onChange={(e) => setMaxDisc(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Escalation Threshold (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Escalation Level Required</label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value as 'none' | 'manager' | 'finance')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="none">No Approval (Auto-approved)</option>
              <option value="manager">Sales Manager Approval</option>
              <option value="finance">Finance & VP Approval</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditRule(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Rule
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
