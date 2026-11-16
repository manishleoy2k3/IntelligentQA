import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return handleGoogleAuth(req);
}

export async function POST(req: NextRequest) {
  return handleGoogleAuth(req);
}

async function handleGoogleAuth(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '/dashboard';
    const error = url.searchParams.get('error') || url.searchParams.get('error_description');

    if (error) {
      const targetUrl = new URL('/auth/callback', req.url);
      targetUrl.searchParams.set('error', error);
      targetUrl.searchParams.set('redirect_to', state);
      return NextResponse.redirect(targetUrl);
    }

    if (!code) {
      const targetUrl = new URL('/auth/callback', req.url);
      targetUrl.searchParams.set('error', 'missing_code');
      targetUrl.searchParams.set('redirect_to', state);
      return NextResponse.redirect(targetUrl);
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const origin = url.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code with Google token endpoint
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      const targetUrl = new URL('/auth/callback', req.url);
      targetUrl.searchParams.set('error', tokenData.error_description || tokenData.error || 'token_exchange_failed');
      targetUrl.searchParams.set('redirect_to', state);
      return NextResponse.redirect(targetUrl);
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();
    if (!userRes.ok || !userData.email) {
      console.error('Google userinfo fetch error:', userData);
      const targetUrl = new URL('/auth/callback', req.url);
      targetUrl.searchParams.set('error', 'userinfo_fetch_failed');
      targetUrl.searchParams.set('redirect_to', state);
      return NextResponse.redirect(targetUrl);
    }

    // 3. Redirect back to client /auth/callback with actual verified Google details
    const targetUrl = new URL('/auth/callback', req.url);
    targetUrl.searchParams.set('email', userData.email);
    targetUrl.searchParams.set('name', userData.name || userData.email.split('@')[0]);
    if (userData.picture) {
      targetUrl.searchParams.set('avatar', userData.picture);
    }
    targetUrl.searchParams.set('redirect_to', state);

    return NextResponse.redirect(targetUrl);
  } catch (err: any) {
    console.error('Unexpected error in Google OAuth handler:', err);
    const targetUrl = new URL('/auth/callback', req.url);
    targetUrl.searchParams.set('error', err?.message || 'oauth_server_error');
    return NextResponse.redirect(targetUrl);
  }
}
