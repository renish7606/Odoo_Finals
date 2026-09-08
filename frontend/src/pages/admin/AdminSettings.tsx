import { useState } from 'react';
import { Settings as SettingsIcon, Save, Shield, Database, Users } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';

export function AdminSettings() {
  const { showSuccess } = useToast();

  const [companyName, setCompanyName] = useState('DealFlow360 Enterprise');
  const [currency, setCurrency] = useState('INR (₹)');
  const [defaultTax, setDefaultTax] = useState(18);
  const [autoApprovalFloor, setAutoApprovalFloor] = useState(5);

  const handleSave = () => {
    showSuccess('System settings updated');
  };

  return (
    <AppLayout
      title="Platform Settings & Governance"
      breadcrumb={[{ label: 'Admin' }, { label: 'Settings' }]}
    >
      <div className="max-w-4xl space-y-6">
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Auto-Approval Ceiling (%)</label>
                <input
                  type="number"
                  value={autoApprovalFloor}
                  onChange={(e) => setAutoApprovalFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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

        {/* Roles & Permissions Info */}
        <Card>
          <CardHeader
            title="Role-Based Access Overview"
            subtitle="Platform roles and security boundaries configured for this tenant"
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-bold text-slate-900">ADMIN</p>
                <p className="text-slate-500 mt-0.5">Full access to product pricing, discount policies, warehouses, and settings.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-bold text-slate-900">SALES_REP</p>
                <p className="text-slate-500 mt-0.5">Create and negotiate quotations, track deal pipeline, manage customer accounts.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-bold text-slate-900">SALES_MANAGER</p>
                <p className="text-slate-500 mt-0.5">Review and approve tier discount exceptions, pipeline velocity, deal health.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-bold text-slate-900">FINANCE_OPS</p>
                <p className="text-slate-500 mt-0.5">Approve high-exposure deals, manage billing, subscriptions, invoices, and payment ledger.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
