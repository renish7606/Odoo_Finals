import { type ReactNode } from 'react';
import { cn } from '../../utils/format';

interface TableColumn {
  key: string;
  header: string;
  render?: (row: any) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function Table({ columns, data, onRowClick, emptyMessage = 'No data available', emptyIcon, loading, className }: TableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider', col.headerClassName)}>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5', col.className)}>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl bg-white">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {emptyIcon}
          <p className="text-sm text-slate-500 mt-3">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden border border-slate-200 rounded-xl bg-white', className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap', col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
