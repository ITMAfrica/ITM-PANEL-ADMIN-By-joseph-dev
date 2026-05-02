import type {
  User,
  Project,
  Task,
  Channel,
  Message,
  Meeting,
  FileItem,
  WikiPage,
  ActivityItem,
  Team,
  Automation,
  CalendarEvent,
} from './types';

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Alex Thompson', email: 'alex@acmecorp.com', avatar: '', role: 'admin', status: 'online' },
  { id: 'u-2', name: 'Sarah Chen', email: 'sarah@acmecorp.com', avatar: '', role: 'member', status: 'online' },
  { id: 'u-3', name: 'Marcus Rivera', email: 'marcus@acmecorp.com', avatar: '', role: 'member', status: 'away' },
  { id: 'u-4', name: 'Emily Watson', email: 'emily@acmecorp.com', avatar: '', role: 'member', status: 'offline' },
  { id: 'u-5', name: 'David Kim', email: 'david@acmecorp.com', avatar: '', role: 'guest', status: 'online' },
  { id: 'u-6', name: 'Lisa Park', email: 'lisa@acmecorp.com', avatar: '', role: 'member', status: 'busy' },
  { id: 'u-7', name: 'James Wilson', email: 'james@acmecorp.com', avatar: '', role: 'member', status: 'online' },
  { id: 'u-8', name: 'Nina Patel', email: 'nina@acmecorp.com', avatar: '', role: 'admin', status: 'away' },
];

export const mockProjects: Project[] = [
  {
    id: 'p-1', name: 'Website Redesign', description: 'Complete redesign of the company website with modern UI/UX',
    color: '#10b981', icon: '🌐', status: 'active', progress: 65, members: ['u-1', 'u-2', 'u-3'],
    taskCount: 24, completedTasks: 16, dueDate: '2025-03-15', createdAt: '2024-11-01',
  },
  {
    id: 'p-2', name: 'Mobile App V2', description: 'Second version of our mobile application',
    color: '#f59e0b', icon: '📱', status: 'active', progress: 40, members: ['u-2', 'u-4', 'u-5'],
    taskCount: 32, completedTasks: 13, dueDate: '2025-04-30', createdAt: '2024-12-01',
  },
  {
    id: 'p-3', name: 'API Integration', description: 'Third-party API integrations and microservices',
    color: '#ef4444', icon: '⚡', status: 'active', progress: 80, members: ['u-1', 'u-3', 'u-6'],
    taskCount: 18, completedTasks: 14, dueDate: '2025-02-28', createdAt: '2024-10-15',
  },
  {
    id: 'p-4', name: 'Marketing Campaign', description: 'Q1 2025 marketing campaign planning and execution',
    color: '#8b5cf6', icon: '📢', status: 'on_hold', progress: 25, members: ['u-4', 'u-7'],
    taskCount: 15, completedTasks: 4, dueDate: '2025-05-01', createdAt: '2025-01-01',
  },
  {
    id: 'p-5', name: 'Data Analytics Dashboard', description: 'Real-time analytics dashboard for business insights',
    color: '#06b6d4', icon: '📊', status: 'active', progress: 55, members: ['u-1', 'u-6', 'u-8'],
    taskCount: 20, completedTasks: 11, dueDate: '2025-03-31', createdAt: '2024-11-15',
  },
  {
    id: 'p-6', name: 'Security Audit', description: 'Annual security audit and compliance review',
    color: '#ec4899', icon: '🔒', status: 'completed', progress: 100, members: ['u-3', 'u-8'],
    taskCount: 12, completedTasks: 12, dueDate: '2025-01-15', createdAt: '2024-09-01',
  },
];

