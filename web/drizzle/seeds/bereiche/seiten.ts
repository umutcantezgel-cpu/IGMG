import { schema } from '../../../src/lib/db';
import { bloeckeSchema } from '../../../src/lib/validierung/bloecke';
import type { BereichsSeed } from './typ';

/**
 * Seed „seiten“ (CMS, ADR 0032, ADR 0015): eine Beispielseite „Unsere Moschee“ / „Camimiz“ / „Our Mosque“ aus
 * Bausteinen, damit die Vorführung eine freie Seite zeigt. Nur Platzhalter in eckigen Klammern – keine erfundenen
 * Fakten über die Gemeinde (G-05). Kennzeichnung `istBeispiel`; idempotent über den deutschen Slug.
 */
const QUELLE = 'Beispielseite des CMS-Pakets (O-M01); Texte sind Platzhalter bis zur Pflege durch die Gemeinde (MN-08)';

const absatz = (text: string) => ({
  type: 'doc' as const,
  content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text }] }],
});

const BLOECKE = bloeckeSchema.parse([
  {
    typ: 'text',
    id: 'einleitung01',
    inhalt: {
      de: absatz('[Einleitung: Wer wir sind und wofür unsere Moschee steht – Text von der Gemeinde]'),
      tr: absatz('[Giriş: Biz kimiz ve camimiz neyi temsil ediyor – metin cemaatten]'),
      en: absatz('[Introduction: who we are and what our mosque stands for – text from the community]'),
    },
  },
  {
    typ: 'spalten',
    id: 'saeulen0001',
    titel: { de: 'Was Sie bei uns finden', tr: 'Bizde neler bulursunuz', en: 'What you will find here' },
    spalten: [
      {
        titel: { de: 'Gebet', tr: 'Namaz', en: 'Prayer' },
        text: {
          de: '[Kurzer Text zu Gebetsraum und Gebetszeiten]',
          tr: '[Namaz salonu ve namaz vakitleri hakkında kısa metin]',
          en: '[Short text about the prayer hall and prayer times]',
        },
      },
      {
        titel: { de: 'Bildung', tr: 'Eğitim', en: 'Education' },
        text: {
          de: '[Kurzer Text zu Korankursen und Unterricht]',
          tr: '[Kur’an kursları ve dersler hakkında kısa metin]',
          en: '[Short text about Quran courses and lessons]',
        },
      },
      {
        titel: { de: 'Gemeinschaft', tr: 'Cemaat', en: 'Community' },
        text: {
          de: '[Kurzer Text zu Begegnung, Festen und Ehrenamt]',
          tr: '[Buluşmalar, bayramlar ve gönüllülük hakkında kısa metin]',
          en: '[Short text about gatherings, celebrations and volunteering]',
        },
      },
    ],
  },
  { typ: 'trenner', id: 'trenner0001' },
  { typ: 'gebetszeiten', id: 'gebetszeit1', titel: { de: '' } },
  {
    typ: 'faq',
    id: 'fragen00001',
    titel: { de: 'Häufige Fragen', tr: 'Sıkça sorulan sorular', en: 'Frequently asked questions' },
    eintraege: [
      {
        frage: { de: 'Darf ich die Moschee besuchen?', tr: 'Camiyi ziyaret edebilir miyim?', en: 'May I visit the mosque?' },
        antwort: {
          de: '[Antwort der Gemeinde: Besuchszeiten, Führungen, Hinweise]',
          tr: '[Cemaatin cevabı: ziyaret saatleri, rehberli turlar, bilgiler]',
          en: '[Answer from the community: visiting hours, guided tours, notes]',
        },
      },
      {
        frage: { de: 'Wie erreiche ich die Moschee?', tr: 'Camiye nasıl ulaşırım?', en: 'How do I get to the mosque?' },
        antwort: {
          de: '[Antwort der Gemeinde: Anfahrt, Parkplätze, Bus]',
          tr: '[Cemaatin cevabı: ulaşım, otopark, otobüs]',
          en: '[Answer from the community: directions, parking, bus]',
        },
      },
    ],
  },
  { typ: 'termine', id: 'termine0001', titel: { de: '' }, anzahl: 3, organisation: '' },
  { typ: 'kontakt', id: 'kontakt0001', titel: { de: '' } },
  {
    typ: 'aufruf',
    id: 'aufruf00001',
    titel: { de: 'Besuchen Sie uns', tr: 'Bizi ziyaret edin', en: 'Visit us' },
    text: {
      de: '[Einladender Satz der Gemeinde]',
      tr: '[Cemaatten davet eden bir cümle]',
      en: '[An inviting sentence from the community]',
    },
    knopf: { de: 'Kontakt aufnehmen', tr: 'İletişime geçin', en: 'Get in touch' },
    ziel: '/kontakt',
  },
]);

export const seed: BereichsSeed = async (db) => {
  const r = await db
    .insert(schema.seite)
    .values({
      slugDe: 'unsere-moschee',
      slugTr: 'camimiz',
      slugEn: 'our-mosque',
      titel: { de: 'Unsere Moschee', tr: 'Camimiz', en: 'Our Mosque' },
      beschreibung: {
        de: '[Ein Satz zur Moschee – Text von der Gemeinde]',
        tr: '[Cami hakkında bir cümle – metin cemaatten]',
        en: '[One sentence about the mosque – text from the community]',
      },
      bloecke: BLOECKE,
      status: 'veroeffentlicht',
      istBeispiel: true,
      quelle: QUELLE,
    })
    .onConflictDoNothing({ target: schema.seite.slugDe })
    .returning({ id: schema.seite.id });
  return r.length;
};
