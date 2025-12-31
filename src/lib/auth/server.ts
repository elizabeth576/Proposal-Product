import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as jose from 'jose';
import { AuthTokenPayload, UserRole } from '@/types';
import { APPROVAL_ROLES } from '@/constants';

// ============================================================================
// Constants
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const COOKIE_NAME = 'proposal_access_token';

// ============================================================================
// Token Verification
// ============================================================================

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Server-Side Auth Utilities
// ============================================================================

export async function getServerSession(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function requireAuth(): Promise<AuthTokenPayload> {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireRole(roles: UserRole[]): Promise<AuthTokenPayload> {
  const session = await requireAuth();

  if (!roles.includes(session.role_slug)) {
    redirect('/dashboard');
  }

  return session;
}

export async function requireApprovalRole(): Promise<AuthTokenPayload> {
  return requireRole(APPROVAL_ROLES);
}

// ============================================================================
// Permission Helpers
// ============================================================================

export function canUserApprove(session: AuthTokenPayload): boolean {
  return APPROVAL_ROLES.includes(session.role_slug);
}

export function hasPermission(
  session: AuthTokenPayload,
  resource: string,
  action: string
): boolean {
  const permission = session.permissions.find((p) => p.resource === resource);
  return permission?.actions.includes(action as never) ?? false;
}

// ============================================================================
// Organization Scope
// ============================================================================

export function getOrganizationId(session: AuthTokenPayload): string {
  return session.organization_id;
}

export function getUserId(session: AuthTokenPayload): string {
  return session.sub;
}
