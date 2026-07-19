import { fr } from './locales/fr';
import { en } from './locales/en';

export type Locale = 'fr' | 'en';

export const translations = {
  fr,
  en,
} as const;

export type TranslationKey = typeof translations.fr;
