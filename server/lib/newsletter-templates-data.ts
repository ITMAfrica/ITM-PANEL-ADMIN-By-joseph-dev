// Templates de newsletter — structures de sections éditable (JSON).
// Rendu HTML : server/lib/newsletter-template-render.ts (style Labs : crème + blobs).

import type { NewsletterSection } from './newsletter-template-render';

const PLACEHOLDER = 'https://via.placeholder.com/600x300';

const learningNewsletter: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'JUILLET NEWSLETTER',
    title: 'Voici les nouveautés du Lab',
    subtitle:
      'Explorez l’avenir de l’IA avec les drops et mises à jour de ce mois.',
    imageUrl: '',
  },
  { type: 'cta', label: 'Explorer toutes les expériences', href: 'https://itm-hr.example/lab' },
  { type: 'band', label: 'Formation à la une' },
  {
    type: 'article',
    title: 'Leadership & Management',
    imageUrl: PLACEHOLDER,
    text: 'Développez vos compétences pour mieux diriger vos équipes.',
  },
  { type: 'cta', label: 'Découvrir la formation', href: 'https://itm-hr.example/formation' },
  { type: 'band', label: 'Nos formations disponibles' },
  {
    type: 'article',
    title: 'Catégories',
    imageUrl: PLACEHOLDER,
    text: 'Management · Leadership · RH & Organisation · Soft Skills · Digital Skills',
  },
  { type: 'band', label: 'Success Story' },
  {
    type: 'article',
    title: 'Témoignage',
    imageUrl: PLACEHOLDER,
    text: '« Cette formation m’a permis d’améliorer mes compétences et de prendre confiance en équipe. »',
  },
  {
    type: 'calendar',
    items: [
      '📅 12 Juillet — Leadership Management',
      '📅 18 Juillet — Excel avancé',
      '📅 25 Juillet — Communication professionnelle',
    ],
  },
  { type: 'cta', label: 'Réserver ma place', href: 'https://itm-hr.example/inscription' },
  { type: 'band', label: 'Rejoignez ITM HR Academy' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: 'Prêt à développer vos compétences ? Rejoignez la prochaine session.',
  },
  { type: 'cta', label: 'Bénéficier d’une formation', href: 'https://itm-hr.example/academy' },
  { type: 'footer', text: 'ITM HR — Contact · Réseaux sociaux · © 2026 Tous droits réservés.' },
];

const academyNewsletter: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'ACADEMY NEWSLETTER',
    title: 'Votre rendez-vous mensuel des compétences',
    subtitle: 'Parcours, sessions et succès de la communauté ITM HR Academy.',
    imageUrl: '',
  },
  { type: 'cta', label: 'Explorer le programme', href: 'https://itm-hr.example/academy' },
  { type: 'band', label: 'Formation du mois' },
  {
    type: 'article',
    title: 'Leadership 4.0',
    imageUrl: PLACEHOLDER,
    text: 'Une formation pour diriger à l’ère du travail hybride.',
  },
  { type: 'cta', label: 'Voir le programme', href: 'https://itm-hr.example/leadership' },
  { type: 'band', label: 'Learning Path' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: '01 Management · 02 Digital · 03 Leadership · 04 Innovation',
  },
  { type: 'band', label: 'Success Stories' },
  {
    type: 'article',
    title: 'Témoignage',
    imageUrl: PLACEHOLDER,
    text: '« Un parcours clair, des formateurs experts, un vrai impact. »',
  },
  {
    type: 'calendar',
    items: [
      '📅 Août — Management',
      '📅 Septembre — Data Analysis',
      '📅 Octobre — IA générative',
    ],
  },
  { type: 'cta', label: 'Inscrivez-vous', href: 'https://itm-hr.example/sessions' },
  { type: 'band', label: 'Join ITM HR Community' },
  { type: 'cta', label: 'Rejoindre la communauté', href: 'https://itm-hr.example/community' },
  { type: 'footer', text: 'ITM HR Academy — Contact · Réseaux sociaux · © 2026 Tous droits réservés.' },
];

