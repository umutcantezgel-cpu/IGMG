'use server';

import type { z } from 'zod';
import {
  BEREICH_ORGANISATION,
  istOrganisation,
  type Fehlerschluessel,
} from '@/components/verwaltung/seiteninhalte-organisationen/bereiche';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { SEITENINHALT, type SeitenBereich } from '@/lib/validierung/seiteninhalte';

/**
 * Verwaltung „Seiteninhalte II“ (C05): Kontaktdaten und die vier Organisationsseiten. Reihenfolge je Action:
 * Recht (Sitzung, zweiter Faktor, Rolle, bei Organisationen mit Ziel) → Eingabe gegen das Schema des Bereichs →
 * Speichern und Audit in einer Transaktion → Caches. Fehler sind Schlüssel; Antworten nennen keine Interna (S4).
 */
export type SpeicherZustand = {
  fehler?: 'pruefen' | 'keinRecht' | 'unlesbar';
  feldFehler?: Record<string, Fehlerschluessel>;
  gespeichert?: number;
};

/** Kontaktdaten (Bereich „kontakt“): Recht seiteninhalt.bearbeiten (Redaktion und Administration). */
export async function speichereKontakt(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('seiteninhalt.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  return speichere(a, 'kontakt', fd);
}

/**
 * Organisation (at, kt, gt, kgt). Die Seite bindet die Organisation fest ein (`bind`), damit das Recht vor jeder
 * Eingabe am Ziel geprüft wird; die Organisationsredaktion erreicht so nur die eigene Organisation.
 */
export async function speichereOrganisation(
  organisation: OrganisationKuerzel,
  _vorher: SpeicherZustand,
  fd: FormData,
): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('organisationsinhalt.bearbeiten', { organisation });
  } catch {
    return { fehler: 'keinRecht' };
  }
  if (!istOrganisation(organisation)) return { fehler: 'keinRecht' };
  return speichere(a, BEREICH_ORGANISATION[organisation], fd);
}

async function speichere(a: Angemeldet, bereich: SeitenBereich, fd: FormData): Promise<SpeicherZustand> {
  let roh: unknown;
  try {
    roh = JSON.parse(String(fd.get('inhalt') ?? ''));
  } catch {
    return { fehler: 'unlesbar' };
  }
  // Das Schema des Bereichs entscheidet; unbekannte Felder fallen weg, die Antwort nennt nur Pfade und Schlüssel.
  const geprueft = SEITENINHALT[bereich].safeParse(roh);
  if (!geprueft.success) {
    const feldFehler: Record<string, Fehlerschluessel> = {};
    for (const befund of geprueft.error.issues) feldFehler[befund.path.join('.')] ??= fehlerSchluessel(befund, roh);
    return { fehler: 'pruefen', feldFehler };
  }
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.seiteninhalt)
      .values({ bereich, inhalt: geprueft.data, istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: a.benutzerId })
      .onConflictDoUpdate({
        target: schema.seiteninhalt.bereich,
        set: {
          inhalt: geprueft.data,
          istBeispiel: false,
          quelle: 'verwaltung',
          aktualisiertVon: a.benutzerId,
          aktualisiertAm: new Date(),
        },
      });
    // Audit ohne Personendaten: nur Bereich und Aktion (G-07)
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', zielId: bereich }, tx);
  });
  inhaltGeaendert(TAG.seiteninhalt(bereich));
  return { gespeichert: Date.now() };
}

/** Wert unter einem Pfad des Eingabeobjekts (fehlt er, ist das Feld leer). */
function wertAn(wurzel: unknown, pfad: PropertyKey[]): unknown {
  let wert: unknown = wurzel;
  for (const schluessel of pfad) {
    if (!wert || typeof wert !== 'object') return undefined;
    wert = (wert as Record<PropertyKey, unknown>)[schluessel];
  }
  return wert;
}

/** Zod-Befund → Fehlerschlüssel für die Oberfläche (Texte unter verwaltung.seiteninhalteOrganisationen.fehler). */
function fehlerSchluessel(befund: z.core.$ZodIssue, roh: unknown): Fehlerschluessel {
  switch (befund.code) {
    case 'invalid_type':
      if (wertAn(roh, befund.path) === undefined) return 'pflicht';
      return befund.expected === 'number' ? 'zahl' : 'ungueltig';
    case 'too_small':
      return befund.origin === 'string' ? 'pflicht' : 'ungueltig';
    case 'too_big':
      if (befund.origin === 'array') return 'zuViele';
      return befund.origin === 'string' ? 'zuLang' : 'ungueltig';
    case 'invalid_format':
      return befund.format === 'url' ? 'url' : 'ungueltig';
    default:
      return 'ungueltig';
  }
}
