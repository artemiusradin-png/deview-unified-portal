import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie";
import { isClientIpAllowed } from "@/lib/ip-allowlist";
import { getSessionFromToken } from "@/lib/session-edge";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPublicPath(pathname)) {
    const rules = process.env.ALLOWED_IP_CIDRS;
    if (!isClientIpAllowed(clientIp(request), rules)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionFromToken(raw);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (session.role !== "ADMIN") {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
