import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workspaces = await db.workspace.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, color, icon } = body;

    const workspace = await db.workspace.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || '#10b981',
        icon: icon || '🏢',
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
