export const ADMIN_ROLES = new Set(["admin", "superadmin"]);
export const SUPER_ADMIN_ROLES = new Set(["superadmin"]);

export const isAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  return ADMIN_ROLES.has(role);
};

export const isSuperAdminRole = (role?: string | null): boolean => {
  if (!role) return false;
  return SUPER_ADMIN_ROLES.has(role);
};

export const isAdminUser = (user?: { role?: string | null } | null): boolean => {
  return isAdminRole(user?.role);
};

export const isSuperAdminUser = (user?: { role?: string | null } | null): boolean => {
  return isSuperAdminRole(user?.role);
};
