import type { Request, Response } from 'express';
import { db } from '../lib/prisma';
import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  verifyPassword,
  type SessionUser,
} from '../lib/auth';

const userWithWorkspaceInclude = {
  workspaceMembers: {
    include: { workspace: true },
    orderBy: { joinedAt: 'asc' as const },
    take: 1,
  },
};

async function sendAuthResponse(
  res: Response,
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
    workspaceMembers: Array<{ workspaceId: string; workspace: { name: string } }>;
  },
  status = 200,
) {
  const membership = user.workspaceMembers[0];
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: membership?.workspaceId ?? '',
    tenantName: membership?.workspace.name ?? '',
  };

  await setSessionCookie(res, sessionUser);

  res.status(status).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? '',
      role: user.role,
      tenantId: sessionUser.tenantId,
      tenantName: sessionUser.tenantName,
    },
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ error: 'Name, email and password required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: await hashPassword(password),
        role: 'tenant_admin',
      },
      include: userWithWorkspaceInclude,
    });

    await sendAuthResponse(res, user, 201);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: userWithWorkspaceInclude,
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    await sendAuthResponse(res, user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function logout(_req: Request, res: Response) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ user: null });
    return;
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: '',
      role: req.user.role,
      tenantId: req.user.tenantId,
      tenantName: req.user.tenantName,
    },
  });
}
