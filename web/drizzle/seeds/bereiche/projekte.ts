import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as inhaltSchema } from '../../../src/lib/validierung/seiteninhalte/projekte';
import type { BereichsSeed } from './typ';

/** Platzhalter je Sprache (G-05): Fakten, die nur die Gemeinde liefern kann (MENSCHEN MN-08, MN-13). */
const ORT = { de: '[Ortsangabe – von der Gemeinde]', tr: '[Konum – cemaat tarafından]', en: '[Location – from the community]' };
/** Kurz, weil die Meilensteinlinie die Daten nebeneinander beschriftet (lange Platzhalter überlappen bei 1440 px). */
const DATUM = { de: '[Datum]', tr: '[Tarih]', en: '[Date]' };

/**
 * Beispielinhalt „projekte“ (Blatt S10, DATEN), Stand 2026: Die neue Fatih-Moschee ist fertiggestellt (AUFTRAG 3.9,
 * Bericht E0-K05). Name nach E0-K05 (Frage 11), Status „fertiggestellt“, alle Meilensteine erledigt. Belegt aus dem
 * Bestand (Projects.tsx) sind nur die Meilensteine „Genehmigungen“ (März 2024) und „Architektenpläne“ (April 2024);
 * alle übrigen Daten, Ort, Kapazität, Fläche, Einrichtungen und der Spendenzweck sind Platzhalter, bis die Gemeinde sie
 * bestätigt (MN-08, MN-13). Keine Aussagen über Behörden. Fertigstellung 2026 laut AUFTRAG 3.9.
 * Die Inhaltsmigration `scripts/inhalte-2026.ts` setzt denselben Stand in bestehenden Beispieldaten.
 */
