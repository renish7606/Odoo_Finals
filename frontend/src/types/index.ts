export type UserRole = 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE_OPS' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatarColor: string;
  customerId?: string;
}

export type ProductCategory = 'Hardware' | 'Services' | 'Subscriptions';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  price: number;
  unit: string;
  tax: number;
  stock: number;
  status: 'active' | 'inactive';
  cost: number;
  variants: ProductVariant[];
  recurring?: boolean;
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
}

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  tier: CustomerTier;
  address: string;
  city: string;
  country: string;
  createdAt: string;
}

export type QuotationStage =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Negotiation'
  | 'Confirmed'
  | 'Fulfillment'
  | 'Completed'
  | 'Rejected';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface QuotationLine {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  cost: number;
  discount: number;
  tax: number;
  recurring: boolean;
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  lineStatus?: 'OK' | 'EXCEEDS LIMIT';
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerTier: CustomerTier;
  salesRepId: string;
  salesRepName: string;
  stage: QuotationStage;
  lines: QuotationLine[];
  orderDiscount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  margin: number;
  marginPercent: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: {
    discountExcess: number;
    financialImpact: number;
    violations: number;
  };
  approvalLevel: 'none' | 'manager' | 'finance';
  approvalChain: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
  expirationDate: string;
  notes: string;
  internalNotes: string;
  negotiations: NegotiationMessage[];
  fulfillmentStatus?: 'pending' | 'allocated' | 'partial' | 'shipped' | 'delivered';
  orderId?: string;
}

export interface ApprovalStep {
  id: string;
  level: 'Sales Rep' | 'Sales Manager' | 'Finance';
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  action: string;
  timestamp: string;
  reason?: string;
}

export interface NegotiationMessage {
  id: string;
  from: 'sales_rep' | 'customer';
  authorName: string;
  message: string;
  type: 'comment' | 'change_request' | 'counter_discount' | 'confirmation';
  lineId?: string;
  requestedDiscount?: number;
  timestamp: string;
  status: 'sent' | 'under_review' | 'accepted' | 'rejected';
}

export interface AuditEntry {
  id: string;
  entityId: string;
  entityType: 'quotation' | 'order' | 'subscription' | 'invoice';
  user: string;
  action: string;
  timestamp: string;
  reason?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  stock: number;
  shippingCostWeight: number;
  replenishmentRule: string;
  status: 'active' | 'inactive';
}

export interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  available: number;
  allocated: number;
  shippingCost: number;
  status: 'allocated' | 'backorder' | 'pending';
}

export interface PriceListEntry {
  id: string;
  productId: string;
  productName: string;
  basePrice: number;
  bronzePrice: number;
  silverPrice: number;
  goldPrice: number;
  currency: string;
  active: boolean;
}

export interface DiscountRule {
  id: string;
  type: 'tier' | 'category';
  name: string;
  maxDiscount: number;
  approvalThreshold: number;
  approvalRoute: 'none' | 'manager' | 'finance';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingFrequency: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  prorationRule: string;
  cancellationRule: string;
  refundRule: string;
  status: 'active' | 'inactive';
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  nextBilling: string;
  status: 'Active' | 'Trial' | 'Past Due' | 'Cancellation Scheduled' | 'Cancelled';
  quotationId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: 'one_time' | 'recurring' | 'mixed';
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid' | 'Cancelled';
  items: InvoiceLine[];
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod?: string;
  paymentDate?: string;
  quotationId?: string;
  subscriptionId?: string;
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'one_time' | 'recurring';
  recurringAmount?: number;
  billingCycle?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  method: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  date: string;
  status: 'Applied' | 'Pending' | 'Cancelled';
  subscriptionId?: string;
}

export interface UpsellRule {
  id: string;
  productId: string;
  productName: string;
  recommendedProductId: string;
  recommendedProductName: string;
  priority: number;
  promotion: string;
  minimumMargin: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'customer' | 'inventory' | 'billing' | 'deal_health' | 'info';
  read: boolean;
  timestamp: string;
  link?: string;
}
