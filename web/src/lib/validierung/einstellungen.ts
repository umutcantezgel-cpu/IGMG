import { z } from 'zod';
import { STANDARD_EINSTELLUNGEN, STANDARD_NAEHERUNG } from '@/lib/gebetszeiten/typen';

const GEBET = z.enum(['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi']);
const HOHE_BREITE = z.enum(['middleofthenight', 'seventhofthenight', 'twilightangle']);
const temkin = (standard: number) => z.number().int().min(-1800).max(1800).default(standard);

/**
 * IGMG-Abgleich (ADR 0048): Stadt im IGMG-Gebetskalender (Wetzlar = 20238), Zeitraum und Freigabe. Die Adresse des
 * offiziellen Zugangs steht absichtlich nicht hier, sondern in GEBETSZEITEN_IGMG_URL (keine frei wählbaren Abrufe über die
 * Verwaltung, SSRF); der Schlüssel ist ein Geheimnis (K-13).
 */
export const gebetszeitenAbgleich = z.object({
  aktiv: z.boolean().default(false),
  stadtId: z
    .string()
    .regex(/^\d{1,9}$/)
    .default('20238'),
  stadtName: z.string().trim().min(1).max(80).default('Wetzlar'),
  tageVoraus: z.number().int().min(14).max(400).default(60),
  /** automatisch: plausible Lieferungen werden geschrieben; pruefen: jede Änderung wartet auf Freigabe */
  freigabe: z.enum(['automatisch', 'pruefen']).default('automatisch'),
});

/** Näherung „IGMG (angenähert)“ (ADR 0048): Winkel, Temkin in Sekunden je Gebet, Herkunft der Kalibrierung. */
export const gebetszeitenNaeherung = z.object({
  fajrWinkel: z.number().min(12).max(21).default(STANDARD_NAEHERUNG.fajrWinkel),
  ishaWinkel: z.number().min(12).max(21).default(STANDARD_NAEHERUNG.ishaWinkel),
  temkinSek: z
    .object({
      imsak: temkin(STANDARD_NAEHERUNG.temkinSek.imsak),
      gunes: temkin(STANDARD_NAEHERUNG.temkinSek.gunes),
      ogle: temkin(STANDARD_NAEHERUNG.temkinSek.ogle),
      ikindi: temkin(STANDARD_NAEHERUNG.temkinSek.ikindi),
      aksam: temkin(STANDARD_NAEHERUNG.temkinSek.aksam),
      yatsi: temkin(STANDARD_NAEHERUNG.temkinSek.yatsi),
    })
    .prefault({}),
  hoheBreite: HOHE_BREITE.default(STANDARD_NAEHERUNG.hoheBreite),
  /** Woran kalibriert wurde (Verwaltung „Vorschlag übernehmen“); Standard: IGMG Aachen, Oktober 2026 */
  kalibriert: z
    .object({
      am: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      basis: z.string().trim().max(120),
      tage: z.number().int().min(0),
      maxFehlerMin: z.number().min(0),
    })
    .default({ am: '2026-10-28', basis: 'IGMG-Gebetskalender Aachen, Oktober 2026', tage: 31, maxFehlerMin: 1 }),
});
export type GebetszeitenNaeherung = z.infer<typeof gebetszeitenNaeherung>;

/**
 * Einstellungen als typisierte Schlüssel (Tabelle `einstellung`). Ein Schema für Lesen und Schreiben.
 * Gebetszeiten (ADR 0008, ADR 0048): `aktiveQuelle` „igmg“ oder „import“ → die Lader lesen die Tabelle (Vorrang je Tag,
 * `lib/gebetszeiten/vorrang.ts`), „berechnung“ → nur Rechnung. Tage ohne Tabelle rechnet `rueckfall`: die Näherung (Standard)
 * oder die Methode. Ältere gespeicherte Werte ohne die neuen Felder parsen mit den Standardwerten.
 */
