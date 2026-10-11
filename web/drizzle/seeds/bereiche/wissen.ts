import { wissenInhalt } from '../../../src/components/website/wissen/inhalt';
import { schema } from '../../../src/lib/db';
import type { BereichsSeed } from './typ';

/**
 * Seed „wissen“ (Welle A, Paket A11, ADR 0015): Themen aus design/IslamicKnowledge.dc.html (Z136) mit den
 * Sprachfassungen aus bestand/src/app/components/IslamicKnowledge.tsx (Z47–60, 74–87, 101–114) in der Tabelle
 * wissen_thema; Artikel, Videos und Experten als Seiteninhalt „wissen“ (istBeispiel). Personennamen, Autorennamen
 * und Institutionen sind Platzhalter (G-04, G-05). Nur der Sachtext „Allah“ ist ausgeschrieben; die übrigen Artikel
 * zeigen den Beispieltext der Oberfläche. Videoquellen fehlen: keine Adressen, keine Einbettung (K-14).
 */

const THEMEN_QUELLE = 'design/IslamicKnowledge.dc.html:136; bestand/IslamicKnowledge.tsx:47–60 (de), 74–87 (tr), 101–114 (en)';

const INHALT_QUELLE =
  'design/IslamicKnowledge.dc.html:139–155 (Artikel, Videos), 158–161 (Experten, nur Platzhalter); ' +
  'bestand/IslamicKnowledge.tsx:135–196 (Videos: Titel, Dauer, Beschreibung), 198–284 (Artikel: Titel, Thema, Lesezeit, Datum), ' +
  '208 (Sachtext Allah de), 210 (tr), 211 (en), 331–383 (Experten: nur Platzhalter, G-04); ' +
  'Autorennamen und Institutionen durch Platzhalter ersetzt (G-04)';

type ThemaQuelle = { slug: string; de: string; tr: string; en: string; sortierung: number };

/** Zwölf Themen in Designreihenfolge (D:26–28). Die Schlüssel übernehmen die Design-Schlüssel (D:136). */
const THEMEN: ThemaQuelle[] = [
  { slug: 'allah', de: 'Allah', tr: 'Allah', en: 'Allah', sortierung: 1 },
  { slug: 'fivestoesarz', de: 'Fünf Säulen', tr: 'Beş Şart', en: 'Five Pillars', sortierung: 2 },
  { slug: 'mosque', de: 'Moschee', tr: 'Cami', en: 'Mosque', sortierung: 3 },
  { slug: 'jihad', de: 'Dschihad', tr: 'Cihat', en: 'Jihad', sortierung: 4 },
  { slug: 'worship', de: 'Gottesdienst', tr: 'İbadet', en: 'Worship', sortierung: 5 },
  { slug: 'faith', de: 'Glaube (Iman)', tr: 'İman', en: 'Faith (Iman)', sortierung: 6 },
  { slug: 'islam', de: 'Islam', tr: 'İslam', en: 'Islam', sortierung: 7 },
  { slug: 'quran', de: 'Quran', tr: 'Kuran', en: 'Quran', sortierung: 8 },
  { slug: 'prophet', de: 'Prophet Muhammad', tr: 'Muhammed (s.a.v.)', en: 'Prophet Muhammad', sortierung: 9 },
  { slug: 'sunnah', de: 'Sunna', tr: 'Sünnet', en: 'Sunnah', sortierung: 10 },
  { slug: 'community', de: 'Gemeinschaft', tr: 'Toplum', en: 'Community', sortierung: 11 },
  { slug: 'ummah', de: 'Umma', tr: 'Ümmet', en: 'Ummah', sortierung: 12 },
];

const themenZeilen = THEMEN.map((t): typeof schema.wissenThema.$inferInsert => ({
  slug: t.slug,
  status: 'veroeffentlicht',
  istBeispiel: false,
  quelle: THEMEN_QUELLE,
  // Pflichtspalte ohne Vorgabe im Design (keine Gruppen erkennbar): einheitlicher Wert, MENSCHEN führt die Frage.
  kategorie: 'thema',
  titel: { de: t.de, tr: t.tr, en: t.en },
  klartext: { de: t.de, tr: t.tr, en: t.en },
  sortierung: t.sortierung,
}));

/** Sachtext „Allah“ wörtlich aus dem Bestand (IslamicKnowledge.tsx:208, 210, 211). Zur Prüfung durch die Gemeinde (MENSCHEN). */
const ALLAH_DE =
  "Allah ist das arabische Wort für Gott und wird von Muslimen verwendet, um den einen, allmächtigen Schöpfer zu bezeichnen. Im Islam ist Allah einzigartig, hat keine Partner und ist der Schöpfer und Erhalter des Universums. Muslime glauben, dass Allah barmherzig, gerecht und allwissend ist. Das Wort 'Allah' wird auch von arabischsprachigen Christen und Juden verwendet, um Gott zu bezeichnen.";
