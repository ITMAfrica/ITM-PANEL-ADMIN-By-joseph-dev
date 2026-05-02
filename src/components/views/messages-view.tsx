'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Hash,
  Lock,
  Send,
  Paperclip,
  Smile,
  AtSign,
  Search,
  ArrowLeft,
  Users,
  MessageSquare,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { mockChannels, mockMessages, mockUsers } from '@/lib/mock-data';
import type { Channel, Message } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Helper functions
function getUserById(id: string) {
  return mockUsers.find((u) => u.id === id);
}

function getUserInitials(id: string) {
  const user = getUserById(id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
}

function getUserName(id: string) {
  return getUserById(id)?.name || 'Unknown';
}

function getUserStatus(id: string) {
  return getUserById(id)?.status || 'offline';
}

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`;
}

function formatShortTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Status color indicator
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
    offline: 'bg-slate-400',
  };
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full border-2 border-background',
        colors[status] || 'bg-slate-400'
      )}
    />
  );
}

// Channel list item
function ChannelListItem({
  channel,
  isActive,
  onClick,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}) {
  const isDirect = channel.type === 'direct';
  const status = isDirect ? getUserStatus(channel.members[1] || channel.members[0]) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors text-left',
        isActive
          ? 'bg-[oklch(0.55_0.15_160)/0.12] text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      {isDirect ? (
        <div className="relative shrink-0">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px] bg-muted">
              {getUserInitials(channel.members[1] || channel.members[0])}
            </AvatarFallback>
          </Avatar>
          {status && (
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background',
                status === 'online'
                  ? 'bg-emerald-500'
                  : status === 'away'
                  ? 'bg-amber-500'
                  : status === 'busy'
                  ? 'bg-red-500'
                  : 'bg-slate-400'
              )}
            />
          )}
        </div>
      ) : channel.type === 'project' ? (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      ) : (
        <Hash className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      )}
      <span className="truncate flex-1">
        {isDirect ? channel.name : channel.name}
      </span>
      {channel.unread > 0 && (
        <Badge className="h-4 min-w-[18px] px-1 text-[9px] bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.48_0.15_160)]">
          {channel.unread}
        </Badge>
      )}
    </button>
  );
}

// Message bubble
function MessageBubble({ message, showHeader }: { message: Message; showHeader: boolean }) {
  const sender = getUserById(message.senderId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex gap-2.5 px-4 py-0.5 hover:bg-muted/20 transition-colors',
        showHeader && 'mt-3'
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {showHeader ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-[10px] font-medium"
              style={{
                backgroundColor: sender
                  ? `oklch(0.7 ${0.08 + (sender.name.charCodeAt(0) % 5) * 0.02} ${140 + (sender.name.charCodeAt(1) % 40)})`
                  : undefined,
              }}
            >
              {getUserInitials(message.senderId)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground transition-colors">
              {formatShortTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold">{getUserName(message.senderId)}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed break-words">{message.content}</p>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors',
                  'hover:border-[oklch(0.55_0.15_160)/40] hover:bg-[oklch(0.55_0.15_160)/8]'
                )}
              >
                <span className="text-xs">{reaction.emoji}</span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {reaction.users.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export function MessagesView() {
  const [selectedChannel, setSelectedChannel] = useState<string>('ch-1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channel = mockChannels.find((c) => c.id === selectedChannel);
  const messages = mockMessages[selectedChannel] || [];

  // Group channels by type
  const teamChannels = mockChannels.filter((c) => c.type === 'team');
  const projectChannels = mockChannels.filter((c) => c.type === 'project');
  const directChannels = mockChannels.filter((c) => c.type === 'direct');

  // Filter channels by search
  const filterChannels = (channels: Channel[]) =>
    searchQuery
      ? channels.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : channels;

  const totalUnread = mockChannels.reduce((sum, c) => sum + c.unread, 0);

  // Auto-scroll to bottom on channel change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChannel]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setShowMobileChat(true);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] border rounded-xl overflow-hidden bg-background">
      {/* Channel Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r bg-muted/20 shrink-0',
          'w-full md:w-72',
          showMobileChat ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Messages</h2>
            {totalUnread > 0 && (
              <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.48_0.15_160)]">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-8 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1 px-2">
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Team Channels */}
            {filterChannels(teamChannels).length > 0 && (
              <div className="mb-3">
                <button className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  Team Channels
                </button>
                <div className="space-y-0.5">
                  {filterChannels(teamChannels).map((ch) => (
                    <motion.div key={ch.id} variants={item}>
                      <ChannelListItem
                        channel={ch}
                        isActive={selectedChannel === ch.id}
                        onClick={() => handleChannelSelect(ch.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Channels */}
            {filterChannels(projectChannels).length > 0 && (
              <div className="mb-3">
                <button className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  Project Channels
                </button>
                <div className="space-y-0.5">
                  {filterChannels(projectChannels).map((ch) => (
                    <motion.div key={ch.id} variants={item}>
                      <ChannelListItem
                        channel={ch}
                        isActive={selectedChannel === ch.id}
                        onClick={() => handleChannelSelect(ch.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Messages */}
            {filterChannels(directChannels).length > 0 && (
              <div className="mb-3">
                <button className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  Direct Messages
                </button>
                <div className="space-y-0.5">
                  {filterChannels(directChannels).map((ch) => (
                    <motion.div key={ch.id} variants={item}>
                      <ChannelListItem
                        channel={ch}
                        isActive={selectedChannel === ch.id}
                        onClick={() => handleChannelSelect(ch.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !showMobileChat ? 'hidden md:flex' : 'flex'
        )}
      >
        {channel ? (
          <>
            {/* Channel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:hidden shrink-0"
                  onClick={() => setShowMobileChat(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {channel.type === 'direct' ? (
                  <div className="relative">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[7px] bg-muted">
                        {getUserInitials(channel.members[1] || channel.members[0])}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : channel.type === 'project' ? (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{channel.name}</h3>
                    {channel.unread > 0 && (
                      <Badge className="h-4 min-w-[16px] px-1 text-[8px] bg-[oklch(0.55_0.15_160)] text-white">
                        {channel.unread} new
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
                  <Users className="h-3.5 w-3.5" />
                  <span>{channel.members.length}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1">
              <div className="py-4">
                {messages.length > 0 ? (
                  <>
                    {/* Channel intro */}
                    <div className="px-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-[oklch(0.55_0.15_160)/12] flex items-center justify-center">
                          {channel.type === 'direct' ? (
                            <MessageSquare className="h-6 w-6 text-[oklch(0.55_0.15_160)]" />
                          ) : channel.type === 'project' ? (
                            <Lock className="h-6 w-6 text-[oklch(0.55_0.15_160)]" />
                          ) : (
                            <Hash className="h-6 w-6 text-[oklch(0.55_0.15_160)]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-base font-bold">{channel.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {channel.type === 'direct'
                              ? `This is the beginning of your conversation with ${channel.name}`
                              : channel.type === 'project'
                              ? `Private channel for ${channel.name} project members`
                              : `This is the #${channel.name} channel`}
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </div>

                    {/* Messages */}
                    {messages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showHeader =
                        !prevMsg ||
                        prevMsg.senderId !== msg.senderId ||
                        new Date(msg.timestamp).getTime() -
                          new Date(prevMsg.timestamp).getTime() >
                          300000; // 5 minutes gap

                      return (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          showHeader={showHeader}
                        />
                      );
                    })}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t bg-background shrink-0">
              <div className="flex items-center gap-2 p-2 rounded-lg border bg-background focus-within:border-[oklch(0.55_0.15_160)/40] focus-within:ring-1 focus-within:ring-[oklch(0.55_0.15_160)/20] transition-all">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground">
                  <Plus className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={`Message ${channel.type === 'direct' ? channel.name : '#' + channel.name}...`}
                  className="border-0 shadow-none focus-visible:ring-0 h-7 text-sm px-1"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <AtSign className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white shrink-0"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5 px-2">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-[8px] font-mono">Enter</kbd> to send,{' '}
                <kbd className="px-1 py-0.5 rounded bg-muted text-[8px] font-mono">Shift+Enter</kbd> for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Select a channel</p>
              <p className="text-xs mt-1">Choose a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
