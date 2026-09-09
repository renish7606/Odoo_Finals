import type {
  Quotation,
  QuotationLine,
  DiscountRule,
  CustomerTier,
  ProductCategory,
  RiskLevel,
  Product,
  Customer,
  Warehouse,
} from '../types';

export interface LineRisk {
  productId: string;
  productName: string;
  category: ProductCategory;
  allowedDiscount: number;
  appliedDiscount: number;
  status: 'OK' | 'EXCEEDS LIMIT';
}

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  discountExcess: number;
  financialImpact: number;
  violations: number;
  lineRisks: LineRisk[];
  explanation: string;
  approvalRequired: boolean;
  approvalLevel: 'none' | 'manager' | 'finance';
  violatedLines: number;
}

export function getCategoryMaxDiscount(category: ProductCategory, rules: DiscountRule[]): number {
  const rule = rules.find((r) => r.type === 'category' && r.name === category);
  return rule?.maxDiscount ?? 15;
}

export function getTierMaxDiscount(tier: CustomerTier, rules: DiscountRule[]): number {
  const rule = rules.find((r) => r.type === 'tier' && r.name === tier);
  return rule?.maxDiscount ?? 10;
}

export function calculateLineNet(line: QuotationLine): number {
  const gross = line.unitPrice * line.quantity;
  const discountAmount = gross * (line.discount / 100);
  return gross - discountAmount;
}

export function calculateLineMargin(line: QuotationLine): number {
  const net = calculateLineNet(line);
  const cost = line.cost * line.quantity;
  if (net === 0) return 0;
  return ((net - cost) / net) * 100;
}

export function calculateQuoteTotals(quote: Quotation): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  margin: number;
  marginPercent: number;
} {
  const lines = quote.lines;
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const lineDiscounts = lines.reduce((sum, l) => {
    const gross = l.unitPrice * l.quantity;
    return sum + gross * (l.discount / 100);
  }, 0);

  const orderDiscountAmount = (subtotal - lineDiscounts) * (quote.orderDiscount / 100);
  const discountAmount = lineDiscounts + orderDiscountAmount;

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = lines.reduce((sum, l) => {
    const gross = l.unitPrice * l.quantity;
    const lineDisc = gross * (l.discount / 100);
    const lineNet = gross - lineDisc - (gross - lineDisc) * (quote.orderDiscount / 100);
    return sum + lineNet * (l.tax / 100);
  }, 0);

  const total = afterDiscount + taxAmount;
  const totalCost = lines.reduce((sum, l) => sum + l.cost * l.quantity, 0);
  const margin = afterDiscount - totalCost;
  const marginPercent = afterDiscount > 0 ? (margin / afterDiscount) * 100 : 0;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    margin,
    marginPercent,
  };
}

export function analyzeRisk(quote: Quotation, rules: DiscountRule[]): RiskAnalysis {
  const tierMax = getTierMaxDiscount(quote.customerTier, rules);
  let violationCount = 0;
  let totalExcess = 0;
  const lineRisks: LineRisk[] = [];

  for (const line of quote.lines) {
    const categoryMax = getCategoryMaxDiscount(line.category, rules);
    const allowed = Math.min(categoryMax, tierMax);
    const applied = line.discount;
    const exceeded = applied > allowed;

    if (exceeded) {
      violationCount++;
      totalExcess += applied - allowed;
    }

    lineRisks.push({
      productId: line.productId,
      productName: line.productName,
      category: line.category,
      allowedDiscount: allowed,
      appliedDiscount: applied,
      status: exceeded ? 'EXCEEDS LIMIT' : 'OK',
    });
  }

  const discountExcess = Math.min(100, violationCount > 0 ? 40 + (totalExcess / Math.max(1, quote.lines.length)) * 10 : Math.min(30, (quote.orderDiscount / Math.max(1, tierMax)) * 25));

  const totals = calculateQuoteTotals(quote);
  const marginPercent = totals.marginPercent;
  const financialImpact = Math.max(0, Math.min(100, (30 - marginPercent) / 30 * 100));

  const violationScore = Math.min(100, violationCount * 30);

  const score = Math.round(Math.min(100, discountExcess * 0.4 + financialImpact * 0.3 + violationScore * 0.3));

  let level: RiskLevel;
  if (score < 30) level = 'LOW';
  else if (score < 55) level = 'MODERATE';
  else if (score < 75) level = 'HIGH';
  else level = 'CRITICAL';

  const approvalRequired = violationCount > 0 || score >= 40 || quote.orderDiscount > tierMax;
  let approvalLevel: 'none' | 'manager' | 'finance' = 'none';
  if (score >= 70 || violationCount >= 2) {
    approvalLevel = 'finance';
  } else if (approvalRequired) {
    approvalLevel = 'manager';
  }

  const explanations: string[] = [];
  for (const lr of lineRisks) {
    if (lr.status === 'EXCEEDS LIMIT') {
      explanations.push(
        `${lr.productName} discount exceeds the configured ${lr.category.toLowerCase()} limit by ${(lr.appliedDiscount - lr.allowedDiscount).toFixed(0)} percentage points.`
      );
    }
  }
  if (quote.orderDiscount > tierMax) {
    explanations.push(`Order-level discount of ${quote.orderDiscount}% exceeds the ${quote.customerTier} tier limit of ${tierMax}%.`);
  }
  if (marginPercent < 15) {
    explanations.push(`Overall margin of ${marginPercent.toFixed(1)}% is below the 15% threshold.`);
  }

  return {
    score,
    level,
    discountExcess: Math.round(discountExcess),
    financialImpact: Math.round(financialImpact),
    violations: violationScore,
    lineRisks,
    explanation: explanations.join(' ') || 'No discount violations detected. All line items are within configured limits.',
    approvalRequired,
    approvalLevel,
    violatedLines: violationCount,
  };
}

