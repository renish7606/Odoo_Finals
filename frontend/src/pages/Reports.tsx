import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Download, TrendingUp, DollarSign } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardBody, Button } from '../components/ui';
import { useAppData } from '../contexts/AppDataContext';
import { formatCurrency } from '../utils/format';

export function Reports() {
  const { quotations, products } = useAppData();

  // Category revenue aggregation
  const categoryData = [
    { name: 'Hardware', revenue: 0, cost: 0 },
    { name: 'Services', revenue: 0, cost: 0 },
    { name: 'Subscriptions', revenue: 0, cost: 0 },
  ];

  quotations.forEach((q) => {
    q.lines.forEach((line) => {
      const target = categoryData.find((c) => c.name === line.category);
      if (target) {
        const net = line.unitPrice * line.quantity * (1 - line.discount / 100);
        target.revenue += net;
        target.cost += line.cost * line.quantity;
      }
    });
  });

  const stageData = [
    { name: 'Draft', count: quotations.filter((q) => q.stage === 'Draft').length },
    { name: 'Pending', count: quotations.filter((q) => q.stage === 'Pending Approval').length },
    { name: 'Approved', count: quotations.filter((q) => q.stage === 'Approved').length },
    { name: 'Confirmed', count: quotations.filter((q) => q.stage === 'Confirmed').length },
    { name: 'Fulfilled', count: quotations.filter((q) => q.stage === 'Completed').length },
  ];

  const COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#3B82F6', '#10B981'];

  const totalSales = quotations.reduce((acc, q) => acc + q.total, 0);
  const totalMargin = quotations.reduce((acc, q) => acc + q.margin, 0);

  return (
    <AppLayout
      title="Executive Analytics & Business Intelligence"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Reports' }]}
      actions={
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-1" /> Export PDF Summary
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Gross Quoted Revenue</p>
            <p className="text-3xl font-bold text-teal-700 mt-2">{formatCurrency(totalSales)}</p>
            <p className="text-xs text-slate-400 mt-1">Across all pipeline lifecycle stages</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Realized Profit Margin</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalMargin)}</p>
            <p className="text-xs text-slate-400 mt-1">Overall blended profitability</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Cost by Category */}
          <Card>
            <CardHeader
              title="Revenue vs Cost by Product Category"
              subtitle="Comparison of net billed volume against product costs"
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#0F766E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Cost" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Deal Count by Pipeline Stage */}
          <Card>
            <CardHeader
              title="Pipeline Volume Distribution"
              subtitle="Active opportunity concentration across workflow phases"
            />
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="count" name="Quotations" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
