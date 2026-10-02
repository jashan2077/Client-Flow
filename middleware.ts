import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes — skip all auth logic
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Root "/" — redirect authenticated users to their dashboard immediately,
  // otherwise send to login. No auth() round-trip needed in page.tsx.
  if (pathname === "/") {
    if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));
    const { role } = session.user;
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin/dashboard", req.url));
    if (role === "AGENCY_ADMIN" || role === "AGENCY_TEAM") return NextResponse.redirect(new URL("/agency/dashboard", req.url));
    if (role === "CLIENT") return NextResponse.redirect(new URL("/client-portal/dashboard", req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Login page — already authenticated users skip it
  if (pathname === "/login") {
    if (session?.user) {
      const { role } = session.user;
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin/dashboard", req.url));
      if (role === "AGENCY_ADMIN" || role === "AGENCY_TEAM") return NextResponse.redirect(new URL("/agency/dashboard", req.url));
      if (role === "CLIENT") return NextResponse.redirect(new URL("/client-portal/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Not authenticated
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role, agencyId, supportAgencyId } = session.user;

  // Super Admin routes
  if (pathname.startsWith("/super-admin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Agency routes
  if (pathname.startsWith("/agency") || pathname.startsWith("/api/agency")) {
    // Support mode: SUPER_ADMIN entering an agency workspace
    if (role === "SUPER_ADMIN" && supportAgencyId) {
      return NextResponse.next();
    }
    if (role !== "AGENCY_ADMIN" && role !== "AGENCY_TEAM") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Suspended agency check happens in API routes / server components
    return NextResponse.next();
  }

  // Client portal routes
  if (pathname.startsWith("/client-portal")) {
    if (role !== "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/super-admin/:path*",
    "/agency/:path*",
    "/client-portal/:path*",
    "/api/agency/:path*",
    "/api/super-admin/:path*",
    "/api/support/:path*",
  ],
};
