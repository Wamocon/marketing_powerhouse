import type { NextConfig } from 'next';

const socialHubInternalUrl = process.env.SOCIAL_HUB_INTERNAL_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
    // Use trailing slashes consistent with the original routing
    trailingSlash: false,
    async rewrites() {
        return [
            {
                source: '/social-hub/:path*',
                destination: `${socialHubInternalUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
