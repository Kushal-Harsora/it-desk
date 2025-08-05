import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
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