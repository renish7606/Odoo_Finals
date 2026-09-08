import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  TrendingUp,
  Plus,
  CheckCircle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { KpiCard, Button, Card, CardHeader, CardBody } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency, formatDate } from '../utils/format';

export function Dashboard() {
  const { quotations } = useAppData();
  const navigate = useNavigate();

  // Metrics calculation
  const totalPipeline = quotations.reduce((acc, q) => acc + q.total, 0);
  const pendingApprovals = quotations.filter((q) => q.stage === 'Pending Approval').length;
  const criticalDeals = quotations.filter((q) => q.riskLevel === 'CRITICAL' || q.riskLevel === 'HIGH').length;
  const avgMargin = quotations.length > 0
    ? (quotations.reduce((acc, q) => acc + q.marginPercent, 0) / quotations.length).toFixed(1)
    : '0';

  const stages = [
    { label: 'Draft', count: quotations.filter((q) => q.stage === 'Draft').length, color: 'bg-slate-500' },
    { label: 'Pending Approval', count: quotations.filter((q) => q.stage === 'Pending Approval').length, color: 'bg-amber-500' },
    { label: 'Approved', count: quotations.filter((q) => q.stage === 'Approved').length, color: 'bg-teal-600' },
    { label: 'Negotiation', count: quotations.filter((q) => q.stage === 'Negotiation').length, color: 'bg-blue-500' },
    { label: 'Confirmed', count: quotations.filter((q) => q.stage === 'Confirmed').length, color: 'bg-emerald-600' },
    { label: 'Completed', count: quotations.filter((q) => q.stage === 'Completed').length, color: 'bg-purple-600' },
  ];

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const highRiskQuotes = quotations.filter((q) => q.riskLevel === 'CRITICAL' || q.riskLevel === 'HIGH').slice(0, 3);

  return (
    <AppLayout
      title="Sales & Operations Dashboard"
      breadcrumb={[{ label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/quotations')}>
            <Plus className="w-4 h-4 mr-1" /> New Quotation
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Pipeline Value"
            value={formatCurrency(totalPipeline)}
            icon={<DollarSign className="w-5 h-5" />}
            variant="teal"
            trend={{ value: '14.2%', positive: true }}
          />
          <KpiCard
            label="Active Quotations"
            value={quotations.length.toString()}
            icon={<FileText className="w-5 h-5" />}
            variant="default"
          />
          <KpiCard
            label="Pending Approvals"
            value={pendingApprovals.toString()}
            icon={<Clock className="w-5 h-5" />}
            variant="amber"
          />
          <KpiCard
            label="Average Deal Margin"
            value={`${avgMargin}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="blue"
            trend={{ value: '2.5%', positive: true }}
          />
        </div>

        {/* High Risk Alerts if any */}
        {criticalDeals > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  {criticalDeals} {criticalDeals === 1 ? 'deal requires' : 'deals require'} governance attention
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Quotations have exceeded approved tier discounts or dropped below target margin.
                </p>
              </div>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={() => navigate('/deal-health')}
              className="whitespace-nowrap"
            >
              Inspect Deal Health
            </Button>
          </div>
        )}

        {/* Funnel Overview */}
        <Card>
          <CardHeader title="Pipeline Distribution by Stage" subtitle="Real-time deal status breakdown" />
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stages.map((st) => (
                <div key={st.label} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${st.color}`} />
                    <span className="text-xs text-slate-500 font-medium truncate">{st.label}</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{st.count}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Two Columns: Recent Quotations & High Risk Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Quotes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recent Quotations"
                subtitle="Latest sales orders and quotations updated"
                action={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
                    View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs font-semibold">
                    <tr>
                      <th className="py-3 px-4">Quote #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Margin</th>
                      <th className="py-3 px-4">Risk</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentQuotations.map((quote) => (
                      <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-teal-700">
                          {quote.quoteNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{quote.customerName}</p>
                          <span className="text-[11px] text-slate-400">{quote.customerTier} Tier</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(quote.total)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className={quote.marginPercent < 20 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                            {quote.marginPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={quote.riskLevel} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={quote.stage} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/quotations/${quote.id}`)}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* High Risk / Attention Required */}
          <div>
            <Card>
              <CardHeader
                title="Deals Requiring Review"
                subtitle="Quotes with high discount excess"
                action={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/approvals')}>
                    Approvals
                  </Button>
                }
              />
              <CardBody className="space-y-3">
                {highRiskQuotes.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-medium text-slate-700">All Deals Within Limits</p>
                    <p className="text-xs text-slate-400 mt-1">No critical pricing violations detected.</p>
                  </div>
                ) : (
                  highRiskQuotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-500 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{q.quoteNumber}</span>
                        <StatusBadge status={q.riskLevel} />
                      </div>
                      <p className="text-sm font-medium text-slate-800">{q.customerName}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>Total: {formatCurrency(q.total)}</span>
                        <span>Margin: {q.marginPercent.toFixed(0)}%</span>
                      </div>
                      <p className="text-[11px] text-amber-700 font-medium mt-1">
                        Excess: {q.riskBreakdown.discountExcess}% above allowable policy
                      </p>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
