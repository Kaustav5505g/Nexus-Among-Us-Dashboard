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
