import { useState } from 'react';
import { Search, Plus, Mail, Phone, MapPin, Building, User } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Modal, Card } from '../components/ui';
import { Badge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { generateId, formatDate } from '../utils/format';
import type { Customer, CustomerTier } from '../types';

export function Customers() {
  const { customers, quotations } = useAppData();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [addModal, setAddModal] = useState(false);

  // New Customer Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<CustomerTier>('Bronze');
  const [city, setCity] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComp = c.company.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      if (!matchComp && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const getTierVariant = (t: CustomerTier) => {
    switch (t) {
      case 'Gold': return 'amber';
      case 'Silver': return 'slate';
      case 'Bronze': return 'orange';
      default: return 'default';
    }
  };

  const handleAddCustomer = () => {
    if (!company || !name || !email) {
      showError('Please provide company, contact name, and email');
      return;
    }

    const newCust: Customer = {
      id: generateId('cust'),
      name,
      company,
      email,
      phone: phone || '+91 98000 00000',
      tier,
      address: 'Corporate Headquarters',
      city: city || 'Bangalore',
      country: 'India',
      createdAt: new Date().toISOString(),
    };

    customers.push(newCust); // mutated in place or updated in state
    setAddModal(false);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setCity('');
    showSuccess(`Added customer ${company}`);
  };

  return (
    <AppLayout
      title="Customers & Client Directory"
      breadcrumb={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Customers' }]}
      actions={
        <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Customer
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, contacts, emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Tiers</option>
              <option value="Gold">Gold Tier</option>
              <option value="Silver">Silver Tier</option>
              <option value="Bronze">Bronze Tier</option>
            </select>
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const custQuotes = quotations.filter((q) => q.customerId === cust.id);
            return (
              <div
                key={cust.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-teal-500 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{cust.company}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5" /> {cust.name}
                    </p>
                  </div>
                  <Badge variant={getTierVariant(cust.tier)} dot>
                    {cust.tier} Tier
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.city}, {cust.country}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{custQuotes.length} quotations on file</span>
                  <span className="text-[11px] text-slate-400">Since {formatDate(cust.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Customer"
        description="Register an account for quotation and order processing."
      >
        <div className="space-y-3 py-2 text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Nexus Enterprises"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-medium mb-1">Primary Contact Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@nexus.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Customer Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CustomerTier)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Bronze">Bronze (5% max disc)</option>
                <option value="Silver">Silver (10% max disc)</option>
                <option value="Gold">Gold (15% max disc)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCustomer}>
              Create Customer
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