export const gebetszeitenEinstellung = z.object({
  aktiveQuelle: z.enum(['igmg', 'import', 'berechnung']).default('igmg'),
  /** Quelle von der Gemeinde bestätigt → Hinweis „berechnet“ entfällt (G-06). */
  bestaetigt: z.boolean().default(false),
  methode: z
    .enum([
      'Turkey',
      'MuslimWorldLeague',
      'Egyptian',
      'Karachi',
      'UmmAlQura',
      'Dubai',
      'MoonsightingCommittee',
      'NorthAmerica',
      'Kuwait',
      'Qatar',
      'Singapore',
      'Tehran',
    ])
    .default('Turkey'),
  madhab: z.enum(['shafi', 'hanafi']).default('shafi'),
  hoheBreite: HOHE_BREITE.default('seventhofthenight'),
  anpassungen: z.partialRecord(GEBET, z.number().int().min(-30).max(30)).default({}),
  breite: z.number().min(-90).max(90).default(STANDARD_EINSTELLUNGEN.breite),
  laenge: z.number().min(-180).max(180).default(STANDARD_EINSTELLUNGEN.laenge),
  rueckfall: z.enum(['naeherung', 'methode']).default('naeherung'),
  naeherung: gebetszeitenNaeherung.prefault({}),
  abgleich: gebetszeitenAbgleich.prefault({}),
});
export type GebetszeitenEinstellung = z.infer<typeof gebetszeitenEinstellung>;

export const allgemeineEinstellung = z.object({
  /** Konzept-Hinweis (DisclaimerDialog) anzeigen, solange Inhalte Beispielinhalte sind. */
  konzepthinweis: z.boolean().default(true),
});
export type AllgemeineEinstellung = z.infer<typeof allgemeineEinstellung>;

/** Funktionsschalter (ADR 0035): nur gesetzte Werte; Standard je Betriebsart in src/lib/funktionen.ts. */
export const funktionenEinstellung = z.object({
  konten: z.boolean().optional(),
  lernplattform: z.boolean().optional(),
  chat: z.boolean().optional(),
  echtzeit: z.boolean().optional(),
  push: z.boolean().optional(),
  push_gebet: z.boolean().optional(),
  hatim: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  hadith_gesamt: z.boolean().optional(),
  ramadan_vorschau: z.boolean().optional(),
  // Lauf Lern-App (KERN 4.0 §6)
  lernapp: z.boolean().optional(),
  lernapp_ungeprueft: z.boolean().optional(),
  lernapp_wissen_vorschau: z.boolean().optional(),
  lernapp_sprechen: z.boolean().optional(),
  lernapp_meldungen: z.boolean().optional(),
  lernapp_sync: z.boolean().optional(),
  lernapp_gruppen: z.boolean().optional(),
  lernapp_rangliste: z.boolean().optional(),
  lernapp_statistik: z.boolean().optional(),
  push_lernapp: z.boolean().optional(),
});
export type FunktionenEinstellung = z.infer<typeof funktionenEinstellung>;

/** Text in drei Sprachen (Deutsch Pflicht) für Einstellungen, die öffentlich erscheinen. */
const einstellungText = (max: number) =>
  z.object({ de: z.string().trim().min(1).max(max), tr: z.string().trim().max(max).optional(), en: z.string().trim().max(max).optional() });

/**
 * Spenden (AUFTRAG 3.10, MN-13): Bankverbindung und Spendenzwecke für /spenden und den GiroCode. Leer bis der
 * Kassenwart die Daten bestätigt; ohne gültige IBAN zeigt die Seite einen Platzhalter und keinen QR-Code.
 * Der Verwendungszweck steht so im GiroCode (höchstens 140 Zeichen, EPC069-12).
 */
export const spendenZweck = z.object({
  titel: einstellungText(80),
  beschreibung: z
    .object({ de: z.string().trim().max(300), tr: z.string().trim().max(300).optional(), en: z.string().trim().max(300).optional() })
    .optional(),
  verwendungszweck: z.string().trim().min(1).max(140),
});
export type SpendenZweck = z.infer<typeof spendenZweck>;

export const spendenEinstellung = z.object({
  empfaenger: z.string().trim().max(70).default(''),
  iban: z.string().trim().max(42).default(''),
  bic: z.string().trim().max(11).default(''),
  zwecke: z.array(spendenZweck).max(6).default([]),
});
export type SpendenEinstellung = z.infer<typeof spendenEinstellung>;

export const EINSTELLUNG = {
  gebetszeiten: { schluessel: 'gebetszeiten', schema: gebetszeitenEinstellung },
  allgemein: { schluessel: 'allgemein', schema: allgemeineEinstellung },
  funktionen: { schluessel: 'funktionen', schema: funktionenEinstellung },
  spenden: { schluessel: 'spenden', schema: spendenEinstellung },
} as const;
