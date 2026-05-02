'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Link2,
  Trash2,
  Camera,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const settingsSections = [
  { id: 'general', label: 'General', icon: <Globe className="h-4 w-4" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Link2 className="h-4 w-4" /> },
  { id: 'workspace', label: 'Workspace', icon: <Shield className="h-4 w-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState('general');
  const currentUser = useAppStore((s) => s.currentUser);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    mentions: true,
    assignments: true,
    deadlines: true,
    updates: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your workspace and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Nav */}
        <nav className="lg:w-52 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors w-full text-left',
                  activeSection === section.id
                    ? 'bg-[oklch(0.55_0.15_160/0.1)] text-[oklch(0.55_0.15_160)] font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {/* General */}
          {activeSection === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General Settings</CardTitle>
                <CardDescription>Configure your workspace preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input defaultValue="English (US)" className="max-w-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input defaultValue="UTC+1 (West Africa Time)" className="max-w-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Input defaultValue="MM/DD/YYYY" className="max-w-xs" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Use dark theme across the app</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Sidebar</Label>
                    <p className="text-xs text-muted-foreground">Minimize sidebar by default</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg bg-[oklch(0.55_0.15_160)] text-white">
                        {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium">{currentUser?.name || 'Alex Thompson'}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.email || 'alex@acmecorp.com'}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Thompson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={currentUser?.email || 'alex@acmecorp.com'} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue="Admin" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input defaultValue="Product Manager at Acme Corp" />
                </div>
                <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Channels</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive email for important updates</p>
                    </div>
                    <Switch checked={notifications.email} onCheckedChange={() => toggleNotification('email')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Get browser push notifications</p>
                    </div>
                    <Switch checked={notifications.push} onCheckedChange={() => toggleNotification('push')} />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Events</h4>
                  {[
                    { key: 'mentions' as const, label: 'Mentions', desc: 'When someone mentions you' },
                    { key: 'assignments' as const, label: 'Task Assignments', desc: 'When a task is assigned to you' },
                    { key: 'deadlines' as const, label: 'Deadline Reminders', desc: 'Before tasks are due' },
                    { key: 'updates' as const, label: 'Project Updates', desc: 'General project activity' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <Label>{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={() => toggleNotification(item.key)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integrations</CardTitle>
                <CardDescription>Connect third-party tools to your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'GitHub', desc: 'Sync issues and pull requests', connected: true, color: '#333' },
                  { name: 'Slack', desc: 'Post updates to Slack channels', connected: true, color: '#4A154B' },
                  { name: 'Figma', desc: 'Embed Figma designs in tasks', connected: false, color: '#F24E1E' },
                  { name: 'Google Drive', desc: 'Attach files from Google Drive', connected: false, color: '#4285F4' },
                  { name: 'Jira', desc: 'Sync with Jira projects', connected: false, color: '#0052CC' },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-3 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: integration.color }}
                      >
                        {integration.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.desc}</p>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? 'outline' : 'default'}
                      size="sm"
                      className={cn(
                        !integration.connected && 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]'
                      )}
                    >
                      {integration.connected ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Workspace */}
          {activeSection === 'workspace' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Workspace Settings</CardTitle>
                  <CardDescription>Manage your workspace configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input defaultValue="Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workspace URL</Label>
                    <Input defaultValue="acme-corp" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input defaultValue="Main workspace for Acme Corporation" />
                  </div>
                  <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
                    <Save className="h-4 w-4 mr-1.5" /> Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-destructive/20">
                    <div>
                      <p className="text-sm font-medium">Delete Workspace</p>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete this workspace and all its data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing */}
          {activeSection === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Billing & Plans</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border-2 border-[oklch(0.55_0.15_160/0.3)] bg-[oklch(0.55_0.15_160/0.05)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">Pro Plan</h4>
                        <Badge className="bg-[oklch(0.55_0.15_160)] text-white text-[10px]">Current</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlimited projects, members, and automations
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      $12<span className="text-xs text-muted-foreground font-normal">/mo</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Billing Email</Label>
                  <Input defaultValue="billing@acmecorp.com" type="email" />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="flex items-center gap-3 p-3 rounded-xl border">
                    <div className="w-10 h-7 rounded bg-gradient-to-r from-slate-600 to-slate-500 flex items-center justify-center text-white text-[8px] font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/2026</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
