import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      agencyId: string | null;
      clientId: string | null;
      supportAgencyId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    agencyId: string | null;
    clientId: string | null;
    supportAgencyId: string | null;
  }
}
