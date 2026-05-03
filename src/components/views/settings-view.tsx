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
  Check,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  Moon,
  PanelLeftClose,
  Mail,
  MessageSquare,
  AtSign,
  ListChecks,
  CalendarClock,
  FolderKanban,
  Github,
  Hash,
  Figma,
  HardDrive,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Settings Sections Config ────────────────────────────────────────────────
const settingsSections = [
  { id: 'general', labelKey: 'general', icon: Globe },
  { id: 'profile', labelKey: 'profile', icon: User },
  { id: 'notifications', labelKey: 'notifications', icon: Bell },
  { id: 'integrations', labelKey: 'integrations', icon: Link2 },
  { id: 'workspace', labelKey: 'workspace', icon: Shield },
  { id: 'billing', labelKey: 'billing', icon: CreditCard },
];

// ─── Integration Config ──────────────────────────────────────────────────────
const integrations = [
  { name: 'GitHub', desc: 'Sync issues and pull requests', connected: true, color: '#24292e', icon: Github },
  { name: 'Slack', desc: 'Post updates to Slack channels', connected: true, color: '#4A154B', icon: Hash },
  { name: 'Figma', desc: 'Embed Figma designs in tasks', connected: false, color: '#F24E1E', icon: Figma },
  { name: 'Google Drive', desc: 'Attach files from Google Drive', connected: false, color: '#34A853', icon: HardDrive },
  { name: 'Jira', desc: 'Sync with Jira projects', connected: false, color: '#0052CC', icon: Code2 },
];

