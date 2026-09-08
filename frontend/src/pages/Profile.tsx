import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Shield, Save, LogOut } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Avatar } from '../components/ui';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function Profile() {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('789 Innovation Hub, Tech Valley');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      user.name = name;
      localStorage.setItem('dealflow360_auth', JSON.stringify(user));
    }
    showSuccess('Profile information updated successfully');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout
      title="User Account & Profile"
      breadcrumb={[{ label: 'Home' }, { label: 'Profile' }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || 'User'} color={user?.avatarColor} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="teal">{user?.role.replace('_', ' ')}</Badge>
                <span className="text-[11px] text-slate-400">Tenant: {user?.tenantId}</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>

        {/* Profile Settings Form */}
        <Card>
          <CardHeader
            title="Personal Details"
            subtitle="Manage your contact info and preferred address"
          />
          <CardBody>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Office / Shipping Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button type="submit" variant="primary" size="sm">
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
