import { useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button, Card, CardHeader, CardBody } from '../components/ui';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { formatDateTime, generateId } from '../utils/format';
import type { NegotiationMessage } from '../types';

export function Messages() {
  const { user } = useAuth();
  const { quotations, addNegotiationMessage } = useAppData();
  const { showSuccess } = useToast();

  const [activeQuoteId, setActiveQuoteId] = useState<string>(
    quotations.length > 0 ? quotations[0].id : ''
  );
  const [msgInput, setMsgInput] = useState('');

  const activeQuote = quotations.find((q) => q.id === activeQuoteId);

  const handleSend = () => {
    if (!msgInput.trim() || !activeQuote) return;

    const isCustomer = user?.role === 'CUSTOMER';
    const newMsg: NegotiationMessage = {
      id: generateId('msg'),
      from: isCustomer ? 'customer' : 'sales_rep',
      authorName: user?.name || (isCustomer ? 'Customer' : 'Account Manager'),
      message: msgInput.trim(),
      type: 'comment',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    addNegotiationMessage(activeQuote.id, newMsg);
    setMsgInput('');
    showSuccess('Message sent');
  };

  return (
    <AppLayout
      title="Communication & Deal Messages"
      breadcrumb={[{ label: 'Home' }, { label: 'Messages' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left Thread List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-card flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Conversations</h3>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
              {quotations.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-3 scrollbar-thin">
            {quotations.map((q) => (
              <div
                key={q.id}
                onClick={() => setActiveQuoteId(q.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeQuoteId === q.id
                    ? 'bg-teal-50/60 border-teal-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{q.quoteNumber}</span>
                  <span className="text-[10px] text-slate-400">
                    {q.negotiations.length > 0
                      ? formatDateTime(q.negotiations[q.negotiations.length - 1].timestamp)
                      : 'New'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 truncate">{q.customerName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {q.negotiations.length > 0
                    ? q.negotiations[q.negotiations.length - 1].message
                    : 'No messages yet in this discussion'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Main Frame */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex flex-col h-full">
          {activeQuote ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeQuote.customerName} — {activeQuote.quoteNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Stage: {activeQuote.stage} • Rep: {activeQuote.salesRepName}
                  </p>
                </div>
                <Badge variant="teal">{activeQuote.customerTier} Tier</Badge>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin pr-1">
                {activeQuote.negotiations.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No messages yet. Send a response below to start the conversation.
                  </div>
                ) : (
                  activeQuote.negotiations.map((msg) => {
                    const isMe =
                      (user?.role === 'CUSTOMER' && msg.from === 'customer') ||
                      (user?.role !== 'CUSTOMER' && msg.from === 'sales_rep');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700">{msg.authorName}</span>
                          <span>{formatDateTime(msg.timestamp)}</span>
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-teal-700 text-white rounded-br-xs shadow-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.message}</p>
                          {msg.requestedDiscount !== undefined && (
                            <div className="mt-1.5 p-1 bg-white/20 rounded font-semibold text-[11px]">
                              Proposed Discount: {msg.requestedDiscount}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message or clarification..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <Button variant="primary" size="sm" onClick={handleSend}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select a conversation to view messages.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
