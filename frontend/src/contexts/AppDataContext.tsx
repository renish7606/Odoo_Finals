import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Quotation,
  Subscription,
  Invoice,
  Payment,
  CreditNote,
  Notification,
  AuditEntry,
  DiscountRule,
  Product,
  Customer,
  Warehouse,
  PriceListEntry,
  SubscriptionPlan,
  UpsellRule,
  QuotationLine,
  ApprovalStep,
  NegotiationMessage,
} from '../types';
import {
  mockQuotations,
  mockSubscriptions,
  mockInvoices,
  mockPayments,
  mockCreditNotes,
  mockNotifications,
  mockAuditTrail,
  mockDiscountRules,
  mockProducts,
  mockCustomers,
  mockWarehouses,
  mockPriceLists,
  mockSubscriptionPlans,
  mockUpsellRules,
} from '../data/mockData';
import { analyzeRisk, calculateQuoteTotals } from '../utils/billing';
import { generateId } from '../utils/format';

interface AppDataContextValue {
  quotations: Quotation[];
  products: Product[];
  customers: Customer[];
  warehouses: Warehouse[];
  discountRules: DiscountRule[];
  priceLists: PriceListEntry[];
  subscriptionPlans: SubscriptionPlan[];
  upsellRules: UpsellRule[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  creditNotes: CreditNote[];
  notifications: Notification[];
  auditTrail: AuditEntry[];

  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  createQuotation: (quote: Quotation) => void;
  deleteQuotation: (id: string) => void;
  recalculateQuotation: (quote: Quotation) => Quotation;

  approveQuotation: (id: string, approverName: string, reason?: string) => void;
  rejectQuotation: (id: string, approverName: string, reason: string) => void;
  returnQuotation: (id: string, approverName: string, reason: string) => void;
  submitQuotation: (id: string, repName: string) => void;

  updateQuotationStage: (id: string, stage: Quotation['stage']) => void;

  addNegotiationMessage: (quoteId: string, msg: NegotiationMessage) => void;
  applyCustomerCounterDiscount: (quoteId: string, lineId: string, requestedDiscount: number, customerName: string) => void;
  confirmQuotation: (id: string) => void;

  cancelSubscription: (id: string, mode: 'immediate' | 'end_of_period', reason: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: string) => void;

  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addAuditEntry: (e: Omit<AuditEntry, 'id' | 'timestamp'>) => void;

  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  addWarehouse: (w: Warehouse) => void;
  deleteWarehouse: (id: string) => void;

  updateDiscountRule: (id: string, updates: Partial<DiscountRule>) => void;
  updatePriceList: (id: string, updates: Partial<PriceListEntry>) => void;
  updateSubscriptionPlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  updateUpsellRule: (id: string, updates: Partial<UpsellRule>) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [products] = useState<Product[]>(mockProducts);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(mockDiscountRules);
  const [priceLists, setPriceLists] = useState<PriceListEntry[]>(mockPriceLists);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
  const [upsellRules, setUpsellRules] = useState<UpsellRule[]>(mockUpsellRules);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(mockCreditNotes);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(mockAuditTrail);

  const addAuditEntry = useCallback((e: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    setAuditTrail((prev) => [...prev, { ...e, id: generateId('at'), timestamp: new Date().toISOString() }]);
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => [...prev, { ...n, id: generateId('n'), timestamp: new Date().toISOString(), read: false }]);
  }, []);

  const recalculateQuotation = useCallback((quote: Quotation): Quotation => {
    const totals = calculateQuoteTotals(quote);
    const risk = analyzeRisk(quote, discountRules);
    return {
      ...quote,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      margin: totals.margin,
      marginPercent: totals.marginPercent,
      riskScore: risk.score,
      riskLevel: risk.level,
      riskBreakdown: {
        discountExcess: risk.discountExcess,
        financialImpact: risk.financialImpact,
        violations: risk.violations,
      },
      approvalLevel: risk.approvalLevel,
      lines: quote.lines.map((l) => {
        const lr = risk.lineRisks.find((r) => r.productId === l.productId);
        return { ...l, lineStatus: lr?.status || 'OK' };
      }),
    };
  }, [discountRules]);

