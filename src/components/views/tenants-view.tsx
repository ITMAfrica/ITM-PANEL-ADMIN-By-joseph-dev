'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Plus,
  Search,
  Users,
  FileText,
  Globe,
  ToggleLeft,
  ArrowUpRight,
  MapPin,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Tenant } from '@/lib/types';

// ─── Animation ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Tenant type config ──────────────────────────────────────────────────────
const tenantTypeConfig: Record<Tenant['type'], { label: string; color: string; bg: string; border: string }> = {
  country: {
    label: 'Pays',
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
  subsidiary: {
    label: 'Filiale',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  organization: {
    label: 'Organisation',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  brand: {
    label: 'Marque',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  department: {
    label: 'Département',
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function TenantsView() {
  const { t } = useTranslation();
  const { tenants } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tenantStates, setTenantStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    tenants.forEach((tenant) => {
      states[tenant.id] = tenant.isActive;
    });
    return states;
  });

  // Filter tenants
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

  // Stats
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

  const statCards = [
    {
      title: t.tenants.title,
      value: totalTenants,
      icon: Building2,
      gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
      iconBg: 'bg-teal-500/15 border-teal-500/15',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500/20',
    },
    {
      title: t.tenants.active,
      value: activeTenants,
      icon: ToggleLeft,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 border-emerald-500/15',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500/20',
    },
    {
      title: t.tenants.members,
      value: totalMembers,
      icon: Users,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 border-amber-500/15',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500/20',
    },
    {
      title: t.tenants.content,
      value: totalContent,
      icon: FileText,
      gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-cyan-500/15 border-cyan-500/15',
      iconColor: 'text-cyan-600',
      borderAccent: 'border-cyan-500/20',
    },
  ];

  const tenantTypes: Tenant['type'][] = ['country', 'subsidiary', 'organization', 'brand', 'department'];

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t.tenants.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalTenants} entités · {activeTenants} actives
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.50_0.15_165)] hover:from-[oklch(0.50_0.15_160)] hover:to-[oklch(0.45_0.15_165)] shadow-sm shadow-[oklch(0.55_0.15_160/0.2)] text-white"
        >
          <Plus className="h-4 w-4" /> {t.tenants.createTenant}
        </Button>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const IconComp = stat.icon;
          return (
            <motion.div key={i} variants={item} initial="hidden" animate="show">
              <Card className={`relative overflow-hidden border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow duration-300 group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${stat.iconBg}`}>
                    <IconComp className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-lg font-extrabold tracking-tight">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher des entités..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8 bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160/0.3)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/30 border-transparent">
                  <Layers className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.tenants.type} — {t.tenants.all}</SelectItem>
                  {tenantTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {tenantTypeConfig[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs bg-muted/30 border-transparent">
                  <ToggleLeft className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.tenants.all}</SelectItem>
                  <SelectItem value="active">{t.tenants.active}</SelectItem>
                  <SelectItem value="inactive">{t.tenants.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Tenant Cards ────────────────────────────────────────────────── */}
      {filteredTenants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{t.tenants.noResults}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTenants.map((tenant) => {
            const typeConfig = tenantTypeConfig[tenant.type];
            const isActive = tenantStates[tenant.id] ?? tenant.isActive;

            return (
              <motion.div key={tenant.id} variants={item}>
                <Card className="group overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Gradient top strip */}
                  <div
                    className="h-1.5"
                    style={{
                      background: `linear-gradient(to right, ${tenant.color}, ${tenant.color}88)`,
                    }}
                  />

                  <CardContent className="p-4">
                    {/* Top row: Icon + Name + Type Badge */}
                    <div className="flex items-start gap-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border"
                        style={{
                          backgroundColor: `${tenant.color}15`,
                          borderColor: `${tenant.color}30`,
                        }}
                      >
                        {tenant.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold truncate">{tenant.name}</h3>
                          <Badge
                            className={cn(
                              'text-[9px] px-2 py-0 h-4 font-semibold border gap-1',
                              typeConfig.bg,
                              typeConfig.color,
                              typeConfig.border
                            )}
                          >
                            {typeConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{tenant.country}</span>
                        </div>
                      </div>

                      {/* Active toggle */}
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggleTenantActive(tenant.id)}
                        className={cn(
                          'scale-90',
                          isActive ? 'data-[state=checked]:bg-[oklch(0.55_0.15_160)]' : ''
                        )}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="p-1 rounded-md bg-teal-500/10">
                          <Users className="h-3 w-3 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">{t.tenants.members}</p>
                          <p className="text-sm font-bold">{tenant.memberCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="p-1 rounded-md bg-emerald-500/10">
                          <FileText className="h-3 w-3 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground">{t.tenants.content}</p>
                          <p className="text-sm font-bold">{tenant.contentCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={cn(
                            'text-[9px] px-2 py-0 h-4 font-semibold border-0 gap-1',
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-slate-500/10 text-slate-500'
                          )}
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            )}
                          />
                          {isActive ? t.tenants.active : t.tenants.inactive}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Créé le {new Date(tenant.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
