'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui';

// ============================================================================
// Types
// ============================================================================

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left side - Title or Search */}
      <div className="flex items-center gap-4">
        {title ? (
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        ) : (
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search proposals..."
              leftIcon={<Search className="h-4 w-4" />}
              className="h-9"
            />
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {actions}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// Page Header
// ============================================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-primary-600 hover:underline"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-slate-700">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
