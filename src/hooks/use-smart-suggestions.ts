'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SmartSuggestion {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  actionType: 'create_task' | 'view_project' | 'schedule_meeting' | 'review_task' | 'check_deadline';
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const FALLBACK_SUGGESTIONS: SmartSuggestion[] = [
  { id: 'sug-1', icon: '⏰', title: 'Review overdue tasks', description: '2 tasks are past their due date and need attention', action: 'Review now', actionType: 'review_task' },
  { id: 'sug-2', icon: '🚀', title: 'Focus on API Integration', description: 'Project is 80% complete — push to finish this sprint', action: 'View project', actionType: 'view_project' },
  { id: 'sug-3', icon: '📅', title: 'Prepare for Sprint Planning', description: 'Meeting tomorrow at 10 AM — review backlog first', action: 'Schedule', actionType: 'schedule_meeting' },
  { id: 'sug-4', icon: '✅', title: 'Close completed reviews', description: '2 tasks are in review and ready for final approval', action: 'Review tasks', actionType: 'review_task' },
  { id: 'sug-5', icon: '📋', title: 'Break down Marketing Campaign', description: 'Only 25% progress — consider splitting into smaller tasks', action: 'Create task', actionType: 'create_task' },
];

interface UseSmartSuggestionsReturn {
  suggestions: SmartSuggestion[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSmartSuggestions(): UseSmartSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>(FALLBACK_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const isFetching = useRef(false);

  const fetchSuggestions = useCallback(async (force = false) => {
    // Prevent concurrent fetches
    if (isFetching.current) return;

    const now = Date.now();
    // Use cache if less than 5 minutes old and not forced
    if (!force && lastFetchTime.current && now - lastFetchTime.current < CACHE_DURATION) {
      return;
    }

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'suggestions' }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        lastFetchTime.current = Date.now();
      } else {
        // Use fallback if API returns empty
        setSuggestions(FALLBACK_SUGGESTIONS);
      }
    } catch (err) {
      console.error('Failed to fetch smart suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      // Use fallback on error
      setSuggestions(FALLBACK_SUGGESTIONS);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const refresh = useCallback(() => {
    lastFetchTime.current = 0; // Clear cache
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  return { suggestions, isLoading, error, refresh };
}
