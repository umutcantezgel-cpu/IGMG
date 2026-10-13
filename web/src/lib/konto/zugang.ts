import 'server-only';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { ladeKonto, verlangeKonto, type GemeindeRolle, type Konto } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Zugang zu den Konto-Seiten und „Mein Bereich“ (ADR 0026, ADR 0035). Ergänzt `src/lib/rechte/gemeinde.ts` um
 * den Funktionsschalter, die Pflicht-Faktor-Regel für Verwaltungskonten und den Weg nach der Anmeldung.
 */

/** Seiten: Funktion `konten` aus → 404 (in der Produktion bis zur Freigabe). */
export async function verlangeKontenSeite(): Promise<void> {
  if (!(await funktionAn('konten'))) notFound();
}

/** Server Actions: Funktion `konten` aus → `KeinRecht` (Actions sind auch ohne Seite aufrufbar). */
export async function verlangeKontenAktion(): Promise<void> {
  if (!(await funktionAn('konten'))) throw new KeinRecht();
}

/** Konten mit Pflicht zum zweiten Faktor: Lehrkräfte (ADR 0026) und alle mit Verwaltungsrolle (K-06). */
export function faktorPflicht(k: Pick<Konto, 'gemeindeRollen' | 'verwaltungsRollen'>): boolean {
  return k.verwaltungsRollen.length > 0 || k.gemeindeRollen.includes('lehrkraft');
}

/** Hat das Konto überhaupt Zugang zu „Mein Bereich“? (Unbestätigte Registrierungen haben noch keine Rolle.) */
export function hatZugang(k: Pick<Konto, 'gemeindeRollen' | 'verwaltungsRollen'>): boolean {
  return k.gemeindeRollen.length > 0 || k.verwaltungsRollen.length > 0;
}

/**
 * Seiten in „Mein Bereich“: Funktion an, angemeldet (sonst → Anmeldung), Lehrkraft mit zweitem Faktor (sonst →
 * Einrichtung), mindestens eine Rolle (sonst → Anmeldung mit Hinweis) und – falls angegeben – eine der Kontoarten.
 */
export async function verlangeMeinBereich(locale: Locale, rollen?: readonly GemeindeRolle[]): Promise<Konto> {
  await verlangeKontenSeite();
  const k = await verlangeKonto(locale, rollen);
  if (!hatZugang(k)) redirect(pfadFuer({ pathname: '/anmelden', query: { hinweis: 'unbestaetigt' } }, locale));
  return k;
}

/** Wie `verlangeMeinBereich`, aber ohne Faktor-Pflicht: nur für die Konto-Seite (dort wird der Faktor eingerichtet). */
export async function verlangeKontoSeite(locale: Locale): Promise<Konto> {
  await verlangeKontenSeite();
  const k = await ladeKonto();
  if (!k) redirect(pfadFuer('/anmelden', locale));
  if (!hatZugang(k)) redirect(pfadFuer({ pathname: '/anmelden', query: { hinweis: 'unbestaetigt' } }, locale));
  return k;
}

/** ID der aktuellen Sitzung (je Anfrage einmal); markiert „dieses Gerät“ und schützt sie vor „andere abmelden“. */
export const aktuelleSitzungsId = cache(async (): Promise<string | null> => {
  const s = await auth.api.getSession({ headers: await headers() });
  return s?.session.id ?? null;
});

/**
 * Ziel nach erfolgreicher Anmeldung: Konten mit Verwaltungsrolle wählen auf der Anmeldeseite zwischen Verwaltung und
 * Mein Bereich, alle anderen gehen direkt nach Mein Bereich (bzw. zum geprüften Rücksprung).
 */
export async function zielNachAnmeldung(benutzerId: string, locale: Locale, weiter: string | null): Promise<string> {
  const [verwaltung] = await db
    .select({ id: schema.rolleZuweisung.id })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, benutzerId))
    .limit(1);
  if (weiter) return weiter;
  if (verwaltung) return pfadFuer('/anmelden', locale);
  return pfadFuer('/mein-bereich', locale);
}
