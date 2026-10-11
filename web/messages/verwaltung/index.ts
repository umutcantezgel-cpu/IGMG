/**
 * Texte der Verwaltungsmodule (Welle C, E-031): je Modul eine Datei `messages/verwaltung/<modul>.json` mit
 * { "<modul>": { … } } – nur Deutsch (ADR 0016). `src/i18n/request.ts` hängt sie unter den Namensraum `verwaltung`;
 * `pnpm sprachen:pruefen` meldet Überschneidungen mit `messages/de.json` › verwaltung. Neue Module trägt nur der
 * Orchestrator ein.
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
import einstellungen from './einstellungen.json';

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
  einstellungen,
};
