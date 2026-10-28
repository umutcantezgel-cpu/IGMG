/**
 * Verzeichnis der übernommenen Daten, Schriften und Bibliotheken für /quellen (AUFTRAG 5, ADR 0025). Sprachneutrale
 * Angaben (Eigennamen, Urheber wie in der Quelle, Lizenzname, Adressen) stehen hier; Fassung, Verwendung, Änderungen und
 * Hinweise in messages/bereiche/quellen.json unter `quellen.eintraege.<id>`. Belege: web/daten/<quelle>/QUELLE.md,
 * src/fonts/QUELLE.md und *-OFL.txt, package.json (Versionen laut node_modules). Lern-App (L8-03, ADR 0045 Nr. 15, Z-L17):
 * Sprachdaten, Bildkarten und Spracherkennung mit denselben Angaben wie `/lern-app/[ui]/quellen`; die Namensnennungen der
 * Daten kommen aus `src/lib/lernapp/quellen.ts` (eine Quelle für beide Seiten, abgeglichen mit `web/daten/<ordner>/QUELLE.md`).
 */
import { HUTBA_FEED } from '@/lib/dachverband/feed';
import { NETZWERK } from '@/lib/dachverband/netzwerk';
import { DATEN, ORT_DRITTLIZENZEN } from '@/lib/lernapp/quellen';
import { ENTITAET } from '@/lib/seo/entitaet';

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
  /**
   * Übernahme mit Zustimmung der IGMG (Nutzerentscheidung vom 27.10.2026, E-044 Nr. 1): statt einer Lizenz der gemeinsame
   * Text `quellen.dachverband.lizenz` (Texte eigenständig formuliert, Zahlen und Kontaktdaten mit Quelle übernommen).
   */
  zustimmung?: true;
  /** Herkunft des Inhalts, wenn sie von der Bezugsquelle abweicht (Hadith: sunnah.com laut References.md) */
  herkunft?: { name: string; url: string };
  /** Es gibt `quellen.eintraege.<id>.aenderungen` bzw. `.hinweis` */
  aenderungen?: boolean;
  hinweis?: boolean;
  /** Pflichtangabe der Namensnennung wie in `QUELLE.md` (deutsch, sprachneutral wiedergegeben, `lang="de"`) */
  namensnennung?: string;
  /** Volltext weiterer Lizenzen (ONNX Runtime: ThirdPartyNotices) vom eigenen Ursprung */
  drittlizenzen?: Lizenz;
};

/** Namensnennung einer Datenquelle der Lern-App (`src/lib/lernapp/quellen.ts`). */
const namensnennung = (id: string) => {
  const d = DATEN.find((x) => x.id === id);
  if (!d) throw new Error(`Datenquelle ${id} fehlt in src/lib/lernapp/quellen.ts`);
  return d.namensnennung;
};