export const mockTasks: Task[] = [
  {
    id: 't-1', title: 'Design homepage hero section', description: 'Create a visually striking hero section with animations',
    status: 'in_progress', priority: 'high', assigneeId: 'u-2', projectId: 'p-1',
    tags: ['design', 'frontend'], dueDate: '2025-01-25', createdAt: '2025-01-15',
    subtasks: [
      { id: 'st-1', title: 'Create wireframes', completed: true },
      { id: 'st-2', title: 'Design mockup in Figma', completed: true },
      { id: 'st-3', title: 'Implement responsive layout', completed: false },
    ],
  },
  {
    id: 't-2', title: 'Set up authentication flow', description: 'Implement OAuth2 with Google and GitHub providers',
    status: 'todo', priority: 'urgent', assigneeId: 'u-1', projectId: 'p-1',
    tags: ['backend', 'security'], dueDate: '2025-01-22', createdAt: '2025-01-10',
    subtasks: [
      { id: 'st-4', title: 'Configure OAuth providers', completed: false },
      { id: 'st-5', title: 'Build login UI', completed: false },
    ],
  },
  {
    id: 't-3', title: 'Create onboarding screens', description: 'Design and implement mobile onboarding flow',
    status: 'review', priority: 'medium', assigneeId: 'u-4', projectId: 'p-2',
    tags: ['design', 'mobile'], dueDate: '2025-01-28', createdAt: '2025-01-12',
    subtasks: [
      { id: 'st-6', title: 'Design screens', completed: true },
      { id: 'st-7', title: 'Add animations', completed: false },
    ],
  },
  {
    id: 't-4', title: 'Implement payment API', description: 'Stripe payment integration for subscriptions',
    status: 'in_progress', priority: 'high', assigneeId: 'u-3', projectId: 'p-2',
    tags: ['backend', 'payments'], dueDate: '2025-01-30', createdAt: '2025-01-08',
    subtasks: [
      { id: 'st-8', title: 'Set up Stripe account', completed: true },
      { id: 'st-9', title: 'Create webhook handlers', completed: true },
      { id: 'st-10', title: 'Test payment flow', completed: false },
    ],
  },
  {
    id: 't-5', title: 'Write API documentation', description: 'Complete OpenAPI spec for all endpoints',
    status: 'todo', priority: 'low', assigneeId: 'u-6', projectId: 'p-3',
    tags: ['documentation'], dueDate: '2025-02-05', createdAt: '2025-01-14',
    subtasks: [],
  },
  {
    id: 't-6', title: 'Database migration script', description: 'Create migration scripts for the new schema',
    status: 'done', priority: 'high', assigneeId: 'u-1', projectId: 'p-3',
    tags: ['backend', 'database'], dueDate: '2025-01-20', createdAt: '2025-01-05',
    subtasks: [
      { id: 'st-11', title: 'Write migration SQL', completed: true },
      { id: 'st-12', title: 'Test on staging', completed: true },
    ],
  },
  {
    id: 't-7', title: 'Performance optimization', description: 'Optimize bundle size and loading times',
    status: 'in_progress', priority: 'medium', assigneeId: 'u-7', projectId: 'p-1',
    tags: ['frontend', 'performance'], dueDate: '2025-02-01', createdAt: '2025-01-18',
    subtasks: [
      { id: 'st-13', title: 'Analyze bundle', completed: true },
      { id: 'st-14', title: 'Implement code splitting', completed: false },
    ],
  },
  {
    id: 't-8', title: 'Design email templates', description: 'Create transactional email templates',
    status: 'todo', priority: 'medium', assigneeId: 'u-4', projectId: 'p-4',
    tags: ['design', 'email'], dueDate: '2025-02-10', createdAt: '2025-01-16',
    subtasks: [],
  },
  {
    id: 't-9', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployments',
    status: 'review', priority: 'high', assigneeId: 'u-3', projectId: 'p-3',
    tags: ['devops'], dueDate: '2025-01-24', createdAt: '2025-01-11',
    subtasks: [
      { id: 'st-15', title: 'Configure build pipeline', completed: true },
      { id: 'st-16', title: 'Add deployment scripts', completed: true },
      { id: 'st-17', title: 'Setup monitoring', completed: false },
    ],
  },
  {
    id: 't-10', title: 'User analytics dashboard', description: 'Build real-time user analytics with charts',
    status: 'in_progress', priority: 'high', assigneeId: 'u-6', projectId: 'p-5',
    tags: ['frontend', 'analytics'], dueDate: '2025-02-08', createdAt: '2025-01-13',
    subtasks: [
      { id: 'st-18', title: 'Design dashboard layout', completed: true },
      { id: 'st-19', title: 'Implement charts', completed: false },
      { id: 'st-20', title: 'Add filtering', completed: false },
    ],
  },
  {
    id: 't-11', title: 'Mobile push notifications', description: 'Implement Firebase push notifications',
    status: 'todo', priority: 'medium', assigneeId: 'u-5', projectId: 'p-2',
    tags: ['mobile', 'backend'], dueDate: '2025-02-15', createdAt: '2025-01-19',
    subtasks: [],
  },
  {
    id: 't-12', title: 'Security vulnerability scan', description: 'Run automated security scan and fix issues',
    status: 'done', priority: 'urgent', assigneeId: 'u-8', projectId: 'p-6',
    tags: ['security'], dueDate: '2025-01-18', createdAt: '2025-01-02',
    subtasks: [
      { id: 'st-21', title: 'Run OWASP scan', completed: true },
      { id: 'st-22', title: 'Fix critical issues', completed: true },
    ],
  },
];