export function getRecommendedUpsells(quote: Quotation, products: Product[], upsellRules: { productId: string; recommendedProductId: string; productName: string; recommendedProductName: string; priority: number; promotion: string; minimumMargin: number }[]): Product[] {
  const quoteProductIds = new Set(quote.lines.map((l) => l.productId));
  const recommendations: Product[] = [];

  for (const rule of upsellRules) {
    if (quoteProductIds.has(rule.productId)) {
      const product = products.find((p) => p.id === rule.recommendedProductId);
      if (product && !quoteProductIds.has(product.id)) {
        recommendations.push(product);
      }
    }
  }

  return recommendations.slice(0, 4);
}

export function calculateUpsellMarginDelta(product: Product, quote: Quotation): number {
  const totals = calculateQuoteTotals(quote);
  const currentMargin = totals.marginPercent;
  const newRevenue = totals.subtotal - totals.discountAmount + product.price;
  const newCost = quote.lines.reduce((sum, l) => sum + l.cost * l.quantity, 0) + product.cost;
  const newMargin = ((newRevenue - newCost) / newRevenue) * 100;
  return newMargin - currentMargin;
}

export function recommendWarehouseSplit(
  requiredQty: number,
  warehouses: Warehouse[]
): { warehouseId: string; warehouseName: string; available: number; allocated: number; shippingCost: number; status: 'allocated' | 'backorder' | 'pending' }[] {
  const activeWarehouses = warehouses.filter((w) => w.status === 'active' && w.stock > 0);
  activeWarehouses.sort((a, b) => a.shippingCostWeight - b.shippingCostWeight);

  let remaining = requiredQty;
  const allocations: { warehouseId: string; warehouseName: string; available: number; allocated: number; shippingCost: number; status: 'allocated' | 'backorder' | 'pending' }[] = [];

  for (const wh of activeWarehouses) {
    if (remaining <= 0) {
      allocations.push({
        warehouseId: wh.id,
        warehouseName: wh.name,
        available: wh.stock,
        allocated: 0,
        shippingCost: 0,
        status: 'pending',
      });
      continue;
    }
    const allocate = Math.min(remaining, wh.stock);
    allocations.push({
      warehouseId: wh.id,
      warehouseName: wh.name,
      available: wh.stock,
      allocated: allocate,
      shippingCost: allocate * wh.shippingCostWeight * 10,
      status: allocate < remaining ? 'allocated' : 'allocated',
    });
    remaining -= allocate;
  }

  return allocations;
}

export function calculateProration(
  planAmount: number,
  billingCycle: 'monthly' | 'quarterly' | 'yearly',
  startDate: string,
  cancelDate: string
): { used: number; remaining: number; credit: number } {
  const start = new Date(startDate);
  const cancel = new Date(cancelDate);
  const totalDays =
    billingCycle === 'monthly' ? 30 : billingCycle === 'quarterly' ? 90 : 365;
  const usedDays = Math.max(0, Math.min(totalDays, Math.ceil((cancel.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
  const remainingDays = totalDays - usedDays;
  const used = Math.round((planAmount / totalDays) * usedDays);
  const remaining = Math.round((planAmount / totalDays) * remainingDays);
  return { used, remaining, credit: remaining };
}

export function getMarginColor(marginPercent: number): string {
  if (marginPercent >= 25) return 'text-teal-700';
  if (marginPercent >= 15) return 'text-amber-600';
  return 'text-red-600';
}

export function getMarginBg(marginPercent: number): string {
  if (marginPercent >= 25) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (marginPercent >= 15) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'LOW':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'MODERATE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

export function getRiskScoreColor(score: number): string {
  if (score < 30) return 'text-teal-600';
  if (score < 55) return 'text-amber-600';
  if (score < 75) return 'text-orange-600';
  return 'text-red-600';
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'Draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Pending Approval':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Approved':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Negotiation':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Confirmed':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Fulfillment':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Completed':
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'Rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStageDotColor(stage: string): string {
  switch (stage) {
    case 'Draft':
      return 'bg-slate-400';
    case 'Pending Approval':
      return 'bg-amber-400';
    case 'Approved':
      return 'bg-teal-500';
    case 'Negotiation':
      return 'bg-blue-400';
    case 'Confirmed':
      return 'bg-teal-500';
    case 'Fulfillment':
      return 'bg-indigo-400';
    case 'Completed':
      return 'bg-teal-600';
    case 'Rejected':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

export function requiresApprovalTransition(from: string, to: string): boolean {
  const approvalStages = ['Approved', 'Negotiation', 'Confirmed', 'Fulfillment'];
  if (from === 'Pending Approval') return false;
  return approvalStages.includes(to) && from !== 'Approved';
}

export function getCustomersForTier(tier: CustomerTier, customers: Customer[]): Customer[] {
  return customers.filter((c) => c.tier === tier);
}
