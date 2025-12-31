import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Table Container
// ============================================================================

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className={cn('w-full text-sm', className)} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Table Header
// ============================================================================

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={cn('border-b border-slate-200 bg-slate-50', className)} {...props}>
      {children}
    </thead>
  );
}

// ============================================================================
// Table Body
// ============================================================================

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-slate-200', className)} {...props}>
      {children}
    </tbody>
  );
}

// ============================================================================
// Table Row
// ============================================================================

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isClickable?: boolean;
}

export function TableRow({ className, isClickable, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors',
        isClickable && 'cursor-pointer hover:bg-slate-50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

// ============================================================================
// Table Head Cell
// ============================================================================

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

// ============================================================================
// Table Cell
// ============================================================================

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', className)} {...props}>
      {children}
    </td>
  );
}

// ============================================================================
// Empty State
// ============================================================================

interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmptyState({ icon, title, description, action }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {icon && <div className="mb-4 text-slate-400">{icon}</div>}
          <h3 className="text-sm font-medium text-slate-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
