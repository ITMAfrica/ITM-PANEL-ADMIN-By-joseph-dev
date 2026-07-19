'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  type ViewTab,
} from '@/components/view-layout';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { getSectionItems } from '@/lib/navigation';
import { ChevronRight } from 'lucide-react';
import { SubscribeWidgetGenerator } from '@/components/subscribe-widget-generator';
import { SiteConnectSection } from '@/components/site-connect-section';

type SettingsTabId = 'compte' | 'acces' | 'integrations';

const inputClassName =
  'h-10 rounded-lg border-border/80 bg-white shadow-none focus-visible:ring-1 focus-visible:ring-foreground/20';

const selectTriggerClassName =
  'h-10 w-full rounded-lg border-border/80 bg-white shadow-none focus-visible:ring-1 focus-visible:ring-foreground/20';

function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="rounded-xl bg-[#f3f4f6] p-5 dark:bg-muted/40">{children}</div>
    </section>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground/90">{label}</Label>
      {children}
    </div>
  );
}

export function SettingsView() {
  const { locale, setLocale, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [activeTab, setActiveTab] = useState<SettingsTabId>('compte');
  const currentUser = useAppStore((s) => s.currentUser);

  const adminItems = getSectionItems('administration');

  const getNavLabel = (pageId: string): string => {
    const key = pageId as keyof typeof t.nav;
    return t.nav[key] || pageId;
  };

  const [firstName, lastName] = useMemo(() => {
    const name = currentUser?.name || 'Joseph Nyandu';
    const parts = name.trim().split(/\s+/);
    return [parts[0] ?? '', parts.slice(1).join(' ')];
  }, [currentUser?.name]);

  const tabs: ViewTab<SettingsTabId>[] = [
    { id: 'compte', label: 'Compte' },
    { id: 'acces', label: 'Accès' },
    { id: 'integrations', label: locale === 'fr' ? 'Intégrations' : 'Integrations' },
  ];

  return (
    <ViewShell className="mx-auto max-w-5xl">
      <ViewSubNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <ViewTabPanel>
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8 dark:bg-card overflow-hidden dark-card-glow">
          {activeTab === 'compte' && (
            <div className="space-y-8">
              <SettingsSection title="Données personnelles">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FieldGroup label="Prénom">
                    <Input defaultValue={firstName} className={inputClassName} />
                  </FieldGroup>
                  <FieldGroup label="Nom de famille">
                    <Input defaultValue={lastName} className={inputClassName} />
                  </FieldGroup>
                </div>
              </SettingsSection>

              <SettingsSection title="Préférences">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FieldGroup label="Langue">
                    <Select value={locale} onValueChange={(v) => setLocale(v as 'fr' | 'en')}>
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Fuseau horaire">
                    <Select defaultValue="africa-kinshasa">
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa-kinshasa">Africa/Kinshasa</SelectItem>
                        <SelectItem value="europe-paris">Europe/Paris</SelectItem>
                        <SelectItem value="america-new-york">America/New_York</SelectItem>
                        <SelectItem value="asia-tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Premier jour de la semaine">
                    <Select defaultValue="monday">
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Lundi</SelectItem>
                        <SelectItem value="sunday">Dimanche</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Format de date">
                    <Select defaultValue="dd-mm-yyyy">
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-lg border border-border/50 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Mode sombre</p>
                    <p className="text-xs text-muted-foreground">Utiliser le thème sombre dans l&apos;application</p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
                  />
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'acces' && (
            <div className="space-y-8">
              <SettingsSection title="Informations du compte">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FieldGroup label="E-mail">
                    <Input
                      defaultValue={currentUser?.email || 'joseph@example.com'}
                      type="email"
                      className={inputClassName}
                    />
                  </FieldGroup>
                  <FieldGroup label="Rôle">
                    <Input defaultValue="Administrateur" disabled className={inputClassName} />
                  </FieldGroup>
                </div>
              </SettingsSection>

              <SettingsSection title="Sécurité">
                <div className="space-y-4">
                  <FieldGroup label="Mot de passe">
                    <Input type="password" defaultValue="••••••••••••" className={cn(inputClassName, 'max-w-md')} />
                  </FieldGroup>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Changer le mot de passe
                  </Button>
                </div>
              </SettingsSection>

              <SettingsSection title="Espace de travail">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FieldGroup label="Nom de l'espace">
                    <Input defaultValue={currentUser?.tenantName || 'ITM Workspace'} className={inputClassName} />
                  </FieldGroup>
                  <FieldGroup label="Identifiant">
                    <Input defaultValue="itm-workspace" className={inputClassName} />
                  </FieldGroup>
                </div>
              </SettingsSection>

              <SettingsSection title={t.topbar.sections.administration}>
                <div className="divide-y divide-border/50 rounded-lg border border-border/50 bg-white overflow-hidden">
                  {adminItems.map(({ pageId, icon: Icon }) => (
                    <button
                      key={pageId}
                      type="button"
                      onClick={() => setActivePage(pageId)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-foreground/90 transition-colors hover:bg-muted/40"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-left">{getNavLabel(pageId)}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    </button>
                  ))}
                </div>
              </SettingsSection>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-8">
              <SiteConnectSection />
              <SubscribeWidgetGenerator />
            </div>
          )}
        </div>
      </ViewTabPanel>
    </ViewShell>
  );
}
