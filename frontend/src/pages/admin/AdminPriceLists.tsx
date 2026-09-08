import { useState } from 'react';
import { Tags, Plus, Search, Edit2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../../components/ui';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';
import type { PriceListEntry } from '../../types';

export function AdminPriceLists() {
  const { priceLists, updatePriceList } = useAppData();
  const { showSuccess } = useToast();

  const [editItem, setEditItem] = useState<PriceListEntry | null>(null);
  const [bronze, setBronze] = useState(0);
  const [silver, setSilver] = useState(0);
  const [gold, setGold] = useState(0);

  const handleOpenEdit = (pl: PriceListEntry) => {
    setEditItem(pl);
    setBronze(pl.bronzePrice);
    setSilver(pl.silverPrice);
    setGold(pl.goldPrice);
  };

  const handleSave = () => {
    if (!editItem) return;
    updatePriceList(editItem.id, {
      bronzePrice: Number(bronze),
      silverPrice: Number(silver),
      goldPrice: Number(gold),
    });
    showSuccess(`Updated price list for ${editItem.productName}`);
    setEditItem(null);
  };

  return (
    <AppLayout
      title="Customer Tier Price Lists"
      breadcrumb={[{ label: 'Admin' }, { label: 'Price Lists' }]}
    >
      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Tier-based Pricing Matrix"
            subtitle="Configured price per product unit across Bronze, Silver, and Gold account tiers"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Base MSRP</th>
                  <th className="py-3 px-4">Bronze Tier</th>
                  <th className="py-3 px-4">Silver Tier</th>
                  <th className="py-3 px-4">Gold Tier</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priceLists.map((pl) => (
                  <tr key={pl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{pl.productName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatCurrency(pl.basePrice)}</td>
                    <td className="py-3.5 px-4 font-medium text-amber-800">{formatCurrency(pl.bronzePrice)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{formatCurrency(pl.silverPrice)}</td>
                    <td className="py-3.5 px-4 font-bold text-teal-700">{formatCurrency(pl.goldPrice)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(pl)}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Tier Prices
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Adjust Tier Pricing: ${editItem?.productName}`}
        description="Override specific customer tier prices for this product"
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Bronze Price (₹)</label>
            <input
              type="number"
              value={bronze}
              onChange={(e) => setBronze(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Silver Price (₹)</label>
            <input
              type="number"
              value={silver}
              onChange={(e) => setSilver(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Gold Price (₹)</label>
            <input
              type="number"
              value={gold}
              onChange={(e) => setGold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Update Prices
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
