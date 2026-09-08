import { useState } from 'react';
import { Warehouse as WarehouseIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import { generateId } from '../../utils/format';
import type { Warehouse } from '../../types';

export function AdminWarehouses() {
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useAppData();
  const { showSuccess, showError } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [stock, setStock] = useState(20);
  const [weight, setWeight] = useState(1.0);
  const [replenish, setReplenish] = useState('');

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setLocation('');
    setStock(20);
    setWeight(1.0);
    setReplenish('Min 5 units, reorder at 10');
    setModalOpen(true);
  };

  const handleOpenEdit = (w: Warehouse) => {
    setEditId(w.id);
    setName(w.name);
    setLocation(w.location);
    setStock(w.stock);
    setWeight(w.shippingCostWeight);
    setReplenish(w.replenishmentRule);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !location.trim()) {
      showError('Please provide warehouse name and location');
      return;
    }

    if (editId) {
      updateWarehouse(editId, {
        name,
        location,
        stock: Number(stock),
        shippingCostWeight: Number(weight),
        replenishmentRule: replenish,
      });
      showSuccess(`Updated warehouse ${name}`);
    } else {
      const newWh: Warehouse = {
        id: generateId('wh'),
        name,
        location,
        stock: Number(stock),
        shippingCostWeight: Number(weight),
        replenishmentRule: replenish,
        status: 'active',
      };
      addWarehouse(newWh);
      showSuccess(`Added warehouse ${name}`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, whName: string) => {
    if (window.confirm(`Delete warehouse ${whName}?`)) {
      deleteWarehouse(id);
      showSuccess(`Deleted warehouse ${whName}`);
    }
  };

  return (
    <AppLayout
      title="Warehouse & Logistics Hubs"
      breadcrumb={[{ label: 'Admin' }, { label: 'Warehouses' }]}
      actions={
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Warehouse
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <Card key={w.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{w.name}</h3>
                    <p className="text-xs text-slate-500">{w.location}</p>
                  </div>
                  <Badge variant="teal" dot>{w.status}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Stock Capacity:</span>
                    <strong className="text-slate-900">{w.stock} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight Factor:</span>
                    <strong>{w.shippingCostWeight}x</strong>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-400">
                    Policy: {w.replenishmentRule}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(w)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(w.id, w.name)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Warehouse' : 'New Warehouse'}
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Warehouse Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">City / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Stock Level</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Freight Weight Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Replenishment Rule</label>
            <input
              type="text"
              value={replenish}
              onChange={(e) => setReplenish(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Warehouse
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
