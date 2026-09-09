import { type ReactNode } from 'react';
import { TopNavbar } from './TopNavbar';
import { Breadcrumb } from '../ui';

interface AppLayoutProps {
  title: string;
  breadcrumb: { label: string; path?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, breadcrumb, actions, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Floating Glassmorphic Top Navigation Bar */}
      <TopNavbar />

      {/* Page Title & Action Subheader */}
      <div className="w-full px-3 sm:px-6 pt-3 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <div className="mt-0.5">
              <Breadcrumb items={breadcrumb} />
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      </div>

      {/* Main Page Workspace Content */}
      <main className="flex-1 w-full px-3 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
