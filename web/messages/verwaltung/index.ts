/**
 * Texte der Verwaltungsmodule (Welle C, E-031): je Modul eine Datei `messages/verwaltung/<modul>.json` mit
 * { "<modul>": { … } } – nur Deutsch (ADR 0016). `src/i18n/request.ts` hängt sie unter den Namensraum `verwaltung`;
 * `pnpm sprachen:pruefen` meldet Überschneidungen mit `messages/de.json` › verwaltung. Neue Module trägt nur der
 * Orchestrator ein. Ausnahme: `lernapp-pruefung.json` (Prüfoberfläche Sprache in de, tr und ar, ADR 0041 Nr. 10) steht
 * nicht hier; die Seite liest sie mit `createTranslator` und ausdrücklicher Sprache.
 */
import uebersicht from './uebersicht.json';
import neuigkeiten from './neuigkeiten.json';
import ankuendigungen from './ankuendigungen.json';
import seiteninhalte from './seiteninhalte.json';
import seiteninhalteOrganisationen from './seiteninhalte-organisationen.json';
import kurse from './kurse.json';
import gebetszeiten from './gebetszeiten.json';
import eingaenge from './eingaenge.json';
import postfach from './postfach.json';
import tickets from './tickets.json';
import medien from './medien.json';
import benutzer from './benutzer.json';
import audit from './audit.json';
import styleguide from './styleguide.json';
import editor from './editor.json';
import startklar from './startklar.json';
import einstellungen from './einstellungen.json';
import medienwahl from './medienwahl.json';
import kinderschutz from './kinderschutz.json';
import gemeindeImBlick from './gemeindeImBlick.json';
import seiten from './seiten.json';
import menues from './menues.json';
import weiterleitungen from './weiterleitungen.json';
import freigaben from './freigaben.json';
import hatim from './hatim.json';
import besondereTage from './besondereTage.json';
import newsletter from './newsletter.json';
import spenden from './spenden.json';
import lernen from './lernen.json';
import koran from './koran.json';
import rezitationen from './rezitationen.json';
import anzeige from './anzeige.json';
import sicherheit from './sicherheit.json';
import startseite from './startseite.json';
import wissen from './wissen.json';
import lernapp from './lernapp.json';

type Teil = Record<string, unknown>;

export const VERWALTUNG: Record<string, Teil> = {
  uebersicht,
  neuigkeiten,
  ankuendigungen,
  seiteninhalte,
  seiteninhalteOrganisationen,
  kurse,
  gebetszeiten,
  eingaenge,
  postfach,
  tickets,
  medien,
  benutzer,
  audit,
  styleguide,
  editor,
  startklar,
  einstellungen,
  medienwahl,
  kinderschutz,
  gemeindeImBlick,
  seiten,
  menues,
  weiterleitungen,
  freigaben,
  hatim,
  besondereTage,
  newsletter,
  spenden,
  lernen,
  koran,
  rezitationen,
  anzeige,
  sicherheit,
  startseite,
  wissen,
  lernapp,
};
