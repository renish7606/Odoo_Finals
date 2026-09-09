import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, MessageSquare, ArrowLeft, Send, ShieldCheck, Download } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody, Modal } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate, formatDateTime, generateId } from '../utils/format';
import type { NegotiationMessage } from '../types';

export function CustomerPortal() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const { quotations, addNegotiationMessage, confirmQuotation, updateQuotationStage } = useAppData();

  const quoteId = id || searchParams.get('id') || (quotations.length > 0 ? quotations[0].id : '');
  const quote = quotations.find((q) => q.id === quoteId);

  const [counterDiscount, setCounterDiscount] = useState(5);
  const [customerMessage, setCustomerMessage] = useState('');
  const [accepted, setAccepted] = useState(false);

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-card">
          <Zap className="w-8 h-8 text-teal-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Quotation Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">Please check the quotation link provided by your sales representative.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Application
          </Button>
        </div>
      </div>
    );
  }

  const handleSendCounter = () => {
    if (!customerMessage.trim()) {
      showError('Please provide a message explaining your request');
      return;
    }

    const msg: NegotiationMessage = {
      id: generateId('msg'),
      from: 'customer',
      authorName: quote.customerName,
      message: customerMessage.trim(),
      type: 'counter_discount',
      requestedDiscount: Number(counterDiscount),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    addNegotiationMessage(quote.id, msg);
    updateQuotationStage(quote.id, 'Negotiation');
    setCustomerMessage('');
    showSuccess('Your counter request has been sent to the account manager');
  };

  const handleAcceptQuote = () => {
    confirmQuotation(quote.id);
    setAccepted(true);
    showSuccess('Quotation accepted successfully!');
  };

  return (
    <AppLayout
      title={`Quotation ${quote.quoteNumber}`}
      breadcrumb={[{ label: 'Home' }, { label: 'My Quotation' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
          {quote.stage !== 'Confirmed' && quote.stage !== 'Completed' && (
            <Button variant="primary" size="sm" onClick={handleAcceptQuote}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Accept & Sign Deal
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Deal Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{quote.quoteNumber}</h1>
                <StatusBadge status={quote.stage} />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Prepared by {quote.salesRepName} • Valid through {formatDate(quote.expirationDate)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-1" /> Download PDF
              </Button>
              {quote.stage !== 'Confirmed' && quote.stage !== 'Completed' && (
                <Button variant="primary" size="sm" onClick={handleAcceptQuote}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Accept & Sign Deal
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <Card>
          <CardHeader title="Order Specification" subtitle="Selected hardware, services, and software licenses" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.lines.map((line) => {
                  const gross = line.unitPrice * line.quantity;
                  const net = gross - gross * (line.discount / 100);
                  return (
                    <tr key={line.id}>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {line.productName}
                        <span className="block text-xs text-slate-400 font-normal">{line.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">{line.quantity}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{line.discount}%</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 text-right">
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex flex-col items-end text-sm space-y-1.5">
            <div className="flex justify-between w-64 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discountAmount > 0 && (
              <div className="flex justify-between w-64 text-amber-700">
                <span>Discount Applied:</span>
                <span className="font-semibold">-{formatCurrency(quote.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-slate-600">
              <span>Applicable Taxes:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(quote.taxAmount)}</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
              <span>Final Total:</span>
              <span className="text-teal-700 text-xl">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </Card>

        {/* Negotiation & Counter Proposal */}
        <Card>
          <CardHeader
            title="Deal Negotiation & Remarks"
            subtitle="Submit questions or propose revisions directly to your sales account manager"
          />
          <CardBody className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {quote.negotiations.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-sm ${
                    msg.from === 'customer'
                      ? 'bg-teal-50 border border-teal-200'
                      : 'bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800">{msg.authorName}</span>
                    <span>{formatDateTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-slate-700">{msg.message}</p>
                  {msg.requestedDiscount !== undefined && (
                    <span className="inline-block mt-1 text-xs font-semibold text-teal-700">
                      Requested Discount: {msg.requestedDiscount}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Message</label>
                  <input
                    type="text"
                    placeholder="We would like to request an additional discount on Hardware..."
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Counter Disc %</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={counterDiscount}
                    onChange={(e) => setCounterDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSendCounter}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Submit Counter Request
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
