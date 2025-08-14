import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPrivatePathPublic = path.startsWith("/dashboard")
  const isPrivatePathAdmin = path.startsWith("/admin/dashboard");
  const isPrivatePathsuperAdmin = path.startsWith("/superAdmin/dashboard");

  const isLoginPath: boolean = path === "/login";
  const isLoginPathAdmin: boolean = path === '/admin';

  const token = request.cookies.get("token")?.value || "";

  // 1. If user is trying to access login page while already logged in → redirect to "/"
  if (token) {
    if (isLoginPath) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    } else if (isLoginPathAdmin) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }
    else if(isPrivatePathsuperAdmin){
      const response = NextResponse.redirect(new URL("/superAdmin", request.url));
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }
  }

  // 2. If user is accessing a private path without token → redirect to login
  if (isPrivatePathPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  } else if (isPrivatePathAdmin && !token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  else if(isPrivatePathsuperAdmin && !token){
    return NextResponse.redirect(new URL("/superAdmin", request.url));
  }

  // 3. Default allow
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
}


// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/superAdmin/:path*',
    '/dashboard/:path*',
    '/api/:path*',
    '/login',
    '/admin',
    '/superAdmin'
  ],
}