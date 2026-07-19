'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/lib/i18n';
import { ViewShell } from '@/components/view-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bot,
  Check,
  EyeOff,
  Filter,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Unplug,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DEFAULT_AI_PILOT_ID, getAiPilot, type AiPilotId } from '@/lib/ai-pilots';

const AiPilotMascot = dynamic(
  () =>
    import('@/components/conversation/pilots').then((m) => m.AiPilotMascot),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-[#F3F6F8]/80" aria-hidden />
    ),
  }
);

const AiPilotGallery = dynamic(
  () =>
    import('@/components/conversation/ai-pilot-gallery').then((m) => m.AiPilotGallery),
  { ssr: false }
);

type ConversationTab = 'unresolved' | 'unread' | 'all';
type Platform = 'facebook' | 'google';
type AiProvider = 'openai' | 'claude' | 'gemini';

type MockConversation = {
  id: string;
  name: string;
  avatarUrl: string;
  preview: string;
  timestamp: string;
  platform: Platform;
  status: 'unresolved' | 'resolved';
  unread: boolean;
};

const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: '1',
    name: 'Samy Beatitud Mutoto',
    avatarUrl: 'https://i.pravatar.cc/96?u=samy-beatitud',
    preview: 'Bonjour, je souhaitais savoir si…',
    timestamp: '16 août 2022 4:59',
    platform: 'facebook',
    status: 'unresolved',
    unread: true,
  },
  {
    id: '2',
    name: 'Marie Dupont',
    avatarUrl: 'https://i.pravatar.cc/96?u=marie-dupont',
    preview: 'Merci pour votre réponse rapide !',
    timestamp: '15 août 2022 18:22',
    platform: 'facebook',
    status: 'unresolved',
    unread: true,
  },
  {
    id: '3',
    name: 'Jean Kouassi',
    avatarUrl: 'https://i.pravatar.cc/96?u=jean-kouassi',
    preview: 'Est-ce que la formation est encore…',
    timestamp: '14 août 2022 11:05',
    platform: 'google',
    status: 'unresolved',
    unread: false,
  },
  {
    id: '4',
    name: 'Amina Benali',
    avatarUrl: 'https://i.pravatar.cc/96?u=amina-benali',
    preview: 'Pouvez-vous me renvoyer le lien…',
    timestamp: '13 août 2022 9:41',
    platform: 'facebook',
    status: 'resolved',
    unread: false,
  },
  {
    id: '5',
    name: 'Lucas Martin',
    avatarUrl: 'https://i.pravatar.cc/96?u=lucas-martin',
    preview: 'Parfait, on se retrouve demain.',
    timestamp: '12 août 2022 16:18',
    platform: 'google',
    status: 'unresolved',
    unread: true,
  },
  {
    id: '6',
    name: 'Sophie Leroy',
    avatarUrl: 'https://i.pravatar.cc/96?u=sophie-leroy',
    preview: 'J’ai une question sur l’inscription…',
    timestamp: '11 août 2022 8:03',
    platform: 'facebook',
    status: 'unresolved',
    unread: false,
  },
];

function FacebookBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm ring-2 ring-white',
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-current">
        <path d="M14 8h3V4.5C16.4 4.3 15.3 4 14.1 4 11.6 4 10 5.5 10 8.2V11H7v4h3v9h4v-9h3.1l.5-4H14V8.3c0-.6.2-1 1-1z" />
      </svg>
    </span>
  );
}

function GoogleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-white',
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    </span>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === 'facebook' ? (
    <FacebookBadge className="absolute -bottom-0.5 -right-0.5" />
  ) : (
    <GoogleBadge className="absolute -bottom-0.5 -right-0.5" />
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ConversationView() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ConversationTab>('unresolved');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiConnected, setAiConnected] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');
  const [leftPane, setLeftPane] = useState<'chats' | 'gallery' | 'ai'>('chats');
  const [activePilotId, setActivePilotId] = useState<AiPilotId>(DEFAULT_AI_PILOT_ID);

  const activePilot = getAiPilot(activePilotId);

  const unreadCount = MOCK_CONVERSATIONS.filter((c) => c.unread).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_CONVERSATIONS.filter((c) => {
      if (tab === 'unresolved' && c.status !== 'unresolved') return false;
      if (tab === 'unread' && !c.unread) return false;
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.preview.toLowerCase().includes(query)
      );
    });
  }, [search, tab]);

  const tabs: { id: ConversationTab; label: string; showDot?: boolean }[] = [
    { id: 'unresolved', label: t.conversation.tabs.unresolved },
    { id: 'unread', label: t.conversation.tabs.unread, showDot: unreadCount > 0 },
    { id: 'all', label: t.conversation.tabs.all },
  ];

  const handleConnectAi = () => {
    setAiConnected(true);
  };

  const handleDisconnectAi = () => {
    setAiConnected(false);
  };

  return (
    <ViewShell className="!mx-0 space-y-0">
      <div className="flex h-[calc(100vh-7.5rem)] min-h-[520px] gap-4 overflow-hidden">
        {/* Left: conversation list */}
        <aside className="flex w-full max-w-[420px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-sm lg:w-[380px] xl:w-[420px]">
          {/* Platform switcher + AI */}
          <div className="flex items-center gap-2 border-b border-[#E8ECEF] px-4 py-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm ring-2 ring-[#1877F2]/20"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M14 8h3V4.5C16.4 4.3 15.3 4 14.1 4 11.6 4 10 5.5 10 8.2V11H7v4h3v9h4v-9h3.1l.5-4H14V8.3c0-.6.2-1 1-1z" />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8ECEF] bg-white shadow-sm"
              aria-label="Google Business"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-[#D0D5DD] text-[#8B939E] hover:bg-[#F8FAFB]"
              aria-label={t.conversation.addChannel}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setLeftPane((p) => (p === 'gallery' ? 'chats' : 'gallery'))
              }
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
                leftPane === 'gallery'
                  ? 'border-[#1D141F] bg-[#1D141F] text-[#E2F343]'
                  : 'border-[#E8ECEF] bg-white text-[#1D141F] hover:bg-[#F8FAFB]'
              )}
              style={
                leftPane !== 'gallery'
                  ? { boxShadow: `inset 0 0 0 2px ${activePilot.accent}33` }
                  : undefined
              }
              aria-label={t.conversation.ai.openGallery}
              title={t.conversation.ai.openGallery}
            >
              <Bot
                className="h-4 w-4"
                style={{ color: leftPane === 'gallery' ? undefined : activePilot.accent }}
              />
            </button>
            <button
              type="button"
              onClick={() => setLeftPane((p) => (p === 'ai' ? 'chats' : 'ai'))}
              className={cn(
                'ml-auto flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors',
                leftPane === 'ai' || aiConnected
                  ? 'border-[#E2F343]/60 bg-[#1D141F] text-[#E2F343]'
                  : 'border-[#E8ECEF] bg-[#F8FAFB] text-[#1D141F] hover:bg-white',
                leftPane === 'ai' && 'ring-2 ring-[#1D141F]/15'
              )}
              aria-label={t.conversation.ai.connectTitle}
              title={t.conversation.ai.connectTitle}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {aiConnected ? t.conversation.ai.connected : t.conversation.ai.connectCta}
            </button>
          </div>

          {leftPane === 'gallery' ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <AiPilotGallery
                activePilotId={activePilotId}
                onSelect={(id) => {
                  setActivePilotId(id);
                  setLeftPane('chats');
                }}
                onClose={() => setLeftPane('chats')}
              />
            </div>
          ) : leftPane === 'ai' ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <AiConnectPanel
                provider={aiProvider}
                connected={aiConnected}
                onProviderChange={setAiProvider}
                onConnect={handleConnectAi}
                onDisconnect={handleDisconnectAi}
                onClose={() => setLeftPane('chats')}
              />
            </div>
          ) : (
            <>
          {/* Search + filter */}
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B939E]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.conversation.searchPlaceholder}
                className="h-10 rounded-xl border-[#E8ECEF] bg-[#F8FAFB] pl-9 text-sm shadow-none focus-visible:ring-1"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8ECEF] bg-white text-[#1D141F] hover:bg-[#F8FAFB]"
              aria-label={t.conversation.filter}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-[#E8ECEF] px-4">
            <nav className="flex items-end gap-5">
              {tabs.map((item) => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'relative pb-3 pt-1 text-sm transition-colors',
                      isActive
                        ? 'font-semibold text-[#1D141F]'
                        : 'font-medium text-[#8B939E] hover:text-[#1D141F]'
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {item.label}
                      {item.showDot && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      )}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#1D141F]" />
                    )}
                  </button>
                );
              })}
            </nav>
            <button
              type="button"
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-[#8B939E] hover:bg-[#F8FAFB] hover:text-[#1D141F]"
              aria-label={t.conversation.more}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#8B939E]">
                {t.conversation.noResults}
              </p>
            ) : (
              filtered.map((conversation) => {
                const isSelected = selectedId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-[#EEF1F4] px-4 py-3.5 text-left transition-colors hover:bg-[#F8FAFB]',
                      isSelected && 'bg-[#F3F6F8]'
                    )}
                  >
                    <div className="relative mt-0.5 shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
                        <AvatarFallback className="bg-[#EEF4F8] text-xs font-semibold text-[#1D141F]">
                          {initials(conversation.name)}
                        </AvatarFallback>
                      </Avatar>
                      <PlatformBadge platform={conversation.platform} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-sm text-[#1D141F]',
                            conversation.unread ? 'font-bold' : 'font-semibold'
                          )}
                        >
                          {conversation.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-[#8B939E]">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-[#8B939E]">
                          <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{conversation.preview}</span>
                        </p>
                        <span className="flex shrink-0 items-center gap-1.5 text-[#B0B7C0]">
                          <EyeOff className="h-3.5 w-3.5" />
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
            </>
          )}
        </aside>

        {/* Right: detail / empty state */}
        <section className="hidden min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white shadow-sm sm:flex">
          {selectedId ? (
            <SelectedConversationPanel
              conversation={MOCK_CONVERSATIONS.find((c) => c.id === selectedId)!}
              aiConnected={aiConnected}
              onOpenAiPanel={() => setLeftPane('ai')}
              activePilotId={activePilotId}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-6 flex h-44 w-56 items-center justify-center">
                  <div className="absolute inset-x-6 bottom-2 h-24 rounded-[40%] bg-[#D7E8F5]/70 blur-[1px]" />
                  <div className="absolute inset-x-10 bottom-6 h-16 rounded-[45%] bg-[#C5DCF0]/80" />
                  <div className="relative z-10 flex h-24 w-28 items-center justify-center rounded-[28px] bg-white shadow-[0_12px_30px_rgba(29,20,31,0.08)]">
                    <div className="relative flex h-14 w-16 items-center justify-center rounded-2xl bg-[#EAF3FA] text-[#6B8EAD]">
                      <MessageCircle className="h-8 w-8" strokeWidth={1.75} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#6B8EAD] shadow-sm">
                        !
                      </span>
                    </div>
                  </div>
                </div>
                <p className="max-w-sm text-[15px] font-medium text-[#5B6470]">
                  {t.conversation.selectPrompt}
                </p>
                {!aiConnected && (
                  <Button
                    type="button"
                    onClick={() => setLeftPane('ai')}
                    className="mt-5 h-9 gap-1.5 rounded-lg bg-[#1D141F] px-4 text-sm font-semibold text-[#E2F343] hover:opacity-90"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t.conversation.ai.connectCta}
                  </Button>
                )}
              </motion.div>
            </div>
          )}
        </section>
      </div>
    </ViewShell>
  );
}

