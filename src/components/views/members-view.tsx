'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Shield,
  User,
  Eye,
  Mail,
  Crown,
} from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import type { MemberRole } from '@/lib/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const roleConfig: Record<MemberRole, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admin: { label: 'Admin', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-200', icon: <Crown className="h-3 w-3" /> },
  member: { label: 'Member', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-200', icon: <User className="h-3 w-3" /> },
  guest: { label: 'Guest', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-200', icon: <Eye className="h-3 w-3" /> },
};

const statusColors: Record<string, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-slate-400',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function MembersView() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const onlineCount = mockUsers.filter((u) => u.status === 'online').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Members</h2>
          <p className="text-sm text-muted-foreground">
            {mockUsers.length} members · {onlineCount} online
          </p>
        </div>
        <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]" size="sm">
          <UserPlus className="h-4 w-4 mr-1.5" /> Invite Member
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'admin', 'member', 'guest'].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-7 text-xs',
                roleFilter === role && 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]'
              )}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              {role !== 'all' && (
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                  {mockUsers.filter((u) => u.role === role).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Members Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filtered.map((user) => {
          const role = roleConfig[user.role];
          return (
            <motion.div key={user.id} variants={item}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className="text-sm bg-gradient-to-br from-[oklch(0.55_0.15_160/0.2)] to-[oklch(0.55_0.15_160/0.05)]">
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background',
                            statusColors[user.status]
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove from workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', role.bg, role.color)}>
                      {role.icon}
                      <span className="ml-1">{role.label}</span>
                    </Badge>
                    <span className={cn('text-[10px] capitalize', user.status === 'online' ? 'text-emerald-500' : 'text-muted-foreground')}>
                      {user.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
