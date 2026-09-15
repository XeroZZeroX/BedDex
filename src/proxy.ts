import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/auth"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Lit le token Supabase depuis les cookies
  const hasSession =
    request.cookies.has("beddex_auth-auth-token") ||
    request.cookies.has("sb-access-token") ||
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.endsWith("-auth-token") || c.name.endsWith("-auth-token.0")
    )

  // Pas de session et page protégée → login
  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Déjà connecté et tente d'aller sur /login → dashboard
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

