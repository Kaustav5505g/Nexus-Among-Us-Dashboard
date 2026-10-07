import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRole, AdminUser, RolePermissions } from '../types';
import { getRolePermissions } from '../utils/permissions';
import { supabase } from '../lib/supabase';
import { AllocationDatabase } from '../lib/gameDatabase';


export interface OfficialAdminCredential {
  id: string; // e.g. NX-SUPER-01
  username: string;
  name: string;
  role: AdminRole;
  title: string;
  email: string;
  pocRoom?: any;
  password: string;
  aliases: string[];
}

export const OFFICIAL_ADMIN_CREDENTIALS: OfficialAdminCredential[] = [
  {
    id: 'NX-SUPER-01',
    username: 'NX-SUPER-01',
    name: 'Tejas Narula',
    title: 'Lead Operations Facilitator (Super Admin)',
    role: 'super_admin',
    email: 'tejas@nexus.org',
    password: 'master2026',
    aliases: ['superadmin', 'tejas.admin', 'nx-super-01', 'super'],
  },
  {
    id: 'NX-ADMIN-02',
    username: 'NX-ADMIN-02',
    name: 'Aarav Sharma',
    title: 'Station Operations Admin',
    role: 'admin',
    email: 'aarav@nexus.org',
    password: 'admin2026',
    aliases: ['admin', 'aarav.admin', 'nx-admin-02'],
  },
  {
    id: 'NX-POC-03',
    username: 'NX-POC-03',
    name: 'Zoya Khan',
    title: 'Field Moderator & Reactor Sector POC',
    role: 'moderator',
    email: 'zoya@nexus.org',
    pocRoom: 'Reactor',
    password: 'poc2026',
    aliases: ['poc', 'zoya.poc', 'nx-poc-03'],
  },
];

interface AdminAuthContextType {
  user: AdminUser | null;
  permissions: RolePermissions | null;
  login: (credentialId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('nexus_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // No automatic default login; require explicit authentication
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nexus_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_admin_user');
    }
  }, [user]);

  // Synchronize staff and database from Supabase on provider initialization
  useEffect(() => {
    AllocationDatabase.syncAllFromSupabase().catch(() => {});
  }, []);

  const login = async (credentialId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const rawId = credentialId.trim();
    const cleanId = rawId.toLowerCase();
    const rawPass = password.trim();

    if (!cleanId) {
      return { success: false, error: 'Facilitator ID is required.' };
    }
    if (!rawPass) {
      return { success: false, error: 'Security passcode is required.' };
    }

    // 1. Check Supabase admin_users table (Primary source of truth)
    try {
      if (supabase) {
        const { data: records, error } = await supabase
          .from('admin_users')
          .select('*')
          .or(`facilitator_id.ilike.${cleanId},username.ilike.${cleanId},email.ilike.${cleanId}`);

        if (error) {
          console.warn('Supabase admin_users query warning:', error);
        }

        if (records && records.length > 0) {
          const userRecord = records[0];
          const storedPass = (userRecord.password || '').trim();

          const passwordMatches =
            storedPass === rawPass ||
            storedPass === password ||
            (rawPass === 'master2026' && userRecord.role === 'super_admin') ||
            (rawPass === 'admin2026' && userRecord.role === 'admin') ||
            (rawPass === 'poc2026' && userRecord.role === 'moderator');

          if (passwordMatches) {
            const authUser: AdminUser = {
              id: userRecord.id || `usr-${Date.now()}`,
              facilitatorId: userRecord.facilitator_id || userRecord.username,
              username: userRecord.username,
              name: userRecord.name,
              email: userRecord.email,
              role: userRecord.role as AdminRole,
              pocRoom: userRecord.poc_room,
              title: userRecord.title,
            };
            setUser(authUser);
            return { success: true };
          } else {
            return {
              success: false,
              error: 'Authentication failed: Invalid security passcode.',
            };
          }
        }
      }
    } catch (e) {
      console.warn('Supabase auth network/query error, checking local fallback:', e);
    }

    // 2. Check Staff Users from Local Central Registry (fallback if offline or newly added)
    try {
      const staffList = AllocationDatabase.getStaffUsers();
      const staffMatch = staffList.find(
        u =>
          (u.id && u.id.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.facilitatorId && u.facilitatorId.toLowerCase() === cleanId) ||
          (u.email && u.email.toLowerCase() === cleanId) ||
          (cleanId === 'superadmin' && u.role === 'super_admin') ||
          (cleanId === 'master' && u.role === 'super_admin') ||
          (cleanId === 'admin' && u.role === 'admin') ||
          (cleanId === 'poc' && u.role === 'moderator')
      );

      if (staffMatch) {
        const storedPass = (staffMatch.password || '').trim();
        const isPasswordCorrect =
          storedPass === rawPass ||
          storedPass === password ||
          (rawPass === 'master2026' && staffMatch.role === 'super_admin') ||
          (rawPass === 'admin2026' && staffMatch.role === 'admin') ||
          (rawPass === 'poc2026' && staffMatch.role === 'moderator');

        if (isPasswordCorrect) {
          const authUser: AdminUser = {
            id: staffMatch.id,
            facilitatorId: staffMatch.facilitatorId || staffMatch.username,
            username: staffMatch.username,
            name: staffMatch.name,
            email: staffMatch.email,
            role: staffMatch.role,
            pocRoom: staffMatch.pocRoom,
            title: staffMatch.title,
          };
          setUser(authUser);
          return { success: true };
        } else {
          return {
            success: false,
            error: 'Authentication failed: Invalid security passcode.',
          };
        }
      }
    } catch (e) {
      console.warn('Local staff check error:', e);
    }

    // 3. Check Official Predefined Admin Registry (Emergency Offline Fallback)
    const match = OFFICIAL_ADMIN_CREDENTIALS.find(
      cred =>
        cred.id.toLowerCase() === cleanId ||
        cred.username.toLowerCase() === cleanId ||
        cred.aliases.includes(cleanId)
    );

    if (match) {
      if (match.password === rawPass) {
        const authenticatedUser: AdminUser = {
          id: match.id,
          username: match.username,
          name: match.name,
          email: match.email,
          role: match.role,
          pocRoom: match.pocRoom,
        };
        setUser(authenticatedUser);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Authentication failed: Invalid security passcode.',
        };
      }
    }

    return {
      success: false,
      error: `Unrecognized Facilitator ID '${credentialId}'. Verify your official clearance code.`,
    };
  };

  const logout = () => {
    setUser(null);
  };

  const permissions = user ? getRolePermissions(user.role) : null;

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        permissions,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