const ALLAH_TR =
  "Allah, Müslümanların tek, her şeye gücü yeten Yaratıcı'yı ifade etmek için kullandıkları Arapça Tanrı kelimesidir. İslam'da Allah eşsizdir, ortağı yoktur ve evrenin yaratıcısı ve sürdürücüsüdür. Müslümanlar Allah'ın merhametli, adil ve her şeyi bilen olduğuna inanırlar. 'Allah' kelimesi Arapça konuşan Hıristiyanlar ve Yahudiler tarafından da Tanrı'yı ifade etmek için kullanılır.";
const ALLAH_EN =
  "Allah is the Arabic word for God used by Muslims to refer to the one, almighty Creator. In Islam, Allah is unique, has no partners, and is the creator and sustainer of the universe. Muslims believe that Allah is merciful, just, and all-knowing. The word 'Allah' is also used by Arabic-speaking Christians and Jews to refer to God.";

/** Artikel 1–9 (D:139–147): Titel, Thema, Lesezeit und Datum aus Design und Bestand; Autorennamen als Platzhalter (G-04). */
const ARTIKEL = [
  {
    schluessel: 'artikel-1',
    thema: 'allah',
    titel: { de: 'Allah - Wer ist Gott im Islam?', tr: "Allah - İslam'da Tanrı Kimdir?", en: 'Allah - Who is God in Islam?' },
    autor: '[Name – Autor/in 1]',
    lesezeit: '5 min',
    datum: '2024-01-15',
    text: { de: ALLAH_DE, tr: ALLAH_TR, en: ALLAH_EN },
  },
  {
    schluessel: 'artikel-2',
    thema: 'fivestoesarz',
    titel: { de: 'Die fünf Säulen des Islam erklärt', tr: "İslam'ın Beş Şartı Açıklandı", en: 'The Five Pillars of Islam Explained' },
    autor: '[Name – Autor/in 2]',
    lesezeit: '8 min',
    datum: '2024-01-12',
  },
  {
    schluessel: 'artikel-3',
    thema: 'jihad',
    titel: {
      de: 'Dschihad - Was bedeutet das wirklich?',
      tr: 'Cihat - Gerçekte Ne Anlama Gelir?',
      en: 'Jihad - What Does It Really Mean?',
    },
    autor: '[Name – Autor/in 3]',
    lesezeit: '12 min',
    datum: '2024-01-10',
  },
  {
    schluessel: 'artikel-4',
    thema: 'prophet',
    titel: { de: 'Wer war Prophet Muhammad?', tr: 'Peygamber Muhammed Kimdi?', en: 'Who was Prophet Muhammad?' },
    autor: '[Name – Autor/in 4]',
    lesezeit: '10 min',
    datum: '2024-01-08',
  },
  {
    schluessel: 'artikel-5',
    thema: 'quran',
    titel: { de: 'Der Quran: Aufbau und Inhalt', tr: 'Kuran: Yapısı ve İçeriği', en: 'The Quran: Structure and Content' },
    autor: '[Name – Autor/in 5]',
    lesezeit: '9 min',
    datum: '2024-01-05',
  },
  {
    schluessel: 'artikel-6',
    thema: 'faith',
    titel: { de: 'Glaube (Iman) im Islam verstehen', tr: "İslam'da İman'ı Anlamak", en: 'Understanding Faith (Iman) in Islam' },
    autor: '[Name – Autor/in 6]',
    lesezeit: '7 min',
    datum: '2024-01-03',
  },
  {
    schluessel: 'artikel-7',
    thema: 'mosque',
    titel: { de: 'Die Moschee als Gemeindezentrum', tr: 'Toplum Merkezi Olarak Cami', en: 'The Mosque as Community Center' },
    autor: '[Name – Autor/in 7]',
    lesezeit: '6 min',
    datum: '2024-01-01',
  },
  {
    schluessel: 'artikel-8',
    thema: 'worship',
    titel: {
      de: 'Gottesdienst im Islam: Die 5 täglichen Gebete',
      tr: "İslam'da İbadet: 5 Vakit Namaz",
      en: 'Worship in Islam: The 5 Daily Prayers',
    },
    autor: '[Name – Autor/in 8]',
    lesezeit: '8 min',
    datum: '2023-12-28',
  },
  {
    schluessel: 'artikel-9',
    thema: 'sunnah',
    titel: {
      de: 'Sunna - Die Traditionen des Propheten',
      tr: 'Sünnet - Peygamber Gelenekleri',
      en: 'Sunnah - The Traditions of the Prophet',
    },
    autor: '[Name – Autor/in 9]',
    lesezeit: '11 min',
    datum: '2023-12-25',
  },
];

