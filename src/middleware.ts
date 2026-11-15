import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionSecret, verifySessionToken } from "@/infrastructure/auth/session";

/** Все страницы /admin, кроме входа, доступны только с валидной сессией. */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = sessionSecret();
  const valid = secret ? await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, secret) : false;
  if (valid) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
