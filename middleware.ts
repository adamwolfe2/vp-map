
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

'/portal(.*)',
    '/admin(.*)',
    '/api/((?!clients).*)' // ALLOW /api/clients to be public
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
