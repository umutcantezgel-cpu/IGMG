import type { LernappStelle } from '@/lib/db/schema/lernapp';
import de from '../../../../messages/lernapp/de.json';
import { formatiere } from '../format';

/**
 * Quellenzeile einer Aussage des Wissenskurses aus ihren Belegen (ADR 0040 Fortschreibung S8 Nr. 2, KERN 4.0 §2.3): Werk
 * (Autor), Kitab › Bab › Fasl, Ausgabe, Band, Seite – je Beleg, mehrere durch Semikolon getrennt; nie der Wortlaut der Quelle
 * und keine arabische Schrift aus Inhaltsdateien (KERN 4.0 §2.2 Nr. 4). Inhalt deutsch wie der Kurs. Rein: genutzt vom
 * Paketbau aus der Datenbank (`server/queries/lernapp/wissen.ts`) und von der Vertragsprobe über die Inhaltsdateien
 * (`tests/unit/lernapp/wissen-vertrag.test.ts`).
 *
 * Die Formate „Bd.“/„S.“ kommen aus `messages/lernapp/de.json` über den kleinen Formatierer (`format.ts`), nicht über
 * next-intl: Skripte mit `--conditions=react-server` (z. B. `scripts/beispielkonten.ts` über `lib/lernapp/sync/server.ts` →
 * `pakete.ts`) scheitern am Client-Teil von next-intl.
 */
export type QuellenBeleg = { werk: string; autor: string | null; ausgabe: string | null; stelle: LernappStelle };

export function quellenzeile(belege: readonly QuellenBeleg[]): string {
  const t = (vorlage: string, werte: Record<string, string>) => formatiere(vorlage, werte, 'de');
  return belege
    .map((b) =>
      [
        b.autor ? `${b.werk} (${b.autor})` : b.werk,
        [b.stelle.kitab, b.stelle.bab, b.stelle.fasl].filter(Boolean).join(' › '),
        b.ausgabe,
        b.stelle.band ? t(de.quellenzeile.band, { band: b.stelle.band }) : null,
        b.stelle.seite ? t(de.quellenzeile.seite, { seite: b.stelle.seite }) : null,
      ]
        .filter((x): x is string => Boolean(x))
        .join(', '),
    )
    .join('; ');
}
