import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// Define the routes that are protected (Dashboard)
const protectedRoutes = ['/', '/customers', '/products', '/orders', '/employees', '/reports', '/predictions'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    );
    
    const isAuthRoute = authRoutes.includes(pathname);

    // Skip API routes except we might want to protect them later
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth/seed')) {
       // Allow API calls to proceed or add API auth if needed.
       // For dashboard interactions API should be protected theoretically
       // But let's mainly protect the UI for now.
    }

    if (!isProtectedRoute && !isAuthRoute) return NextResponse.next();

    // Verify session
    const sessionCookie = request.cookies.get('session')?.value;
    const session = sessionCookie ? await decrypt(sessionCookie) : null;

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthRoute && session) {
        // If logged in and trying to access /login, redirect to dashboard
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Config to limit middleware to specific matcher paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