// ─── Animation ───────────────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function SettingsView() {
  const { t } = useTranslation();
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

  const [generalSettings, setGeneralSettings] = useState({
    darkMode: false,
    compactSidebar: false,
  });

  const getSectionLabel = (id: string) => {
    const key = id as keyof typeof t.settings;
    return t.settings[key] || id;
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">{t.settings.title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t.settings.subtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Settings Nav Sidebar ──────────────────────────────────────── */}
        <nav className="lg:w-56 flex-shrink-0">
          <Card className="lg:p-2 overflow-hidden border shadow-sm">
            <div className="flex lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible p-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all duration-200 w-full text-left font-medium',
                      isActive
                        ? 'bg-[oklch(0.55_0.15_160/0.08)] text-[oklch(0.55_0.15_160)] shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="settings-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[oklch(0.55_0.15_160)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {getSectionLabel(section.id)}
                  </button>
                );
              })}
            </div>
          </Card>
        </nav>

        {/* ─── Settings Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              variants={sectionVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-5"
            >
              {/* General */}
              {activeSection === 'general' && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                        <Globe className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.settings.general}</CardTitle>
                        <CardDescription>{t.settings.subtitle}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.language}</Label>
                      <Input
                        defaultValue="English (US)"
                        className="max-w-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.timezone}</Label>
                      <Input
                        defaultValue="UTC+1 (West Africa Time)"
                        className="max-w-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.dateFormat}</Label>
                      <Input
                        defaultValue="MM/DD/YYYY"
                        className="max-w-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">{t.settings.darkMode}</Label>
                          <p className="text-xs text-muted-foreground">{t.settings.darkModeDesc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={generalSettings.darkMode}
                        onCheckedChange={(v) => setGeneralSettings((p) => ({ ...p, darkMode: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">{t.settings.compactSidebar}</Label>
                          <p className="text-xs text-muted-foreground">{t.settings.compactSidebarDesc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={generalSettings.compactSidebar}
                        onCheckedChange={(v) => setGeneralSettings((p) => ({ ...p, compactSidebar: v }))}
                      />
                    </div>
                    <Button
                      className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
                    >
                      <Save className="h-4 w-4" /> {t.settings.saveChanges}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Profile */}
              {activeSection === 'profile' && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                        <User className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.settings.profileSettings}</CardTitle>
                        <CardDescription>{t.settings.profileDesc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[oklch(0.55_0.15_160/0.2)]">
                          {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'AT'}
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[oklch(0.55_0.15_160)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                          <Camera className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-semibold">{currentUser?.name || 'Alex Thompson'}</p>
                        <p className="text-sm text-muted-foreground">{currentUser?.email || 'alex@acmecorp.com'}</p>
                        <Badge className="mt-1 text-[10px] bg-teal-500/10 text-teal-700 border-0">
                          Admin
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t.settings.firstName}</Label>
                        <Input defaultValue="Alex" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t.settings.lastName}</Label>
                        <Input defaultValue="Thompson" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.email}</Label>
                      <Input defaultValue={currentUser?.email || 'alex@acmecorp.com'} type="email" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.role}</Label>
                      <Input defaultValue="Admin" disabled className="bg-muted/30 border-transparent max-w-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.bio}</Label>
                      <Input defaultValue="Product Manager at Acme Corp" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                    </div>
                    <Button
                      className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
                    >
                      <Save className="h-4 w-4" /> {t.settings.saveChanges}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                        <Bell className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.settings.notificationPreferences}</CardTitle>
                        <CardDescription>{t.settings.notificationDesc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-md bg-muted/50">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <h4 className="text-sm font-semibold">{t.settings.channels}</h4>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <Label className="text-sm font-medium">{t.settings.emailNotif}</Label>
                          <p className="text-xs text-muted-foreground">{t.settings.emailNotifDesc}</p>
                        </div>
                        <Switch checked={notifications.email} onCheckedChange={() => toggleNotification('email')} className="data-[state=checked]:bg-[oklch(0.55_0.15_160)]" />
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <Label className="text-sm font-medium">{t.settings.pushNotif}</Label>
                          <p className="text-xs text-muted-foreground">{t.settings.pushNotifDesc}</p>
                        </div>
                        <Switch checked={notifications.push} onCheckedChange={() => toggleNotification('push')} className="data-[state=checked]:bg-[oklch(0.55_0.15_160)]" />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-md bg-muted/50">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <h4 className="text-sm font-semibold">{t.settings.events}</h4>
                      </div>
                      {[
                        { key: 'mentions' as const, label: t.settings.mentions, desc: t.settings.mentionsDesc, icon: AtSign },
                        { key: 'assignments' as const, label: t.settings.taskAssignments, desc: t.settings.taskAssignmentsDesc, icon: ListChecks },
                        { key: 'deadlines' as const, label: t.settings.deadlineReminders, desc: t.settings.deadlineRemindersDesc, icon: CalendarClock },
                        { key: 'updates' as const, label: t.settings.projectUpdates, desc: t.settings.projectUpdatesDesc, icon: FolderKanban },
                      ].map((ntf) => (
                        <div key={ntf.key} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted/50">
                              <ntf.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">{ntf.label}</Label>
                              <p className="text-xs text-muted-foreground">{ntf.desc}</p>
                            </div>
                          </div>
                          <Switch
                            checked={notifications[ntf.key]}
                            onCheckedChange={() => toggleNotification(ntf.key)}
                            className="data-[state=checked]:bg-[oklch(0.55_0.15_160)]"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Integrations */}
              {activeSection === 'integrations' && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
                        <Link2 className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.settings.integrationsTitle}</CardTitle>
                        <CardDescription>{t.settings.integrationsDesc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {integrations.map((integration, idx) => {
                      const Icon = integration.icon;
                      return (
                        <motion.div
                          key={integration.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + idx * 0.05 }}
                          className={cn(
                            'flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm',
                            integration.connected
                              ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                              : 'border-border hover:border-border/80'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm border border-white/10"
                              style={{ backgroundColor: integration.color }}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">{integration.name}</p>
                                {integration.connected && (
                                  <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-700 border-0 font-medium">
                                    <Check className="h-2.5 w-2.5 mr-0.5" />
                                    {t.settings.connected}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{integration.desc}</p>
                            </div>
                          </div>
                          <Button
                            variant={integration.connected ? 'outline' : 'default'}
                            size="sm"
                            className={cn(
                              'gap-1.5 text-xs',
                              !integration.connected && 'bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] text-white shadow-sm'
                            )}
                          >
                            {integration.connected ? (
                              <>
                                <ExternalLink className="h-3 w-3" /> Manage
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3" /> {t.settings.connect}
                              </>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Workspace */}
              {activeSection === 'workspace' && (
                <div className="space-y-5">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/15">
                          <Shield className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t.settings.workspaceSettings}</CardTitle>
                          <CardDescription>{t.settings.workspaceDesc}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t.settings.workspaceName}</Label>
                        <Input defaultValue="Acme Corp" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t.settings.workspaceUrl}</Label>
                        <Input defaultValue="acme-corp" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">{t.settings.description}</Label>
                        <Input defaultValue="Main workspace for Acme Corporation" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                      </div>
                      <Button
                        className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
                      >
                        <Save className="h-4 w-4" /> {t.settings.saveChanges}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-2 border-rose-500/20 shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/15">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-rose-600">{t.settings.dangerZone}</CardTitle>
                          <CardDescription>{t.settings.dangerDesc}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-xl border-2 border-rose-500/20 bg-rose-500/[0.03]">
                        <div>
                          <p className="text-sm font-semibold text-rose-700">{t.settings.deleteWorkspace}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.settings.deleteWorkspaceDesc}</p>
                        </div>
                        <Button variant="destructive" size="sm" className="gap-1.5 shadow-sm">
                          <Trash2 className="h-4 w-4" /> {t.settings.delete}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Billing */}
              {activeSection === 'billing' && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/15">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.settings.billingPlans}</CardTitle>
                        <CardDescription>{t.settings.billingDesc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Current Plan */}
                    <div className="p-5 rounded-xl border-2 border-[oklch(0.55_0.15_160/0.3)] bg-gradient-to-br from-[oklch(0.55_0.15_160/0.05)] to-transparent relative overflow-hidden">
                      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[oklch(0.55_0.15_160/0.05)]" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold">{t.settings.proPlan}</h4>
                            <Badge className="bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] text-white text-[10px] border-0 shadow-sm">
                              <Sparkles className="h-3 w-3 mr-0.5" />
                              {t.settings.currentPlan}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{t.settings.proPlanDesc}</p>
                        </div>
                        <p className="text-xl font-extrabold tracking-tight">
                          $12<span className="text-xs text-muted-foreground font-normal">/mo</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.billingEmail}</Label>
                      <Input defaultValue="billing@acmecorp.com" type="email" className="bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)] focus:bg-background transition-all" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t.settings.paymentMethod}</Label>
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-muted/20">
                        <div className="w-12 h-8 rounded-md bg-gradient-to-r from-slate-700 to-slate-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                          VISA
                        </div>
                        <div>
                          <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                          <p className="text-xs text-muted-foreground">{t.settings.expires} 12/2026</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto gap-1 text-xs">{t.settings.update}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