const CC_BY_3 = { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' };
const CC_BY_4 = { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' };
const OFL = { name: 'SIL Open Font License 1.1', url: 'https://openfontlicense.org/' };
const MIT = { name: 'MIT', url: 'https://opensource.org/license/mit' };
const APACHE = { name: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' };
const CC_BY_2_FR = { name: 'CC BY 2.0 FR', url: 'https://creativecommons.org/licenses/by/2.0/fr/' };
const CC_BY_SA_4 = { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' };
const ISC = { name: 'ISC', url: 'https://opensource.org/license/isc-license-txt' };

/** Urheber der Inhalte des Dachverbands (Impressum igmg.org). */
const IGMG_EV = 'Islamische Gemeinschaft Millî Görüş e. V., Köln';
const IGMG = 'https://www.igmg.org';
/** IGMG-Bericht zum Tag der offenen Moschee 2011 in Wetzlar (17.10.2011); gleiche Adresse wie `ARTIKEL_2011` im Seed „ueber-uns“. */
export const ARTIKEL_WETZLAR_2011 = `${IGMG}/gutes-wetter-und-gute-gespra%c2%a4che-ae-tag-der-offenen-moschee-2011-in-wetzlar/`;

export const ABSCHNITTE: { id: string; eintraege: QuellenEintrag[]; zusatz?: 'uebersetzungsbedingungen' | 'stimmen' | 'ofl' }[] = [
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
      // Marktstart P6 (ADR 0048): Zeiten aus dem IGMG-Gebetskalender mit Zustimmung der IGMG (so in quellen.json unter „lizenz“)
      {
        id: 'igmg-gebetskalender',
        name: 'IGMG-Gebetskalender',
        urheber: 'Islamische Gemeinschaft Millî Görüş (IGMG), Köln',
        url: NETZWERK.gebetskalender.url.de,
        hinweis: true,
      },
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
    // Marktstart P7 (ADR 0046): Quellen zum Dachverband; Anker #dachverband (Quellenzeilen auf /igmg, /ueber-uns, …). Ohne
    // Lizenzobjekt – Übernahme mit Zustimmung der IGMG. Der Gebetskalender steht oben unter „gebetszeiten“.
    id: 'dachverband',
    eintraege: [
      { id: 'igmg-website', name: 'igmg.org', urheber: IGMG_EV, url: NETZWERK.igmg.url.de, zustimmung: true },
      {
        id: 'igmg-broschuere-en',
        name: 'IGMG-Broschüre (Englisch)',
        urheber: IGMG_EV,
        url: `${IGMG}/wp-content/uploads/2026/07/english_igmg.pdf`,
        zustimmung: true,
      },
      {
        id: 'igmg-broschuere-tr',
        name: 'IGMG-Broschüre (Türkisch)',
        urheber: IGMG_EV,
        url: `${IGMG}/wp-content/uploads/2026/04/IGMG_broshure_tr_new.pdf`,
        zustimmung: true,
      },
      { id: 'igmg-satzung', name: 'Satzung der IGMG', urheber: IGMG_EV, url: NETZWERK.satzung.url.de, zustimmung: true },
      {
        id: 'igmg-wetzlar-2008',
        name: 'IGMG-Gemeinde Wetzlar feiert 30. Jubiläum (07.04.2008)',
        urheber: IGMG_EV,
        url: ENTITAET.gruendungBeleg,
        zustimmung: true,
      },
      {
        id: 'igmg-wetzlar-2011',
        name: 'Tag der offenen Moschee 2011 in Wetzlar (17.10.2011)',
        urheber: IGMG_EV,
        url: ARTIKEL_WETZLAR_2011,
        zustimmung: true,
      },
      { id: 'igmg-hutba-feed', name: 'Freitagspredigt der IGMG (RSS-Feed)', urheber: IGMG_EV, url: HUTBA_FEED, zustimmung: true },
      {
        id: 'hasene',
        name: 'Hasene International',
        urheber: 'HASENE International e. V., Köln',
        url: NETZWERK.hasene.url.de,
        zustimmung: true,
      },
      {
        id: 'igmg-reisen',
        name: 'IGMG Reisen (igmgreisen.com)',
        urheber: 'IGMG Hadsch-Umra Reisen GmbH, Köln',
        url: NETZWERK.reisen.url.de,
        zustimmung: true,
      },
    ],
  },
  {
    // OFL-Volltext unter den Einträgen (OFL 1.1 Nr. 2: Lizenz bei jeder Weitergabe; Stufe C, C-lizenzen-gegen Z-L17)
    id: 'schriften',
    zusatz: 'ofl',
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
      {
        // Lern-App: arabische Oberfläche (ADR 0044 Nr. 7)
        id: 'noto-sans-arabic',
        name: 'Noto Sans Arabic',
        urheber: 'The Noto Project Authors, 2022',
        url: 'https://github.com/notofonts/arabic',
        lizenz: OFL,
      },
    ],
  },
  {
    // Lern-App: gepinnte Sprachdaten (ADR 0045 Nr. 3–7) und Bildkarten (ADR 0045 Nr. 9); Belege web/daten/<ordner>/QUELLE.md
    id: 'lernapp-daten',
    eintraege: [
      {
        id: 'tatoeba',
        name: 'Tatoeba',
        urheber: 'Tatoeba contributors',
        url: 'https://tatoeba.org',
        lizenz: CC_BY_2_FR,
        aenderungen: true,
        namensnennung: namensnennung('tatoeba'),
      },
      {
        id: 'wiktionary',
        name: 'Wiktionary (kaikki.org, Wiktextract)',
        urheber: 'Wiktionary contributors; Tatu Ylonen (Wiktextract)',
        url: 'https://kaikki.org/dictionary/',
        lizenz: CC_BY_SA_4,
        herkunft: { name: 'Wiktionary', url: 'https://www.wiktionary.org' },
        aenderungen: true,
        namensnennung: namensnennung('wiktionary'),
      },
      {
        id: 'wordfreq',
        name: 'wordfreq',
        urheber: 'Robyn Speer',
        url: 'https://github.com/rspeer/wordfreq',
        lizenz: CC_BY_SA_4,
        aenderungen: true,
        namensnennung: namensnennung('wordfreq'),
      },
      {
        id: 'camel-msa',
        name: 'CAMeL Arabic Frequency Lists (MSA)',
        urheber: 'Salam Khalifa, Go Inoue, Bashar Alhafni, Nurpeiis Baimukan, Houda Bouamor, Nizar Habash',
        url: 'https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists',
        lizenz: CC_BY_SA_4,
        aenderungen: true,
        namensnennung: namensnennung('camel-msa'),
      },
      {
        id: 'frequencywords',
        name: 'FrequencyWords',
        urheber: 'Hermit Dave',
        url: 'https://github.com/hermitdave/FrequencyWords',
        lizenz: CC_BY_SA_4,
        aenderungen: true,
        namensnennung: namensnennung('frequencywords'),
      },
      {
        id: 'lucide-bildkarten',
        name: 'Lucide',
        urheber: 'Lucide Icons and Contributors; Cole Bemis (Feather)',
        url: 'https://lucide.dev',
        lizenz: ISC,
        hinweis: true,
      },
    ],
  },
  {
    // Lern-App: synthetische Stimmen (ADR 0039 Nr. 9, ADR 0045 Nr. 11); Angaben wie src/lib/lernapp/audio/stimmen.ts.
    // Zusatz „stimmen“: Sprachen ohne freigegebene Stimme (Hörabnahme LM-06 offen oder keine Stimme), wie /lern-app/*/quellen
    id: 'sprachausgabe',
    zusatz: 'stimmen',
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
  {
    // Lern-App: Spracherkennung der Sprechübung (ADR 0042 Nr. 3 und 10); Beleg web/daten/lernapp-modelle/QUELLE.md und
    // web/daten/lernapp-lizenzen/QUELLE.md (ThirdPartyNotices)
    id: 'lernapp-spracherkennung',
    eintraege: [
      {
        id: 'whisper',
        name: 'Whisper (base)',
        urheber: 'OpenAI, Copyright (c) 2022',
        url: 'https://github.com/openai/whisper',
        lizenz: MIT,
      },
      {
        id: 'whisper-onnx',
        name: 'Xenova/whisper-base (ONNX, q8)',
        urheber: 'Xenova',
        url: 'https://huggingface.co/Xenova/whisper-base',
        lizenz: APACHE,
      },
      {
        id: 'transformers-js',
        name: 'Transformers.js',
        urheber: 'Hugging Face',
        url: 'https://github.com/huggingface/transformers.js',
        lizenz: APACHE,
      },
      {
        id: 'onnxruntime-web',
        name: 'ONNX Runtime Web',
        urheber: 'Microsoft Corporation',
        url: 'https://github.com/microsoft/onnxruntime',
        lizenz: MIT,
        drittlizenzen: { name: 'ThirdPartyNotices.txt', url: ORT_DRITTLIZENZEN.pfad },
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
  { id: 'lucide', name: 'Lucide', url: 'https://lucide.dev', lizenz: ISC },
  { id: 'date-fns', name: 'date-fns', url: 'https://date-fns.org', lizenz: MIT },
  { id: 'zod', name: 'Zod', url: 'https://zod.dev', lizenz: MIT },
  // Lern-App im Browser (ADR 0038); Spracherkennung siehe Abschnitt `lernapp-spracherkennung`
  { id: 'idb', name: 'idb', url: 'https://github.com/jakearchibald/idb', lizenz: ISC },
  { id: 'ts-fsrs', name: 'ts-fsrs', url: 'https://github.com/open-spaced-repetition/ts-fsrs', lizenz: MIT },
  { id: 'fastest-levenshtein', name: 'fastest-levenshtein', url: 'https://github.com/ka-weihe/fastest-levenshtein', lizenz: MIT },
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
  // sharp bringt libvips als eigenes, unverändertes Binärpaket mit (@img/sharp-libvips-*), nur auf dem Server (M-060, ADR 0001)
  {
    id: 'libvips',
    name: 'libvips',
    url: 'https://www.libvips.org',
    lizenz: { name: 'LGPL-3.0-or-later', url: 'https://www.gnu.org/licenses/lgpl-3.0.html' },
  },
  {
    id: 'nodemailer',
    name: 'Nodemailer',
    url: 'https://nodemailer.com',
    lizenz: { name: 'MIT-0', url: 'https://opensource.org/license/mit-0' },
  },
];
