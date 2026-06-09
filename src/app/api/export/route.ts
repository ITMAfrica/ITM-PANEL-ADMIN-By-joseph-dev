import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'tasks';

    let data: Array<Record<string, unknown>> = [];

    switch (type) {
      case 'tasks': {
        const tasks = await db.task.findMany({
          include: {
            assignee: { select: { name: true } },
            project: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        data = tasks.map((task) => ({
          Title: task.title,
          Status: task.status,
          Priority: task.priority,
          Assignee: task.assignee?.name ?? 'Unassigned',
          'Due Date': task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          Project: task.project?.name ?? '',
        }));
        break;
      }
      case 'projects': {
        const projects = await db.project.findMany({
          include: {
            tasks: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        data = projects.map((project) => ({
          Name: project.name,
          Status: project.status,
          Progress: project.tasks.length > 0
            ? `${Math.round((project.tasks.filter((t) => t.status === 'done').length / project.tasks.length) * 100)}%`
            : '0%',
          'Members Count': 0,
          'Tasks Count': project.tasks.length,
        }));
        break;
      }
      case 'workload': {
        const teams = await db.team.findMany({
          include: {
            teamMembers: { include: { user: { include: { assignedTasks: true } } } },
          },
        });
        data = teams.map((team) => {
          const allTasks = team.teamMembers.flatMap((tm) => tm.user.assignedTasks);
          return {
            Team: team.name,
            'Active Tasks': allTasks.filter((t) => t.status !== 'done').length,
            'Completed Tasks': allTasks.filter((t) => t.status === 'done').length,
          };
        });
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be tasks, projects, or workload.' },
          { status: 400 }
        );
    }

    if (format === 'json') {
      const jsonString = JSON.stringify(data, null, 2);
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${type}-export.json"`,
        },
      });
    }

    // CSV format (default)
    if (data.length === 0) {
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-export.csv"`,
        },
      });
    }

    const headers = Object.keys(data[0]);
    const escapeCSVValue = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerRow = headers.map(escapeCSVValue).join(',');
    const rows = data.map((obj) =>
      headers.map((key) => escapeCSVValue(obj[key])).join(',')
    );
    const csvString = [headerRow, ...rows].join('\n');

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
