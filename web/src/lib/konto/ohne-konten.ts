import { routing } from '@/i18n/routing';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { umgebungsSchalter } from '@/lib/funktionen-regeln';

/**
 * Konto-Seiten sicher aus (ADR 0026, ADR 0035), entschieden allein aus der Umgebung: ohne Laufzeit-Datenbank
 * (Beispielmodus, ADR 0019) oder mit `FUNKTION_KONTEN=aus` (die Umgebung schlägt jede Einstellung). Dann antwortet der
 * Proxy mit echtem 404. Grund (Endprüfung Stufe C, Soft-404): Die Konto-Seiten sind mit Cache Components teilweise
 * vorgerendert (leere statische Hülle, `x-nextjs-postponed`); die Antwort beginnt mit Status 200 aus dem Vorrendern, das
 * `notFound()` im Layout (`verlangeKontenSeite`) kommt erst im Datenstrom an – nur noch als Inhalt mit `noindex`. Ein
 * Status lässt sich nur vor dem Rendern setzen (Next-Doku notFound: „before streaming starts“, Proxy). Hängt der
 * Schalter an der Einstellung in der Datenbank, bleibt es beim `notFound()` im Layout (der Proxy liest keine Datenbank).
 */
export function kontenSicherAus(env: Record<string, string | undefined> = process.env): boolean {
  return !datenbankVerfuegbar() || umgebungsSchalter('konten', env) === false;
}

/** Ziel der 404-Antwort: die Fangroute der Sprache mit ihrem Platzhalter `_` – vorgerendert als „Seite nicht gefunden“. */
export function nichtGefundenZiel(pfad: string): string {
  const sprache = /^\/(tr|en)(?:\/|$)/.exec(pfad)?.[1] ?? routing.defaultLocale;
  return `/${sprache}/_`;
}
