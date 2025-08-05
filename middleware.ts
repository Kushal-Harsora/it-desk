import { NextResponse } from 'next/server'
 
export function middleware() {
  const res = NextResponse.next();
  res.headers.append('Access-Control-Allow-Origin', '*');
  return res;
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ],
}