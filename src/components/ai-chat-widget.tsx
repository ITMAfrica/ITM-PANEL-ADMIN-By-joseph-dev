'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Paperclip, Mic, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
}

export function AiChatWidget() {
  const { t } = useTranslation();
  const aiChatOpen = useAppStore((s) => s.aiChatOpen);
  const toggleAiChat = useAppStore((s) => s.toggleAiChat);
  const setAiChatOpen = useAppStore((s) => s.setAiChatOpen);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: t.aiChat.welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (aiChatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [aiChatOpen]);

  const callLlmApi = useCallback(async (message: string) => {
    setIsLoading(true);
    setIsTyping(true);
    setLastFailedMessage(null);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.message || data.fallback || t.aiChat.errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: t.aiChat.errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setLastFailedMessage(message);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [t]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    callLlmApi(trimmed);
  }, [input, isLoading, callLlmApi]);

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      // Remove the last error message
      setMessages((prev) => prev.filter((m) => m.role !== 'error'));
      setLastFailedMessage(null);
      callLlmApi(lastFailedMessage);
    }
  }, [lastFailedMessage, callLlmApi]);

  const handleQuickAction = useCallback((action: string) => {
    if (isLoading) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: action,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    callLlmApi(action);
  }, [isLoading, callLlmApi]);

  const quickActions = [
    t.aiChat.summarizeTasks,
    t.aiChat.createTask,
    t.aiChat.findDeadlines,
    t.aiChat.teamStatus,
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!aiChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={toggleAiChat}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_160)] to-[oklch(0.45_0.15_160)] text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-shadow flex items-center justify-center group"
            aria-label="Open AI Chat"
          >
            <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[oklch(0.55_0.15_160)] opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[480px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[oklch(0.55_0.15_160)] to-[oklch(0.45_0.15_160)] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{t.aiChat.title}</h3>
                    {/* AI-Powered Badge */}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/20 backdrop-blur-sm border border-white/20">
                      <Sparkles className="h-2.5 w-2.5" />
                      {t.aiChat.aiPowered}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[11px] text-white/80">{t.aiChat.online}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'error'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : msg.role === 'ai'
                          ? 'bg-[oklch(0.55_0.15_160/0.1)] text-foreground border border-[oklch(0.55_0.15_160/0.15)]'
                          : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />
                        <span className="text-[10px] font-medium text-[oklch(0.55_0.15_160)]">{t.aiChat.title}</span>
                      </div>
                    )}
                    {msg.role === 'error' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-medium">{t.aiChat.errorTitle}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'error' && (
                      <button
                        onClick={handleRetry}
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t.aiChat.retry}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[oklch(0.55_0.15_160/0.1)] border border-[oklch(0.55_0.15_160/0.15)] rounded-2xl px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="h-3.5 w-3.5 text-[oklch(0.55_0.15_160)]" />
                        <span className="text-[10px] font-medium text-[oklch(0.55_0.15_160)]">{t.aiChat.thinking}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.span
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)]"
                        />
                        <motion.span
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)]"
                        />
                        <motion.span
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                          className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_160)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[oklch(0.55_0.15_160/0.08)] text-[oklch(0.55_0.15_160)] border border-[oklch(0.55_0.15_160/0.15)] hover:bg-[oklch(0.55_0.15_160/0.15)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 pt-1 shrink-0">
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2 focus-within:border-[oklch(0.55_0.15_160/0.4)] focus-within:ring-1 focus-within:ring-[oklch(0.55_0.15_160/0.2)] transition-all">
                <button
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t.aiChat.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
                />
                <button
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 rounded-lg bg-[oklch(0.55_0.15_160)] text-white hover:bg-[oklch(0.55_0.15_160/0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
