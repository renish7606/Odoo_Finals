import { useState } from 'react';
import { Box, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { useAppData } from '../../contexts/AppDataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, generateId } from '../../utils/format';
import type { Product, ProductCategory } from '../../types';

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Hardware');
  const [price, setPrice] = useState(10000);
  const [cost, setCost] = useState(7000);
  const [stock, setStock] = useState(10);
  const [tax, setTax] = useState(18);

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setCategory('Hardware');
    setPrice(10000);
    setCost(7000);
    setStock(10);
    setTax(18);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setTax(p.tax);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      showError('Please provide a product name');
      return;
    }

    if (editingId) {
      updateProduct(editingId, {
        name,
        sku,
        category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        tax: Number(tax),
      });
      showSuccess(`Updated ${name}`);
    } else {
      const newProd: Product = {
        id: generateId('p'),
        name,
        sku,
        category,
        description: `${name} standard catalog item`,
        price: Number(price),
        unit: category === 'Services' ? 'service' : 'unit',
        tax: Number(tax),
        stock: Number(stock),
        status: 'active',
        cost: Number(cost),
        variants: [],
      };
      addProduct(newProd);
      showSuccess(`Created product ${name}`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (window.confirm(`Delete product ${prodName}?`)) {
      deleteProduct(id);
      showSuccess(`Deleted product ${prodName}`);
    }
  };

  return (
    <AppLayout
      title="Product Catalog Management"
      breadcrumb={[{ label: 'Admin' }, { label: 'Products' }]}
      actions={
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Tax %</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <span className="text-xs text-slate-400 font-mono">{p.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="teal">{p.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(p.price)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="py-3 px-4 text-slate-600">{p.tax}%</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{p.stock}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Product' : 'Add New Product'}
        description="Configure product pricing, category, and inventory parameters"
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Hardware">Hardware</option>
                <option value="Services">Services</option>
                <option value="Subscriptions">Subscriptions</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Cost Price (₹)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Product
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