function AiConnectPanel({
  provider,
  connected,
  onProviderChange,
  onConnect,
  onDisconnect,
  onClose,
}: {
  provider: AiProvider;
  connected: boolean;
  onProviderChange: (p: AiProvider) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const providers: { id: AiProvider; label: string }[] = [
    { id: 'openai', label: t.conversation.ai.providerOpenai },
    { id: 'claude', label: t.conversation.ai.providerClaude },
    { id: 'gemini', label: t.conversation.ai.providerGemini },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-[#E8ECEF] px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1D141F]">{t.conversation.ai.connectTitle}</p>
          <p className="mt-0.5 text-xs text-[#8B939E]">{t.conversation.ai.connectSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8B939E] hover:bg-[#F3F6F8] hover:text-[#1D141F]"
          aria-label={t.conversation.ai.galleryClose}
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div
          className={cn(
            'rounded-2xl border px-4 py-3',
            connected
              ? 'border-[#E2F343]/50 bg-[#1D141F] text-[#E2F343]'
              : 'border-[#E8ECEF] bg-[#FAFBFC] text-[#8B939E]'
          )}
        >
          <p className="inline-flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            {connected ? t.conversation.ai.connected : t.conversation.ai.disconnected}
          </p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[#8B939E]">
            {t.conversation.ai.providersLabel}
          </p>
          <div className="flex flex-col gap-2">
            {providers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onProviderChange(item.id)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                  provider === item.id
                    ? 'border-[#1D141F] bg-[#1D141F] text-[#E2F343]'
                    : 'border-[#E8ECEF] bg-white text-[#1D141F] hover:bg-[#F8FAFB]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#E8ECEF] px-4 py-3">
        {connected ? (
          <Button
            type="button"
            variant="outline"
            onClick={onDisconnect}
            className="h-10 w-full gap-1.5 rounded-xl border-[#E8ECEF] text-sm"
          >
            <Unplug className="h-3.5 w-3.5" />
            {t.conversation.ai.disconnect}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onConnect}
            className="h-10 w-full gap-1.5 rounded-xl bg-[#1D141F] text-sm font-semibold text-[#E2F343] hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.conversation.ai.connectCta}
          </Button>
        )}
      </footer>
    </div>
  );
}

function SelectedConversationPanel({
  conversation,
  aiConnected,
  onOpenAiPanel,
  activePilotId,
}: {
  conversation: MockConversation;
  aiConnected: boolean;
  onOpenAiPanel: () => void;
  activePilotId: AiPilotId;
}) {
  const { t } = useTranslation();
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const pilot = getAiPilot(activePilotId);
  const pilotCopy = t.conversation.ai.pilots[activePilotId];

  const activateRobot = () => {
    if (!aiConnected) {
      onOpenAiPanel();
      return;
    }
    setIsGenerating(true);
    window.setTimeout(() => {
      const suggestion = pilotCopy.suggestions[0] ?? '';
      setReply(suggestion);
      setIsGenerating(false);
    }, 650);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-[#E8ECEF] px-5 py-4">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
            <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
          </Avatar>
          <PlatformBadge platform={conversation.platform} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#1D141F]">{conversation.name}</p>
          <p className="text-xs text-[#8B939E]">{conversation.timestamp}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
            aiConnected
              ? 'bg-[#1D141F] text-[#E2F343]'
              : 'bg-[#F3F6F8] text-[#8B939E]'
          )}
        >
          <Sparkles className="h-3 w-3" />
          {aiConnected ? t.conversation.ai.connected : t.conversation.ai.disconnected}
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
            <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
          </Avatar>
          <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-[#F3F6F8] px-3.5 py-2.5 text-sm text-[#1D141F]">
            {conversation.preview}
          </div>
        </div>
      </div>

      <footer className="border-t border-[#E8ECEF] bg-gradient-to-b from-white to-[#FAFBFC] px-4 py-3">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t.conversation.ai.replyPlaceholder}
          rows={2}
          className="mb-3 min-h-[72px] w-full resize-none rounded-xl border border-[#E8ECEF] bg-white px-3 py-2.5 text-sm text-[#1D141F] outline-none focus:border-[oklch(0.55_0.18_250/0.4)] focus:ring-1 focus:ring-[oklch(0.55_0.18_250/0.2)]"
        />
        <div className="flex items-stretch gap-2.5">
          <button
            type="button"
            onClick={activateRobot}
            disabled={isGenerating}
            className={cn(
              'group relative flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border-2 px-2.5 py-1.5 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.18_250/0.35)]',
              isGenerating
                ? 'border-[#1D141F] bg-[#1D141F] shadow-md'
                : 'border-[#1D141F]/15 bg-white hover:border-[#1D141F] hover:shadow-md'
            )}
            style={{
              boxShadow: isGenerating
                ? `0 8px 24px ${pilot.accent}40`
                : undefined,
            }}
            aria-label={t.conversation.ai.robotActivate}
          >
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: pilot.accent }}
              aria-hidden
            />
            <span
              className={cn(
                'relative flex shrink-0 items-center justify-center rounded-xl',
                isGenerating ? 'bg-white/10' : 'bg-[#F3F6F8]'
              )}
            >
              <AiPilotMascot
                pilotId={activePilotId}
                isGenerating={isGenerating}
                mini
                showLabel={false}
              />
            </span>
            <span className="min-w-0 flex-1 py-1 pr-1">
              <span
                className={cn(
                  'block text-[10px] font-semibold uppercase tracking-wide',
                  isGenerating ? 'text-[#E2F343]' : 'text-[#8B939E]'
                )}
              >
                {isGenerating
                  ? t.conversation.ai.robotWorking
                  : t.conversation.ai.robotAutoReply}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-sm font-semibold',
                  isGenerating ? 'text-white' : 'text-[#1D141F]'
                )}
              >
                {pilotCopy.name}
              </span>
              <span
                className={cn(
                  'mt-0.5 block truncate text-[11px] leading-snug',
                  isGenerating ? 'text-white/65' : 'text-[#8B939E]'
                )}
              >
                {isGenerating ? pilotCopy.generating : t.conversation.ai.robotActivate}
              </span>
            </span>
            <Sparkles
              className={cn(
                'mr-1 h-4 w-4 shrink-0',
                isGenerating ? 'text-[#E2F343]' : 'text-[#1D141F]/40 group-hover:text-[#1D141F]'
              )}
            />
          </button>

          <Button
            type="button"
            disabled={!reply.trim()}
            className="h-auto min-h-[72px] w-[7.25rem] shrink-0 flex-col gap-1 rounded-2xl bg-[#1D141F] px-3 text-sm font-semibold text-[#E2F343] hover:opacity-90 disabled:opacity-40"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/50">
              {t.conversation.ai.send}
            </span>
            <span className="text-base leading-none">→</span>
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#8B939E]">
          {t.conversation.ai.robotHint}
        </p>
      </footer>
    </div>
  );
}
