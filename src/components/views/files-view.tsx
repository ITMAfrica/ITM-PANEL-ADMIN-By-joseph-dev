'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Upload,
  LayoutGrid,
  List,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File,
  Download,
  MoreHorizontal,
  Trash2,
  Eye,
  HardDrive,
} from 'lucide-react';
import { mockFiles, mockUsers } from '@/lib/mock-data';
import type { FileItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const fileTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  document: { icon: <FileText className="h-5 w-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Document' },
  spreadsheet: { icon: <FileSpreadsheet className="h-5 w-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Spreadsheet' },
  presentation: { icon: <Presentation className="h-5 w-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Presentation' },
  image: { icon: <ImageIcon className="h-5 w-5" />, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Image' },
  pdf: { icon: <File className="h-5 w-5" />, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'PDF' },
  other: { icon: <File className="h-5 w-5" />, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Other' },
};

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'document', label: 'Documents' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'presentation', label: 'Presentations' },
  { value: 'image', label: 'Images' },
  { value: 'pdf', label: 'PDFs' },
];

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function FileGridCard({ file }: { file: FileItem }) {
  const typeConfig = fileTypeConfig[file.type] || fileTypeConfig.other;
  const ext = file.name.split('.').pop()?.toUpperCase() || '';

  return (
    <motion.div variants={item}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={cn('p-2.5 rounded-xl', typeConfig.bg)}>
              <span className={typeConfig.color}>{typeConfig.icon}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-sm font-medium truncate mb-1">{file.name}</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 mb-3">{ext}</Badge>

          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[8px] bg-muted">
                {getUserInitials(file.uploadedBy)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">{getUserName(file.uploadedBy)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FileListRow({ file }: { file: FileItem }) {
  const typeConfig = fileTypeConfig[file.type] || fileTypeConfig.other;
  const ext = file.name.split('.').pop()?.toUpperCase() || '';

  return (
    <motion.div
      variants={item}
      className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className={cn('p-2 rounded-lg', typeConfig.bg)}>
        <span className={typeConfig.color}>{typeConfig.icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
      </div>
      <div className="hidden sm:block w-20 text-xs text-muted-foreground text-right">{formatFileSize(file.size)}</div>
      <div className="hidden md:flex items-center gap-1.5 w-28">
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[8px] bg-muted">{getUserInitials(file.uploadedBy)}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground truncate">{getUserName(file.uploadedBy)}</span>
      </div>
      <div className="hidden lg:block w-24 text-xs text-muted-foreground">{formatDate(file.createdAt)}</div>
      <div className="flex items-center gap-1 w-20">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{ext}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
            <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export function FilesView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredFiles = mockFiles.filter((file) => {
    if (typeFilter === 'all') return true;
    return file.type === typeFilter;
  });

  const totalSize = mockFiles.reduce((acc, f) => acc + f.size, 0);
  const storageUsed = 2.4; // GB mock
  const storageTotal = 10; // GB mock
  const storagePercent = Math.round((storageUsed / storageTotal) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Files</h2>
          <p className="text-sm text-muted-foreground">
            {mockFiles.length} files · {formatFileSize(totalSize)} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList className="h-8">
              <TabsTrigger value="grid" className="text-xs px-2.5">
                <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-2.5">
                <List className="h-3.5 w-3.5 mr-1" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="h-8 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]">
            <Upload className="h-3.5 w-3.5 mr-1" /> Upload
          </Button>
        </div>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <HardDrive className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-xs text-muted-foreground">{storageUsed} GB / {storageTotal} GB</span>
              </div>
              <Progress value={storagePercent} className="h-2" />
            </div>
            <span className="text-sm font-bold text-emerald-600">{storagePercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* File Type Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={typeFilter === opt.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              typeFilter === opt.value && 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)]'
            )}
            onClick={() => setTypeFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <File className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No files found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredFiles.map((file) => (
                  <FileGridCard key={file.id} file={file} />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <File className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No files found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span className="w-9"></span>
                  <span>Name</span>
                  <span className="hidden sm:block w-20 text-right">Size</span>
                  <span className="hidden md:block w-28">Uploaded By</span>
                  <span className="hidden lg:block w-24">Date</span>
                  <span className="w-20">Type</span>
                </div>
                <motion.div variants={container} initial="hidden" animate="show" className="divide-y">
                  {filteredFiles.map((file) => (
                    <FileListRow key={file.id} file={file} />
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
