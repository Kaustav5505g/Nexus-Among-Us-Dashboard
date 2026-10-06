import { AdminRole, RolePermissions } from '../types';

export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  super_admin: {
    levelName: 'Master Admin / Super Admin',
    levelNumber: 3,
    canStartEvent: true,
    canPauseEvent: true,
    canEndEvent: true,
    canToggleImpostorPowers: true,
    canAllotRoomsAndImpostors: true,
    canAddTeam: true,
    canEditTeam: true,
    canDeleteTeam: true,
    canTriggerSabotage: true,
    canCallEmergency: true,
    canManageAdmins: true,
    canManageTasksAndClues: true,
  },
  admin: {
    levelName: 'Event Admin',
    levelNumber: 2,
    canStartEvent: true,
    canPauseEvent: true,
    canEndEvent: false,
    canToggleImpostorPowers: false,
    canAllotRoomsAndImpostors: true,
    canAddTeam: true,
    canEditTeam: true,
    canDeleteTeam: false,
    canTriggerSabotage: true,
    canCallEmergency: true,
    canManageAdmins: false,
    canManageTasksAndClues: true,
  },
  moderator: {
    levelName: 'Point of Contact / Moderator',
    levelNumber: 1,
    canStartEvent: false,
    canPauseEvent: true, // POC can pause/freeze on-ground match
    canEndEvent: false,
    canToggleImpostorPowers: true, // POC can freeze/stop impostor powers
    canAllotRoomsAndImpostors: false,
    canAddTeam: true, // POC can register walk-ins
    canEditTeam: true, // POC can update check-in & score
    canDeleteTeam: false,
    canTriggerSabotage: false,
    canCallEmergency: true,
    canManageAdmins: false,
    canManageTasksAndClues: true,
  },
};

export const getRolePermissions = (role: AdminRole): RolePermissions => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.moderator;
};

/**
 * Root Master Account Guardian:
 * Aditya Goyal (nx-masteradmin) is the ultimate root master administrator.
 * This account is completely hidden from other admins/moderators on the website,
 * and cannot be edited, modified, demoted, or deleted by anyone except Aditya himself.
 */
export const isRootMasterAccount = (
  target: { id?: string; username?: string; name?: string; email?: string; facilitatorId?: string } | null | undefined
): boolean => {
  if (!target) return false;
  const u = (target.username || '').toLowerCase().trim();
  const fid = (target.facilitatorId || '').toLowerCase().trim();
  const id = (target.id || '').toLowerCase().trim();
  const name = (target.name || '').toLowerCase().trim();
  const email = (target.email || '').toLowerCase().trim();

  return (
    u === 'nx-masteradmin' ||
    fid === 'nx-masteradmin' ||
    fid === 'nx-super-00' ||
    id === 'a0000000-0000-0000-0000-000000000000' ||
    name === 'aditya goyal' ||
    email === 'nexus@nexus.org'
  );
};

export const isCurrentAdityaUser = (
  currentUser: { id?: string; username?: string; name?: string; email?: string; facilitatorId?: string } | null | undefined
): boolean => {
  return isRootMasterAccount(currentUser);
};

