/** @type {import('next').NextConfig} */
const nextConfig = {};

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'Missing Clerk Environment Variables. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your Vercel project settings.'
        );
    }
}

export default nextConfig;
