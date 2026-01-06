import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // 認証が必要なパス
  const protectedPaths = ["/app", "/profile"];
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 認証済みユーザーがauthページにアクセス
  if (session && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/app/swipe", request.url));
  }

  // 未認証ユーザーが保護ページにアクセス
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/profile/:path*", "/auth/:path*"],
};

