import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { BEREICHE } from '../../messages/bereiche';
import { VERWALTUNG } from '../../messages/verwaltung';
import { routing } from './routing';

type Nachrichten = Record<string, unknown>;

/** Tiefes Zusammenführen: fehlende Schlüssel der Sprache werden aus Deutsch ergänzt (Sicherheitsnetz). */
function mitRueckfall(basis: Nachrichten, sprache: Nachrichten): Nachrichten {
  const aus: Nachrichten = { ...basis };
  for (const [k, v] of Object.entries(sprache)) {
    const b = basis[k];
    aus[k] =
      v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? mitRueckfall(b as Nachrichten, v as Nachrichten) : v;
  }
  return aus;
}

/**
 * Sprache aus dem Root-Parameter `[locale]` (next/root-params, Lichtung a) – statisch renderbar. Im Lernbereich aus
 * dessen Root-Parameter `[ui]` (`spracheImLernbereich`).
 * Fehlt ein Schlüssel in tr/en, greift Deutsch (Sicherheitsnetz); Vollständigkeit prüft `pnpm sprachen:pruefen` (Z-03).
 * Die Verwaltung ist nur deutsch (ADR 0016): Namensraum `verwaltung` immer aus de.json.
 */
/** Hauptdatei + Bereichsdateien (E-027) einer Sprache zu einem Objekt. */
function mitBereichen(basis: Nachrichten, sprache: 'de' | 'tr' | 'en'): Nachrichten {
  const aus: Nachrichten = { ...basis };
  for (const datei of Object.values(BEREICHE)) Object.assign(aus, datei[sprache]);
  // Verwaltungsmodule (E-031): nur Deutsch, unter dem Namensraum `verwaltung`
  if (sprache === 'de') aus.verwaltung = Object.assign({}, basis.verwaltung as Nachrichten, ...Object.values(VERWALTUNG));
  return aus;
}

/**
 * Sprache der Website-Bausteine im Lernbereich (`/lern-app/[ui]`, eigenes Wurzel-Layout ohne `[locale]`): Kopf- und
 * Fußzeile der Website stehen auch dort (eine Website, ein Rahmen). Türkisch bleibt Türkisch; Deutsch und Arabisch
 * bekommen die deutsche Fassung, weil es die Website nicht auf Arabisch gibt (wie die Links aus dem Lernbereich bisher).
 */
async function spracheImLernbereich(): Promise<string | undefined> {
  const ui = await rootParams.ui();
  if (ui === 'tr') return 'tr';
  return ui === 'de' || ui === 'ar' ? 'de' : undefined;
}

export default getRequestConfig(async ({ locale }) => {
  const kandidat = locale ?? (await rootParams.locale()) ?? (await spracheImLernbereich());
  if (!hasLocale(routing.locales, kandidat)) notFound();
  const de = mitBereichen((await import('../../messages/de.json')).default as Nachrichten, 'de');
  if (kandidat === 'de') return { locale: kandidat, timeZone: 'Europe/Berlin', messages: de };
  const eigen = mitBereichen((await import(`../../messages/${kandidat}.json`)).default as Nachrichten, kandidat);
  return { locale: kandidat, timeZone: 'Europe/Berlin', messages: { ...mitRueckfall(de, eigen), verwaltung: de.verwaltung } };
});
