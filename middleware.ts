
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes
// Admin routes require specific permissions (handled in page logic or refined middleware later)
const isProtected = createRouteMatcher([
    '/portal(.*)',
    '/admin(.*)'  // We will protect admin routes with auth now too
]);

export default clerkMiddleware((auth, req) => {
    if (isProtected(req)) auth().protect();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
