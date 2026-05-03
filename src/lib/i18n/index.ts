'use client';

import { useAppStore } from '@/lib/store';
import { translations, type Locale, type TranslationKey } from './translations';

export type { Locale, TranslationKey };

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);
  const t = translations[locale] as TranslationKey;

  return { t, locale };
}

// Helper for non-hook usage
export function getTranslation(locale: Locale): TranslationKey {
  return translations[locale] as TranslationKey;
}