  const updateQuotation = useCallback((id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q)));
  }, []);

  const createQuotation = useCallback((quote: Quotation) => {
    setQuotations((prev) => [...prev, quote]);
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const submitQuotation = useCallback((id: string, repName: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const recalculated = calculateQuoteTotals(q);
        const risk = analyzeRisk(q, discountRules);
        const stage = risk.approvalRequired ? 'Pending Approval' : 'Approved';
        const approvalChain: ApprovalStep[] = [
          { id: generateId('a'), level: 'Sales Rep', approverName: repName, status: 'approved', action: 'Submitted', timestamp: new Date().toISOString() },
          { id: generateId('a'), level: 'Sales Manager', status: risk.approvalRequired ? 'pending' : 'approved', action: risk.approvalRequired ? 'Pending' : 'Auto-Approved', timestamp: risk.approvalRequired ? '' : new Date().toISOString() },
        ];
        if (risk.approvalLevel === 'finance') {
          approvalChain.push({ id: generateId('a'), level: 'Finance', status: 'pending', action: 'Pending', timestamp: '' });
        }
        return {
          ...q,
          stage,
          subtotal: recalculated.subtotal,
          discountAmount: recalculated.discountAmount,
          taxAmount: recalculated.taxAmount,
          total: recalculated.total,
          margin: recalculated.margin,
          marginPercent: recalculated.marginPercent,
          riskScore: risk.score,
          riskLevel: risk.level,
          riskBreakdown: { discountExcess: risk.discountExcess, financialImpact: risk.financialImpact, violations: risk.violations },
          approvalLevel: risk.approvalLevel,
          approvalChain,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditEntry({ entityId: id, entityType: 'quotation', user: repName, action: 'Submitted for Approval' });
  }, [discountRules, addAuditEntry]);

  const approveQuotation = useCallback((id: string, approverName: string, _reason?: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updatedChain = q.approvalChain.map((step) => {
          if (step.status === 'pending') {
            return { ...step, status: 'approved' as const, action: 'Approved', approverName, timestamp: new Date().toISOString() };
          }
          return step;
        });
        const hasPending = updatedChain.some((s) => s.status === 'pending');
        return {
          ...q,
          stage: hasPending ? 'Pending Approval' : 'Approved',
          approvalChain: updatedChain,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditEntry({ entityId: id, entityType: 'quotation', user: approverName, action: 'Approved' });
    addNotification({ userId: 'u-alex', title: `Quote approved`, message: `${id} has been approved by ${approverName}`, type: 'approval', link: `/quotations/${id}` });
  }, [addAuditEntry, addNotification]);

  const rejectQuotation = useCallback((id: string, approverName: string, reason: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updatedChain = q.approvalChain.map((step) => {
          if (step.status === 'pending') {
            return { ...step, status: 'rejected' as const, action: 'Rejected', approverName, reason, timestamp: new Date().toISOString() };
          }
          return step;
        });
        return { ...q, stage: 'Rejected', approvalChain: updatedChain, updatedAt: new Date().toISOString() };
      })
    );
    addAuditEntry({ entityId: id, entityType: 'quotation', user: approverName, action: 'Rejected', reason });
    addNotification({ userId: 'u-alex', title: 'Quote rejected', message: `${id} was rejected by ${approverName}: ${reason}`, type: 'approval', link: `/quotations/${id}` });
  }, [addAuditEntry, addNotification]);

  const returnQuotation = useCallback((id: string, approverName: string, reason: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updatedChain = q.approvalChain.map((step) => {
          if (step.status === 'pending') {
            return { ...step, status: 'returned' as const, action: 'Returned for Revision', approverName, reason, timestamp: new Date().toISOString() };
          }
          return step;
        });
        return { ...q, stage: 'Draft', approvalChain: updatedChain, updatedAt: new Date().toISOString() };
      })
    );
    addAuditEntry({ entityId: id, entityType: 'quotation', user: approverName, action: 'Returned for Revision', reason });
    addNotification({ userId: 'u-alex', title: 'Quote returned for revision', message: `${id} was returned by ${approverName}: ${reason}`, type: 'approval', link: `/quotations/${id}` });
  }, [addAuditEntry, addNotification]);

  const updateQuotationStage = useCallback((id: string, stage: Quotation['stage']) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, stage, updatedAt: new Date().toISOString() } : q)));
    addAuditEntry({ entityId: id, entityType: 'quotation', user: 'System', action: `Stage changed to ${stage}` });
  }, [addAuditEntry]);

  const addNegotiationMessage = useCallback((quoteId: string, msg: NegotiationMessage) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updatedQ = { ...q, negotiations: [...q.negotiations, msg] };
        if (msg.type === 'counter_discount' && q.stage === 'Approved') {
          return { ...updatedQ, stage: 'Negotiation' };
        }
        return updatedQ;
      })
    );
    addAuditEntry({ entityId: quoteId, entityType: 'quotation', user: msg.authorName, action: `Negotiation: ${msg.message.substring(0, 50)}` });
  }, [addAuditEntry]);

  const applyCustomerCounterDiscount = useCallback((quoteId: string, lineId: string, requestedDiscount: number, customerName: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updatedLines = q.lines.map((l) => (l.id === lineId ? { ...l, discount: requestedDiscount } : l));
        const updatedQuote = { ...q, lines: updatedLines, stage: 'Negotiation' as const };
        const recalculated = calculateQuoteTotals(updatedQuote);
        const risk = analyzeRisk(updatedQuote, discountRules);
        const needsReapproval = risk.approvalRequired;
        return {
          ...updatedQuote,
          subtotal: recalculated.subtotal,
          discountAmount: recalculated.discountAmount,
          taxAmount: recalculated.taxAmount,
          total: recalculated.total,
          margin: recalculated.margin,
          marginPercent: recalculated.marginPercent,
          riskScore: risk.score,
          riskLevel: risk.level,
          riskBreakdown: { discountExcess: risk.discountExcess, financialImpact: risk.financialImpact, violations: risk.violations },
          approvalLevel: risk.approvalLevel,
          stage: needsReapproval ? 'Pending Approval' : 'Negotiation',
          approvalChain: needsReapproval
            ? [...q.approvalChain, { id: generateId('a'), level: 'Sales Manager' as const, status: 'pending' as const, action: 'Pending', timestamp: '' }]
            : q.approvalChain,
        };
      })
    );
    addAuditEntry({ entityId: quoteId, entityType: 'quotation', user: customerName, action: `Customer requested ${requestedDiscount}% discount` });
    addNotification({ userId: 'u-sarah', title: 'Customer counter-offer requires approval', message: `${quoteId} customer requested new discount terms`, type: 'customer', link: '/approvals' });
  }, [discountRules, addAuditEntry, addNotification]);

  const confirmQuotation = useCallback((id: string) => {
    const orderId = `ORD-${1000 + quotations.length + 1}`;
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, stage: 'Confirmed', fulfillmentStatus: 'pending', orderId, updatedAt: new Date().toISOString() } : q))
    );
    addAuditEntry({ entityId: id, entityType: 'quotation', user: 'Customer', action: 'Customer Confirmed Quotation' });
    addAuditEntry({ entityId: id, entityType: 'order', user: 'System', action: `Order Created: ${orderId}` });
    addNotification({ userId: 'u-alex', title: 'Quote confirmed by customer', message: `${id} has been confirmed. Order ${orderId} created.`, type: 'info', link: '/fulfillment' });
  }, [quotations.length, addAuditEntry, addNotification]);

  const cancelSubscription = useCallback((id: string, mode: 'immediate' | 'end_of_period', reason: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: mode === 'immediate' ? 'Cancelled' : 'Cancellation Scheduled' } : s))
    );
    if (sub) {
      const cn: CreditNote = {
        id: generateId('cn'),
        creditNoteNumber: `CN-${1000 + creditNotes.length + 1}`,
        customerId: sub.customerId,
        customerName: sub.customerName,
        amount: sub.amount,
        reason: `Subscription cancellation: ${reason}`,
        date: new Date().toISOString(),
        status: 'Applied',
        subscriptionId: sub.id,
      };
      setCreditNotes((prev) => [...prev, cn]);
      addAuditEntry({ entityId: id, entityType: 'subscription', user: 'System', action: `Subscription ${mode === 'immediate' ? 'cancelled immediately' : 'cancellation scheduled'}: ${reason}` });
      addNotification({ userId: 'u-mike', title: 'Credit note generated', message: `${cn.creditNoteNumber} for ${sub.customerName} - ₹${cn.amount.toLocaleString('en-IN')}`, type: 'billing', link: '/billing' });
    }
  }, [subscriptions, creditNotes.length, addAuditEntry, addNotification]);

  const recordPayment = useCallback((invoiceId: string, amount: number, method: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;
    const payment: Payment = {
      id: generateId('pay'),
      paymentNumber: `PAY-${1000 + payments.length + 1}`,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      amount,
      method,
      date: new Date().toISOString(),
      status: 'Completed',
    };
    setPayments((prev) => [...prev, payment]);
    const newStatus = amount >= invoice.total ? 'Paid' : 'Partially Paid';
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus as Invoice['status'], paymentMethod: method, paymentDate: new Date().toISOString() } : i)));
    addAuditEntry({ entityId: invoiceId, entityType: 'invoice', user: 'System', action: `Payment Recorded: ₹${amount.toLocaleString('en-IN')} via ${method}` });
    addNotification({ userId: 'u-mike', title: 'Payment recorded', message: `${payment.paymentNumber} for ${invoice.invoiceNumber} - ₹${amount.toLocaleString('en-IN')}`, type: 'billing', link: '/billing' });
  }, [invoices, payments.length, addAuditEntry, addNotification]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    // products is read-only in mock, but we acknowledge the call
    void id; void updates;
  }, []);

  const addProduct = useCallback((_p: Product) => {
    // mock - no-op
  }, []);

  const deleteProduct = useCallback((_id: string) => {
    // mock - no-op
  }, []);

  const updateWarehouse = useCallback((id: string, updates: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const addWarehouse = useCallback((w: Warehouse) => {
    setWarehouses((prev) => [...prev, w]);
  }, []);

  const deleteWarehouse = useCallback((id: string) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateDiscountRule = useCallback((id: string, updates: Partial<DiscountRule>) => {
    setDiscountRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const updatePriceList = useCallback((id: string, updates: Partial<PriceListEntry>) => {
    setPriceLists((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const updateSubscriptionPlan = useCallback((id: string, updates: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const updateUpsellRule = useCallback((id: string, updates: Partial<UpsellRule>) => {
    setUpsellRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        quotations,
        products,
        customers,
        warehouses,
        discountRules,
        priceLists,
        subscriptionPlans,
        upsellRules,
        subscriptions,
        invoices,
        payments,
        creditNotes,
        notifications,
        auditTrail,
        updateQuotation,
        createQuotation,
        deleteQuotation,
        recalculateQuotation,
        approveQuotation,
        rejectQuotation,
        returnQuotation,
        submitQuotation,
        updateQuotationStage,
        addNegotiationMessage,
        applyCustomerCounterDiscount,
        confirmQuotation,
        cancelSubscription,
        recordPayment,
        markNotificationRead,
        addNotification,
        addAuditEntry,
        updateProduct,
        addProduct,
        deleteProduct,
        updateWarehouse,
        addWarehouse,
        deleteWarehouse,
        updateDiscountRule,
        updatePriceList,
        updateSubscriptionPlan,
        updateUpsellRule,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
