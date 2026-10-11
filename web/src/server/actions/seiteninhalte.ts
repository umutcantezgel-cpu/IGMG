'use server';

import type { z } from 'zod';
import { istVerwaltungBereich } from '@/components/verwaltung/seiteninhalte/bereiche';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { SEITENINHALT } from '@/lib/validierung/seiteninhalte';

/**
 * Verwaltung „Seiteninhalte I“ (V05, Muster 5): Über uns, Vorstand, Projekte, IGMG, Impressum und Datenschutz.
 * Reihenfolge: Recht (Sitzung, zweiter Faktor, Rolle) → Bereich prüfen → Inhalt mit dem Schema prüfen → speichern →
 * Audit → Cache. Fehler sind Schlüssel unter `verwaltung.seiteninhalte.fehler`; Antworten nennen keine Interna (S4).
 */
export type SpeicherZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  gespeichert?: number;
};

/** Fehlerschlüssel je Zod-Problem (Texte stehen unter `verwaltung.seiteninhalte.fehler`). */
function fehlerSchluessel(problem: z.core.$ZodIssue): string {
  const letzter = String(problem.path.at(-1) ?? '');
  switch (problem.code) {
    case 'too_small':
      if (problem.origin === 'array') return 'mindestensEin';
      if (problem.origin === 'string') return Number(problem.minimum) <= 1 ? 'pflicht' : 'zuKurz';
      return 'zuKlein';
    case 'too_big':
      if (problem.origin === 'array') return 'zuVieleEintraege';
      return problem.origin === 'string' ? 'zuLang' : 'zuGross';
    case 'invalid_type':
      return ['number', 'int'].includes(String(problem.expected)) ? 'ungueltigeZahl' : 'ungueltig';
    case 'invalid_format':
      if (problem.format === 'email' || letzter === 'email') return 'ungueltigeAdresse';
      return problem.format === 'regex' ? 'ungueltigerPfad' : 'ungueltig';
    case 'invalid_value':
      return 'ungueltigeAuswahl';
    case 'invalid_union':
      return letzter === 'email' ? 'ungueltigeAdresse' : 'ungueltig';
    default:
      return 'ungueltig';
  }
}

/** Feldfehler je Pfad (`issue.path.join('.')`); der erste Fehler eines Pfads zählt. */
function feldFehlerAus(probleme: readonly z.core.$ZodIssue[]): Record<string, string> {
  const ausgabe: Record<string, string> = {};
  for (const problem of probleme) {
    const pfad = problem.path.map(String).join('.') || 'formular';
    ausgabe[pfad] ??= fehlerSchluessel(problem);
  }
  return ausgabe;
}

export async function speichereSeiteninhalt(_vorher: SpeicherZustand, fd: FormData): Promise<SpeicherZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('seiteninhalt.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  if (!darf(a.rollen, 'seiteninhalt.bearbeiten')) return { fehler: 'keinRecht' };

  // Nur die Bereiche dieses Moduls. Organisationen und Kontakt haben eigene Actions mit Organisationsrecht.
  const bereich = fd.get('bereich');
  if (typeof bereich !== 'string' || !istVerwaltungBereich(bereich)) return { fehler: 'nichtGefunden' };

  const roh = fd.get('inhalt');
  if (typeof roh !== 'string') return { fehler: 'unlesbar' };
  let eingabe: unknown;
  try {
    eingabe = JSON.parse(roh);
  } catch {
    return { fehler: 'unlesbar' };
  }

  const geprueft = SEITENINHALT[bereich].safeParse(eingabe);
  if (!geprueft.success) return { fehler: 'pruefen', feldFehler: feldFehlerAus(geprueft.error.issues) };
  const inhalt = geprueft.data;

  await db.transaction(async (tx) => {
    await tx
      .insert(schema.seiteninhalt)
      .values({ bereich, inhalt, istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: a.benutzerId })
      .onConflictDoUpdate({
        target: schema.seiteninhalt.bereich,
        set: { inhalt, istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: a.benutzerId, aktualisiertAm: new Date() },
      });
    // Ohne Personendaten: nur der Bereich zählt; der Inhalt selbst steht nicht im Audit-Log.
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', zielId: bereich }, tx);
  });
  inhaltGeaendert(TAG.seiteninhalt(bereich));
  return { gespeichert: Date.now() };
}
