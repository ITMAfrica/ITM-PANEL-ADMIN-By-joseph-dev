'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import {
  Plus,
  Search,
  Edit3,
  Eye as EyeIcon,
  ChevronRight,
  FileText,
  Clock,
  Home,
  BookOpen,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Link2,
  ImageIcon,
  Save,
  X,
  History,
  Copy,
  Trash2,
  GripVertical,
  MoreHorizontal,
  ArrowLeft,
  PlusCircle,
  Check,
  GitCommit,
  AlertTriangle,
} from 'lucide-react';
import { mockWikiPages, mockUsers } from '@/lib/mock-data';
import type { WikiPage } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserAvatarColor(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user
    ? `oklch(0.7 ${0.08 + (user.name.charCodeAt(0) % 5) * 0.02} ${140 + (user.name.charCodeAt(1) % 40)})`
    : undefined;
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Build a nested tree structure from flat list
interface WikiTreeNode {
  page: WikiPage;
  children: WikiTreeNode[];
}

function buildTree(pages: WikiPage[]): WikiTreeNode[] {
  const map = new Map<string, WikiTreeNode>();
  const roots: WikiTreeNode[] = [];

  pages.forEach((page) => {
    map.set(page.id, { page, children: [] });
  });

  pages.forEach((page) => {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Get breadcrumb path for a page
function getBreadcrumbs(pageId: string, pages: WikiPage[]): WikiPage[] {
  const breadcrumbs: WikiPage[] = [];
  let current = pages.find((p) => p.id === pageId);

  while (current) {
    breadcrumbs.unshift(current);
    current = current.parentId
      ? pages.find((p) => p.id === current!.parentId)
      : undefined;
  }

  return breadcrumbs;
}

// Mock version history data
interface VersionEntry {
  id: string;
  pageId: string;
  version: number;
  author: string;
  date: string;
  addedLines: number;
  removedLines: number;
  isCurrent: boolean;
}

function getMockVersions(pageId: string): VersionEntry[] {
  const authors = ['u-1', 'u-2', 'u-3', 'u-6', 'u-7', 'u-8'];
  const page = mockWikiPages.find((p) => p.id === pageId);
  if (!page) return [];

  const updatedAt = new Date(page.updatedAt);
  const versions: VersionEntry[] = [
    {
      id: `v-${pageId}-4`,
      pageId,
      version: 4,
      author: page.lastEditedBy,
      date: updatedAt.toISOString(),
      addedLines: 5,
      removedLines: 2,
      isCurrent: true,
    },
    {
      id: `v-${pageId}-3`,
      pageId,
      version: 3,
      author: authors[Math.floor(Math.random() * authors.length)],
      date: new Date(updatedAt.getTime() - 86400000 * 2).toISOString(),
      addedLines: 8,
      removedLines: 1,
      isCurrent: false,
    },
    {
      id: `v-${pageId}-2`,
      pageId,
      version: 2,
      author: authors[Math.floor(Math.random() * authors.length)],
      date: new Date(updatedAt.getTime() - 86400000 * 5).toISOString(),
      addedLines: 12,
      removedLines: 3,
      isCurrent: false,
    },
    {
      id: `v-${pageId}-1`,
      pageId,
      version: 1,
      author: authors[Math.floor(Math.random() * authors.length)],
      date: new Date(updatedAt.getTime() - 86400000 * 14).toISOString(),
      addedLines: 24,
      removedLines: 0,
      isCurrent: false,
    },
  ];

  return versions;
}

// Formatting toolbar button component
function ToolbarButton({
  icon,
  label,
  isActive,
  onClick,
  separator,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  separator?: boolean;
}) {
  if (separator) {
    return <div className="w-px h-5 bg-border mx-1" />;
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-7 w-7 p-0 transition-all duration-150',
        isActive
          ? 'bg-[oklch(0.55_0.15_160)/0.15] text-[oklch(0.45_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/0.2]'
          : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
      )}
      onClick={onClick}
      title={label}
    >
      {icon}
    </Button>
  );
}

// Wiki tree item with context menu
function WikiTreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
  onDuplicate,
  onDelete,
}: {
  node: WikiTreeNode;
  selectedId: string;
  onSelect: (page: WikiPage) => void;
  depth?: number;
  onDuplicate: (page: WikiPage) => void;
  onDelete: (page: WikiPage) => void;
}) {
  const isSelected = node.page.id === selectedId;
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            onClick={() => {
              onSelect(node.page);
              if (hasChildren) setExpanded(!expanded);
            }}
            className={cn(
              'w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm transition-all duration-150 text-left group cursor-pointer',
              isSelected
                ? 'bg-[oklch(0.55_0.15_160)/0.12] text-[oklch(0.45_0.15_160)] font-semibold shadow-sm'
                : 'hover:bg-muted/50 text-foreground'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <span className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0">
              <GripVertical className="h-3 w-3" />
            </span>
            {hasChildren ? (
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', expanded && 'rotate-90')}
              />
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            <span className="shrink-0 text-sm">{node.page.icon}</span>
            <span className="truncate text-xs font-medium">{node.page.title}</span>
            {hasChildren && (
              <Badge variant="outline" className="ml-auto text-[8px] px-1 py-0 h-3.5 font-mono shrink-0 opacity-50">
                {node.children.length}
              </Badge>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => onSelect(node.page)}>
            <EyeIcon className="h-4 w-4 mr-2" />
            View
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDuplicate(node.page)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => onDelete(node.page)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <WikiTreeItem
                key={child.page.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                depth={depth + 1}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple markdown rendering with better typography and syntax highlighting
function renderContent(content: string) {
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  return content.split('\n').map((line, i) => {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeContent = codeBlockContent.join('\n');
        codeBlockContent = [];
        return (
          <div key={i} className="my-3 rounded-lg bg-muted/80 border border-border/50 overflow-hidden">
            <div className="px-3 py-1.5 bg-muted/60 border-b border-border/30 text-[10px] text-muted-foreground font-mono">
              {line.slice(3) || 'code'}
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-xs font-mono text-foreground/80 leading-relaxed">
                {codeContent}
              </code>
            </pre>
          </div>
        );
      } else {
        inCodeBlock = true;
        codeBlockContent = [];
        return null;
      }
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return null;
    }

    if (line.startsWith('# ')) {
      return (
        <h1 key={i} className="text-2xl font-extrabold mt-8 mb-3 first:mt-0 tracking-tight text-foreground">
          {line.slice(2)}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-lg font-bold mt-6 mb-2 pb-2 border-b border-border/50 text-foreground">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={i} className="text-base font-semibold mt-5 mb-1.5 text-foreground">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={i} className="border-l-3 border-[oklch(0.55_0.15_160)/50] pl-4 my-3 text-sm text-muted-foreground italic bg-[oklch(0.55_0.15_160)/0.03] py-2 rounded-r-lg">
          {line.slice(2)}
        </blockquote>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <li key={i} className="ml-5 text-sm text-muted-foreground list-disc leading-relaxed py-0.5">
          {line.slice(2)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      return (
        <li key={i} className="ml-5 text-sm text-muted-foreground list-decimal leading-relaxed py-0.5">
          {line.replace(/^\d+\.\s/, '')}
        </li>
      );
    }
    if (line.startsWith('`') && line.endsWith('`') && line.length > 2) {
      return (
        <p key={i} className="text-sm leading-relaxed">
          <code className="px-1.5 py-0.5 rounded-md bg-muted/80 text-xs font-mono text-[oklch(0.55_0.15_160)] dark:text-[oklch(0.65_0.15_160)]">
            {line.slice(1, -1)}
          </code>
        </p>
      );
    }
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }
    // Process inline formatting
    const processedLine = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del class="opacity-60">$1</del>')
      .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted/80 text-xs font-mono text-[oklch(0.55_0.15_160)]">$1</code>');

    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });
}

export function WikiView() {
  const { t } = useTranslation();
  const [selectedPageId, setSelectedPageId] = useState<string>(mockWikiPages[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<'content' | 'history'>('content');
  const [editContent, setEditContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<WikiPage | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<VersionEntry | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [pages, setPages] = useState<WikiPage[]>([...mockWikiPages]);

  const tree = useMemo(() => buildTree(pages), [pages]);

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  const breadcrumbs = useMemo(() => {
    return selectedPageId ? getBreadcrumbs(selectedPageId, pages) : [];
  }, [selectedPageId, pages]);

  const filteredPages = searchQuery
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  const versions = useMemo(() => {
    return selectedPageId ? getMockVersions(selectedPageId) : [];
  }, [selectedPageId]);

  // Word and character count
  const wordCount = useMemo(() => {
    if (!editContent) return 0;
    return editContent.trim().split(/\s+/).filter(Boolean).length;
  }, [editContent]);

  const charCount = useMemo(() => {
    return editContent.length;
  }, [editContent]);

  // Handle edit mode
  const enterEditMode = useCallback(() => {
    if (selectedPage) {
      setEditContent(selectedPage.content);
      setHasUnsavedChanges(false);
      setMode('edit');
    }
  }, [selectedPage]);

  const exitEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      setMode('view');
    }
  }, [hasUnsavedChanges]);

  const handleSave = useCallback(() => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === selectedPageId
          ? { ...p, content: editContent, updatedAt: new Date().toISOString(), lastEditedBy: 'u-1' }
          : p
      )
    );
    setHasUnsavedChanges(false);
    setMode('view');
  }, [selectedPageId, editContent]);

  const handleDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    setHasUnsavedChanges(false);
    setMode('view');
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setEditContent(value);
    setHasUnsavedChanges(true);
  }, []);

  // Formatting insert functions
  const insertFormat = useCallback((prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newContent =
      editContent.substring(0, start) + prefix + selectedText + suffix + editContent.substring(end);
    setEditContent(newContent);
    setHasUnsavedChanges(true);
    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    });
  }, [editContent]);

  const insertLinePrefix = useCallback((prefix: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    // Find the start of the current line
    const lineStart = editContent.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = editContent.indexOf('\n', start);
    const endOfLine = lineEnd === -1 ? editContent.length : lineEnd;
    const currentLine = editContent.substring(lineStart, endOfLine);
    const newLine = prefix + currentLine;
    const newContent = editContent.substring(0, lineStart) + newLine + editContent.substring(endOfLine);
    setEditContent(newContent);
    setHasUnsavedChanges(true);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length + currentLine.length);
    });
  }, [editContent]);

  // Page management
  const handleDuplicatePage = useCallback((page: WikiPage) => {
    const newPage: WikiPage = {
      ...page,
      id: `w-${Date.now()}`,
      title: `${page.title} (copy)`,
      parentId: page.parentId,
      updatedAt: new Date().toISOString(),
      lastEditedBy: 'u-1',
    };
    setPages((prev) => [...prev, newPage]);
  }, []);

  const handleDeletePage = useCallback((page: WikiPage) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeletePage = useCallback(() => {
    if (pageToDelete) {
      setPages((prev) => {
        // Also remove children references
        return prev.filter((p) => p.id !== pageToDelete.id);
      });
      if (selectedPageId === pageToDelete.id) {
        setSelectedPageId(pages[0]?.id || '');
      }
    }
    setShowDeleteDialog(false);
    setPageToDelete(null);
  }, [pageToDelete, selectedPageId, pages]);

  const handleSelectPage = useCallback((page: WikiPage) => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
      return;
    }
    setSelectedPageId(page.id);
    setMode('view');
    setActiveTab('content');
  }, [hasUnsavedChanges]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && mode === 'edit') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [editContent, mode]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
      {/* Left Sidebar - Page Tree */}
      <div className="w-full lg:w-64 shrink-0">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.wiki.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[oklch(0.55_0.15_160)] hover:text-[oklch(0.45_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/10]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t.wiki.searchPages}
                className="pl-8 h-8 text-xs bg-muted/30 border-transparent focus:border-[oklch(0.55_0.15_160)/40]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Page Tree */}
            <ScrollArea className="h-[calc(100vh-18rem)]">
              {searchQuery ? (
                <div className="space-y-0.5">
                  {filteredPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handleSelectPage(page)}
                      className={cn(
                        'w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm transition-all duration-150 text-left',
                        selectedPageId === page.id
                          ? 'bg-[oklch(0.55_0.15_160)/0.12] text-[oklch(0.45_0.15_160)] font-semibold'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <span className="text-sm">{page.icon}</span>
                      <span className="truncate text-xs font-medium">{page.title}</span>
                    </button>
                  ))}
                  {filteredPages.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Search className="h-6 w-6 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{t.wiki.searchPages}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {tree.map((node) => (
                    <WikiTreeItem
                      key={node.page.id}
                      node={node}
                      selectedId={selectedPageId}
                      onSelect={handleSelectPage}
                      onDuplicate={handleDuplicatePage}
                      onDelete={handleDeletePage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-2" />
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start text-[oklch(0.55_0.15_160)] hover:text-[oklch(0.45_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/10]">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {t.wiki.newPage}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0">
            {selectedPage ? (
              <div className="flex flex-col h-full">
                {/* Breadcrumb navigation */}
                <div className="flex items-center gap-1 px-6 py-3 border-b bg-muted/20">
                  <Home className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {breadcrumbs.map((page, idx) => (
                    <div key={page.id} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      <button
                        onClick={() => handleSelectPage(page)}
                        className={cn(
                          'text-xs transition-colors hover:text-foreground',
                          idx === breadcrumbs.length - 1
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {page.icon} {page.title}
                      </button>
                    </div>
                  ))}

                  {/* View/Edit mode tabs + History tab */}
                  <div className="ml-auto flex items-center gap-2">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'content' | 'history')}>
                      <TabsList className="h-7">
                        <TabsTrigger value="content" className="text-[10px] px-2 h-5">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {mode === 'edit' ? t.wiki.editMode : t.wiki.viewMode}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-[10px] px-2 h-5">
                          <History className="h-3 w-3 mr-1" />
                          {t.wiki.history}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {activeTab === 'content' && (
                      <AnimatePresence mode="wait">
                        {mode === 'view' ? (
                          <motion.div
                            key="view-btn"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={enterEditMode}
                              className="h-7 text-xs shadow-sm border-[oklch(0.55_0.15_160)/30] text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/10]"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1" /> {t.wiki.edit}
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="edit-btns"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={exitEditMode}
                              className="h-7 text-xs text-muted-foreground"
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> {t.wiki.discard}
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="h-7 text-xs bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white shadow-sm"
                            >
                              <Save className="h-3.5 w-3.5 mr-1" /> {t.wiki.save}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Version History Tab */}
                {activeTab === 'history' ? (
                  <ScrollArea className="flex-1">
                    <div className="px-6 py-5 max-w-3xl">
                      <motion.div
                        key={`history-${selectedPageId}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                          <History className="h-4 w-4 text-[oklch(0.55_0.15_160)]" />
                          {t.wiki.versionHistory}
                        </h3>

                        <div className="space-y-3">
                          {versions.map((version, idx) => (
                            <motion.div
                              key={version.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                              <Card className={cn(
                                'overflow-hidden transition-all duration-200 hover:shadow-md',
                                version.isCurrent && 'ring-1 ring-[oklch(0.55_0.15_160)/30]'
                              )}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      {/* Version dot with connecting line */}
                                      <div className="flex flex-col items-center">
                                        <div className={cn(
                                          'h-3 w-3 rounded-full border-2 shrink-0',
                                          version.isCurrent
                                            ? 'bg-[oklch(0.55_0.15_160)] border-[oklch(0.55_0.15_160)]'
                                            : 'bg-muted border-muted-foreground/30'
                                        )} />
                                        {idx < versions.length - 1 && (
                                          <div className="w-px h-8 bg-border/50 mt-1" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-semibold">
                                            {t.wiki.version} {version.version}
                                          </span>
                                          {version.isCurrent && (
                                            <Badge className="text-[9px] px-1.5 py-0.5 bg-[oklch(0.55_0.15_160)/15] text-[oklch(0.45_0.15_160)] border-0">
                                              {t.wiki.currentVersion}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Avatar className="h-4 w-4">
                                            <AvatarFallback
                                              className="text-[6px] font-semibold"
                                              style={{ backgroundColor: getUserAvatarColor(version.author) }}
                                            >
                                              {getUserInitials(version.author)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium">{getUserName(version.author)}</span>
                                          <span>·</span>
                                          <span>{formatRelativeTime(version.date)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Diff indicators */}
                                    <div className="flex items-center gap-2">
                                      {version.addedLines > 0 && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                          +{version.addedLines} {t.wiki.addedLines}
                                        </span>
                                      )}
                                      {version.removedLines > 0 && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                          -{version.removedLines} {t.wiki.removedLines}
                                        </span>
                                      )}
                                      {!version.isCurrent && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-[10px] border-[oklch(0.55_0.15_160)/30] text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/10]"
                                          onClick={() => {
                                            setVersionToRestore(version);
                                            setShowRestoreDialog(true);
                                          }}
                                        >
                                          <GitCommit className="h-3 w-3 mr-1" />
                                          {t.wiki.restoreVersion}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </ScrollArea>
                ) : mode === 'edit' ? (
                  /* Edit Mode - Split Pane */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Formatting Toolbar - Sticky */}
                    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm px-4 py-1.5">
                      <div className="flex items-center gap-0.5 flex-wrap">
                        <ToolbarButton
                          icon={<Bold className="h-3.5 w-3.5" />}
                          label={t.wiki.bold}
                          onClick={() => insertFormat('**', '**')}
                        />
                        <ToolbarButton
                          icon={<Italic className="h-3.5 w-3.5" />}
                          label={t.wiki.italic}
                          onClick={() => insertFormat('*', '*')}
                        />
                        <ToolbarButton
                          icon={<Strikethrough className="h-3.5 w-3.5" />}
                          label={t.wiki.strikethrough}
                          onClick={() => insertFormat('~~', '~~')}
                        />
                        <ToolbarButton
                          icon={<Code className="h-3.5 w-3.5" />}
                          label={t.wiki.code}
                          onClick={() => insertFormat('`', '`')}
                        />
                        <ToolbarButton separator />

                        <ToolbarButton
                          icon={<Heading1 className="h-3.5 w-3.5" />}
                          label={t.wiki.heading1}
                          onClick={() => insertLinePrefix('# ')}
                        />
                        <ToolbarButton
                          icon={<Heading2 className="h-3.5 w-3.5" />}
                          label={t.wiki.heading2}
                          onClick={() => insertLinePrefix('## ')}
                        />
                        <ToolbarButton
                          icon={<Heading3 className="h-3.5 w-3.5" />}
                          label={t.wiki.heading3}
                          onClick={() => insertLinePrefix('### ')}
                        />
                        <ToolbarButton separator />

                        <ToolbarButton
                          icon={<List className="h-3.5 w-3.5" />}
                          label={t.wiki.bulletList}
                          onClick={() => insertLinePrefix('- ')}
                        />
                        <ToolbarButton
                          icon={<ListOrdered className="h-3.5 w-3.5" />}
                          label={t.wiki.numberedList}
                          onClick={() => insertLinePrefix('1. ')}
                        />
                        <ToolbarButton
                          icon={<Quote className="h-3.5 w-3.5" />}
                          label={t.wiki.quote}
                          onClick={() => insertLinePrefix('> ')}
                        />
                        <ToolbarButton
                          icon={<CodeSquare className="h-3.5 w-3.5" />}
                          label={t.wiki.codeBlock}
                          onClick={() => insertFormat('```\n', '\n```')}
                        />
                        <ToolbarButton separator />

                        <ToolbarButton
                          icon={<Link2 className="h-3.5 w-3.5" />}
                          label={t.wiki.link}
                          onClick={() => insertFormat('[', '](url)')}
                        />
                        <ToolbarButton
                          icon={<ImageIcon className="h-3.5 w-3.5" />}
                          label={t.wiki.image}
                          onClick={() => insertFormat('![alt](', 'url)')}
                        />
                      </div>
                    </div>

                    {/* Editor + Preview Split */}
                    <ResizablePanelGroup direction="horizontal" className="flex-1">
                      <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full flex flex-col">
                          <div className="px-4 py-2 border-b bg-muted/20">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t.wiki.editor}
                            </span>
                          </div>
                          <ScrollArea className="flex-1">
                            <Textarea
                              ref={textareaRef}
                              value={editContent}
                              onChange={(e) => handleContentChange(e.target.value)}
                              className="border-0 rounded-none resize-none min-h-full focus-visible:ring-0 focus-visible:border-transparent p-4 text-sm font-mono leading-relaxed bg-transparent"
                              placeholder="Start writing..."
                            />
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
                      <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full flex flex-col">
                          <div className="px-4 py-2 border-b bg-muted/20">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {t.wiki.livePreview}
                            </span>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="px-6 py-5 max-w-3xl">
                              {renderContent(editContent)}
                            </div>
                          </ScrollArea>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>

                    {/* Bottom bar with word/char count */}
                    <div className="flex items-center justify-between px-4 py-1.5 border-t bg-muted/20 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>{wordCount} {t.wiki.wordCount}</span>
                        <span>{charCount} {t.wiki.charCount}</span>
                      </div>
                      {hasUnsavedChanges && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1 text-amber-500"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{t.wiki.unsavedChanges}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    {/* Page Header */}
                    <div className="px-6 pt-5 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{selectedPage.icon}</span>
                          <div>
                            <h2 className="text-xl font-bold tracking-tight">{selectedPage.title}</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback
                                  className="text-[8px] font-semibold"
                                  style={{ backgroundColor: getUserAvatarColor(selectedPage.lastEditedBy) }}
                                >
                                  {getUserInitials(selectedPage.lastEditedBy)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {t.wiki.lastEditedBy} <span className="font-semibold text-foreground">{getUserName(selectedPage.lastEditedBy)}</span>
                              </span>
                              <span className="text-xs text-muted-foreground/60">·</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(selectedPage.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={enterEditMode}
                            className="h-8 text-xs shadow-sm border-[oklch(0.55_0.15_160)/30] text-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.55_0.15_160)/10]"
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" /> {t.wiki.edit}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleDuplicatePage(selectedPage)}>
                                <Copy className="h-4 w-4 mr-2" />
                                {t.wiki.duplicatePage}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <GripVertical className="h-4 w-4 mr-2" />
                                {t.wiki.movePage}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeletePage(selectedPage)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.wiki.deletePage}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Page Content */}
                    <ScrollArea className="flex-1">
                      <motion.div
                        key={selectedPage.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 py-5 max-w-3xl"
                      >
                        {renderContent(selectedPage.content)}
                      </motion.div>
                    </ScrollArea>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 opacity-30" />
                </div>
                <p className="text-sm font-medium">Select a page to view</p>
                <p className="text-xs mt-1">Choose a page from the sidebar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discard Changes Confirmation Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              </div>
              {t.wiki.unsavedChanges}
            </DialogTitle>
            <DialogDescription>
              {t.wiki.unsavedWarning}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDiscardDialog(false)}
            >
              {t.wiki.keepEditing}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDiscard}
            >
              {t.wiki.discardChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Page Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </div>
              {t.wiki.deletePage}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.wiki.deletePageWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={confirmDeletePage}
            >
              {t.wiki.deletePage}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Version Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[oklch(0.55_0.15_160)/10] flex items-center justify-center">
                <GitCommit className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />
              </div>
              {t.wiki.restoreConfirm}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.wiki.restoreWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white"
              onClick={() => {
                setShowRestoreDialog(false);
                setVersionToRestore(null);
              }}
            >
              {t.wiki.restoreVersion}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
