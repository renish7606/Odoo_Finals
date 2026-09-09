import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/AppDataContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Quotations } from './pages/Quotations';
import { QuotationDetail } from './pages/QuotationDetail';
import { Pipeline } from './pages/Pipeline';
import { Approvals } from './pages/Approvals';
import { Customers } from './pages/Customers';
import { Fulfillment } from './pages/Fulfillment';
import { Subscriptions } from './pages/Subscriptions';
import { Billing } from './pages/Billing';
import { DealHealth } from './pages/DealHealth';
import { Reports } from './pages/Reports';
import { CustomerPortal } from './pages/CustomerPortal';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { DiscountTiers } from './pages/DiscountTiers';

// Admin Pages
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminPriceLists } from './pages/admin/AdminPriceLists';
import { AdminDiscountRules } from './pages/admin/AdminDiscountRules';
import { AdminWarehouses } from './pages/admin/AdminWarehouses';
import { AdminSubscriptionPlans } from './pages/admin/AdminSubscriptionPlans';
import { AdminUpsellRules } from './pages/admin/AdminUpsellRules';
import { AdminSettings } from './pages/admin/AdminSettings';

function RootRedirect() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/portal" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              {/* Public & Authentication */}
              <Route path="/login" element={<Login />} />

              {/* Customer Accessible Pages */}
              <Route path="/portal" element={<CustomerPortal />} />
              <Route path="/portal/:id" element={<CustomerPortal />} />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Staff Navigation Bar Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute feature="dashboard" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotations"
                element={
                  <ProtectedRoute feature="quotation" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Quotations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotations/:id"
                element={
                  <ProtectedRoute feature="quotation" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <QuotationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute feature="approvals" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Approvals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discount-tiers"
                element={
                  <ProtectedRoute feature="discount_tier" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <DiscountTiers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute feature="subscriptions" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute feature="invoice" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deal-health"
                element={
                  <ProtectedRoute feature="deal_health" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <DealHealth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute feature="report" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute feature="product" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />

              {/* Additional Operations Routes */}
              <Route
                path="/pipeline"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
                    <Pipeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fulfillment"
                element={
                  <ProtectedRoute feature="fulfillment" allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE_OPS']}>
                    <Fulfillment />
                  </ProtectedRoute>
                }
              />

              {/* Administration Routes */}
              <Route
                path="/admin/price-lists"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminPriceLists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/discount-rules"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDiscountRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/warehouses"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminWarehouses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subscription-plans"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminSubscriptionPlans />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/upsell-rules"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUpsellRules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* Automatic Role-based Redirects */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
