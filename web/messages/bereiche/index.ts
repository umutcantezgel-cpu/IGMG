/**
 * Sprachdateien je Seitenbereich (E-027): Jedes Welle-Paket besitzt genau eine Datei `<bereich>.json` mit
 * `{ de, tr, en }` und eigenen Namensräumen. `src/i18n/request.ts` führt sie über die Hauptdateien zusammen;
 * `pnpm sprachen:pruefen` prüft Vollständigkeit und meldet Überschneidungen. Neue Bereiche nur hier eintragen.
 */
import anzeige from './anzeige.json';
import fehlergrenze from './fehlergrenze.json';
import fehlerseiten from './fehlerseiten.json';
import formulare from './formulare.json';
import gebetszeiten from './gebetszeiten.json';
import igmg from './igmg.json';
import kontakt from './kontakt.json';
import kontaktformular from './kontaktformular.json';
import korankurse from './korankurse.json';
import mails from './mails.json';
import meldung from './meldung.json';
import mitglied from './mitglied.json';
import moscheeAnfrage from './moschee-anfrage.json';
import nachrichten from './nachrichten.json';
import organisationen from './organisationen.json';
import projekte from './projekte.json';
import rechtliches from './rechtliches.json';
import suche from './suche.json';
import ueberUns from './ueber-uns.json';
import voranmeldung from './voranmeldung.json';
import vorstand from './vorstand.json';
import wissen from './wissen.json';

type Teil = Record<string, unknown>;
export type BereichsDatei = { de: Teil; tr: Teil; en: Teil };

export const BEREICHE: Record<string, BereichsDatei> = {
  anzeige,
  fehlergrenze,
  fehlerseiten,
  formulare,
  gebetszeiten,
  igmg,
  kontakt,
  kontaktformular,
  korankurse,
  mails,
  meldung,
  mitglied,
  moscheeAnfrage,
  nachrichten,
  organisationen,
  projekte,
  rechtliches,
  suche,
  'ueber-uns': ueberUns,
  voranmeldung,
  vorstand,
  wissen,
};
