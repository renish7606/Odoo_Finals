import { useState, useEffect } from 'react';
import {
  Save,
  Shield,
  RotateCcw,
  Search,
  Lock,
  LayoutDashboard,
  FileText,
  CheckSquare,
  Package,
  CreditCard,
  Receipt,
  Activity,
  BarChart3,
  Box,
  Percent,
  Info,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import type { FeatureKey, AccessLevel, RBACMatrix, UserRole } from '../../types';
import { DEFAULT_RBAC_MATRIX } from '../../types';
import { cn } from '../../utils/format';

interface FeatureConfig {
  key: FeatureKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURES: FeatureConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Executive KPI cards, performance charts, and activity feeds',
    icon: LayoutDashboard,
  },
  {
    key: 'quotation',
    label: 'Quotation',
    description: 'Create, revise, discount, and manage deal quotations',
    icon: FileText,
  },
  {
    key: 'approvals',
    label: 'Approvals',
    description: 'Review and decide on discount thresholds and credit limits',
    icon: CheckSquare,
  },
  {
    key: 'fulfillment',
    label: 'Fulfillment',
    description: 'Order fulfillment statuses, dispatch notes, and warehouse inventory',
    icon: Package,
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    description: 'Recurring contracts, billing terms, and renewal cycles',
    icon: CreditCard,
  },
  {
    key: 'invoice',
    label: 'Invoice',
    description: 'Billing ledger, payment reconciliation, and invoice generation',
    icon: Receipt,
  },
  {
    key: 'deal_health',
    label: 'Deal Health',
    description: 'Margin erosion, risk scoring, and deal pipeline analytics',
    icon: Activity,
  },
  {
    key: 'report',
    label: 'Report',
    description: 'Performance metrics, sales velocity, and executive summaries',
    icon: BarChart3,
  },
  {
    key: 'product',
    label: 'Product',
    description: 'Product catalog, unit pricing, margins, and warehouse inventory',
    icon: Box,
  },
  {
    key: 'discount_tier',
    label: 'Discount Tier',
    description: 'Tier ceilings, category limits, and multi-level approval routing chains',
    icon: Percent,
  },
];

const ROLES: { key: UserRole; label: string; badgeColor: string }[] = [
  { key: 'ADMIN', label: 'Admin', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'SALES_REP', label: 'Sales Rep', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'SALES_MANAGER', label: 'Sales Manager', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'FINANCE_OPS', label: 'Finance Ops', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
];

export function AdminSettings() {
  const { showSuccess, showInfo } = useToast();
  const { rbacMatrix, updateRBACMatrix, resetRBACMatrix } = useAuth();

  const [companyName, setCompanyName] = useState('DealFlow360 Enterprise');
  const [currency, setCurrency] = useState('INR (₹)');
  const [defaultTax, setDefaultTax] = useState(18);
  const [autoApprovalFloor, setAutoApprovalFloor] = useState(5);

  // Local editable state of RBAC matrix
  const [matrix, setMatrix] = useState<RBACMatrix>(rbacMatrix);
  const [searchQuery, setSearchQuery] = useState('');

  // Keep local matrix synced if context matrix changes externally
  useEffect(() => {
    setMatrix(rbacMatrix);
  }, [rbacMatrix]);

  const handleAccessChange = (feature: FeatureKey, role: UserRole, access: AccessLevel) => {
    if (role === 'ADMIN') return; // Admin is permanently locked to edit
    setMatrix((prev) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [role]: access,
      },
    }));
  };

  const handleSave = () => {
    updateRBACMatrix(matrix);
    showSuccess('System parameters & RBAC permissions successfully saved');
  };

  const handleResetDefaults = () => {
    resetRBACMatrix();
    setMatrix(DEFAULT_RBAC_MATRIX);
    showInfo('RBAC permissions restored to system defaults');
  };

  const filteredFeatures = FEATURES.filter((f) =>
    f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout
      title="Platform Settings & Governance"
      breadcrumb={[{ label: 'Admin' }, { label: 'Settings' }]}
    >
      <div className="max-w-6xl space-y-6 pb-12">
        {/* General Parameters */}
        <Card>
          <CardHeader
            title="General System Parameters"
            subtitle="Configure default currencies, corporate entity name, and baseline taxation"
          />
          <CardBody className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Company Operating Entity</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Default GST / Tax Rate (%)</label>
                <input
                  type="number"
                  value={defaultTax}
                  onChange={(e) => setDefaultTax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Auto-Approval Ceiling (%)</label>
                <input
                  type="number"
                  value={autoApprovalFloor}
                  onChange={(e) => setAutoApprovalFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save Settings
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Dynamic RBAC Matrix */}
        <Card>
          <CardHeader
            title="Role-Based Access Control (RBAC) Governance"
            subtitle="Configure granular access levels (Edit, Read Only, None) across core platform features for each role"
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetDefaults}
                  title="Reset all feature permissions to default settings"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Permissions
                </Button>
              </div>
            }
          />
          <CardBody className="space-y-4">
            {/* Legend & Search bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Badges Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Access Levels:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Edit (Full)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Read Only (View)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> None (Disabled)
                </span>
              </div>
            </div>

            {/* Permissions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 min-w-[240px]">Feature</th>
                    {ROLES.map((role) => (
                      <th key={role.key} className="py-3 px-4 min-w-[170px] text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>{role.label}</span>
                          {role.key === 'ADMIN' && (
                            <span className="text-[10px] lowercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-200 font-normal">
                              super
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredFeatures.map((feature) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <tr key={feature.key} className="hover:bg-slate-50/70 transition-colors">
                        {/* Feature Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FeatureIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">
                                {feature.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role Columns */}
                        {ROLES.map((role) => {
                          const access = role.key === 'ADMIN' ? 'edit' : matrix[feature.key]?.[role.key] || 'none';
                          const isAdmin = role.key === 'ADMIN';

                          return (
                            <td key={role.key} className="py-3.5 px-4 text-center align-middle">
                              {isAdmin ? (
                                <div
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed shadow-xs"
                                  title="Admin retains full edit rights across all features to prevent lockout"
                                >
                                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Edit (Locked)</span>
                                </div>
                              ) : (
                                <select
                                  value={access}
                                  onChange={(e) =>
                                    handleAccessChange(feature.key, role.key, e.target.value as AccessLevel)
                                  }
                                  className={cn(
                                    'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer outline-none focus:ring-2 shadow-xs',
                                    access === 'edit' &&
                                      'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500 hover:bg-emerald-100/60',
                                    access === 'read' &&
                                      'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-500 hover:bg-blue-100/60',
                                    access === 'none' &&
                                      'bg-slate-100 text-slate-600 border-slate-300 focus:ring-slate-400 hover:bg-slate-200/60'
                                  )}
                                >
                                  <option value="edit">Edit</option>
                                  <option value="read">Read Only</option>
                                  <option value="none">None</option>
                                </select>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {filteredFeatures.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No features matched &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Guidance Footer */}
            <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Security Note: </span>
                Modifying access updates sidebar visibility and route guards in real-time. Features assigned{' '}
                <span className="font-semibold text-slate-700">None</span> are withheld from navigation and blocked by HTTP 403 authorization guards. Click{' '}
                <span className="font-semibold text-teal-700">Save Permissions</span> to persist rules across sessions.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={handleResetDefaults}>
                <RotateCcw className="w-4 h-4 mr-1" /> Reset Defaults
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" /> Save Permissions
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
