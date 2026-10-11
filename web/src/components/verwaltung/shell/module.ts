import type { Aktion } from '@/lib/rechte/matrix';

/**
 * Module der Verwaltung (V01–V14 + Einstellungen) in der Reihenfolge der Seitenleiste. Ein Modul erscheint nur, wenn
 * es gebaut ist (`gebaut`, setzt der Orchestrator bei der Abnahme) und die Rolle eines der Leserechte hat (`recht`).
 * Alle Module sind vorab eingetragen, damit parallele Pakete (Welle C) diese Datei nicht ändern (E-027, E-031).
 */
export type ModulSchluessel =
  | 'uebersicht'
  | 'veranstaltungen'
  | 'neuigkeiten'
  | 'ankuendigungen'
  | 'seiteninhalte'
  | 'kurse'
  | 'gebetszeiten'
  | 'eingaenge'
  | 'postfach'
  | 'tickets'
  | 'medien'
  | 'benutzer'
  | 'audit'
  | 'styleguide'
  | 'startklar'
  | 'einstellungen';
export type ModulIcon = ModulSchluessel;

export type Modul = { schluessel: ModulSchluessel; pfad: string; recht: Aktion | readonly Aktion[]; icon: ModulIcon; gebaut: boolean };

export const MODULE: readonly Modul[] = [
  { schluessel: 'uebersicht', pfad: '/verwaltung', recht: 'uebersicht.lesen', icon: 'uebersicht', gebaut: true },
  { schluessel: 'neuigkeiten', pfad: '/verwaltung/neuigkeiten', recht: 'nachricht.lesen', icon: 'neuigkeiten', gebaut: true },
  {
    schluessel: 'veranstaltungen',
    pfad: '/verwaltung/veranstaltungen',
    recht: 'veranstaltung.lesen',
    icon: 'veranstaltungen',
    gebaut: true,
  },
  { schluessel: 'ankuendigungen', pfad: '/verwaltung/ankuendigungen', recht: 'ankuendigung.lesen', icon: 'ankuendigungen', gebaut: true },
  {
    schluessel: 'seiteninhalte',
    pfad: '/verwaltung/seiteninhalte',
    recht: ['seiteninhalt.lesen', 'organisationsinhalt.bearbeiten'],
    icon: 'seiteninhalte',
    gebaut: true,
  },
  { schluessel: 'kurse', pfad: '/verwaltung/kurse', recht: 'kurs.lesen', icon: 'kurse', gebaut: true },
  { schluessel: 'gebetszeiten', pfad: '/verwaltung/gebetszeiten', recht: 'gebetszeiten.lesen', icon: 'gebetszeiten', gebaut: true },
  {
    schluessel: 'eingaenge',
    pfad: '/verwaltung/eingaenge',
    recht: [
      'eingang.kontakt.lesen',
      'eingang.veranstaltungsanmeldung.lesen',
      'eingang.voranmeldung.lesen',
      'eingang.mitgliedsantrag.lesen',
      'eingang.moschee_anfrage.lesen',
    ],
    icon: 'eingaenge',
    gebaut: true,
  },
  { schluessel: 'postfach', pfad: '/verwaltung/postfach', recht: 'postfach.nutzen', icon: 'postfach', gebaut: true },
  { schluessel: 'tickets', pfad: '/verwaltung/tickets', recht: ['ticket.lesen', 'ticket.anlegen'], icon: 'tickets', gebaut: true },
  { schluessel: 'medien', pfad: '/verwaltung/medien', recht: 'medium.lesen', icon: 'medien', gebaut: true },
  { schluessel: 'benutzer', pfad: '/verwaltung/benutzer', recht: 'benutzer.lesen', icon: 'benutzer', gebaut: true },
  { schluessel: 'audit', pfad: '/verwaltung/audit', recht: 'audit.lesen', icon: 'audit', gebaut: true },
  { schluessel: 'styleguide', pfad: '/verwaltung/styleguide', recht: 'styleguide.lesen', icon: 'styleguide', gebaut: true },
  { schluessel: 'startklar', pfad: '/verwaltung/startklar', recht: 'einstellung.bearbeiten', icon: 'startklar', gebaut: true },
  { schluessel: 'einstellungen', pfad: '/verwaltung/einstellungen', recht: 'einstellung.bearbeiten', icon: 'einstellungen', gebaut: true },
];

/** Hat die Rolle eines der Leserechte des Moduls? */
export function rechtListe(m: Modul): readonly Aktion[] {
  return typeof m.recht === 'string' ? [m.recht] : m.recht;
}
