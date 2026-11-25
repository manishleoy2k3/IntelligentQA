import { NextRequest, NextResponse } from 'next/server';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

let mockUsers: MockUser[] = [
  {
    id: 'usr-101',
    name: 'Priya Sharma',
    email: 'priya.qa@techcorp.io',
    role: 'Staff SDET',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'usr-102',
    name: 'Marcus Chen',
    email: 'marcus.chen@fincloud.dev',
    role: 'Lead QA',
    status: 'active',
    createdAt: '2026-02-14T11:30:00Z',
  },
  {
    id: 'usr-103',
    name: 'Elena Rostova',
    email: 'elena.rostova@cloudscale.net',
    role: 'Senior Automation Engineer',
    status: 'active',
    createdAt: '2026-03-01T14:15:00Z',
  },
  {
    id: 'usr-104',
    name: 'Devon Patel',
    email: 'devon.p@microtest.ai',
    role: 'SDET',
    status: 'inactive',
    createdAt: '2026-04-12T16:45:00Z',
  },
  {
    id: 'usr-105',
    name: 'Sarah Jenkins',
    email: 'sarah.j@qualityfirst.org',
    role: 'Principal SDET',
    status: 'active',
    createdAt: '2026-05-20T10:00:00Z',
  },
];

const MOCK_JWT_SECRET = 'intelligentqa-secret-token-2026-sdet-mastery';

function verifyBearer(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return false;
  return parts[1].length > 10;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');

  // 1. /api/sandbox/v1/delay/:seconds
  if (route[0] === 'delay' && route[1]) {
    const rawSeconds = parseInt(route[1], 10);
    const seconds = Math.min(Math.max(isNaN(rawSeconds) ? 1 : rawSeconds, 1), 10);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return NextResponse.json({
      message: `Delayed response delivered successfully after ${seconds} second(s).`,
      delaySeconds: seconds,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. /api/sandbox/v1/status/:code
  if (route[0] === 'status' && route[1]) {
    const code = parseInt(route[1], 10);
    const statusCode = isNaN(code) || code < 100 || code > 599 ? 400 : code;
    return NextResponse.json(
      {
        requestedStatus: statusCode,
        statusText: statusCode >= 400 ? 'Client or Server Error Injected for Testing' : 'Success',
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }

  // 3. /api/sandbox/v1/users
  if (route[0] === 'users') {
    // Check Bearer Token
    if (!verifyBearer(req)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing or invalid Bearer token in Authorization header.',
          hint: 'Authenticate via POST /api/sandbox/v1/auth/login or supply header: Authorization: Bearer mock-jwt-token',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let filtered = [...mockUsers];
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    // Specific user ID
    if (route[1]) {
      const user = filtered.find((u) => u.id === route[1]);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        total: filtered.length,
        page,
        limit,
        users: paginated,
      },
      {
        headers: {
          'X-Total-Count': filtered.length.toString(),
          'X-Page': page.toString(),
          'X-Limit': limit.toString(),
        },
      }
    );
  }

  // 4. Default / info
  return NextResponse.json({
    status: 'IntelligentQA Mock API Online',
    version: 'v1.0.0',
    availableEndpoints: [
      'POST /api/sandbox/v1/auth/login',
      'GET  /api/sandbox/v1/users',
      'POST /api/sandbox/v1/users',
      'PUT  /api/sandbox/v1/users/:id',
      'DELETE /api/sandbox/v1/users/:id',
      'GET  /api/sandbox/v1/delay/:seconds',
      'GET  /api/sandbox/v1/status/:code',
    ],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;

  // 1. /api/sandbox/v1/auth/login
  if (route[0] === 'auth' && route[1] === 'login') {
    try {
      const body = await req.json();
      const { email, password } = body || {};

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Both "email" and "password" fields are required.' },
          { status: 400 }
        );
      }

      if (password === 'invalid' || password === 'wrong') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid credentials provided.' },
          { status: 401 }
        );
      }

      // Generate simulated valid JWT
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(
        JSON.stringify({ sub: email, role: 'sdet', exp: Math.floor(Date.now() / 1000) + 3600 })
      ).toString('base64')}.${MOCK_JWT_SECRET}`;

      return NextResponse.json({
        token: mockToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { email, role: 'SDET Practitioner' },
      });
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
  }

  // 2. /api/sandbox/v1/users
  if (route[0] === 'users') {
    if (!verifyBearer(req)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid Bearer token.' },
        { status: 401 }
      );
    }

    try {
      const body = await req.json();
      const { name, email, role } = body || {};

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Field "name" is required and must be a non-empty string.',
          },
          { status: 400 }
        );
      }

      const newUser: MockUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@intelligentqa-sandbox.dev`,
        role: role || 'SDET',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      mockUsers.unshift(newUser);
      return NextResponse.json(newUser, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  if (route[0] === 'users' && route[1]) {
    if (!verifyBearer(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = route[1];
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      id: userId, // Preserve ID
    };

    return NextResponse.json(mockUsers[userIndex]);
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  if (route[0] === 'users' && route[1]) {
    if (!verifyBearer(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = route[1];
    const initialLen = mockUsers.length;
    mockUsers = mockUsers.filter((u) => u.id !== userId);

    if (mockUsers.length === initialLen) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 204 No Content
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}
