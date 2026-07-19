'use client';

import { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Plus, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  ViewShell,
  ViewSubNav,
  ViewTabPanel,
  ViewToolbar,
  ViewSearchInput,
  BrandPrimaryButton,
  ViewOutlineButton,
  ViewStatGrid,
  ViewStatCard,
  ViewFilterRow,
  FilterChip,
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
import type { Tenant } from '@/lib/types';

const tenantTypeConfig: Record<Tenant['type'], { label: string; color: string }> = {
  country: { label: 'Pays', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  subsidiary: { label: 'Filiale', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  organization: { label: 'Organisation', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  brand: { label: 'Marque', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  department: { label: 'Département', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
};

const statusColors = {
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export function TenantsView() {
  const { t } = useTranslation();
  const tenants = useAppStore((s) => s.tenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAll, setSelectedAll] = useState(false);
  const [tenantStates, setTenantStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    tenants.forEach((tenant) => {
      states[tenant.id] = tenant.isActive;
    });
    return states;
  });

  const filteredTenants = useMemo(() => {
    let result = tenants;
    if (typeFilter !== 'all') {
      result = result.filter((tn) => tn.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter((tn) => tenantStates[tn.id] === isActive);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tn) =>
          tn.name.toLowerCase().includes(q) ||
          tn.country.toLowerCase().includes(q) ||
          tn.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tenants, typeFilter, statusFilter, searchQuery, tenantStates]);

  const totalTenants = tenants.length;
  const activeTenants = Object.values(tenantStates).filter(Boolean).length;
  const totalMembers = tenants.reduce((sum, tn) => sum + tn.memberCount, 0);
  const totalContent = tenants.reduce((sum, tn) => sum + tn.contentCount, 0);

  const toggleTenantActive = (id: string) => {
    setTenantStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const tenantTypes: Tenant['type'][] = ['country', 'subsidiary', 'organization', 'brand', 'department'];
  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'all' || statusFilter !== 'all';

  const typeTabs = [
    { id: 'all', label: t.tenants.all },
    ...tenantTypes.map((type) => ({
      id: type,
      label: tenantTypeConfig[type].label,
    })),
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

  return (
    <ViewShell>
      <ViewSubNav
        tabs={typeTabs}
        activeTab={typeFilter}
        onTabChange={setTypeFilter}
      />
      <ViewTabPanel>
        <ViewStatGrid>
          <ViewStatCard label={t.tenants.title} value={totalTenants} />
          <ViewStatCard label={t.tenants.active} value={activeTenants} />
          <ViewStatCard label={t.tenants.members} value={totalMembers} />
          <ViewStatCard label={t.tenants.content} value={totalContent} />
        </ViewStatGrid>

        <ViewToolbar
          actions={
            <BrandPrimaryButton>
              <Plus className="h-4 w-4" />
              {t.tenants.createTenant}
            </BrandPrimaryButton>
          }
        >
          <ViewSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher des entités..."
          />
          <ViewOutlineButton icon={<Filter className="h-4 w-4" />} />
        </ViewToolbar>

        <ViewFilterRow>
          <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            {t.tenants.all}
          </FilterChip>
          <FilterChip active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
            {t.tenants.active}
          </FilterChip>
          <FilterChip active={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
            {t.tenants.inactive}
          </FilterChip>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              Réinitialiser
            </button>
          )}
        </ViewFilterRow>

        <ViewDataTable>
          <ViewDataTableHeader>
            <ViewDataTableCheckboxHead checked={selectedAll} onCheckedChange={setSelectedAll} />
            <ViewDataTableHead>{t.editorialCalendar.columns.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">Type</ViewDataTableHead>
            <ViewDataTableHead className="hidden md:table-cell">{t.tenants.members}</ViewDataTableHead>
            <ViewDataTableHead className="hidden lg:table-cell">{t.tenants.content}</ViewDataTableHead>
            <ViewDataTableHead className="hidden sm:table-cell">
              {t.editorialCalendar.columns.date}
            </ViewDataTableHead>
            <ViewDataTableHead>{t.editorialCalendar.columns.status}</ViewDataTableHead>
            <ViewDataTableHead className="w-16">Actif</ViewDataTableHead>
          </ViewDataTableHeader>
          <ViewDataTableBody>
            {filteredTenants.length === 0 ? (
              <ViewDataTableEmpty
                colSpan={8}
                message={t.tenants.noResults}
                series2Id="orbit-workspace"
              />
            ) : (
              filteredTenants.map((tenant) => {
                const typeConfig = tenantTypeConfig[tenant.type];
                const isActive = tenantStates[tenant.id] ?? tenant.isActive;

                return (
                  <ViewDataTableRow key={tenant.id}>
                    <ViewDataTableCheckboxCell />
                    <ViewDataTableCell>
                      <p className="font-medium text-[#1D141F] truncate">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{tenant.country}</p>
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell">
                      <ViewStatusText label={typeConfig.label} className={typeConfig.color} />
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden md:table-cell text-muted-foreground">
                      {tenant.memberCount}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden lg:table-cell text-muted-foreground">
                      {tenant.contentCount}
                    </ViewDataTableCell>
                    <ViewDataTableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                      {formatDate(tenant.createdAt)}
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <ViewStatusText
                        label={isActive ? t.tenants.active : t.tenants.inactive}
                        className={isActive ? statusColors.active : statusColors.inactive}
                      />
                    </ViewDataTableCell>
                    <ViewDataTableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => toggleTenantActive(tenant.id)}
                          className={cn(
                            isActive ? 'data-[state=checked]:bg-[oklch(0.55_0.18_250)]' : ''
                          )}
                        />
                      </div>
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