export const PROJEKTE_BEISPIEL: z.input<typeof inhaltSchema> = {
  projekt: {
    name: { de: 'Neue Fatih-Moschee', tr: 'Yeni Fatih Camii', en: 'New Fatih Mosque' },
    status: 'fertiggestellt',
    ort: ORT,
    beginn: null,
    fertigstellung: 2026,
    beschreibung: {
      de: 'Die neue Fatih-Moschee in [Ortsangabe – von der Gemeinde] ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]. [Kurzbeschreibung der Moschee – von der Gemeinde]',
      tr: '[Konum – cemaat tarafından] adresindeki yeni Fatih Camii tamamlandı. Açılış: [Tarih – cemaat tarafından]. [Caminin kısa tanıtımı – cemaat tarafından]',
      en: 'The new Fatih Mosque in [Location – from the community] is complete. Opening: [Date – from the community]. [Short description of the mosque – from the community]',
    },
    kapazitaet: { wert: null, einheit: { de: 'Gläubige', tr: 'Cemaat', en: 'Worshippers' } },
    flaecheM2: null,
    einrichtungen: [],
    modell: null,
  },
  spende: {
    titel: { de: 'Spenden für unsere Gemeinde', tr: 'Cemaatimiz için bağış', en: 'Donations for our community' },
    text: {
      de: '[Spendentext und Spendenzweck – von der Gemeinde]',
      tr: '[Bağış metni ve bağış amacı – cemaat tarafından]',
      en: '[Donation text and purpose – from the community]',
    },
    gesammelt: null,
    ziel: null,
    bankverbindung: { de: '[Bankverbindung – von der Gemeinde]' },
  },
  unterstuetzung: {
    titel: { de: 'Unterstützen Sie uns', tr: 'Destek Olun', en: 'Support Us' },
    text: {
      de: 'Unterstützen Sie unsere Gemeinde. [Spendenzweck – von der Gemeinde]',
      tr: 'Cemaatimize destek olun. [Bağış amacı – cemaat tarafından]',
      en: 'Support our community. [Purpose of donations – from the community]',
    },
    dank: {
      de: 'Wir danken allen, die die neue Fatih-Moschee in [Ortsangabe – von der Gemeinde] möglich gemacht haben.',
      tr: "[Konum – cemaat tarafından] adresindeki yeni Fatih Camii'nin hayata geçmesine katkıda bulunan herkese teşekkür ederiz.",
      en: 'We thank everyone who made the new Fatih Mosque in [Location – from the community] possible.',
    },
  },
  meilensteine: [
    {
      titel: { de: 'Genehmigungen erhalten', tr: 'İzinler Alındı', en: 'Permits Obtained' },
      beschreibung: {
        de: 'Alle erforderlichen Baugenehmigungen wurden erteilt',
        tr: 'Tüm gerekli yapı izinleri verildi',
        en: 'All required building permits have been granted',
      },
      datum: { de: 'März 2024', tr: 'Mart 2024', en: 'March 2024' },
      erledigt: true,
    },
    {
      titel: { de: 'Architektenpläne finalisiert', tr: 'Mimar Planları Tamamlandı', en: 'Architect Plans Finalized' },
      beschreibung: {
        de: 'Detaillierte Baupläne und Designs abgeschlossen',
        tr: 'Detaylı yapı planları ve tasarımlar tamamlandı',
        en: 'Detailed construction plans and designs completed',
      },
      datum: { de: 'April 2024', tr: 'Nisan 2024', en: 'April 2024' },
      erledigt: true,
    },
    {
      titel: { de: 'Grundsteinlegung', tr: 'Temel Atma', en: 'Groundbreaking' },
      beschreibung: { de: 'Offizielle Grundsteinlegungszeremonie', tr: 'Resmi temel atma töreni', en: 'Official groundbreaking ceremony' },
      datum: DATUM,
      erledigt: true,
    },
    {
      titel: { de: 'Rohbau', tr: 'Kaba İnşaat', en: 'Shell Construction' },
      beschreibung: {
        de: 'Fertigstellung der Rohbauarbeiten',
        tr: 'Kaba inşaat işlerinin tamamlanması',
        en: 'Completion of shell construction work',
      },
      datum: DATUM,
      erledigt: true,
    },
    {
      titel: { de: 'Innenausstattung', tr: 'İç Dekorasyon', en: 'Interior Design' },
      beschreibung: {
        de: 'Innenausstattung und finale Arbeiten',
        tr: 'İç dekorasyon ve son işlemler',
        en: 'Interior design and finishing work',
      },
      datum: DATUM,
      erledigt: true,
    },
    {
      titel: { de: 'Eröffnung', tr: 'Açılış', en: 'Opening' },
      beschreibung: {
        de: 'Offizielle Eröffnung der neuen Fatih-Moschee',
        tr: "Yeni Fatih Camii'nin resmi açılışı",
        en: 'Official opening of the new Fatih Mosque',
      },
      datum: DATUM,
      erledigt: true,
    },
  ],
};

/** Quellenvermerk des Beispielinhalts (ADR 0015). */
export const PROJEKTE_QUELLE =
  'design/Projects.dc.html und bestand/src/app/components/Projects.tsx (Meilensteine Genehmigungen März 2024, Architektenpläne April 2024, Titel und Beschreibungen der Meilensteine); Stand 2026 nach AUFTRAG 3.9 und _gemeinde/berichte/E0-K05-moschee-fundstellen.md (Name, Status fertiggestellt, alle Meilensteine erledigt); Ort, Daten, Kapazität, Fläche, Einrichtungen, Spendenzweck und Bankverbindung als Platzhalter (G-05, MN-08, MN-13)';

/** Seed „projekte“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalt mit Quelle, Prüfung gegen das Schema. */
export const seed: BereichsSeed = async (db) => {
  const geprueft = inhaltSchema.parse(PROJEKTE_BEISPIEL);
  const r = await db
    .insert(schema.seiteninhalt)
    .values({ bereich: 'projekte', istBeispiel: true, quelle: PROJEKTE_QUELLE, inhalt: geprueft })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
