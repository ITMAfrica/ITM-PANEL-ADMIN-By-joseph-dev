'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Bold,
  Italic,
  Code2,
  Phone,
  Video,
  Pin,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { mockChannels, mockUsers } from '@/lib/mock-data';
import type { Channel, Message } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useChatSocket } from '@/hooks/use-chat-socket';
import type { ChatMessage } from '@/hooks/use-chat-socket';
import { useAppStore } from '@/lib/store';

// Helper functions
function getUserById(id: string) {
  return mockUsers.find((u) => u.id === id);
}

function getUserInitials(id: string, name?: string) {
  if (name) return name.split(' ').map((n) => n[0]).join('');
  const user = getUserById(id);
  return user ? user.name.split(' ').map((n) => n[0]).join('') : '??';
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

// Status color indicator with online status
function OnlineStatusDot({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'h-2.5 w-2.5 border-2' : 'h-3.5 w-3.5 border-[2.5px]';
  const colors: Record<string, string> = {
    online: 'bg-emerald-500 border-background',
    away: 'bg-amber-500 border-background',
    busy: 'bg-red-500 border-background',
    offline: 'bg-slate-400 dark:bg-slate-500 border-background',
  };
  return (
    <span
      className={cn(
        'inline-block rounded-full shadow-sm',
        sizeClasses,
        colors[status] || 'bg-slate-400 border-background'
      )}
    />
  );
}

// Typing indicator animation
function TypingIndicator({ userName }: { userName: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1.5">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.45_0.15_160)] flex items-center justify-center text-[8px] text-white font-bold shadow-sm">
          {userName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-muted/60">
          <span className="text-xs text-muted-foreground mr-1">{userName}</span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

// Channel list item
function ChannelListItem({
  channel,
  isActive,
  onClick,
  membersLabel,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  membersLabel?: string;
}) {
  const isDirect = channel.type === 'direct';
  const status = isDirect ? getUserStatus(channel.members[1] || channel.members[0]) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left',
        isActive
          ? 'bg-[oklch(0.55_0.15_160)/0.12] text-foreground font-medium shadow-sm'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      {isDirect ? (
        <div className="relative shrink-0">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[9px] bg-muted">
              {getUserInitials(channel.members[1] || channel.members[0])}
            </AvatarFallback>
          </Avatar>
          {status && (
            <span className="absolute -bottom-0.5 -right-0.5">
              <OnlineStatusDot status={status} size="sm" />
            </span>
          )}
        </div>
      ) : channel.type === 'project' ? (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      ) : (
        <Hash className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      )}
      <span className="truncate flex-1">
        {channel.name}
      </span>
      {channel.unread > 0 && (
        <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.48_0.15_160)] shadow-sm">
          {channel.unread}
        </Badge>
      )}
    </button>
  );
}

// Message bubble that works with both local Message type and ChatMessage from WebSocket
function MessageBubble({ message, showHeader, isOwnMessage }: { message: Message | ChatMessage; showHeader: boolean; isOwnMessage: boolean }) {
  const senderId = 'senderId' in message ? message.senderId : '';
  const senderName = 'senderName' in message ? message.senderName : (getUserById(senderId)?.name || 'Unknown');
  const content = message.content;
  const timestamp = message.timestamp;
  const reactions = message.reactions || [];

  // Determine avatar initials
  const initials = senderName !== 'Unknown'
    ? senderName.split(' ').map((n) => n[0]).join('')
    : getUserInitials(senderId);

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
          <div className="relative">
            <Avatar className="h-9 w-9 shadow-sm">
              <AvatarFallback
                className="text-[10px] font-semibold"
                style={{
                  backgroundColor: `oklch(0.7 ${0.08 + (senderName.charCodeAt(0) % 5) * 0.02} ${140 + (senderName.charCodeAt(1) % 40)})`,
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5">
              <OnlineStatusDot status={getUserStatus(senderId)} size="sm" />
            </span>
          </div>
        ) : (
          <div className="w-9 flex items-center justify-center">
            <span className="text-[9px] text-muted-foreground/0 group-hover:text-muted-foreground transition-colors">
              {formatShortTime(timestamp)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-bold">{senderName}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(timestamp)}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed break-words">{content}</p>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {reactions.map((reaction, idx) => (
              <button
                key={idx}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150',
                  'hover:border-[oklch(0.55_0.15_160)/40] hover:bg-[oklch(0.55_0.15_160)/8] hover:shadow-sm'
                )}
              >
                <span className="text-xs">{reaction.emoji}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">
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
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const [selectedChannel, setSelectedChannel] = useState<string>('ch-1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket integration
  const {
    messages: wsMessages,
    sendMessage,
    emitTyping,
    typingUsers,
    connectedUsers,
    isConnected,
  } = useChatSocket(selectedChannel);

  const channel = mockChannels.find((c) => c.id === selectedChannel);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wsMessages, selectedChannel]);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setShowMobileChat(true);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] border rounded-xl overflow-hidden bg-background shadow-sm">
      {/* Channel Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r bg-muted/20 shrink-0',
          'w-full md:w-72',
          showMobileChat ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 space-y-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{t.messages.title}</h2>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              {isConnected ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                        <Wifi className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Connected</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 text-[10px] text-amber-500">
                        <WifiOff className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Connecting...</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {totalUnread > 0 && (
                <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.48_0.15_160)] shadow-sm">
                  {totalUnread}
                </Badge>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t.messages.searchChannels}
              className="pl-8 h-8 text-xs bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1 px-2 py-1">
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Team Channels */}
            {filterChannels(teamChannels).length > 0 && (
              <div className="mb-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  {t.messages.teamChannels}
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
              <div className="mb-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  {t.messages.projectChannels}
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
              <div className="mb-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="h-3 w-3" />
                  {t.messages.directMessages}
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
              <div className="flex items-center gap-2.5 min-w-0">
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
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[8px] bg-muted">
                        {getUserInitials(channel.members[1] || channel.members[0])}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <OnlineStatusDot status={getUserStatus(channel.members[1] || channel.members[0])} size="sm" />
                    </span>
                  </div>
                ) : channel.type === 'project' ? (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate">{channel.name}</h3>
                    {channel.unread > 0 && (
                      <Badge className="h-4 min-w-[16px] px-1 text-[8px] bg-[oklch(0.55_0.15_160)] text-white">
                        {channel.unread} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {channel.type === 'direct'
                      ? `Active now · ${channel.members.length} ${t.messages.members}`
                      : `${channel.members.length} ${t.messages.members}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice Call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pinned Messages</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mentions</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Search className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Search</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground ml-2 bg-muted/50 px-2 py-1 rounded-md">
                  <Users className="h-3.5 w-3.5" />
                  <span>{connectedUsers.length || channel.members.length}</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1">
              <div className="py-4">
                {wsMessages.length > 0 ? (
                  <>
                    {/* Channel intro */}
                    <div className="px-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.15_160)/20] to-[oklch(0.55_0.15_160)/5] flex items-center justify-center shadow-sm">
                          {channel.type === 'direct' ? (
                            <MessageSquare className="h-7 w-7 text-[oklch(0.55_0.15_160)]" />
                          ) : channel.type === 'project' ? (
                            <Lock className="h-7 w-7 text-[oklch(0.55_0.15_160)]" />
                          ) : (
                            <Hash className="h-7 w-7 text-[oklch(0.55_0.15_160)]" />
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
                    {wsMessages.map((msg, idx) => {
                      const prevMsg = idx > 0 ? wsMessages[idx - 1] : null;
                      const showHeader =
                        !prevMsg ||
                        prevMsg.senderId !== msg.senderId ||
                        new Date(msg.timestamp).getTime() -
                          new Date(prevMsg.timestamp).getTime() >
                          300000; // 5 minutes gap

                      const isOwnMessage = msg.senderId === currentUser?.id;

                      return (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          showHeader={showHeader}
                          isOwnMessage={isOwnMessage}
                        />
                      );
                    })}

                    {/* Typing indicators */}
                    <AnimatePresence>
                      {typingUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {typingUsers.map((tu) => (
                            <TypingIndicator key={tu.userId} userName={tu.userName} />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <MessageSquare className="h-8 w-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-3 pb-3 pt-1 shrink-0">
              <div className="flex flex-col rounded-xl border bg-background focus-within:border-[oklch(0.55_0.15_160)/40] focus-within:ring-2 focus-within:ring-[oklch(0.55_0.15_160)/15] transition-all shadow-sm">
                {/* Formatting toolbar */}
                <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-transparent">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                          <Bold className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                          <Italic className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                          <Code2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Code</TooltipContent>
                    </Tooltip>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                          <Paperclip className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50">
                          <AtSign className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Mention</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Input row */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Input
                    placeholder={t.messages.messageInput}
                    className="border-0 shadow-none focus-visible:ring-0 h-7 text-sm px-1 flex-1"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      // Emit typing indicator
                      if (e.target.value.trim()) {
                        emitTyping();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className={cn(
                        'h-7 w-7 shrink-0 transition-all duration-200',
                        messageInput.trim()
                          ? 'bg-[oklch(0.55_0.15_160)] hover:bg-[oklch(0.48_0.15_160)] text-white shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      )}
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5 px-2">
                Press <kbd className="px-1 py-0.5 rounded bg-muted text-[8px] font-mono">Enter</kbd> to {t.messages.send.toLowerCase()},{' '}
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
