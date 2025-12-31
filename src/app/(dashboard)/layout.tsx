'use client';

import { AuthProvider, AuthGuard } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pl-64">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
