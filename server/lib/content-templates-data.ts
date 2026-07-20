// Templates de contenu (article & communication) — structures de sections
// éditables (JSON), mêmes blocs que les newsletters (hero, band, article,
// cta, calendar, footer). Rendu aperçu : NewsletterSectionsPreview côté front.

import type { NewsletterSection } from './newsletter-template-render';

const PLACEHOLDER = 'https://via.placeholder.com/600x300';

// ─── Articles ────────────────────────────────────────────────────────────

const blogStandardArticle: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'BLOG ITM',
    title: 'Titre de votre article',
    subtitle: 'Une introduction courte qui donne envie de lire la suite.',
    imageUrl: '',
  },
  { type: 'band', label: 'Introduction' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: 'Posez le contexte en quelques phrases : pourquoi ce sujet, pour qui, et ce que le lecteur va y gagner.',
  },
  { type: 'band', label: 'Le fond' },
  {
    type: 'article',
    title: 'Premier point clé',
    imageUrl: PLACEHOLDER,
    text: 'Développez votre première idée avec un exemple concret.',
  },
  {
    type: 'article',
    title: 'Deuxième point clé',
    imageUrl: '',
    text: 'Ajoutez chiffres, retours d’expérience ou bonnes pratiques.',
  },
  { type: 'cta', label: 'Lire la suite', href: 'https://itm-hr.example/blog' },
  { type: 'footer', text: 'ITM HR — Blog · © 2026 Tous droits réservés.' },
];

const guideArticle: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'GUIDE PRATIQUE',
    title: 'Votre guide étape par étape',
    subtitle: 'Un format tutoriel : objectif, étapes, résultat.',
    imageUrl: '',
  },
  { type: 'band', label: 'Étape 1' },
  {
    type: 'article',
    title: 'Préparer',
    imageUrl: '',
    text: 'Listez les prérequis et les outils nécessaires avant de commencer.',
  },
  { type: 'band', label: 'Étape 2' },
  {
    type: 'article',
    title: 'Appliquer',
    imageUrl: PLACEHOLDER,
    text: 'Décrivez l’action principale, capture ou schéma à l’appui.',
  },
  { type: 'band', label: 'Étape 3' },
  {
    type: 'article',
    title: 'Vérifier',
    imageUrl: '',
    text: 'Expliquez comment valider le résultat et éviter les erreurs fréquentes.',
  },
  { type: 'cta', label: 'Télécharger le guide', href: 'https://itm-hr.example/guides' },
  { type: 'footer', text: 'ITM HR — Guides & tutoriels · © 2026' },
];

const interviewArticle: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'PORTRAIT',
    title: 'Interview — prénom, rôle',
    subtitle: 'Une rencontre, un parcours, des conseils à partager.',
    imageUrl: PLACEHOLDER,
  },
  { type: 'band', label: 'Première question' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: '« Réponse de l’invité·e, en quelques phrases naturelles. »',
  },
  { type: 'band', label: 'Deuxième question' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: '« Anecdote, conseil ou moment clé du parcours. »',
  },
  { type: 'cta', label: 'Découvrir tous les portraits', href: 'https://itm-hr.example/portraits' },
  { type: 'footer', text: 'ITM HR — Portraits · © 2026' },
];

// ─── Communications (annonces internes) ──────────────────────────────────

const generalAnnouncement: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'COMMUNICATION INTERNE',
    title: 'Titre de votre communication',
    subtitle: 'L’essentiel du message en une phrase.',
    imageUrl: '',
  },
  {
    type: 'article',
    title: 'Ce qui change',
    imageUrl: '',
    text: 'Décrivez la décision ou l’information, sa date d’application et les personnes concernées.',
  },
  {
    type: 'article',
    title: 'Ce que vous devez faire',
    imageUrl: '',
    text: 'Listez les actions attendues côté équipes, s’il y en a.',
  },
  { type: 'footer', text: 'ITM HR — Communication interne · © 2026' },
];

const maintenanceAnnouncement: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'MAINTENANCE INFORMATIQUE',
    title: 'Intervention planifiée',
    subtitle: 'Coupure ou perturbation à prévoir — tous les détails ci-dessous.',
    imageUrl: '',
  },
  { type: 'band', label: 'Créneaux d’intervention' },
  {
    type: 'calendar',
    items: [
      '📅 Vendredi 18h00 — Début de la maintenance',
      '📅 Vendredi 22h00 — Remise en service estimée',
    ],
  },
  {
    type: 'article',
    title: 'Impact',
    imageUrl: '',
    text: 'Les outils concernés seront indisponibles pendant le créneau. Pensez à enregistrer votre travail.',
  },
  { type: 'cta', label: 'Contacter le support IT', href: 'https://itm-hr.example/support' },
  { type: 'footer', text: 'ITM HR — Support IT · © 2026' },
];

const eventAnnouncement: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'ÉVÉNEMENT D’ENTREPRISE',
    title: 'Nom de l’événement',
    subtitle: 'Date, lieu et programme en un coup d’œil.',
    imageUrl: PLACEHOLDER,
  },
  { type: 'band', label: 'Au programme' },
  {
    type: 'calendar',
    items: [
      '📅 09h00 — Accueil & café',
      '📅 10h00 — Session plénière',
      '📅 12h30 — Déjeuner d’équipe',
    ],
  },
  {
    type: 'article',
    title: 'Informations pratiques',
    imageUrl: '',
    text: 'Lieu, accès, dress code et personne à contacter pour toute question.',
  },
  { type: 'cta', label: 'Confirmer ma présence', href: 'https://itm-hr.example/events' },
  { type: 'footer', text: 'ITM HR — Événements · © 2026' },
];

export interface ContentTemplateSeed {
  name: string;
  description: string;
  /** 'article' | 'announcement' — aligné sur ContentTemplate.type */
  type: string;
  category: string;
  isPremium: boolean;
  thumbnail: string;
  body: string;
}

export const CONTENT_TEMPLATE_SEEDS: ContentTemplateSeed[] = [
  {
    name: 'Article de blog standard',
    description: 'Hero, introduction, deux blocs de fond et appel à l’action.',
    type: 'article',
    category: 'blog',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(blogStandardArticle),
  },
  {
    name: 'Guide / Tutoriel',
    description: 'Format pas-à-pas en trois étapes, avec téléchargement final.',
    type: 'article',
    category: 'guide',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(guideArticle),
  },
  {
    name: 'Interview / Portrait',
    description: 'Hero portrait puis enchaînement question / réponse.',
    type: 'article',
    category: 'portrait',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(interviewArticle),
  },
  {
    name: 'Communication générale',
    description: 'Annonce interne claire : ce qui change, actions attendues.',
    type: 'announcement',
    category: 'general',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(generalAnnouncement),
  },
  {
    name: 'Maintenance & IT',
    description: 'Créneaux d’intervention, impact et contact support.',
    type: 'announcement',
    category: 'it-maintenance',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(maintenanceAnnouncement),
  },
  {
    name: 'Événement d’entreprise',
    description: 'Programme, informations pratiques et confirmation de présence.',
    type: 'announcement',
    category: 'event',
    isPremium: false,
    thumbnail: '',
    body: JSON.stringify(eventAnnouncement),
  },
];
