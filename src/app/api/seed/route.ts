import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Create users
    const users = await Promise.all([
      db.user.upsert({ where: { email: 'alex@acmecorp.com' }, update: {}, create: { email: 'alex@acmecorp.com', name: 'Alex Thompson', role: 'admin', status: 'online' } }),
      db.user.upsert({ where: { email: 'sarah@acmecorp.com' }, update: {}, create: { email: 'sarah@acmecorp.com', name: 'Sarah Chen', role: 'member', status: 'online' } }),
      db.user.upsert({ where: { email: 'marcus@acmecorp.com' }, update: {}, create: { email: 'marcus@acmecorp.com', name: 'Marcus Rivera', role: 'member', status: 'away' } }),
      db.user.upsert({ where: { email: 'emily@acmecorp.com' }, update: {}, create: { email: 'emily@acmecorp.com', name: 'Emily Watson', role: 'member', status: 'offline' } }),
      db.user.upsert({ where: { email: 'david@acmecorp.com' }, update: {}, create: { email: 'david@acmecorp.com', name: 'David Kim', role: 'guest', status: 'online' } }),
      db.user.upsert({ where: { email: 'lisa@acmecorp.com' }, update: {}, create: { email: 'lisa@acmecorp.com', name: 'Lisa Park', role: 'member', status: 'busy' } }),
      db.user.upsert({ where: { email: 'james@acmecorp.com' }, update: {}, create: { email: 'james@acmecorp.com', name: 'James Wilson', role: 'member', status: 'online' } }),
      db.user.upsert({ where: { email: 'nina@acmecorp.com' }, update: {}, create: { email: 'nina@acmecorp.com', name: 'Nina Patel', role: 'admin', status: 'away' } }),
    ]);

    // Create workspace
    const workspace = await db.workspace.upsert({
      where: { slug: 'acme-corp' },
      update: {},
      create: {
        name: 'Acme Corp',
        slug: 'acme-corp',
        color: '#10b981',
        icon: '🏢',
      },
    });

    // Add users to workspace
    for (const user of users) {
      await db.workspaceMember.upsert({
        where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
        update: {},
        create: { userId: user.id, workspaceId: workspace.id, role: user.role },
      });
    }

    // Create projects
    const projects = await Promise.all([
      db.project.create({ data: { name: 'Website Redesign', description: 'Complete redesign of the company website', color: '#10b981', icon: '🌐', status: 'active', workspaceId: workspace.id } }),
      db.project.create({ data: { name: 'Mobile App V2', description: 'Second version of our mobile application', color: '#f59e0b', icon: '📱', status: 'active', workspaceId: workspace.id } }),
      db.project.create({ data: { name: 'API Integration', description: 'Third-party API integrations', color: '#ef4444', icon: '⚡', status: 'active', workspaceId: workspace.id } }),
      db.project.create({ data: { name: 'Marketing Campaign', description: 'Q1 2025 marketing campaign', color: '#8b5cf6', icon: '📢', status: 'on_hold', workspaceId: workspace.id } }),
    ]);

    // Create some tasks
    await Promise.all([
      db.task.create({ data: { title: 'Design homepage hero section', description: 'Create a visually striking hero section', status: 'in_progress', priority: 'high', tags: 'design,frontend', dueDate: new Date('2025-01-25'), projectId: projects[0].id, assigneeId: users[1].id, creatorId: users[0].id } }),
      db.task.create({ data: { title: 'Set up authentication flow', description: 'Implement OAuth2 with providers', status: 'todo', priority: 'urgent', tags: 'backend,security', dueDate: new Date('2025-01-22'), projectId: projects[0].id, assigneeId: users[0].id, creatorId: users[0].id } }),
      db.task.create({ data: { title: 'Create onboarding screens', description: 'Design and implement mobile onboarding', status: 'review', priority: 'medium', tags: 'design,mobile', dueDate: new Date('2025-01-28'), projectId: projects[1].id, assigneeId: users[3].id, creatorId: users[1].id } }),
      db.task.create({ data: { title: 'Implement payment API', description: 'Stripe payment integration', status: 'in_progress', priority: 'high', tags: 'backend,payments', dueDate: new Date('2025-01-30'), projectId: projects[1].id, assigneeId: users[2].id, creatorId: users[0].id } }),
      db.task.create({ data: { title: 'Database migration script', description: 'Migration scripts for new schema', status: 'done', priority: 'high', tags: 'backend,database', dueDate: new Date('2025-01-20'), projectId: projects[2].id, assigneeId: users[0].id, creatorId: users[0].id } }),
    ]);

    // Create channels
    const channels = await Promise.all([
      db.channel.create({ data: { name: 'general', type: 'team', workspaceId: workspace.id } }),
      db.channel.create({ data: { name: 'website-redesign', type: 'project', workspaceId: workspace.id } }),
      db.channel.create({ data: { name: 'engineering', type: 'team', workspaceId: workspace.id } }),
    ]);

    // Add channel members
    for (const channel of channels) {
      for (const user of users.slice(0, 5)) {
        await db.channelMember.create({
          data: { channelId: channel.id, userId: user.id },
        });
      }
    }

    // Create some messages
    await Promise.all([
      db.message.create({ data: { content: 'Hey team! Just pushed the latest changes to staging.', channelId: channels[0].id, userId: users[0].id } }),
      db.message.create({ data: { content: 'On it! I\'ll review the API changes this afternoon.', channelId: channels[0].id, userId: users[2].id } }),
      db.message.create({ data: { content: 'The new dashboard looks amazing! 🎉', channelId: channels[0].id, userId: users[1].id } }),
      db.message.create({ data: { content: 'Homepage mockup is ready for review.', channelId: channels[1].id, userId: users[1].id } }),
    ]);

    // Create teams
    await Promise.all([
      db.team.create({ data: { name: 'Engineering', description: 'Core engineering team', color: '#10b981', workspaceId: workspace.id } }),
      db.team.create({ data: { name: 'Design', description: 'UI/UX design and brand', color: '#f59e0b', workspaceId: workspace.id } }),
    ]);

    return NextResponse.json({ message: 'Database seeded successfully', users: users.length, projects: projects.length, channels: channels.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
