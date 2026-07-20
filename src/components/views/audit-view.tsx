'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';
import { useAuditLog } from '@/hooks/use-audit';
import { useUserLookup } from '@/hooks/use-user-lookup';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  ViewOutlineButton,
  ViewStatGrid,
  ViewStatCard,
} from '@/components/view-layout';
import {
  ViewDataTable,
  ViewDataTableHeader,
  ViewDataTableHead,
  ViewDataTableCheckboxHead,
  ViewDataTableBody,
  ViewDataTableRow,
  ViewDataTableCell,
  ViewDataTableCheckboxCell,
  ViewDataTableEmpty,
  ViewStatusText,
} from '@/components/view-data-table';

const actionColors: Record<string, { bg: string; text: string; border: string }> = {
  create: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  update: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  delete: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  validate: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20' },
  publish: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  login: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
  permission_change: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20' },
  logout: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' },
};

const entityTypeLabels: Record<string, string> = {
  newsletter: 'Newsletter',
  article: 'Article',
  announcement: 'Communication',
  user: 'Utilisateur',
  campaign: 'Campagne',
  media: 'Média',
  template: 'Modèle',
  settings: 'Paramètres',
};

function formatTimestamp(ts: string): { date: string; time: string; relative: string } {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative: string;
  if (diffMins < 1) relative = "à l'instant";
  else if (diffMins < 60) relative = `il y a ${diffMins}m`;
  else if (diffHours < 24) relative = `il y a ${diffHours}h`;
  else if (diffDays < 7) relative = `il y a ${diffDays}j`;
  else relative = d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });

  return {
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    relative,
  };
}

export function AuditView() {
  const { t } = useTranslation();
  const activeTenantId = useAppStore((s) => s.activeTenantId);
  const { data: auditLogs = [] } = useAuditLog(activeTenantId);
  const { getUserName } = useUserLookup(activeTenantId);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [selectedAll, setSelectedAll] = useState(false);

  const actionTypes = useMemo(() => {
    const types = new Set(auditLogs.map((log) => log.action));
    return Array.from(types).sort();
  }, [auditLogs]);

  const entityTypes = useMemo(() => {
    const types = new Set(auditLogs.map((log) => log.entityType));
    return Array.from(types).sort();
  }, [auditLogs]);

  const userIds = useMemo(() => {
    const ids = new Set(auditLogs.map((log) => log.userId));
    return Array.from(ids).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    let logs = auditLogs;

    if (actionFilter !== 'all') {
      logs = logs.filter((l) => l.action === actionFilter);
    }
    if (entityFilter !== 'all') {
      logs = logs.filter((l) => l.entityType === entityFilter);
    }
    if (userFilter !== 'all') {
      logs = logs.filter((l) => l.userId === userFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          getUserName(l.userId).toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    return [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs, searchQuery, actionFilter, entityFilter, userFilter, getUserName]);

  const todayActions = useMemo(() => {
    const today = new Date().toDateString();
    return auditLogs.filter(
      (l) => new Date(l.timestamp).toDateString() === today
    ).length;
  }, [auditLogs]);

  const mostActiveUser = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach((l) => {
      counts[l.userId] = (counts[l.userId] || 0) + 1;
    });
    const topUserId = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    return topUserId ? getUserName(topUserId) : '-';
  }, [auditLogs, getUserName]);

  const mostCommonAction = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach((l) => {
      counts[l.action] = (counts[l.action] || 0) + 1;
    });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    return top || '-';
  }, [auditLogs]);

  const actionTabs = [
    { id: 'all', label: t.audit.filterAction },
    ...actionTypes.map((type) => ({
      id: type,
      label: t.audit[type as keyof typeof t.audit] || type,
    })),
  ];

  return (
    <ViewShell>
      <ViewSubNav
        tabs={actionTabs}
        activeTab={actionFilter}
        onTabChange={setActionFilter}
      />
      <ViewTabPanel>
        <ViewStatGrid cols={3}>
          <ViewStatCard label="Actions aujourd'hui" value={todayActions} />
          <ViewStatCard label="Utilisateur le plus actif" value={mostActiveUser.split(' ')[0]} />
          <ViewStatCard
            label="Action la plus fréquente"
            value={t.audit[mostCommonAction as keyof typeof t.audit] || mostCommonAction}
          />
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <ViewOutlineButton icon={<Download className="h-4 w-4" />}>
              {t.audit.exportLog}
            </ViewOutlineButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher dans le journal..."
          />
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="h-9 w-[140px] border-[#E8ECEF] bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.audit.filterEntity}</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {entityTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-9 w-[150px] border-[#E8ECEF] bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.audit.filterUser}</SelectItem>
              {userIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {getUserName(id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
        </ViewToolbar>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.audit.filterUser}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">{t.audit.filterAction}</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">{t.audit.filterEntity}</ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredLogs.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={6}
                message={t.audit.noResults}
                illustrationId="empty-search"
              />
            ) : (
              filteredLogs.map((log) => {
                const userName = getUserName(log.userId);
                const actionColor = actionColors[log.action] || actionColors.update;
                const { date, time, relative } = formatTimestamp(log.timestamp);
                const entityLabel = entityTypeLabels[log.entityType] || log.entityType;
                const actionLabel = t.audit[log.action as keyof typeof t.audit] || log.action;

                return (
                  <ViewDataTableRow key={log.id}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 sm:hidden">
                        {actionLabel} · {entityLabel}
                      </p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell">
                      <ViewStatusText
                        label={actionLabel}
                        className={cn(actionColor.bg, actionColor.text, actionColor.border)}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground text-xs">
                      {entityLabel}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">{log.details}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      <span className="block">{relative}</span>
                      <span className="block text-muted-foreground/60">
                        {date} · {time}
                      </span>
                    </ViewDataTableCell>
                  </ViewDataTableRow>
                );
              })
            )}
          </ViewDataTableBody>
        </ViewDataTable>
      </ViewTabPanel>
    </ViewShell>
  );
}
