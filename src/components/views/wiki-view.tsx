'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Search,
  Edit3,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react';
import { mockWikiPages, mockUsers } from '@/lib/mock-data';
import type { WikiPage } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function getUserName(id: string) {
  return mockUsers.find((u) => u.id === id)?.name || 'Unknown';
}

function getUserInitials(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
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

  // Create nodes for all pages
  pages.forEach((page) => {
    map.set(page.id, { page, children: [] });
  });

  // Build tree
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

function WikiTreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: WikiTreeNode;
  selectedId: string;
  onSelect: (page: WikiPage) => void;
  depth?: number;
}) {
  const isSelected = node.page.id === selectedId;
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.page);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
          isSelected
            ? 'bg-[oklch(0.55_0.15_160_/_0.1)] text-[oklch(0.45_0.15_160)] font-medium'
            : 'hover:bg-muted/50 text-foreground'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn('h-3.5 w-3.5 shrink-0 transition-transform', expanded && 'rotate-90')}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="shrink-0 text-sm">{node.page.icon}</span>
        <span className="truncate text-xs">{node.page.title}</span>
      </button>
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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WikiView() {
  const [selectedPageId, setSelectedPageId] = useState<string>(mockWikiPages[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const tree = useMemo(() => buildTree(mockWikiPages), []);

  const selectedPage = mockWikiPages.find((p) => p.id === selectedPageId);

  const filteredPages = searchQuery
    ? mockWikiPages.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockWikiPages;

  // Simple markdown-like rendering
  function renderContent(content: string) {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mb-3 mt-6 first:mt-0">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-semibold mb-2 mt-5">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold mb-1.5 mt-4">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]">
      {/* Left Sidebar - Page Tree */}
      <div className="w-full lg:w-64 shrink-0">
        <Card className="h-full">
          <CardContent className="p-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                className="pl-8 h-8 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Page Tree */}
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {searchQuery ? (
                <div className="space-y-0.5">
                  {filteredPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      className={cn(
                        'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                        selectedPageId === page.id
                          ? 'bg-[oklch(0.55_0.15_160_/_0.1)] text-[oklch(0.45_0.15_160)] font-medium'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <span className="text-sm">{page.icon}</span>
                      <span className="truncate text-xs">{page.title}</span>
                    </button>
                  ))}
                  {filteredPages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No pages found</p>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {tree.map((node) => (
                    <WikiTreeItem
                      key={node.page.id}
                      node={node}
                      selectedId={selectedPageId}
                      onSelect={(page) => setSelectedPageId(page.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator className="my-2" />
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs justify-start">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Page
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardContent className="p-6">
            {selectedPage ? (
              <div>
                {/* Page Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedPage.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold">{selectedPage.title}</h2>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last edited {formatDate(selectedPage.updatedAt)}</span>
                        <span>by</span>
                        <span className="font-medium text-foreground">{getUserName(selectedPage.lastEditedBy)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                </div>

                <Separator className="mb-6" />

                {/* Page Content */}
                <motion.div
                  key={selectedPage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent(selectedPage.content)}
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a page to view</p>
                <p className="text-xs mt-1">Choose a page from the sidebar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
