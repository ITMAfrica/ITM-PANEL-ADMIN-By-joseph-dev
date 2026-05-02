// ========================
// Core Types for TeamFlow
// ========================

export type PageId =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'calendar'
  | 'messages'
  | 'meetings'
  | 'files'
  | 'wiki'
  | 'activity'
  | 'members'
  | 'teams'
  | 'reports'
  | 'automations'
  | 'settings';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type MemberRole = 'admin' | 'member' | 'guest';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: MemberRole;
  status: 'online' | 'away' | 'offline' | 'busy';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  progress: number;
  members: string[];
  taskCount: number;
  completedTasks: number;
  dueDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  tags: string[];
  dueDate: string;
  createdAt: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  timestamp: string;
  reactions: { emoji: string; users: string[] }[];
  attachments: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'project' | 'direct' | 'team';
  members: string[];
  lastMessage?: Message;
  unread: number;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  attendees: string[];
  status: MeetingStatus;
  link?: string;
  projectId?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'pdf' | 'other';
  size: number;
  url: string;
  uploadedBy: string;
  projectId?: string;
  createdAt: string;
}

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  lastEditedBy: string;
  updatedAt: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'comment_added' | 'project_updated' | 'member_joined' | 'file_uploaded' | 'meeting_scheduled';
  userId: string;
  description: string;
  targetId: string;
  targetType: string;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
  projects: string[];
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  runCount: number;
}

export interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'comment' | 'deadline' | 'invitation' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'deadline' | 'meeting' | 'milestone' | 'reminder';
  color: string;
  projectId?: string;
}
