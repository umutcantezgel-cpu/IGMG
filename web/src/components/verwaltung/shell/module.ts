import type { Aktion } from '@/lib/rechte/matrix';

/** Funktionsschalter (ADR 0035), ohne den ein Modul nicht erscheint (Seiten antworten dann mit 404). */
export type ModulFunktion = 'lernplattform' | 'konten' | 'lernapp';

/**
 * Module der Verwaltung (V01–V14 + Einstellungen) in der Reihenfolge der Seitenleiste. Ein Modul erscheint nur, wenn
 * es gebaut ist (`gebaut`, setzt der Orchestrator bei der Abnahme) und die Rolle eines der Leserechte hat (`recht`).
 * Alle Module sind vorab eingetragen, damit parallele Pakete (Welle C) diese Datei nicht ändern (E-027, E-031).
 * Die Gruppen (`gruppe`) gliedern die Seitenleiste; ihre Reihenfolge in dieser Liste ist fest (H-B05).
 */
export type ModulSchluessel =
  | 'uebersicht'
  | 'veranstaltungen'
  | 'neuigkeiten'
  | 'ankuendigungen'
  | 'seiteninhalte'
  | 'seiten'
  | 'menues'
  | 'startseite'
  | 'weiterleitungen'
  | 'wissen'
  | 'freigaben'
  | 'kurse'
  | 'gruppen'
  | 'lernende'
  | 'lehrplan'
  | 'gebetszeiten'
  | 'eingaenge'
  | 'postfach'
  | 'tickets'
  | 'kinderschutz'
  | 'gemeindeImBlick'
  | 'koran'
  | 'medien'
  | 'rezitationen'
  | 'benutzer'
  | 'gemeindeKonten'
  | 'audit'
  | 'styleguide'
  | 'startklar'
  | 'einstellungen'
  // Lauf Gemeinde-Plattform, Kür A (H-K01–H-K04)
  | 'hatim'
  | 'besondereTage'
  | 'newsletter'
  // Kür (O-K05): Bildschirm-Anzeige im Gebetsraum
  | 'anzeige'
  // Lauf Lern-App (L3-06, PLAN §7.1): Übersicht, Kurse, Sprachprüfung, Audio-Studio, Meldungen, Quellen
  | 'lernapp';
export type ModulIcon = ModulSchluessel;
export type ModulGruppe = 'inhalte' | 'kommunikation' | 'betrieb';

export type Modul = {
  schluessel: ModulSchluessel;
  pfad: string;
  recht: Aktion | readonly Aktion[];
  icon: ModulIcon;
  gebaut: boolean;
  gruppe?: ModulGruppe;
  funktion?: ModulFunktion;
};

/**
 * Handlungsmodule: Ihre Zähler zeigen Arbeit, die wartet (Eingänge, Nachrichten, Tickets). Die übrigen Zähler
 * sind Bestand (Neuigkeiten, Veranstaltungen, Ankündigungen) und sehen anders aus.
 */
export const HANDLUNGS_MODULE = ['eingaenge', 'postfach', 'tickets', 'kinderschutz', 'koran', 'anzeige', 'lernapp'] as const;

