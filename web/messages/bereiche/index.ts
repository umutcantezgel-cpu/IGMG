/**
 * Sprachdateien je Seitenbereich (E-027): Jedes Welle-Paket besitzt genau eine Datei `<bereich>.json` mit
 * `{ de, tr, en }` und eigenen Namensräumen. `src/i18n/request.ts` führt sie über die Hauptdateien zusammen;
 * `pnpm sprachen:pruefen` prüft Vollständigkeit und meldet Überschneidungen. Neue Bereiche nur hier eintragen.
 */
import anzeige from './anzeige.json';
import fehlerseiten from './fehlerseiten.json';
import gebetszeiten from './gebetszeiten.json';
import igmg from './igmg.json';
import kontakt from './kontakt.json';
import korankurse from './korankurse.json';
import nachrichten from './nachrichten.json';
import organisationen from './organisationen.json';
import projekte from './projekte.json';
import rechtliches from './rechtliches.json';
import ueberUns from './ueber-uns.json';
import vorstand from './vorstand.json';
import wissen from './wissen.json';

type Teil = Record<string, unknown>;
export type BereichsDatei = { de: Teil; tr: Teil; en: Teil };

export const BEREICHE: Record<string, BereichsDatei> = {
  anzeige,
  fehlerseiten,
  gebetszeiten,
  igmg,
  kontakt,
  korankurse,
  nachrichten,
  organisationen,
  projekte,
  rechtliches,
  'ueber-uns': ueberUns,
  vorstand,
  wissen,
};
