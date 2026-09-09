import { useState } from 'react';
import { Package, Warehouse as WarehouseIcon, Truck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/format';

export function Fulfillment() {
  const { quotations, warehouses, updateQuotationStage } = useAppData();
  const { showSuccess } = useToast();

  const fulfillmentOrders = quotations.filter(
    (q) => q.stage === 'Confirmed' || q.stage === 'Fulfillment' || q.stage === 'Completed'
  );

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    fulfillmentOrders.length > 0 ? fulfillmentOrders[0].id : null
  );

  const activeQuote = quotations.find((q) => q.id === selectedQuoteId);

  const handleMarkShipped = (quoteId: string) => {
    updateQuotationStage(quoteId, 'Completed');
    showSuccess('Order marked as Completed & Shipped');
  };

  return (
    <AppLayout
      title="Warehouse Fulfillment & Inventory Routing"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Fulfillment' }]}
    >
      <div className="space-y-6">
        {/* Warehouses Inventory Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <WarehouseIcon className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{wh.name}</h4>
                    <p className="text-xs text-slate-500">{wh.location}</p>
                  </div>
                </div>
                <Badge variant={wh.status === 'active' ? 'teal' : 'slate'} dot>
                  {wh.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                <span>Available Units: <strong className="text-slate-900">{wh.stock}</strong></span>
                <span>Weight Factor: <strong>{wh.shippingCostWeight}x</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Fulfillment Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order selection column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Orders Requiring Fulfillment</h3>
            {fulfillmentOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                No orders ready for fulfillment.
              </div>
            ) : (
              fulfillmentOrders.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedQuoteId === q.id
                      ? 'bg-teal-50/50 border-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{q.quoteNumber}</span>
                    <StatusBadge status={q.stage} />
                  </div>
                  <p className="text-sm font-medium text-slate-800">{q.customerName}</p>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>{q.lines.length} Line Items</span>
                    <span className="font-bold text-slate-900">{formatCurrency(q.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Allocation & Shipping Detail */}
          <div className="lg:col-span-2">
            {activeQuote ? (
              <Card>
                <CardHeader
                  title={`Fulfillment Manifest: ${activeQuote.quoteNumber}`}
                  subtitle={`Customer: ${activeQuote.customerName} • Status: ${activeQuote.stage}`}
                  action={
                    activeQuote.stage !== 'Completed' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkShipped(activeQuote.id)}
                      >
                        <Truck className="w-4 h-4 mr-1" /> Mark Dispatched & Shipped
                      </Button>
                    ) : (
                      <Badge variant="green" dot>Fulfilled</Badge>
                    )
                  }
                />
                <CardBody className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3">Warehouse Hub</th>
                          <th className="py-2.5 px-3">Allocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {activeQuote.lines.map((line, idx) => (
                          <tr key={line.id}>
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {line.productName}
                            </td>
                            <td className="py-3 px-3 text-slate-500">{line.category}</td>
                            <td className="py-3 px-3 text-center font-bold text-slate-800">
                              {line.quantity}
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              {line.category === 'Subscriptions'
                                ? 'Digital Cloud Provisioning'
                                : idx % 2 === 0
                                ? 'Main Warehouse (Bangalore)'
                                : 'East Depot (Kolkata)'}
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="teal" dot>
                                {line.category === 'Subscriptions' ? 'Instant Provisioned' : 'Stock Allocated'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-600">
                    <p className="font-semibold text-slate-800">Logistics Routing Summary</p>
                    <p>Standard delivery priority selected. Warehouse stock held and reserved for order dispatch.</p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                Select an order to view warehouse allocations.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
