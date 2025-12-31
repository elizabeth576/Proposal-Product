import { supabase } from './supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { authLogger } from '@/lib/utils/logger';

// ============================================================================
// Types
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  organization_size: string;
}

export interface AuthResult {
  user: SupabaseUser | null;
  session: Session | null;
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  /**
   * Login with email and password
   * Returns session after confirming it's ready
   */
  login: async (data: LoginInput) => {
    const { email, password } = data;

    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      authLogger.loginFailure({ email }, error.message);
      throw new Error(error.message);
    }

    authLogger.loginSuccess({
      userId: authData.user?.id,
      email: authData.user?.email,
    });

    return authData;
  },

  /**
   * Register a new user/organization
   * Order: 1) Supabase Auth signup, 2) Create organization, 3) Create product_user
   */
  register: async (data: RegisterInput): Promise<AuthResult> => {
    const { email, password, full_name, organization_name, organization_size } = data;

    // Split full_name into first_name and last_name
    const nameParts = full_name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.slice(1).join(' ') || '';

    // Step 1: Sign up user with Supabase Auth (must succeed first)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          first_name,
          last_name,
        }
      }
    });

    if (authError) {
      authLogger.registerFailure({ email }, authError.message);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    const user_id = authData.user.id;

    // Step 2: Create organization in organizations table
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        organization_name: organization_name,
        organization_size: organization_size,
      })
      .select('organization_id')
      .single();

    if (orgError) {
      // Rollback: delete auth user if org creation fails
      await supabase.auth.admin.deleteUser(user_id).catch(() => {
        // Admin delete may fail due to permissions, user will need manual cleanup
        console.error('Failed to rollback auth user');
      });
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    const organization_id = orgData.organization_id;

    // Step 3: Create product_user record with role_id 1 (super-admin)
    const { error: userError } = await supabase
      .from('product_users')
      .insert({
        user_id,
        organization_id,
        first_name,
        last_name,
        role_id: "e7c6a2d4-9b3f-4a21-8c5f-0b9f6e2a4d31",
      });

    if (userError) {
      // Rollback: delete organization
      await supabase.from('organizations').delete().eq('id', organization_id);
      throw new Error(`Failed to create user profile: ${userError.message}`);
    }

    // Update auth user metadata with organization_id
    await supabase.auth.updateUser({
      data: { organization_id }
    });

    authLogger.registerSuccess({
      userId: authData.user.id,
      email: authData.user.email,
      organizationId: organization_id,
    });

    return { user: authData.user, session: authData.session };
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    authLogger.logout({
      userId: user?.id,
      email: user?.email ?? undefined,
    });
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return session;
  },

  /**
   * Get current user from session
   */
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw new Error(error.message);
    }
    return user;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
