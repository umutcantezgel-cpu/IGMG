import { z } from 'zod';
import { OBERFLAECHEN, RICHTUNGEN, type RichtungId } from '../kurse';
import type { Einstufung } from './regeln';

/**
 * Format von `/api/lernapp/schreiben` (L5-03; ADR 0042 Nr. 11; PLAN §3.8, §4.3; KERN 4.0 §5): Schreibabgabe an die
 * Lehrkraft der eigenen Gruppe und die eigenen Abgaben mit Rückmeldung. Nur mit Konto, Einwilligung `lernapp` (bei Kindern
 * die der Eltern) und Schalter `lernapp_gruppen`; nur für eine Schreibaufgabe, die einer eigenen Gruppe zugewiesen ist.
 * Der Server prüft alles selbst und speichert den Text verschlüsselt (`web/src/lib/krypto`), nie in Logs, Push, Mail oder
 * Audit. Zod nur auf dem Server; die Oberfläche nutzt nur die Typen (JS-Budget, wie `gruppe/protokoll.ts`).
 *
 * - `GET ?ui=<ui>&kurs=<richtung>&aufgabe=<schlüssel>` → `PruefAntwort`: Ist eine Abgabe möglich, an welche Gruppe(n)?
 * - `GET ?ui=<ui>` → `ListeAntwort`: eigene Abgaben mit Text und Rückmeldung (nicht abgelaufen).
 * - `POST` (JSON `AbgabeAnfrage`, ≤ 64 KB) → 201 `{ status: 'eingereicht' }` bzw. 200 `{ status: 'vorhanden' }` bei
 *   Wiederholung derselben Kennung (idempotent).
 * - `DELETE ?id=<uuid>` → eigene Abgabe löschen; geht auch bei ausgeschalteten Schaltern (Löschen jederzeit).
 */
export const SCHREIBEN_ADRESSE = '/api/lernapp/schreiben';

/** Höchstlänge eines abgegebenen Texts (Zeichen). */
export const ABGABE_MAX_ZEICHEN = 8_000;
/** Höchstgröße des Anfragekörpers (Bytes; Text bis 8.000 Zeichen in UTF-8 mit JSON-Maskierung). */
export const ABGABE_MAX_BYTES = 64 * 1024;

export const SCHREIBEN_FEHLER = [
  'ursprung',
  'anmeldung',
  'anfrage',
  'groesse',
  'einwilligung',
  'eltern',
  'aufgabe',
  'zuweisung',
  'grenze',
  'konflikt',
  'bremse',
] as const;
export type SchreibenFehler = (typeof SCHREIBEN_FEHLER)[number];

const Stufe = z.number().int().min(0).max(3).optional();
const Uuid = z.uuid();

export const SchreibenUiSchema = z.enum(OBERFLAECHEN);

export const AbgabeAnfrageSchema = z.strictObject({
  /** Kennung der Abgabe, auf dem Gerät erzeugt (Wiederholung ohne Doppel) */
  id: Uuid,
  kurs: z.enum(RICHTUNGEN),
  aufgabe: z.string().min(1).max(120),
  gruppe: Uuid,
  text: z.string().trim().min(1).max(ABGABE_MAX_ZEICHEN),
  /** Selbsteinschätzung nach der Prüfliste (0–3 je Kriterium) */
  pruefliste: z.strictObject({ aufgabe: Stufe, zusammenhang: Stufe, wortschatz: Stufe, grammatik: Stufe }),
});
export type AbgabeAnfrage = z.infer<typeof AbgabeAnfrageSchema>;

export const PruefAnfrageSchema = z.strictObject({
  ui: SchreibenUiSchema,
  kurs: z.enum(RICHTUNGEN),
  aufgabe: z.string().min(1).max(120),
});

/** Gründe, aus denen keine Abgabe möglich ist (die Oberfläche zeigt einen Hinweis; der Text bleibt auf dem Gerät). */
export type KeineAbgabe = 'einwilligung' | 'eltern' | 'aufgabe' | 'zuweisung';

export type PruefAntwort = { moeglich: true; gruppen: { id: string; name: string }[] } | { moeglich: false; grund: KeineAbgabe };

/** Inhalt in der Zielsprache (Aufgabe der Übung), ohne Audio. */
export type AufgabenText = { text: string; sprache: 'de' | 'tr' | 'ar' };

export type Stufen = Partial<Record<'aufgabe' | 'zusammenhang' | 'wortschatz' | 'grammatik', number>>;

export type EigeneAbgabe = {
  id: string;
  kurs: RichtungId;
  /** Aufgabe aus dem Kurspaket; null, wenn sie nicht mehr ausgeliefert wird */
  aufgabe: AufgabenText | null;
  gruppe: string | null;
  eingereichtAm: string;
  loeschenAb: string;
  text: string;
  selbst: Stufen;
  rueckmeldung: { am: string; kommentar: string | null; pruefliste: Stufen; einstufung: Einstufung | null } | null;
};

export type ListeAntwort = { abgaben: EigeneAbgabe[] };

export type AbgabeAntwort = { status: 'eingereicht' | 'vorhanden' };
