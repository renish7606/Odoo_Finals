import { api } from '../api.js';

class DealHealthStore {
  constructor() {
    this.deals = [];
    this.listeners = [];
    this.loaded = false;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.deals));
    this.saveToStorage();
  }

  saveToStorage() {
    localStorage.setItem('dealHealthState', JSON.stringify(this.deals));
  }

  loadFromStorage() {
    const data = localStorage.getItem('dealHealthState');
    if (data) {
      try {
        this.deals = JSON.parse(data);
        this.loaded = true;
        return true;
      } catch (e) {
        console.error('Failed to parse deal health state', e);
      }
    }
    return false;
  }

  async fetchHealthData() {
    // Always load from storage first for immediate UI render, but still fetch fresh data
    this.loadFromStorage();
    this.notify();

    try {
      const [stalled, anomalies, slippages, quotes] = await Promise.all([
        api.get('/deal_health/stalled').catch(() => []),
        api.get('/deal_health/anomalies').catch(() => []),
        api.get('/deal_health/slippage').catch(() => []),
        api.get('/quotations').catch(() => [])
      ]);

      const quotesMap = {};
      quotes.forEach(q => quotesMap[q.id] = q);

      const dealsMap = {};

      const addIssue = (quoteId, issueType, details) => {
        if (!dealsMap[quoteId]) {
          const q = quotesMap[quoteId];
          if (!q) return;
          dealsMap[quoteId] = {
            id: q.id,
            dealRef: q.deal_reference,
            dealName: `Quote ${q.deal_reference}`, 
            customerName: q.customer_name || 'Unknown',
            repName: q.rep_name || 'Unknown',
            issues: [],
            issueDetails: {},
            flaggedDate: new Date().toISOString().split('T')[0],
            actionStatus: 'Action Required'
          };
        }
        if (!dealsMap[quoteId].issues.includes(issueType)) {
            dealsMap[quoteId].issues.push(issueType);
            dealsMap[quoteId].issueDetails[issueType] = details;
        }
      };

      stalled.forEach(s => addIssue(s.quotation_id, 'stalled', { daysInactive: s.days_inactive }));
      anomalies.forEach(a => addIssue(a.quotation_id, 'discount_anomaly', { discountGiven: a.discount_given, repAvg: a.rep_average_discount }));
      slippages.forEach(s => addIssue(s.quotation_id, 'delivery_slippage', { daysDelayed: s.days_delayed }));

      this.deals = Object.values(dealsMap);
      this.loaded = true;
      this.notify();
    } catch (e) {
      console.error('Failed to fetch deal health data', e);
    }
  }

  getStalledDeals() { return this.deals.filter(d => d.issues.includes('stalled')); }
  getDiscountAnomalies() { return this.deals.filter(d => d.issues.includes('discount_anomaly')); }
  getDeliverySlippages() { return this.deals.filter(d => d.issues.includes('delivery_slippage')); }
  getAtRiskDeals() { return this.deals.filter(d => d.issues.length > 0); }
  getAtRiskCount() { return this.getAtRiskDeals().length; }
  getActiveFlagsCount() { return this.deals.reduce((sum, d) => sum + d.issues.length, 0); }

  getFlaggedItems() {
    return this.deals.filter(d => d.issues.length > 0).map(d => {
        const issueTexts = [];
        if (d.issues.includes('stalled')) {
            issueTexts.push(`Idle ${d.issueDetails?.stalled?.daysInactive || 7}+ days`);
        }
        if (d.issues.includes('discount_anomaly')) {
            const given = d.issueDetails?.discount_anomaly?.discountGiven || 0;
            const avg = d.issueDetails?.discount_anomaly?.repAvg || 0;
            issueTexts.push(`Discount ${given}% vs avg ${avg}%`);
        }
        if (d.issues.includes('delivery_slippage')) {
            issueTexts.push(`Fulfillment delayed`);
        }
        return {
            ...d,
            displayIssue: issueTexts.join(' & ')
        };
    });
  }

  async nudgeRep(dealId) {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;
    try {
        await api.post(`/deal_health/${dealId}/nudge`);
        deal.actionStatus = 'Nudge sent';
        this.notify();
    } catch (e) { console.error('Failed to nudge', e); }
  }

  async escalateDeal(dealId) {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;
    try {
        await api.post(`/deal_health/${dealId}/escalate`);
        deal.actionStatus = 'Escalated to Manager';
        this.notify();
    } catch (e) { console.error('Failed to escalate', e); }
  }

  async resolveRisk(dealId, issueType = null) {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;
    try {
        await api.post(`/deal_health/${dealId}/resolve`, { issue_type: issueType });
        if (issueType) {
            deal.issues = deal.issues.filter(i => i !== issueType);
        } else {
            deal.issues = [];
        }
        if (deal.issues.length === 0) {
            deal.actionStatus = 'Resolved';
        }
        this.notify();
    } catch (e) { console.error('Failed to resolve', e); }
  }

  simulateStalledDeal(dealObj) {
      let existing = this.deals.find(d => d.id === dealObj.id);
      if (existing) {
          if (!existing.issues.includes('stalled')) {
              existing.issues.push('stalled');
              if (!existing.issueDetails) existing.issueDetails = {};
              existing.issueDetails.stalled = { daysInactive: 8 };
              existing.actionStatus = 'Action Required';
              this.notify();
          }
      } else {
          this.deals.push({
              id: dealObj.id,
              dealRef: dealObj.deal_reference,
              dealName: `Quote ${dealObj.deal_reference}`,
              customerName: dealObj.customer_name || 'Unknown',
              repName: dealObj.rep_name || 'Unknown',
              issues: ['stalled'],
              issueDetails: { stalled: { daysInactive: 8 } },
              flaggedDate: new Date().toISOString().split('T')[0],
              actionStatus: 'Action Required'
          });
          this.notify();
      }
  }
}

export const dealHealthStore = new DealHealthStore();
