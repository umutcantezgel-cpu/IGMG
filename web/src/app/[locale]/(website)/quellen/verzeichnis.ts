/**
 * Verzeichnis der übernommenen Daten, Schriften und Bibliotheken für /quellen (AUFTRAG 5, ADR 0025). Sprachneutrale
 * Angaben (Eigennamen, Urheber wie in der Quelle, Lizenzname, Adressen) stehen hier; Fassung, Verwendung, Änderungen und
 * Hinweise in messages/bereiche/quellen.json unter `quellen.eintraege.<id>`. Belege: web/daten/<quelle>/QUELLE.md,
 * src/fonts/QUELLE.md und *-OFL.txt, package.json (Versionen laut node_modules).
 */
export type Lizenz = { name: string; url: string };

export type QuellenEintrag = {
  /** Anker auf der Seite und Schlüssel in `quellen.eintraege` */
  id: string;
  name: string;
  /** Urheber bzw. Rechteinhaber, wie ihn die Quelle nennt */
  urheber: string;
  url: string;
  /** Lizenz mit Name und Text; ohne Eintrag steht die Lizenz als Text in `quellen.eintraege.<id>.lizenz` */
  lizenz?: Lizenz;
  /** Herkunft des Inhalts, wenn sie von der Bezugsquelle abweicht (Hadith: sunnah.com laut References.md) */
  herkunft?: { name: string; url: string };
  /** Es gibt `quellen.eintraege.<id>.aenderungen` bzw. `.hinweis` */
  aenderungen?: boolean;
  hinweis?: boolean;
};

