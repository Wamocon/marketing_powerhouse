import { NextRequest, NextResponse } from 'next/server';

import { fetchSubscription, fetchUserCompanyRole } from '@/lib/api';
import { hasSocialHubPlanEntitlement } from '@/lib/socialHubEntitlements';

type SocialHubMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type SocialHubBridgeRequest = {
  userId?: string;
  companyId?: string;
  path?: string;
  method?: SocialHubMethod;
  body?: unknown;
};

const ALLOWED_SOCIAL_HUB_ROLES = new Set(['company_admin', 'manager']);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedPath(path: string): boolean {
  if (!path.startsWith('/api/v1/') || path.includes('..') || path.includes('://')) {
    return false;
  }

  return (
    path === '/api/v1/generate' ||
    path === '/api/v1/topics/suggest' ||
    path === '/api/v1/generate-from-task' ||
    path.startsWith('/api/v1/readiness/') ||
    path.startsWith('/api/v1/publish/') ||
    path.startsWith('/api/v1/regenerate-text/') ||
    path.startsWith('/api/v1/regenerate-image/') ||
    path.startsWith('/api/v1/posts/') ||
    path.startsWith('/api/v1/accounts/')
  );
}

function resolveSocialHubUrl(request: NextRequest, path: string): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_SOCIAL_HUB_URL || '/social-hub';
  if (/^https?:\/\//i.test(configuredBaseUrl)) {
    return new URL(path, configuredBaseUrl).toString();
  }

  return new URL(`${configuredBaseUrl}${path}`, request.nextUrl.origin).toString();
}

function sanitizeForwardBody(body: unknown, userId: string, companyId: string): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }

  return {
    ...(body as Record<string, unknown>),
    company_id: companyId,
    user_id: userId,
  };
}

export async function POST(request: NextRequest) {
  let payload: SocialHubBridgeRequest;
  try {
    payload = (await request.json()) as SocialHubBridgeRequest;
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }

  const userId = payload.userId?.trim();
  const companyId = payload.companyId?.trim();
  const path = payload.path?.trim();
  const method = payload.method ?? 'GET';

  if (!userId || !companyId || !path) {
    return NextResponse.json({ detail: 'userId, companyId, and path are required.' }, { status: 400 });
  }

  if (!isAllowedPath(path)) {
    return NextResponse.json({ detail: 'Unsupported Social Hub path.' }, { status: 400 });
  }

  const role = await fetchUserCompanyRole(userId, companyId);
  if (!role || !ALLOWED_SOCIAL_HUB_ROLES.has(role)) {
    return NextResponse.json({ detail: 'Access denied.' }, { status: 403 });
  }

  const subscription = await fetchSubscription(companyId);
  if (!hasSocialHubPlanEntitlement(subscription)) {
    return NextResponse.json(
      { detail: 'Social Hub is available on Pro and Ultimate plans. Upgrade to Pro to continue.' },
      { status: 403 },
    );
  }

  const upstreamUrl = resolveSocialHubUrl(request, path);
  const upstreamHeaders: Record<string, string> = {
    'X-Company-Id': companyId,
    Cookie: `_session_id=${encodeURIComponent(userId)}; _company_id=${encodeURIComponent(companyId)}`,
  };

  let upstreamBody: string | undefined;
  if (method !== 'GET' && payload.body !== undefined) {
    upstreamHeaders['Content-Type'] = 'application/json';
    upstreamBody = JSON.stringify(sanitizeForwardBody(payload.body, userId, companyId));
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: upstreamHeaders,
      body: upstreamBody,
      cache: 'no-store',
    });

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type') || '';
    const parsedBody = contentType.includes('application/json')
      ? JSON.parse(responseText || '{}')
      : { detail: responseText || upstreamResponse.statusText };

    return NextResponse.json(parsedBody, { status: upstreamResponse.status });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Social Hub bridge failed.' },
      { status: 502 },
    );
  }
}