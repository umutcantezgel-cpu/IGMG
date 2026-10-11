import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/** Anker des `<noscript>`-Hinweises in `FormularInsel`. */
export const OHNE_SKRIPT_ANKER = 'ohne-skript';

/**
 * Absenden ohne JavaScript (natives POST, kein `Next-Action`-Header): Die Antwort einer Formular-Action enthält auf
 * dem Server gerenderte Ansichten (E-028), die Next.js in diesem Weg nicht darstellen kann – und ALTCHA braucht
 * ohnehin JavaScript. Statt einer Fehlerseite zurück zur Formularseite (nur Pfad der eigenen Herkunft aus dem
 * Referer, sonst Startseite) zum Hinweis. Erster Aufruf jeder öffentlichen Formular-Action; nichts wird gespeichert.
 */
export async function zurueckOhneSkript(): Promise<void> {
  const h = await headers();
  if (h.get('next-action')) return;
  let pfad = '/';
  try {
    const herkunft = new URL(h.get('referer') ?? '');
    if (herkunft.host === h.get('host') && /^\/(?![/\\])/.test(herkunft.pathname)) pfad = herkunft.pathname;
  } catch {
    // kein oder ungültiger Referer
  }
  redirect(`${pfad}#${OHNE_SKRIPT_ANKER}`);
}