const flashActusNewsletter: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'FLASH ACTUS',
    title: '3 infos à retenir cette semaine',
    subtitle: 'Un format court pour rester aligné sans surcharge.',
    imageUrl: '',
  },
  { type: 'band', label: 'À la une' },
  {
    type: 'article',
    title: 'Nouvelle politique RH',
    imageUrl: '',
    text: 'Les points clés applicables dès lundi prochain.',
  },
  {
    type: 'article',
    title: 'Outil collaboratif',
    imageUrl: '',
    text: 'Mise à jour disponible — 5 minutes pour se former.',
  },
  {
    type: 'article',
    title: 'Moment communauté',
    imageUrl: '',
    text: 'Coffee talk jeudi 12h — inscription libre.',
  },
  { type: 'cta', label: 'Lire le détail', href: 'https://itm-hr.example/flash' },
  { type: 'footer', text: 'ITM HR — Flash hebdo · Se désabonner · © 2026' },
];

const eventCalendarNewsletter: NewsletterSection[] = [
  {
    type: 'hero',
    label: 'AGENDA ITM',
    title: 'Vos prochains rendez-vous',
    subtitle: 'Formations, webinaires et moments clés du mois.',
    imageUrl: '',
  },
  { type: 'band', label: 'Temps forts' },
  {
    type: 'article',
    title: 'Webinaire Leadership',
    imageUrl: PLACEHOLDER,
    text: 'Session live avec Q&A — places limitées.',
  },
  {
    type: 'calendar',
    items: [
      '📅 08 — Kick-off Q3',
      '📅 15 — Webinaire Leadership',
      '📅 22 — Atelier Excel avancé',
      '📅 29 — Community day',
    ],
  },
  { type: 'cta', label: 'Réserver ma place', href: 'https://itm-hr.example/events' },
  { type: 'band', label: 'Ne manquez rien' },
  {
    type: 'article',
    title: '',
    imageUrl: '',
    text: 'Ajoutez les dates à votre calendrier et partagez-les à votre équipe.',
  },
  { type: 'footer', text: 'ITM HR — Agenda · Contact · © 2026 Tous droits réservés.' },
];

export const NEWSLETTER_TEMPLATE_SEEDS = [
  {
    name: 'ITM HR Learning Newsletter',
    description:
      'Hero Labs crème + blobs, formations, success story, calendrier et CTA pill.',
    subject: 'ITM HR — Vos formations du mois',
    preheader: 'Découvrez nos formations, actualités et opportunités.',
    category: 'newsletter',
    isPremium: false,
    thumbnail: '/newsletter/thumb-learning.svg',
    body: JSON.stringify(learningNewsletter),
  },
  {
    name: 'ITM HR Academy',
    description:
      'Format academy style Labs : hero crème, learning path, success stories et sessions.',
    subject: 'ITM HR Academy — Rejoignez la communauté',
    preheader: 'Votre rendez-vous mensuel pour développer vos compétences.',
    category: 'newsletter',
    isPremium: false,
    thumbnail: '/newsletter/thumb-academy.svg',
    body: JSON.stringify(academyNewsletter),
  },
  {
    name: 'Flash actus',
    description: 'Format court : 3 brèves + un CTA. Idéal pour un envoi hebdomadaire.',
    subject: 'ITM HR — Flash de la semaine',
    preheader: 'Trois infos essentielles, en une minute de lecture.',
    category: 'exemple',
    isPremium: false,
    thumbnail: '/newsletter/thumb-flash.svg',
    body: JSON.stringify(flashActusNewsletter),
  },
  {
    name: 'Event & calendrier',
    description: 'Agenda du mois avec temps forts, calendrier et réservation.',
    subject: 'ITM HR — Votre agenda du mois',
    preheader: 'Retenez les dates importantes et réservez vos places.',
    category: 'exemple',
    isPremium: false,
    thumbnail: '/newsletter/thumb-event.svg',
    body: JSON.stringify(eventCalendarNewsletter),
  },
];