const CC_BY_3 = { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' };
const CC_BY_4 = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
const OFL = { name: 'SIL Open Font License 1.1', url: 'https://openfontlicense.org/' };
const MIT = { name: 'MIT', url: 'https://opensource.org/license/mit' };
const APACHE = { name: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' };

export const ABSCHNITTE: { id: string; eintraege: QuellenEintrag[]; zusatz?: 'uebersetzungsbedingungen' }[] = [
  {
    id: 'koran',
    eintraege: [
      {
        id: 'tanzil',
        name: 'Tanzil Quran Text (Uthmani)',
        urheber: 'Tanzil Project, Copyright (C) 2007-2026',
        url: 'https://tanzil.net',
        lizenz: CC_BY_3,
        aenderungen: true,
      },
      {
        id: 'tanzil-metadaten',
        name: 'Tanzil Quran Metadata (quran-data.xml)',
        urheber: 'Tanzil.info, (C) 2008-2009',
        url: 'https://tanzil.net',
        lizenz: { name: 'CC BY', url: 'https://creativecommons.org/licenses/by/3.0/' },
        aenderungen: true,
      },
      {
        id: 'tajwid',
        name: 'quran-tajweed',
        urheber: 'cpfair/quran-tajweed',
        url: 'https://github.com/cpfair/quran-tajweed',
        lizenz: CC_BY_4,
        aenderungen: true,
        hinweis: true,
      },
    ],
  },
  {
    id: 'uebersetzungen',
    zusatz: 'uebersetzungsbedingungen',
    eintraege: [
      {
        id: 'de-bubenheim',
        name: 'Bubenheim & Elyas (de.bubenheim)',
        urheber: 'A. S. F. Bubenheim, N. Elyas',
        url: 'https://tanzil.net/trans/',
      },
      { id: 'tr-diyanet', name: 'Diyanet İşleri (tr.diyanet)', urheber: 'Diyanet İşleri', url: 'https://tanzil.net/trans/' },
      { id: 'en-sahih', name: 'Saheeh International (en.sahih)', urheber: 'Saheeh International', url: 'https://tanzil.net/trans/' },
    ],
  },
  {
    id: 'hadith',
    eintraege: [
      {
        id: 'hadith-api',
        name: 'hadith-api (ara-bukhari)',
        urheber: 'fawazahmed0',
        url: 'https://github.com/fawazahmed0/hadith-api',
        lizenz: { name: 'Unlicense', url: 'https://unlicense.org/' },
        herkunft: { name: 'sunnah.com', url: 'https://sunnah.com/' },
        aenderungen: true,
        hinweis: true,
      },
    ],
  },
  {
    id: 'orte',
    eintraege: [
      { id: 'geonames', name: 'GeoNames', urheber: 'GeoNames', url: 'https://www.geonames.org/', lizenz: CC_BY_4, aenderungen: true },
    ],
  },
  {
    id: 'gebetszeiten',
    eintraege: [
      {
        id: 'adhan',
        name: 'adhan-js',
        urheber: 'Batoul Apps, Copyright (c) 2016',
        url: 'https://github.com/batoulapps/adhan-js',
        lizenz: MIT,
      },
    ],
  },
  {
    id: 'schriften',
    eintraege: [
      {
        id: 'atkinson',
        name: 'Atkinson Hyperlegible Next',
        urheber: 'The Atkinson Hyperlegible Next Project Authors, 2020-2024',
        url: 'https://github.com/googlefonts/atkinson-hyperlegible-next',
        lizenz: OFL,
      },
      {
        id: 'source-serif',
        name: 'Source Serif 4',
        urheber: 'Adobe',
        url: 'https://github.com/adobe-fonts/source-serif',
        lizenz: OFL,
        aenderungen: true,
      },
      {
        id: 'amiri',
        name: 'Amiri',
        urheber: 'The Amiri Project Authors, 2010-2022',
        url: 'https://github.com/aliftype/amiri',
        lizenz: OFL,
      },
      {
        id: 'amiri-quran',
        name: 'Amiri Quran',
        urheber: 'The Amiri Project Authors',
        url: 'https://github.com/aliftype/amiri',
        lizenz: OFL,
      },
    ],
  },
  {
    // Lern-App: synthetische Stimmen (ADR 0039 Nr. 9, ADR 0045 Nr. 11); Angaben wie src/lib/lernapp/audio/stimmen.ts
    id: 'sprachausgabe',
    eintraege: [
      {
        id: 'thorsten-vits',
        name: 'Coqui-TTS VITS „Thorsten“ (Deutsch)',
        urheber: 'Thorsten Müller (Thorsten-Voice); Modell trainiert mit Coqui TTS',
        url: 'https://huggingface.co/Thorsten-Voice/VITS',
        lizenz: APACHE,
        herkunft: { name: 'Thorsten-Voice TV-44kHz-Full (CC0 1.0)', url: 'https://huggingface.co/datasets/Thorsten-Voice/TV-44kHz-Full' },
        aenderungen: true,
        hinweis: true,
      },
    ],
  },
];

/** Wichtigste Programmbibliotheken (package.json); Zweck in `quellen.bibliotheken.zweck.<id>`. */
export const BIBLIOTHEKEN: { id: string; name: string; url: string; lizenz: Lizenz }[] = [
  { id: 'next', name: 'Next.js', url: 'https://nextjs.org', lizenz: MIT },
  { id: 'react', name: 'React', url: 'https://react.dev', lizenz: MIT },
  { id: 'next-intl', name: 'next-intl', url: 'https://next-intl.dev', lizenz: MIT },
  { id: 'tailwind', name: 'Tailwind CSS', url: 'https://tailwindcss.com', lizenz: MIT },
  { id: 'drizzle', name: 'Drizzle ORM', url: 'https://orm.drizzle.team', lizenz: APACHE },
  { id: 'pg', name: 'node-postgres (pg)', url: 'https://github.com/brianc/node-postgres', lizenz: MIT },
  { id: 'pglite', name: 'PGlite', url: 'https://pglite.dev', lizenz: APACHE },
  { id: 'better-auth', name: 'Better Auth', url: 'https://better-auth.com', lizenz: MIT },
  { id: 'tiptap', name: 'Tiptap', url: 'https://tiptap.dev', lizenz: MIT },
  { id: 'radix', name: 'Radix UI', url: 'https://radix-ui.com', lizenz: MIT },
  {
    id: 'lucide',
    name: 'Lucide',
    url: 'https://lucide.dev',
    lizenz: { name: 'ISC', url: 'https://opensource.org/license/isc-license-txt' },
  },
  { id: 'date-fns', name: 'date-fns', url: 'https://date-fns.org', lizenz: MIT },
  { id: 'zod', name: 'Zod', url: 'https://zod.dev', lizenz: MIT },
  { id: 'altcha', name: 'ALTCHA', url: 'https://altcha.org', lizenz: MIT },
  { id: 'ical', name: 'ical-generator', url: 'https://github.com/sebbo2002/ical-generator', lizenz: MIT },
  {
    id: 'rrule',
    name: 'rrule',
    url: 'https://github.com/jkbrzt/rrule',
    lizenz: { name: 'BSD-3-Clause', url: 'https://opensource.org/license/bsd-3-clause' },
  },
  { id: 'uqr', name: 'uqr', url: 'https://github.com/unjs/uqr', lizenz: MIT },
  { id: 'sharp', name: 'sharp', url: 'https://sharp.pixelplumbing.com', lizenz: APACHE },
  {
    id: 'nodemailer',
    name: 'Nodemailer',
    url: 'https://nodemailer.com',
    lizenz: { name: 'MIT-0', url: 'https://opensource.org/license/mit-0' },
  },
];
