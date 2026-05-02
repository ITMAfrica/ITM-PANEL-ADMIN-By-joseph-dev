'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Users,
  FolderKanban,
  Pencil,
  Trash2,
} from 'lucide-react';
import { mockTeams, mockUsers } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export function TeamsView() {
  const getUserInitials = (id: string) => {
    const user = mockUsers.find((u) => u.id === id);
    return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
  };

  const getUserName = (id: string) => {
    return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Teams</h2>
          <p className="text-sm text-muted-foreground">
            {mockTeams.length} teams · Manage team structures
          </p>
        </div>
        <Button className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]" size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {mockTeams.map((team) => (
          <motion.div key={team.id} variants={item}>
            <Card className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: team.color + '20', color: team.color }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" /> Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" /> Manage Members
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{team.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>{team.projects.length} projects</span>
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((id) => (
                      <Avatar key={id} className="h-7 w-7 border-2 border-background">
                        <AvatarFallback className="text-[8px] bg-muted">
                          {getUserInitials(id)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 5 && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                        <span className="text-[9px] font-medium text-muted-foreground">
                          +{team.members.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Create Team Card */}
        <motion.div variants={item}>
          <Card className="border-dashed hover:border-[oklch(0.55_0.15_160/0.3)] transition-colors cursor-pointer">
            <CardContent className="p-5 flex flex-col items-center justify-center min-h-[180px]">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Create new team</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Organize members into teams</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
