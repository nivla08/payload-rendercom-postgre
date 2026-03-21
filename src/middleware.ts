import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|admin|_next|favicon.ico).*)'],
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
