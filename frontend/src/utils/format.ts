import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}M`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysBetween(date1: string, date2: string): number {
  const diff = new Date(date1).getTime() - new Date(date2).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function daysSince(date: string): number {
  return daysBetween(new Date().toISOString(), date);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateQuoteNumber(existing: number): string {
  return `Q-${1000 + existing}`;
}

export function generateOrderNumber(existing: number): string {
  return `ORD-${1000 + existing}`;
}

export function generateInvoiceNumber(existing: number): string {
  return `INV-${1000 + existing}`;
}

export function generateSubscriptionNumber(existing: number): string {
  return `SUB-${1000 + existing}`;
}

export function generatePaymentNumber(existing: number): string {
  return `PAY-${1000 + existing}`;
}

export function generateCreditNoteNumber(existing: number): string {
  return `CN-${1000 + existing}`;
}
