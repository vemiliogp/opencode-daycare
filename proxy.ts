import { type NextRequest, NextResponse } from "next/server";
import { createClientForProxy } from "@/utils/supabase/server";

const publicPaths = ["/login", "/activar-cuenta"];

export default async function proxy(req: NextRequest) {
  const { supabase, response } = createClientForProxy(req);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico";

  if (isPublicPath) {
    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return response;
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
