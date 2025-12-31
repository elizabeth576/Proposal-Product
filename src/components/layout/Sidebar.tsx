'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Plus,
  Settings,
  Users,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

// ============================================================================
// Navigation Items
// ============================================================================

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Proposals',
    href: '/proposals',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'New Proposal',
    href: '/proposals/new',
    icon: <Plus className="h-5 w-5" />,
  },
];

const adminItems: NavItem[] = [
  {
    label: 'Team',
    href: '/team',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: <CreditCard className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER],
  },
];

// ============================================================================
// Component
// ============================================================================

export function Sidebar() {
  const pathname = usePathname();
  const { user, productUser, logout, hasRole } = useAuth();

  const visibleAdminItems = adminItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  const displayName = productUser
    ? `${productUser.first_name} ${productUser.last_name}`.trim()
    : user?.email || 'User';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            P
          </div>
          <span className="text-lg font-semibold text-slate-900">ProposalGen</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </div>

        {visibleAdminItems.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-200" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            <div className="space-y-1">
              {visibleAdminItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// Nav Link Component
// ============================================================================

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

function NavLink({ item, isActive }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      )}
    >
      <span className={cn(isActive ? 'text-primary-600' : 'text-slate-400')}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
