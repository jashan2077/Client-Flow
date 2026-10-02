import { Role } from "@prisma/client";

type UserSession = {
  role: Role;
  agencyId?: string | null;
  clientId?: string | null;
};

export function canAccessSuperAdmin(user: UserSession) {
  return user.role === "SUPER_ADMIN";
}

export function canAccessAgency(user: UserSession, agencyId: string) {
  if (user.role === "SUPER_ADMIN") return true;
  return (
    (user.role === "AGENCY_ADMIN" || user.role === "AGENCY_TEAM") &&
    user.agencyId === agencyId
  );
}

export function canAccessClientPortal(user: UserSession) {
  return user.role === "CLIENT";
}

export function isAgencyMember(user: UserSession) {
  return user.role === "AGENCY_ADMIN" || user.role === "AGENCY_TEAM";
}

export function isAgencyAdmin(user: UserSession) {
  return user.role === "AGENCY_ADMIN";
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  AGENCY_ADMIN: "Agency Admin",
  AGENCY_TEAM: "Team Member",
  CLIENT: "Client",
};
