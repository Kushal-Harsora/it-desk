import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPrivatePath = path.startsWith("/dashboard") || path.startsWith("/admin/dashboard");
  const isLoginPath = path === "/login";

  const token = request.cookies.get("token")?.value || "";

  // 1. If user is trying to access login page while already logged in → redirect to "/"
  if (isLoginPath && token) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    // Clear the token cookie (optional, based on your logic)
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return response;
  }

  // 2. If user is accessing a private path without token → redirect to login
  if (isPrivatePath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Default allow
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}


// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/login'
  ],
}