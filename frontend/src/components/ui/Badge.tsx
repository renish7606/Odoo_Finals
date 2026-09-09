import { cn } from '../../utils/format';

type BadgeVariant =
  | 'default'
  | 'teal'
  | 'amber'
  | 'red'
  | 'blue'
  | 'orange'
  | 'slate'
  | 'green'
  | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 border-slate-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  teal: 'bg-teal-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  blue: 'bg-blue-400',
  orange: 'bg-orange-400',
  slate: 'bg-slate-400',
  green: 'bg-green-500',
  indigo: 'bg-indigo-400',
};

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const statusMap: Record<string, BadgeVariant> = {
    Draft: 'slate',
    'Pending Approval': 'amber',
    Approved: 'teal',
    Negotiation: 'blue',
    Confirmed: 'teal',
    Fulfillment: 'indigo',
    Completed: 'green',
    Rejected: 'red',
    Active: 'green',
    Trial: 'blue',
    'Past Due': 'red',
    'Cancellation Scheduled': 'amber',
    Cancelled: 'slate',
    Paid: 'green',
    Pending: 'amber',
    Overdue: 'red',
    'Partially Paid': 'orange',
    low: 'teal',
    moderate: 'amber',
    high: 'orange',
    critical: 'red',
    LOW: 'teal',
    MODERATE: 'amber',
    HIGH: 'orange',
    CRITICAL: 'red',
    OK: 'teal',
    'EXCEEDS LIMIT': 'red',
  };

  const variant = statusMap[status] || 'default';
  return (
    <Badge variant={variant} className={className} dot>
      {status}
    </Badge>
  );
}