/** Sechs Videos (D:150–155): Titel, Dauer und Beschreibung wörtlich aus Design und Bestand. Keine Videoquelle (K-14). */
const VIDEOS = [
  {
    schluessel: 'video-1',
    thema: 'islam',
    titel: { de: 'Islam in 5 Minuten erklärt', tr: '5 Dakikada İslam', en: 'Islam Explained in 5 Minutes' },
    dauer: '5 min',
    beschreibung: {
      de: 'Eine kurze und verständliche Einführung in die Grundlagen des Islam.',
      tr: "İslam'ın temellerine kısa ve anlaşılır bir giriş.",
      en: 'A brief and understandable introduction to the basics of Islam.',
    },
  },
  {
    schluessel: 'video-2',
    thema: 'worship',
    titel: { de: 'Das Gebet im Islam - einfach erklärt', tr: "İslam'da Namaz - Basit Açıklama", en: 'Prayer in Islam - Simply Explained' },
    dauer: '8 min',
    beschreibung: {
      de: 'Warum und wie Muslime beten - verständlich erklärt.',
      tr: 'Müslümanlar neden ve nasıl namaz kılar - anlaşılır şekilde açıklanmıştır.',
      en: 'Why and how Muslims pray - clearly explained.',
    },
  },
  {
    schluessel: 'video-3',
    thema: 'faith',
    titel: { de: 'Was Muslime über Jesus denken', tr: 'Müslümanlar İsa Hakkında Ne Düşünür', en: 'What Muslims Think About Jesus' },
    dauer: '12 min',
    beschreibung: {
      de: 'Die Rolle von Jesus im islamischen Glauben.',
      tr: "İslam inancında İsa'nın rolü.",
      en: 'The role of Jesus in Islamic belief.',
    },
  },
  {
    schluessel: 'video-4',
    thema: 'community',
    titel: { de: 'Muslimische Feste und Traditionen', tr: 'Müslüman Bayramları ve Gelenekleri', en: 'Muslim Holidays and Traditions' },
    dauer: '10 min',
    beschreibung: {
      de: 'Die wichtigsten Feste und Traditionen im Islam.',
      tr: "İslam'daki en önemli bayramlar ve gelenekler.",
      en: 'The most important holidays and traditions in Islam.',
    },
  },
  {
    schluessel: 'video-5',
    thema: 'community',
    titel: {
      de: 'Frauen im Islam - Mythen vs. Realität',
      tr: "İslam'da Kadınlar - Mitler vs Gerçeklik",
      en: 'Women in Islam - Myths vs Reality',
    },
    dauer: '15 min',
    beschreibung: {
      de: 'Aufklärung über die Stellung der Frau im Islam.',
      tr: "İslam'da kadının konumu hakkında açıklama.",
      en: 'Clarification about the position of women in Islam.',
    },
  },
  {
    schluessel: 'video-6',
    thema: 'worship',
    titel: { de: 'Der Ramadan erklärt', tr: 'Ramazan Açıklandı', en: 'Ramadan Explained' },
    dauer: '7 min',
    beschreibung: {
      de: 'Was ist Ramadan und warum fasten Muslime?',
      tr: 'Ramazan nedir ve Müslümanlar neden oruç tutar?',
      en: 'What is Ramadan and why do Muslims fast?',
    },
  },
];

/** Vier Experten (D:158–161): nur Platzhalter, keine Namen und Institutionen (G-04, L:285). */
const EXPERTEN = [1, 2, 3, 4].map((n) => ({
  schluessel: `experte-${n}`,
  name: `[Name – Gelehrte/r ${n}]`,
  fachgebiet: { de: '[Fachgebiet]' },
  institution: '[Institution]',
  bio: { de: '[Bio]' },
  anzahlArtikel: '[Anzahl]',
}));

const INHALT = wissenInhalt.parse({ artikel: ARTIKEL, videos: VIDEOS, experten: EXPERTEN });

/** Seed „wissen“ (idempotent, onConflictDoNothing). Rückgabe: Anzahl neuer Zeilen (Themen und Seiteninhalt). */
export const seed: BereichsSeed = async (db) => {
  const themen = await db
    .insert(schema.wissenThema)
    .values(themenZeilen)
    .onConflictDoNothing({ target: schema.wissenThema.slug })
    .returning({ id: schema.wissenThema.id });
  const inhalte = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'wissen', inhalt: INHALT, istBeispiel: true, quelle: INHALT_QUELLE })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return themen.length + inhalte.length;
};
