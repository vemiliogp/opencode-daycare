import { type NextRequest, NextResponse } from "next/server";
import { createClientForProxy } from "@/utils/supabase/server";

const authRoutes = ["/login", "/activar-cuenta"];

export default async function proxy(req: NextRequest) {
  const { supabase, response } = createClientForProxy(req);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Auth routes are always accessible
  if (authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return response;
  }

  // Unauthenticated → redirect to /login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Query users table for role
  const { data: dbUser, error: dbError } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // No users row → treat as unauthenticated
  if (dbError || !dbUser) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = dbUser.role as string;

  // Staff/admin: block from family routes
  if ((role === "staff" || role === "admin") && pathname.startsWith("/family")) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Parent: block from staff routes
  if (role === "parent") {
    const isStaffRoute =
      pathname === "/" ||
      pathname.startsWith("/kids") ||
      pathname.startsWith("/avisos");
    if (isStaffRoute) {
      const familyUrl = new URL("/family", req.url);
      return NextResponse.redirect(familyUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
