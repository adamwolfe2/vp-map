
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
    '/portal(.*)',
    '/admin(.*)'
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
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
