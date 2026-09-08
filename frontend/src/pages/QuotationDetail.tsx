import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Check,
  X,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
  DollarSign,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate, formatDateTime, generateId } from '../utils/format';
import type { QuotationLine, Product, NegotiationMessage, QuotationStage } from '../types';

export function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const {
    quotations,
    products,
    updateQuotation,
    recalculateQuotation,
    approveQuotation,
    rejectQuotation,
    returnQuotation,
    submitQuotation,
    updateQuotationStage,
    addNegotiationMessage,
  } = useAppData();

  const quote = quotations.find((q) => q.id === id);

  const [addLineModal, setAddLineModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [lineQty, setLineQty] = useState(1);
  const [lineDiscount, setLineDiscount] = useState(0);

  const [messageText, setMessageText] = useState('');
  const [reasonModal, setReasonModal] = useState<{ open: boolean; action: 'reject' | 'return'; title: string }>({
    open: false,
    action: 'reject',
    title: '',
  });
  const [actionReason, setActionReason] = useState('');

  if (!quote) {
    return (
      <AppLayout title="Quotation Not Found" breadcrumb={[{ label: 'Quotations', path: '/quotations' }, { label: 'Detail' }]}>
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-600 mb-4">The requested quotation does not exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate('/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleUpdateLine = (lineId: string, updates: Partial<QuotationLine>) => {
    const updatedLines = quote.lines.map((l) => (l.id === lineId ? { ...l, ...updates } : l));
    const recalculated = recalculateQuotation({ ...quote, lines: updatedLines });
    updateQuotation(quote.id, recalculated);
  };

  const handleRemoveLine = (lineId: string) => {
    const updatedLines = quote.lines.filter((l) => l.id !== lineId);
    const recalculated = recalculateQuotation({ ...quote, lines: updatedLines });
    updateQuotation(quote.id, recalculated);
    showSuccess('Line item removed');
  };

  const handleOrderDiscountChange = (val: number) => {
    const recalculated = recalculateQuotation({ ...quote, orderDiscount: val });
    updateQuotation(quote.id, recalculated);
  };

  const handleAddLine = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      showError('Please choose a product');
      return;
    }

    const newLine: QuotationLine = {
      id: generateId('line'),
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity: Number(lineQty) || 1,
      unitPrice: product.price,
      cost: product.cost,
      discount: Number(lineDiscount) || 0,
      tax: product.tax,
      recurring: !!product.recurring,
      billingCycle: product.billingCycle,
    };

    const updatedLines = [...quote.lines, newLine];
    const recalculated = recalculateQuotation({ ...quote, lines: updatedLines });
    updateQuotation(quote.id, recalculated);

    setAddLineModal(false);
    setSelectedProductId('');
    setLineQty(1);
    setLineDiscount(0);
    showSuccess(`Added ${product.name} to quotation`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const msg: NegotiationMessage = {
      id: generateId('msg'),
      from: 'sales_rep',
      authorName: user?.name || 'Sales Rep',
      message: messageText.trim(),
      type: 'comment',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    addNegotiationMessage(quote.id, msg);
    setMessageText('');
    showSuccess('Message sent to negotiation stream');
  };

  const handleSubmit = () => {
    if (quote.lines.length === 0) {
      showError('Add at least one product line before submitting');
      return;
    }
    submitQuotation(quote.id, user?.name || 'Sales Rep');
    showSuccess('Submitted quotation for approval');
  };

  const handleApprove = () => {
    approveQuotation(quote.id, user?.name || 'Manager', 'Approved via Split Builder');
    showSuccess('Quotation approved');
  };

  const handleConfirmOrder = () => {
    updateQuotationStage(quote.id, 'Confirmed');
    showSuccess('Quotation confirmed as Sales Order');
  };

  const handleMoveToFulfillment = () => {
    updateQuotationStage(quote.id, 'Fulfillment');
    navigate('/fulfillment');
  };

  return (
    <AppLayout
      title={`Quotation ${quote.quoteNumber}`}
      breadcrumb={[
        { label: 'Quotations', path: '/quotations' },
        { label: quote.quoteNumber },
      ]}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => navigate('/quotations')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {/* Workflow Stage Actions */}
          {quote.stage === 'Draft' && (
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-1" /> Submit for Approval
            </Button>
          )}

          {quote.stage === 'Pending Approval' && (user?.role === 'ADMIN' || user?.role === 'SALES_MANAGER' || user?.role === 'FINANCE_OPS') && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReasonModal({ open: true, action: 'return', title: 'Return Quotation to Draft' })}
              >
                Return
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setReasonModal({ open: true, action: 'reject', title: 'Reject Quotation' })}
              >
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button variant="primary" size="sm" onClick={handleApprove}>
                <Check className="w-4 h-4 mr-1" /> Approve Deal
              </Button>
            </>
          )}

          {(quote.stage === 'Approved' || quote.stage === 'Negotiation') && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/portal?id=${quote.id}`)}
              >
                <ExternalLink className="w-4 h-4 mr-1" /> Customer Portal
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmOrder}>
                <FileCheck className="w-4 h-4 mr-1" /> Confirm Sales Order
              </Button>
            </>
          )}

          {quote.stage === 'Confirmed' && (
            <Button variant="primary" size="sm" onClick={handleMoveToFulfillment}>
              Allocate Warehouse <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Deal Header Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{quote.quoteNumber}</h2>
                <StatusBadge status={quote.stage} />
                <StatusBadge status={quote.riskLevel} />
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Account: <span className="font-semibold text-slate-900">{quote.customerName}</span> ({quote.customerTier} Tier) • Sales Rep: {quote.salesRepName}
              </p>
            </div>

            <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 text-sm">
              <div>
                <p className="text-xs text-slate-400">Total Value</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(quote.total)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Profit Margin</p>
                <p className={`text-lg font-bold ${quote.marginPercent < 20 ? 'text-red-600' : 'text-teal-700'}`}>
                  {quote.marginPercent.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Expiration</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(quote.expirationDate)}</p>
              </div>
            </div>
          </div>

          {/* Risk Alert Notice */}
          {quote.riskLevel !== 'LOW' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <span className="font-semibold">Governance Notice: </span>
                This quotation has a risk score of {quote.riskScore}/100.
                {quote.riskBreakdown.discountExcess > 0 && ` Discount exceeds policy by ${quote.riskBreakdown.discountExcess}%.`}
                {quote.riskBreakdown.violations > 0 && ` Contains ${quote.riskBreakdown.violations} line violation(s).`}
                {` Requires ${quote.approvalLevel.toUpperCase()} approval.`}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout: Main Lines Editor & Financials/Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Lines Split Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Quotation Line Items"
                subtitle="Configure products, services, subscriptions, and line discounts"
                action={
                  <Button variant="primary" size="sm" onClick={() => setAddLineModal(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Product Line
                  </Button>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Item & Category</th>
                      <th className="py-3 px-3 w-20">Qty</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3 w-24">Disc %</th>
                      <th className="py-3 px-3">Net Total</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.lines.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          No line items yet. Click "Add Product Line" to build the quote.
                        </td>
                      </tr>
                    ) : (
                      quote.lines.map((line) => {
                        const gross = line.unitPrice * line.quantity;
                        const net = gross - gross * (line.discount / 100);
                        return (
                          <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{line.productName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">{line.category}</span>
                                {line.recurring && (
                                  <Badge variant="blue" className="text-[10px] py-0">
                                    {line.billingCycle || 'recurring'}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) => handleUpdateLine(line.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium">
                              {formatCurrency(line.unitPrice)}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={line.discount}
                                  onChange={(e) => handleUpdateLine(line.id, { discount: Math.min(100, Math.max(0, Number(e.target.value))) })}
                                  className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                                <span className="text-xs text-slate-400">%</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {formatCurrency(net)}
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge status={line.lineStatus || 'OK'} />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleRemoveLine(line.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Negotiation & Communication Stream */}
            <Card>
              <CardHeader
                title="Customer Negotiation & Deal Notes"
                subtitle="Direct conversation thread between Sales Rep and Customer"
              />
              <CardBody className="space-y-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {quote.negotiations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No negotiation messages yet. Customer comments and discount counters will appear here.
                    </p>
                  ) : (
                    quote.negotiations.map((msg) => {
                      const isRep = msg.from === 'sales_rep';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isRep ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3 rounded-xl text-sm ${
                              isRep
                                ? 'bg-teal-700 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-900 rounded-bl-none'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 mb-1">
                              <span className="font-semibold">{msg.authorName}</span>
                              <span>{formatDateTime(msg.timestamp)}</span>
                            </div>
                            <p>{msg.message}</p>
                            {msg.requestedDiscount !== undefined && (
                              <div className="mt-2 text-xs bg-white/20 p-1.5 rounded">
                                Requested Discount: <span className="font-bold">{msg.requestedDiscount}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message input */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Type an internal note or message to customer..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <Button variant="primary" size="sm" onClick={handleSendMessage}>
                    Send
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar: Calculations, Risk & Approvals */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader title="Financial Breakdown" subtitle="Pricing calculations & margin" />
              <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-medium text-slate-900">{formatCurrency(quote.subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Order Level Discount:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={quote.orderDiscount}
                      onChange={(e) => handleOrderDiscountChange(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-center text-xs"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Total Discount Deducted:</span>
                  <span className="text-amber-700 font-medium">-{formatCurrency(quote.discountAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Tax (GST/VAT):</span>
                  <span className="font-medium text-slate-900">{formatCurrency(quote.taxAmount)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-teal-700 text-lg">{formatCurrency(quote.total)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1 mt-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Gross Profit Margin:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(quote.margin)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Margin Percentage:</span>
                    <span className={`font-bold ${quote.marginPercent < 20 ? 'text-red-600' : 'text-teal-700'}`}>
                      {quote.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Risk & Governance Card */}
            <Card>
              <CardHeader title="Governance & Risk Matrix" subtitle="Automated discount & margin evaluation" />
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Overall Risk Level</span>
                  <StatusBadge status={quote.riskLevel} />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Risk Score</span>
                    <span className="font-bold">{quote.riskScore} / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quote.riskScore > 60
                          ? 'bg-red-500'
                          : quote.riskScore > 30
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, quote.riskScore)}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Discount Excess:</span>
                    <span className="font-semibold text-slate-800">{quote.riskBreakdown.discountExcess}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pricing Violations:</span>
                    <span className="font-semibold text-slate-800">{quote.riskBreakdown.violations} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval Required:</span>
                    <span className="font-semibold text-teal-700 capitalize">{quote.approvalLevel}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Product Line Modal */}
      <Modal
        open={addLineModal}
        onClose={() => setAddLineModal(false)}
        title="Add Product to Quotation"
        description="Select hardware, service, or recurring subscription package."
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={lineQty}
                onChange={(e) => setLineQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={lineDiscount}
                onChange={(e) => setLineDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAddLineModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLine}>
              Add Line
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject / Return Reason Modal */}
      <Modal
        open={reasonModal.open}
        onClose={() => setReasonModal({ ...reasonModal, open: false })}
        title={reasonModal.title}
        description="Provide a justification reason for audit logging."
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              rows={3}
              placeholder="e.g. Requested discount exceeds 15% limit on Hardware lines..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setReasonModal({ ...reasonModal, open: false })}>
              Cancel
            </Button>
            <Button
              variant={reasonModal.action === 'reject' ? 'danger' : 'warning'}
              onClick={() => {
                if (reasonModal.action === 'reject') {
                  rejectQuotation(quote.id, user?.name || 'Manager', actionReason || 'Deal rejected');
                  showSuccess('Quotation rejected');
                } else {
                  returnQuotation(quote.id, user?.name || 'Manager', actionReason || 'Returned for revision');
                  showSuccess('Quotation returned to draft');
                }
                setReasonModal({ ...reasonModal, open: false });
                setActionReason('');
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
