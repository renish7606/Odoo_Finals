import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Save,
  Percent,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { DiscountTierConfig } from '../types';

const STORAGE_KEY = 'dealflow360_discount_tiers';

const DEFAULT_CONFIG: DiscountTierConfig = {
  tierCeilings: [
    { tier: 'Bronze', maxDiscount: 5 },
    { tier: 'Silver', maxDiscount: 10 },
    { tier: 'Gold', maxDiscount: 15 },
  ],
  categoryCeilings: [
    { category: 'Hardware', maxDiscount: 15 },
    { category: 'Services', maxDiscount: 10 },
  ],
  approvalRouting: [
    { range: 'Within tier/Category limit', approver: 'No approval needed' },
    { range: 'Over Limit, blended risk medium', approver: 'Sales manager' },
    { range: 'Over limit, blended high risk', approver: 'Sales manager then finance' },
  ],
};

export function DiscountTiers() {
  const { user, canAccessFeature } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const canEdit = canAccessFeature('discount_tier', 'edit');

  const [config, setConfig] = useState<DiscountTierConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const handleTierChange = (index: number, value: number) => {
    if (!canEdit) return;
    const updated = [...config.tierCeilings];
    updated[index] = { ...updated[index], maxDiscount: value };
    setConfig({ ...config, tierCeilings: updated });
  };

  const handleCategoryChange = (index: number, value: number) => {
    if (!canEdit) return;
    const updated = [...config.categoryCeilings];
    updated[index] = { ...updated[index], maxDiscount: value };
    setConfig({ ...config, categoryCeilings: updated });
  };

  const handleRoutingChange = (index: number, value: string) => {
    if (!canEdit) return;
    const updated = [...config.approvalRouting];
    updated[index] = { ...updated[index], approver: value };
    setConfig({ ...config, approvalRouting: updated });
  };

  const handleSave = () => {
    if (!canEdit) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showSuccess('Discount tiers and approval chains saved successfully');
  };

  return (
    <AppLayout
      title="Discount tiers and approval chains"
      breadcrumb={[
        { label: 'Approvals', path: '/approvals' },
        { label: 'Discount Tiers' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/approvals')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Approvals
          </Button>
          {canEdit ? (
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1.5" /> Save configuration
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Read-Only View</span>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl pb-10">
        {/* Permission Status Banner if Read Only */}
        {!canEdit && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Read-Only Mode:</strong> Your role ({user?.role.replace('_', ' ')}) has view permission. Only Sales Managers, Finance Ops, and Administrators can modify discount ceilings and approval routing chains.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">
              Read-Only
            </span>
          </div>
        )}

        {/* Top 2 Columns Grid: Tier Discount Ceilings & Category Discount Ceilings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Tier Discount Ceilings */}
          <Card>
            <CardHeader
              title="Tier Discount Ceilings"
              subtitle="Base allowable discount ceiling calibrated by customer account tier"
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-5">Tier</th>
                      <th className="py-3 px-5 text-right">Max Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {config.tierCeilings.map((item, idx) => (
                      <tr key={item.tier} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              item.tier === 'Gold'
                                ? 'bg-amber-400 ring-2 ring-amber-200'
                                : item.tier === 'Silver'
                                ? 'bg-slate-400 ring-2 ring-slate-200'
                                : 'bg-amber-700 ring-2 ring-amber-300'
                            }`}
                          />
                          <span>{item.tier}</span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {canEdit ? (
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.maxDiscount}
                                onChange={(e) => handleTierChange(idx, Number(e.target.value))}
                                className="w-20 px-2.5 py-1 text-right text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <span className="text-xs font-medium text-slate-500">percent</span>
                            </div>
                          ) : (
                            <span className="inline-block font-semibold text-slate-800 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                              {item.maxDiscount} percent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Card 2: Category Discount Ceilings */}
          <Card>
            <CardHeader
              title="Category Discount ceilings"
              subtitle="Ceilings dictated by product catalog margin thresholds"
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5 text-right">Max Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {config.categoryCeilings.map((item, idx) => (
                      <tr key={item.category} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-600" />
                          <span>{item.category}</span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {canEdit ? (
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.maxDiscount}
                                onChange={(e) => handleCategoryChange(idx, Number(e.target.value))}
                                className="w-20 px-2.5 py-1 text-right text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                              <span className="text-xs font-medium text-slate-500">percent</span>
                            </div>
                          ) : (
                            <span className="inline-block font-semibold text-slate-800 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                              {item.maxDiscount} percent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Card 3: Bottom Table - Discount Range vs Approval Routing */}
        <Card>
          <CardHeader
            title="Tier Discount Ceilings"
            subtitle="Automated deal routing criteria based on variance from baseline discount caps"
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-5">Discount range</th>
                    <th className="py-3 px-5 text-right">Max Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {config.approvalRouting.map((item, idx) => (
                    <tr key={item.range} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-900">
                        {item.range}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {canEdit ? (
                          <input
                            type="text"
                            value={item.approver}
                            onChange={(e) => handleRoutingChange(idx, e.target.value)}
                            className="w-64 px-3 py-1 text-right text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        ) : (
                          <span
                            className={`inline-block font-semibold px-3 py-1 rounded-lg text-xs border ${
                              item.approver.toLowerCase().includes('finance')
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : item.approver.toLowerCase().includes('sales manager')
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.approver}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save configuration button footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-xs text-slate-500">
                {canEdit ? 'Changes will apply to newly generated quotation calculations.' : 'Viewing mode only.'}
              </div>
              {canEdit ? (
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1.5" /> Save configuration
                </Button>
              ) : (
                <Button variant="secondary" size="sm" disabled>
                  <Lock className="w-4 h-4 mr-1.5" /> Save configuration (Locked)
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Governance & Policy Notice Box (Exact text from mockup layout) */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border-2 border-amber-500/80 shadow-lg text-xs leading-relaxed space-y-1">
          <p className="font-semibold text-amber-400">
            When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level
          </p>
          <p className="text-slate-300">
            All approvals, rejections, and edits must be logged with user, timestamp, and reason.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