export const mockChannels: Channel[] = [
  { id: 'ch-1', name: 'general', type: 'team', members: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'], unread: 3 },
  { id: 'ch-2', name: 'website-redesign', type: 'project', members: ['u-1', 'u-2', 'u-3'], unread: 0 },
  { id: 'ch-3', name: 'mobile-app', type: 'project', members: ['u-2', 'u-4', 'u-5'], unread: 5 },
  { id: 'ch-4', name: 'engineering', type: 'team', members: ['u-1', 'u-3', 'u-6', 'u-7', 'u-8'], unread: 1 },
  { id: 'ch-5', name: 'design', type: 'team', members: ['u-2', 'u-4'], unread: 0 },
  { id: 'ch-6', name: 'Alex Thompson', type: 'direct', members: ['u-1', 'u-2'], unread: 2 },
  { id: 'ch-7', name: 'Emily Watson', type: 'direct', members: ['u-1', 'u-4'], unread: 0 },
];

export const mockMessages: Record<string, Message[]> = {
  'ch-1': [
    { id: 'm-1', content: 'Hey team! Just pushed the latest changes to staging. Can someone review?', senderId: 'u-1', channelId: 'ch-1', timestamp: '2025-01-20T09:00:00Z', reactions: [{ emoji: '👍', users: ['u-2', 'u-3'] }], attachments: [] },
    { id: 'm-2', content: 'On it! I\'ll review the API changes this afternoon.', senderId: 'u-3', channelId: 'ch-1', timestamp: '2025-01-20T09:05:00Z', reactions: [], attachments: [] },
    { id: 'm-3', content: 'The new dashboard looks amazing! Great work on the charts 🎉', senderId: 'u-2', channelId: 'ch-1', timestamp: '2025-01-20T09:15:00Z', reactions: [{ emoji: '🔥', users: ['u-1', 'u-4'] }], attachments: [] },
    { id: 'm-4', content: 'Thanks! I used Recharts for the data visualization. Let me know if you want to add more chart types.', senderId: 'u-1', channelId: 'ch-1', timestamp: '2025-01-20T09:20:00Z', reactions: [], attachments: [] },
    { id: 'm-5', content: 'Can we schedule a quick sync about the mobile app timeline?', senderId: 'u-4', channelId: 'ch-1', timestamp: '2025-01-20T10:00:00Z', reactions: [], attachments: [] },
  ],
  'ch-2': [
    { id: 'm-6', content: 'Homepage mockup is ready for review. Check the Figma link.', senderId: 'u-2', channelId: 'ch-2', timestamp: '2025-01-20T08:30:00Z', reactions: [{ emoji: '👀', users: ['u-1'] }], attachments: [] },
    { id: 'm-7', content: 'Looking at it now. The hero section is 🔥', senderId: 'u-1', channelId: 'ch-2', timestamp: '2025-01-20T08:45:00Z', reactions: [], attachments: [] },
  ],
};

export const mockMeetings: Meeting[] = [
  { id: 'mt-1', title: 'Sprint Planning', description: 'Plan tasks for Sprint 5', date: '2025-01-21T10:00:00Z', duration: 60, attendees: ['u-1', 'u-2', 'u-3', 'u-6'], status: 'scheduled', projectId: 'p-1' },
  { id: 'mt-2', title: 'Design Review', description: 'Review homepage design mockups', date: '2025-01-21T14:00:00Z', duration: 45, attendees: ['u-1', 'u-2', 'u-4'], status: 'scheduled', projectId: 'p-1' },
  { id: 'mt-3', title: 'Mobile App Sync', description: 'Weekly sync for mobile team', date: '2025-01-22T09:00:00Z', duration: 30, attendees: ['u-2', 'u-4', 'u-5'], status: 'scheduled', projectId: 'p-2' },
  { id: 'mt-4', title: 'API Architecture Discussion', description: 'Discuss microservices architecture changes', date: '2025-01-22T15:00:00Z', duration: 90, attendees: ['u-1', 'u-3', 'u-6', 'u-7'], status: 'scheduled', projectId: 'p-3' },
  { id: 'mt-5', title: 'All Hands Meeting', description: 'Monthly company update', date: '2025-01-24T11:00:00Z', duration: 60, attendees: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'], status: 'scheduled' },
  { id: 'mt-6', title: 'Security Review', description: 'Review security audit findings', date: '2025-01-20T10:00:00Z', duration: 60, attendees: ['u-3', 'u-8'], status: 'completed', projectId: 'p-6' },
];

export const mockFiles: FileItem[] = [
  { id: 'f-1', name: 'Homepage_Mockup_v3.fig', type: 'other', size: 4500000, url: '#', uploadedBy: 'u-2', projectId: 'p-1', createdAt: '2025-01-20T08:30:00Z' },
  { id: 'f-2', name: 'API_Documentation.pdf', type: 'pdf', size: 1200000, url: '#', uploadedBy: 'u-6', projectId: 'p-3', createdAt: '2025-01-19T14:20:00Z' },
  { id: 'f-3', name: 'Brand_Guidelines_2025.pdf', type: 'pdf', size: 8900000, url: '#', uploadedBy: 'u-4', createdAt: '2025-01-18T10:00:00Z' },
  { id: 'f-4', name: 'Sprint_Report_Jan.xlsx', type: 'spreadsheet', size: 340000, url: '#', uploadedBy: 'u-1', createdAt: '2025-01-17T16:45:00Z' },
  { id: 'f-5', name: 'App_Screens_Onboarding.png', type: 'image', size: 2300000, url: '#', uploadedBy: 'u-4', projectId: 'p-2', createdAt: '2025-01-16T11:30:00Z' },
  { id: 'f-6', name: 'Q4_Roadmap.pptx', type: 'presentation', size: 5600000, url: '#', uploadedBy: 'u-8', createdAt: '2025-01-15T09:00:00Z' },
  { id: 'f-7', name: 'Database_Schema_v2.png', type: 'image', size: 780000, url: '#', uploadedBy: 'u-3', projectId: 'p-3', createdAt: '2025-01-14T13:20:00Z' },
  { id: 'f-8', name: 'Meeting_Notes_Jan15.docx', type: 'document', size: 45000, url: '#', uploadedBy: 'u-7', createdAt: '2025-01-15T17:00:00Z' },
];

export const mockWikiPages: WikiPage[] = [
  { id: 'w-1', title: 'Getting Started', content: '# Getting Started\n\nWelcome to the team wiki! Here you\'ll find everything you need to get up and running.', lastEditedBy: 'u-1', updatedAt: '2025-01-20T10:00:00Z', icon: '📖' },
  { id: 'w-2', title: 'Development Setup', content: '# Development Setup\n\n## Prerequisites\n- Node.js 18+\n- Bun runtime\n- VS Code with recommended extensions', parentId: 'w-1', lastEditedBy: 'u-3', updatedAt: '2025-01-19T14:00:00Z', icon: '⚙️' },
  { id: 'w-3', title: 'Coding Standards', content: '# Coding Standards\n\nWe follow strict TypeScript conventions and use ESLint + Prettier for code formatting.', parentId: 'w-1', lastEditedBy: 'u-1', updatedAt: '2025-01-18T09:30:00Z', icon: '✅' },
  { id: 'w-4', title: 'API Conventions', content: '# API Conventions\n\nAll API endpoints follow RESTful conventions with consistent response formats.', parentId: 'w-1', lastEditedBy: 'u-6', updatedAt: '2025-01-17T11:00:00Z', icon: '🔌' },
  { id: 'w-5', title: 'Product Roadmap 2025', content: '# Product Roadmap 2025\n\n## Q1\n- Website redesign launch\n- Mobile app v2 beta\n- API integrations complete', lastEditedBy: 'u-8', updatedAt: '2025-01-16T15:00:00Z', icon: '🗺️' },
  { id: 'w-6', title: 'Deployment Guide', content: '# Deployment Guide\n\nWe use GitHub Actions for CI/CD and Vercel for hosting.', parentId: 'w-2', lastEditedBy: 'u-7', updatedAt: '2025-01-15T13:00:00Z', icon: '🚀' },
  { id: 'w-7', title: 'Design System', content: '# Design System\n\nOur design system is built on top of shadcn/ui with custom theme tokens.', lastEditedBy: 'u-2', updatedAt: '2025-01-14T10:30:00Z', icon: '🎨' },
];

export const mockActivities: ActivityItem[] = [
  { id: 'a-1', type: 'task_completed', userId: 'u-1', description: 'completed "Database migration script"', targetId: 't-6', targetType: 'task', timestamp: '2025-01-20T10:30:00Z' },
  { id: 'a-2', type: 'comment_added', userId: 'u-2', description: 'commented on "Design homepage hero section"', targetId: 't-1', targetType: 'task', timestamp: '2025-01-20T10:15:00Z' },
  { id: 'a-3', type: 'task_created', userId: 'u-1', description: 'created "Mobile push notifications"', targetId: 't-11', targetType: 'task', timestamp: '2025-01-20T09:45:00Z' },
  { id: 'a-4', type: 'file_uploaded', userId: 'u-2', description: 'uploaded "Homepage_Mockup_v3.fig"', targetId: 'f-1', targetType: 'file', timestamp: '2025-01-20T08:30:00Z' },
  { id: 'a-5', type: 'project_updated', userId: 'u-8', description: 'updated "Security Audit" status to completed', targetId: 'p-6', targetType: 'project', timestamp: '2025-01-20T08:00:00Z' },
  { id: 'a-6', type: 'meeting_scheduled', userId: 'u-1', description: 'scheduled "Sprint Planning" for Jan 21', targetId: 'mt-1', targetType: 'meeting', timestamp: '2025-01-19T17:00:00Z' },
  { id: 'a-7', type: 'member_joined', userId: 'u-5', description: 'joined the workspace', targetId: 'u-5', targetType: 'user', timestamp: '2025-01-19T14:00:00Z' },
  { id: 'a-8', type: 'task_completed', userId: 'u-8', description: 'completed "Security vulnerability scan"', targetId: 't-12', targetType: 'task', timestamp: '2025-01-19T11:30:00Z' },
  { id: 'a-9', type: 'comment_added', userId: 'u-3', description: 'commented on "Setup CI/CD pipeline"', targetId: 't-9', targetType: 'task', timestamp: '2025-01-19T10:00:00Z' },
  { id: 'a-10', type: 'task_created', userId: 'u-4', description: 'created "Design email templates"', targetId: 't-8', targetType: 'task', timestamp: '2025-01-18T16:00:00Z' },
];

export const mockTeams: Team[] = [
  { id: 'tm-1', name: 'Engineering', description: 'Core engineering team responsible for all development', color: '#10b981', members: ['u-1', 'u-3', 'u-6', 'u-7', 'u-8'], projects: ['p-1', 'p-2', 'p-3', 'p-5'] },
  { id: 'tm-2', name: 'Design', description: 'UI/UX design and brand team', color: '#f59e0b', members: ['u-2', 'u-4'], projects: ['p-1', 'p-2'] },
  { id: 'tm-3', name: 'Marketing', description: 'Marketing and growth team', color: '#ef4444', members: ['u-4', 'u-7'], projects: ['p-4'] },
  { id: 'tm-4', name: 'Product', description: 'Product strategy and management', color: '#06b6d4', members: ['u-1', 'u-2', 'u-8'], projects: ['p-1', 'p-5'] },
];

export const mockAutomations: Automation[] = [
  { id: 'auto-1', name: 'Auto-assign urgent tasks', trigger: 'When a task is marked urgent', action: 'Assign to project lead', enabled: true, lastRun: '2025-01-20T08:00:00Z', runCount: 15 },
  { id: 'auto-2', name: 'Deadline reminder', trigger: 'When a task is due in 24 hours', action: 'Send notification to assignee', enabled: true, lastRun: '2025-01-20T09:00:00Z', runCount: 42 },
  { id: 'auto-3', name: 'Welcome new members', trigger: 'When a new member joins workspace', action: 'Send onboarding message', enabled: true, lastRun: '2025-01-19T14:00:00Z', runCount: 8 },
  { id: 'auto-4', name: 'Archive completed projects', trigger: 'When all tasks in a project are done', action: 'Move project to archived', enabled: false, runCount: 3 },
  { id: 'auto-5', name: 'Sprint report generation', trigger: 'Every Friday at 5 PM', action: 'Generate and share sprint report', enabled: true, lastRun: '2025-01-17T17:00:00Z', runCount: 12 },
];

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'ce-1', title: 'Sprint Planning', date: '2025-01-21T10:00:00Z', endDate: '2025-01-21T11:00:00Z', type: 'meeting', color: '#10b981', projectId: 'p-1' },
  { id: 'ce-2', title: 'Design Review', date: '2025-01-21T14:00:00Z', endDate: '2025-01-21T14:45:00Z', type: 'meeting', color: '#f59e0b', projectId: 'p-1' },
  { id: 'ce-3', title: 'Website Redesign Deadline', date: '2025-03-15', type: 'deadline', color: '#ef4444', projectId: 'p-1' },
  { id: 'ce-4', title: 'Mobile App V2 Beta', date: '2025-02-15', type: 'milestone', color: '#8b5cf6', projectId: 'p-2' },
  { id: 'ce-5', title: 'API Integration Complete', date: '2025-02-28', type: 'deadline', color: '#06b6d4', projectId: 'p-3' },
  { id: 'ce-6', title: 'All Hands Meeting', date: '2025-01-24T11:00:00Z', endDate: '2025-01-24T12:00:00Z', type: 'meeting', color: '#10b981' },
  { id: 'ce-7', title: 'Q1 Review', date: '2025-03-31', type: 'milestone', color: '#ec4899' },
  { id: 'ce-8', title: 'Sprint 4 Ends', date: '2025-01-22', type: 'deadline', color: '#ef4444' },
];
