import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get userId from cookies
  const userId = request.cookies.get('userId')?.value;
  
  // Get the requested path - keep original case for matching
  const path = request.nextUrl.pathname;
  const pathLower = path.toLowerCase();
  
  // Skip middleware for static files, images, and Next.js assets
  if (pathLower.startsWith('/images/') ||
      pathLower.startsWith('/static/') ||
      pathLower.startsWith('/public/') ||
      pathLower.startsWith('/_next/') ||
      pathLower.startsWith('/api/') ||  // Important: Skip all API routes
      /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|avif|json|xml)$/i.test(path)) {
    return NextResponse.next();
  }
  
  // Skip middleware completely for admin routes
  if (pathLower.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Protected routes that require authentication
  const protectedRoutes = ['/cart', '/checkout', '/profile', '/orders'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  if (isProtectedRoute && !userId) {
    const url = new URL('/Login', request.url);
    url.searchParams.set('redirectTo', path);
    url.searchParams.set('message', 'Please login to continue');
    return NextResponse.redirect(url);
  }
  
  // Handle auth pages - redirect logged-in users away from login/register
  const authPages = ['/Login', '/Register', '/forgot-password'];
  if (authPages.includes(path) && userId) {
    // Check if there's a redirect parameter
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    if (redirectTo && !authPages.includes(redirectTo)) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Allow all other routes to proceed
  return NextResponse.next();
}

// Match all routes except for static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};