export const MODULE: readonly Modul[] = [
  { schluessel: 'uebersicht', pfad: '/verwaltung', recht: 'uebersicht.lesen', icon: 'uebersicht', gebaut: true },
  // Leitung (AUFTRAG 3.10): Kennzahlen ohne Personendaten
  {
    schluessel: 'gemeindeImBlick',
    pfad: '/verwaltung/gemeinde-im-blick',
    recht: 'leitung.lesen',
    icon: 'gemeindeImBlick',
    gebaut: true,
  },
  {
    schluessel: 'neuigkeiten',
    pfad: '/verwaltung/neuigkeiten',
    recht: 'nachricht.lesen',
    icon: 'neuigkeiten',
    gebaut: true,
    gruppe: 'inhalte',
  },
  {
    schluessel: 'veranstaltungen',
    pfad: '/verwaltung/veranstaltungen',
    recht: 'veranstaltung.lesen',
    icon: 'veranstaltungen',
    gebaut: true,
    gruppe: 'inhalte',
  },
  {
    schluessel: 'ankuendigungen',
    pfad: '/verwaltung/ankuendigungen',
    recht: 'ankuendigung.lesen',
    icon: 'ankuendigungen',
    gebaut: true,
    gruppe: 'inhalte',
  },
  {
    schluessel: 'seiteninhalte',
    pfad: '/verwaltung/seiteninhalte',
    recht: ['seiteninhalt.lesen', 'organisationsinhalt.bearbeiten'],
    icon: 'seiteninhalte',
    gebaut: true,
    gruppe: 'inhalte',
  },
  // CMS (ADR 0032): freie Seiten, Menüs, Weiterleitungen, Freigaben
  { schluessel: 'seiten', pfad: '/verwaltung/seiten', recht: 'seite.lesen', icon: 'seiten', gebaut: true, gruppe: 'inhalte' },
  { schluessel: 'menues', pfad: '/verwaltung/menues', recht: 'menue.bearbeiten', icon: 'menues', gebaut: true, gruppe: 'inhalte' },
  // F-40: Reihenfolge und Sichtbarkeit der Startseiten-Abschnitte
  {
    schluessel: 'startseite',
    pfad: '/verwaltung/startseite',
    recht: 'startseite.bearbeiten',
    icon: 'startseite',
    gebaut: true,
    gruppe: 'inhalte',
  },
  {
    schluessel: 'weiterleitungen',
    pfad: '/verwaltung/weiterleitungen',
    recht: 'weiterleitung.bearbeiten',
    icon: 'weiterleitungen',
    gebaut: true,
    gruppe: 'inhalte',
  },
  // F-40: Themen „Islamisches Wissen“ pflegen; öffentlich erst nach der religiösen Freigabe (ADR 0030)
  { schluessel: 'wissen', pfad: '/verwaltung/wissen', recht: 'wissen.bearbeiten', icon: 'wissen', gebaut: true, gruppe: 'inhalte' },
  { schluessel: 'freigaben', pfad: '/verwaltung/freigaben', recht: 'freigabe.lesen', icon: 'freigaben', gebaut: true, gruppe: 'inhalte' },
  { schluessel: 'kurse', pfad: '/verwaltung/kurse', recht: 'kurs.lesen', icon: 'kurse', gebaut: true, gruppe: 'inhalte' },
  // Lernplattform (H-L01…L03): nur mit eingeschaltetem Schalter `lernplattform`
  {
    schluessel: 'gruppen',
    pfad: '/verwaltung/gruppen',
    recht: 'gruppe.lesen',
    icon: 'gruppen',
    gebaut: true,
    gruppe: 'inhalte',
    funktion: 'lernplattform',
  },
  {
    schluessel: 'lernende',
    pfad: '/verwaltung/lernende',
    recht: 'lernende.lesen',
    icon: 'lernende',
    gebaut: true,
    gruppe: 'inhalte',
    funktion: 'lernplattform',
  },
  {
    schluessel: 'lehrplan',
    pfad: '/verwaltung/lehrplan',
    recht: 'gruppe.lesen',
    icon: 'lehrplan',
    gebaut: true,
    gruppe: 'inhalte',
    funktion: 'lernplattform',
  },
  {
    schluessel: 'gebetszeiten',
    pfad: '/verwaltung/gebetszeiten',
    recht: 'gebetszeiten.lesen',
    icon: 'gebetszeiten',
    gebaut: true,
    gruppe: 'inhalte',
  },
  // Koran & Hadith (H-Q03/Q04, ADR 0030): Ausgaben, Wortbedeutungen, Tajwid-Texte, Hadith; Zähler = offene religiöse Freigaben
  {
    schluessel: 'koran',
    pfad: '/verwaltung/koran',
    recht: ['quran.bearbeiten', 'hadith.bearbeiten', 'religioes.freigeben'],
    icon: 'koran',
    gebaut: true,
    gruppe: 'inhalte',
  },
  { schluessel: 'medien', pfad: '/verwaltung/medien', recht: 'medium.lesen', icon: 'medien', gebaut: true, gruppe: 'inhalte' },
  // Rezitations-Werkstatt (O-Q02, ADR 0029): religiöse Prüfung und Administration
  {
    schluessel: 'rezitationen',
    pfad: '/verwaltung/rezitationen',
    recht: 'rezitation.bearbeiten',
    icon: 'rezitationen',
    gebaut: true,
    gruppe: 'inhalte',
  },
  // Lern-App (L3-06, PLAN §7.1): nur mit Schalter `lernapp`; Einstieg der Rolle „Sprachprüfung“ (ADR 0041, Fortschreibung S-L1)
  {
    schluessel: 'lernapp',
    pfad: '/verwaltung/lernapp',
    recht: 'lernapp.lesen',
    icon: 'lernapp',
    gebaut: true,
    gruppe: 'inhalte',
    funktion: 'lernapp',
  },
  {
    schluessel: 'besondereTage',
    pfad: '/verwaltung/besondere-tage',
    recht: 'kalender.bearbeiten',
    icon: 'besondereTage',
    gebaut: true,
    gruppe: 'inhalte',
  },
  { schluessel: 'hatim', pfad: '/verwaltung/hatim', recht: 'hatim.bearbeiten', icon: 'hatim', gebaut: true, gruppe: 'inhalte' },
  // Anzeige im Gebetsraum (O-K05): Redaktion pflegt Folien; religiöse Prüfung gibt Vers- und Hadith-Folien frei
  {
    schluessel: 'anzeige',
    pfad: '/verwaltung/anzeige',
    recht: ['anzeige.bearbeiten', 'religioes.freigeben'],
    icon: 'anzeige',
    gebaut: true,
    gruppe: 'inhalte',
  },
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
    gruppe: 'kommunikation',
  },
  {
    schluessel: 'postfach',
    pfad: '/verwaltung/postfach',
    recht: 'postfach.nutzen',
    icon: 'postfach',
    gebaut: true,
    gruppe: 'kommunikation',
  },
  {
    schluessel: 'tickets',
    pfad: '/verwaltung/tickets',
    recht: ['ticket.lesen', 'ticket.anlegen'],
    icon: 'tickets',
    gebaut: true,
    gruppe: 'kommunikation',
  },
  // Kinderschutz (S-08, S-11): nur Rolle kinderschutz – nie über „Administration darf alles“ (ADR 0026)
  {
    schluessel: 'kinderschutz',
    pfad: '/verwaltung/kinderschutz',
    recht: 'meldung.chat.lesen',
    icon: 'kinderschutz',
    gebaut: true,
    gruppe: 'kommunikation',
  },
  {
    schluessel: 'newsletter',
    pfad: '/verwaltung/newsletter',
    recht: 'newsletter.lesen',
    icon: 'newsletter',
    gebaut: true,
    gruppe: 'kommunikation',
  },
  { schluessel: 'benutzer', pfad: '/verwaltung/benutzer', recht: 'benutzer.lesen', icon: 'benutzer', gebaut: true, gruppe: 'betrieb' },
  {
    schluessel: 'gemeindeKonten',
    pfad: '/verwaltung/gemeinde-konten',
    recht: 'gemeindekonto.lesen',
    icon: 'gemeindeKonten',
    gebaut: true,
    gruppe: 'betrieb',
    funktion: 'konten',
  },
  { schluessel: 'audit', pfad: '/verwaltung/audit', recht: 'audit.lesen', icon: 'audit', gebaut: true, gruppe: 'betrieb' },
  {
    schluessel: 'startklar',
    pfad: '/verwaltung/startklar',
    recht: 'einstellung.bearbeiten',
    icon: 'startklar',
    gebaut: true,
    gruppe: 'betrieb',
  },
  {
    schluessel: 'einstellungen',
    pfad: '/verwaltung/einstellungen',
    recht: 'einstellung.bearbeiten',
    icon: 'einstellungen',
    gebaut: true,
    gruppe: 'betrieb',
  },
  {
    schluessel: 'styleguide',
    pfad: '/verwaltung/styleguide',
    recht: 'styleguide.lesen',
    icon: 'styleguide',
    gebaut: true,
    gruppe: 'betrieb',
  },
];

/** Hat die Rolle eines der Leserechte des Moduls? */
export function rechtListe(m: Modul): readonly Aktion[] {
  return typeof m.recht === 'string' ? [m.recht] : m.recht;
}
