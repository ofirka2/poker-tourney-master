
import { useState, useEffect } from 'react';
import { useAuth as useSupabaseAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/types';

export const useAuth = () => {
  const { user, session, loading, signOut } = useSupabaseAuth();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole('user');
        setRoleLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        } else {
          setUserRole(data?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === 'admin';

  return {
    user,
    session,
    loading: loading || roleLoading,
    signOut,
    userRole,
    isAdmin,
  };
};
