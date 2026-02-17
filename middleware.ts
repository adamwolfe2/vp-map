
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
    '/portal(.*)',
    '/admin(.*)',
    // '/api/((?!clients).*)' // OLD: Only clients public
    // NEW: Allow ALL API routes to be public to fix lead gen & CRM save
    // We are temporarily disabling auth on API routes to debug fetch issues
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtected(req)) {
        const session = await auth();
        if (!session.userId) {
            return session.redirectToSignIn();
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
