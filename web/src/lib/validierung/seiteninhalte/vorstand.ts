import { z } from 'zod';
import { mehrsprachig } from '../mehrsprachig';

/**
 * Seiteninhalt „vorstand“ (Welle A, Paket A04). Quellen: design/BoardMembers.dc.html (Blatt S09) und Bestand
 * BoardMembers.tsx. Personennamen sind Platzhalter „[Name – Funktion]“ (G-04); Jahre und E-Mail-Adressen stammen aus
 * dem Bestand und sind von der Gemeinde zu bestätigen; Telefonnummern bleiben Platzhalter (G-05).
 * Alle Felder der obersten Ebene haben Standardwerte, damit der Rückfall in `ladeSeiteninhalt` gültig bleibt.
 */

/** Mitglied des aktuellen Vorstands (BoardMembers.dc.html:55–60). Telefon nur mit E-Mail sichtbar (Blatt C10). */
const vorstandsmitglied = z.object({
  name: z.string().trim().min(1).max(120),
  funktion: mehrsprachig(120),
  seit: z.string().trim().max(10).default(''),
  aufgaben: z.array(mehrsprachig(200)).default([]),
  email: z.union([z.email(), z.literal('')]).default(''),
  telefon: z.string().trim().max(60).default('[Telefonnummer]'),
});

/** Eine Amtszeit in der Chronik (BoardMembers.dc.html:63–74). `bis` leer und `aktuell` wahr heißt „Heute“. */
const amtszeit = z.object({
  name: z.string().trim().min(1).max(120),
  von: z.string().trim().min(1).max(10),
  bis: z.string().trim().max(10).default(''),
  aktuell: z.boolean().default(false),
  erfolge: z.array(mehrsprachig(200)).default([]),
});

export const schema = z.object({
  /** Jahr für die Kennung „Führung seit …“ (BoardMembers.dc.html:30). Der Bestand nennt 1976 als Gründungsjahr (offen). */
  fuehrungSeit: z.string().trim().min(1).max(10).default('[Jahr]'),
  vorstand: z.array(vorstandsmitglied).default([]),
  vorsitzende: z.array(amtszeit).default([]),
});

export type VorstandInhalt = z.infer<typeof schema>;
