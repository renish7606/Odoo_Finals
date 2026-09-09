import type {
  User,
  Product,
  Customer,
  Warehouse,
  Quotation,
  SubscriptionPlan,
  Subscription,
  Invoice,
  Payment,
  CreditNote,
  UpsellRule,
  DiscountRule,
  PriceListEntry,
  Notification,
  AuditEntry,
} from '../types';
import {
  mockUsers,
  mockProducts,
  mockCustomers,
  mockWarehouses,
  mockQuotations,
  mockSubscriptions,
  mockInvoices,
  mockPayments,
  mockCreditNotes,
  mockUpsellRules,
  mockDiscountRules,
  mockPriceLists,
  mockSubscriptionPlans,
  mockNotifications,
  mockAuditTrail,
} from '../data/mockData';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, _password: string): Promise<User | null> {
    await delay(200);
    return mockUsers.find((u) => u.email === email) ?? null;
  },
  async loginAsRole(role: User['role']): Promise<User | null> {
    await delay(150);
    return mockUsers.find((u) => u.role === role) ?? null;
  },
  async signup(name: string, email: string): Promise<User> {
    await delay(300);
    return { id: `u-${Date.now()}`, name, email, role: 'SALES_REP', tenantId: 't-1', avatarColor: '#14B8A6' };
  },
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    await delay();
    return [...mockProducts];
  },
  async getProduct(id: string): Promise<Product | null> {
    await delay(150);
    return mockProducts.find((p) => p.id === id) ?? null;
  },
  async createProduct(data: Partial<Product>): Promise<Product> {
    await delay(300);
    return { ...data, id: `p-${Date.now()}` } as Product;
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(300);
    const product = mockProducts.find((p) => p.id === id);
    return { ...product, ...data, id } as Product;
  },
  async deleteProduct(id: string): Promise<void> {
    await delay(200);
  },
};

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    await delay();
    return [...mockCustomers];
  },
  async getCustomer(id: string): Promise<Customer | null> {
    await delay(150);
    return mockCustomers.find((c) => c.id === id) ?? null;
  },
};

export const quotationService = {
  async getQuotes(): Promise<Quotation[]> {
    await delay();
    return [...mockQuotations];
  },
  async getQuote(id: string): Promise<Quotation | null> {
    await delay(150);
    return mockQuotations.find((q) => q.id === id) ?? null;
  },
  async createQuote(data: Partial<Quotation>): Promise<Quotation> {
    await delay(300);
    return { ...data, id: `q-${Date.now()}` } as Quotation;
  },
  async updateQuote(id: string, data: Partial<Quotation>): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, ...data, id, updatedAt: new Date().toISOString() } as Quotation;
  },
  async submitQuote(id: string): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, id, stage: 'Pending Approval', updatedAt: new Date().toISOString() } as Quotation;
  },
  async deleteQuote(id: string): Promise<void> {
    await delay(200);
  },
  async duplicateQuote(id: string): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, id: `q-${Date.now()}`, quoteNumber: `Q-${Date.now()}`, stage: 'Draft' } as Quotation;
  },
};

export const approvalService = {
  async getPendingApprovals(): Promise<Quotation[]> {
    await delay();
    return mockQuotations.filter((q) => q.stage === 'Pending Approval');
  },
  async approveQuote(id: string, approverName: string, _reason?: string): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, id, stage: 'Approved', updatedAt: new Date().toISOString() } as Quotation;
  },
  async rejectQuote(id: string, approverName: string, reason: string): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, id, stage: 'Rejected', updatedAt: new Date().toISOString() } as Quotation;
  },
  async returnQuote(id: string, approverName: string, reason: string): Promise<Quotation> {
    await delay(300);
    const quote = mockQuotations.find((q) => q.id === id);
    return { ...quote, id, stage: 'Draft', updatedAt: new Date().toISOString() } as Quotation;
  },
};

export const inventoryService = {
  async getWarehouses(): Promise<Warehouse[]> {
    await delay();
    return [...mockWarehouses];
  },
  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    await delay(300);
    return { ...data, id: `w-${Date.now()}` } as Warehouse;
  },
  async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    await delay(300);
    const wh = mockWarehouses.find((w) => w.id === id);
    return { ...wh, ...data, id } as Warehouse;
  },
  async deleteWarehouse(id: string): Promise<void> {
    await delay(200);
  },
};

export const subscriptionService = {
  async getSubscriptions(): Promise<Subscription[]> {
    await delay();
    return [...mockSubscriptions];
  },
  async getSubscription(id: string): Promise<Subscription | null> {
    await delay(150);
    return mockSubscriptions.find((s) => s.id === id) ?? null;
  },
  async cancelSubscription(id: string, mode: string, reason: string): Promise<Subscription> {
    await delay(300);
    const sub = mockSubscriptions.find((s) => s.id === id);
    return { ...sub, id, status: mode === 'immediate' ? 'Cancelled' : 'Cancellation Scheduled' } as Subscription;
  },
  async getPlans(): Promise<SubscriptionPlan[]> {
    await delay();
    return [...mockSubscriptionPlans];
  },
};

export const billingService = {
  async getInvoices(): Promise<Invoice[]> {
    await delay();
    return [...mockInvoices];
  },
  async getInvoice(id: string): Promise<Invoice | null> {
    await delay(150);
    return mockInvoices.find((i) => i.id === id) ?? null;
  },
  async recordPayment(invoiceId: string, amount: number, method: string): Promise<Payment> {
    await delay(300);
    return {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-${Date.now()}`,
      invoiceId,
      invoiceNumber: 'INV-1001',
      customerName: 'Acme Corporation',
      amount,
      method,
      date: new Date().toISOString(),
      status: 'Completed',
    };
  },
  async getPayments(): Promise<Payment[]> {
    await delay();
    return [...mockPayments];
  },
  async getCreditNotes(): Promise<CreditNote[]> {
    await delay();
    return [...mockCreditNotes];
  },
};

export const reportService = {
  async getReportData(filters: Record<string, unknown>): Promise<Record<string, unknown>> {
    await delay(400);
    return { filters, generatedAt: new Date().toISOString() };
  },
};

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay();
    return mockNotifications.filter((n) => n.userId === userId);
  },
  async markAsRead(id: string): Promise<void> {
    await delay(100);
  },
};

export const configService = {
  async getDiscountRules(): Promise<DiscountRule[]> {
    await delay();
    return [...mockDiscountRules];
  },
  async updateDiscountRule(id: string, data: Partial<DiscountRule>): Promise<DiscountRule> {
    await delay(300);
    const rule = mockDiscountRules.find((r) => r.id === id);
    return { ...rule, ...data, id } as DiscountRule;
  },
  async getPriceLists(): Promise<PriceListEntry[]> {
    await delay();
    return [...mockPriceLists];
  },
  async getUpsellRules(): Promise<UpsellRule[]> {
    await delay();
    return [...mockUpsellRules];
  },
  async getAuditTrail(entityId: string): Promise<AuditEntry[]> {
    await delay(200);
    return mockAuditTrail.filter((a) => a.entityId === entityId);
  },
};
