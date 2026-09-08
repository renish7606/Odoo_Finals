import { ArrowUpCircle, Plus, Edit2, Tag } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../../components/ui';
import { useAppData } from '../../contexts/AppDataContext';

export function AdminUpsellRules() {
  const { upsellRules } = useAppData();

  return (
    <AppLayout
      title="Dynamic Upsell & Cross-Sell Rules"
      breadcrumb={[{ label: 'Admin' }, { label: 'Upsell Rules' }]}
    >
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Active Recommendation Matrix"
            subtitle="Automated cross-sell suggestions presented in the split builder based on selected line items"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Trigger Product</th>
                  <th className="py-3 px-4">Recommended Add-on</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Promotional Pitch</th>
                  <th className="py-3 px-4">Min Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upsellRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{rule.productName}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{rule.recommendedProductName}</td>
                    <td className="py-3.5 px-4 text-slate-600">Priority #{rule.priority}</td>
                    <td className="py-3.5 px-4 text-slate-700">{rule.promotion}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">{rule.minimumMargin}%</td>
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
