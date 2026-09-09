import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ShieldCheck, TrendingDown, ArrowRight } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency } from '../utils/format';

export function DealHealth() {
  const { quotations } = useAppData();
  const navigate = useNavigate();

  const lowRisk = quotations.filter((q) => q.riskLevel === 'LOW');
  const modRisk = quotations.filter((q) => q.riskLevel === 'MODERATE');
  const highRisk = quotations.filter((q) => q.riskLevel === 'HIGH');
  const critRisk = quotations.filter((q) => q.riskLevel === 'CRITICAL');

  const riskMetrics = [
    { label: 'Healthy (Low Risk)', count: lowRisk.length, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    { label: 'Moderate Risk', count: modRisk.length, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'High Risk', count: highRisk.length, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'Critical Violation', count: critRisk.length, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  ];

  return (
    <AppLayout
      title="Deal Health & Margin Risk Radar"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Deal Health' }]}
    >
      <div className="space-y-6">
        {/* Risk Level Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((rm) => (
            <div key={rm.label} className={`border rounded-xl p-4 shadow-card ${rm.bg} ${rm.border}`}>
              <span className={`text-xs font-semibold uppercase ${rm.color}`}>{rm.label}</span>
              <p className={`text-2xl font-bold mt-2 ${rm.color}`}>{rm.count} Deals</p>
            </div>
          ))}
        </div>

        {/* Risk Radar Table */}
        <Card>
          <CardHeader
            title="Deal Health Matrix"
            subtitle="Governance risk scores based on discount thresholds, minimum margin floors, and approval hierarchy"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Profit Margin</th>
                  <th className="py-3 px-4">Excess Discount</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-teal-700">{q.quoteNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{q.customerName}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatCurrency(q.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${q.marginPercent < 20 ? 'text-red-600' : 'text-teal-700'}`}>
                        {q.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-amber-700 font-medium">
                      {q.riskBreakdown.discountExcess > 0 ? `+${q.riskBreakdown.discountExcess}%` : '0%'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{q.riskScore}</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              q.riskScore > 60 ? 'bg-red-500' : q.riskScore > 30 ? 'bg-amber-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, q.riskScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={q.riskLevel} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/quotations/${q.id}`)}>
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
