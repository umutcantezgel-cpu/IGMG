import type { Sprache } from '@/lib/lernapp/kurse';

/**
 * Rechte-Matrix (K-06, ADR 0003). Reine Daten und Funktionen – ohne Datenbank, vollständig unit-testbar.
 * Jede Server Action und jede Verwaltungsroute ruft `verlangeRecht(aktion, ziel)` (pruefe.ts) auf.
 */

export const ROLLEN = [
  'administration',
  'redaktion',
  'organisationsredaktion',
  'bildung',
  'mitgliederverwaltung',
  'leitung',
  'religioese_pruefung',
  'kinderschutz',
  // Lauf Lern-App (ADR 0041 Nr. 1): muttersprachliche Prüfung je eigener Sprache
  'sprachpruefung',
] as const;
export type Rolle = (typeof ROLLEN)[number];

export const ORGANISATION_KUERZEL = ['at', 'kt', 'gt', 'kgt'] as const;
export type OrganisationKuerzel = (typeof ORGANISATION_KUERZEL)[number];

export type RollenZuweisung = { rolle: Rolle; organisation?: OrganisationKuerzel | null };

/** Alle Aktionen der Verwaltung. Neue Module ergänzen hier ihre Aktionen (nur Orchestrator). */
export const AKTIONEN = [
  'verwaltung.betreten',
  'uebersicht.lesen',
  'veranstaltung.lesen',
  'veranstaltung.bearbeiten',
  'veranstaltung.loeschen',
  'nachricht.lesen',
  'nachricht.bearbeiten',
  'nachricht.loeschen',
  'ankuendigung.lesen',
  'ankuendigung.bearbeiten',
  'ankuendigung.loeschen',
  'seiteninhalt.lesen',
  'seiteninhalt.bearbeiten',
  'organisationsinhalt.bearbeiten',
  'kurs.lesen',
  'kurs.bearbeiten',
  'kurs.loeschen',
  'gebetszeiten.lesen',
  'gebetszeiten.bearbeiten',
  'eingang.kontakt.lesen',
  'eingang.kontakt.bearbeiten',
  'eingang.veranstaltungsanmeldung.lesen',
  'eingang.veranstaltungsanmeldung.bearbeiten',
  'eingang.voranmeldung.lesen',
  'eingang.voranmeldung.bearbeiten',
  'eingang.mitgliedsantrag.lesen',
  'eingang.mitgliedsantrag.bearbeiten',
  'eingang.moschee_anfrage.lesen',
  'eingang.moschee_anfrage.bearbeiten',
  'postfach.nutzen',
  'ticket.lesen',
  'ticket.anlegen',
  'ticket.bearbeiten',
  'medium.lesen',
  'medium.hochladen',
  'medium.loeschen',
  'benutzer.lesen',
  'benutzer.einladen',
  'benutzer.bearbeiten',
  'audit.lesen',
  'einstellung.bearbeiten',
  'styleguide.lesen',
  // Lauf Gemeinde-Plattform (ADR 0026, ADR 0032, ADR 0030)
  'gruppe.lesen',
  'gruppe.bearbeiten',
  'lernende.lesen',
  'lernende.bearbeiten',
  'lernende.aufnehmen',
  'lehrplan.bearbeiten',
  'gemeindekonto.lesen',
  'gemeindekonto.bearbeiten',
  'seite.lesen',
  'seite.bearbeiten',
  'seite.veroeffentlichen',
  'menue.bearbeiten',
  'startseite.bearbeiten',
  'weiterleitung.bearbeiten',
  'wissen.bearbeiten',
  'freigabe.lesen',
  'religioes.freigeben',
  'quran.bearbeiten',
  'hadith.bearbeiten',
  'elifbe.bearbeiten',
  'rezitation.bearbeiten',
  'anzeige.bearbeiten',
  'kalender.bearbeiten',
  'hatim.bearbeiten',
  'newsletter.lesen',
  'newsletter.senden',
  'ehrenamt.bearbeiten',
  'push.ankuendigung',
  'meldung.chat.lesen',
  'meldung.chat.bearbeiten',
  'moderationsprotokoll.lesen',
  'chat.notfallpause',
  'leitung.lesen',
  'funktion.schalten',
  // Lauf Lern-App (PLAN §3.9, ADR 0040 Nr. 5, ADR 0041)
  'lernapp.lesen',
  'lernapp.bearbeiten',
  'lernapp.veroeffentlichen',
  'lernapp.sprache.pruefen',
  'lernapp.religioes.pruefen',
  'lernapp.audio.bearbeiten',
  'lernapp.statistik.lesen',
] as const;
export type Aktion = (typeof AKTIONEN)[number];

/** Aktionen, die nur für eigene Organisationsinhalte gelten (Organisationsredaktion). */
const ORGANISATIONSGEBUNDEN: ReadonlySet<Aktion> = new Set<Aktion>([
  'veranstaltung.bearbeiten',
  'veranstaltung.loeschen',
  'nachricht.bearbeiten',
  'nachricht.loeschen',
  'ankuendigung.bearbeiten',
  'ankuendigung.loeschen',
  'organisationsinhalt.bearbeiten',
  'eingang.veranstaltungsanmeldung.lesen',
  'eingang.veranstaltungsanmeldung.bearbeiten',
  'seite.bearbeiten',
  'seite.veroeffentlichen',
]);

/**
 * Kinderschutz (ADR 0026, S-11): Chat-Meldungen und Moderationsprotokoll sind NICHT über
 * „Administration darf alles“ erreichbar, sondern nur mit der Rolle `kinderschutz` (jeder Zugriff im Audit).
 * Lern-App (ADR 0040 Nr. 5): Die Administration ersetzt keine religiöse Prüfung – nur die Rolle `religioese_pruefung`.
 */
export const NIE_PER_ADMINISTRATION: ReadonlySet<Aktion> = new Set<Aktion>([
  'meldung.chat.lesen',
  'meldung.chat.bearbeiten',
  'moderationsprotokoll.lesen',
  'lernapp.religioes.pruefen',
]);

const GRUNDRECHTE: Aktion[] = [
  'verwaltung.betreten',
  'uebersicht.lesen',
  'postfach.nutzen',
  'ticket.lesen',
  'ticket.anlegen',
  'styleguide.lesen',
  'medium.lesen',
];

/** Matrix Rolle → erlaubte Aktionen. Administration darf alles (ADR 0003) – außer Chat-Inhalten (NIE_PER_ADMINISTRATION). */
export const MATRIX: Record<Rolle, ReadonlySet<Aktion>> = {
  administration: new Set<Aktion>(AKTIONEN.filter((a) => !NIE_PER_ADMINISTRATION.has(a))),
  redaktion: new Set<Aktion>([
    ...GRUNDRECHTE,
    'veranstaltung.lesen',
    'veranstaltung.bearbeiten',
    'veranstaltung.loeschen',
    'nachricht.lesen',
    'nachricht.bearbeiten',
    'nachricht.loeschen',
    'ankuendigung.lesen',
    'ankuendigung.bearbeiten',
    'ankuendigung.loeschen',
    'seiteninhalt.lesen',
    'seiteninhalt.bearbeiten',
    'organisationsinhalt.bearbeiten',
    'gebetszeiten.lesen',
    'gebetszeiten.bearbeiten',
    'medium.hochladen',
    'medium.loeschen',
    'eingang.veranstaltungsanmeldung.lesen',
    'eingang.veranstaltungsanmeldung.bearbeiten',
    'seite.lesen',
    'seite.bearbeiten',
    'seite.veroeffentlichen',
    'menue.bearbeiten',
    'startseite.bearbeiten',
    'weiterleitung.bearbeiten',
    'wissen.bearbeiten',
    'freigabe.lesen',
    'anzeige.bearbeiten',
    'kalender.bearbeiten',
    'hatim.bearbeiten',
    'newsletter.lesen',
    'newsletter.senden',
    'ehrenamt.bearbeiten',
    'push.ankuendigung',
  ]),
  organisationsredaktion: new Set<Aktion>([
    ...GRUNDRECHTE,
    'veranstaltung.lesen',
    'veranstaltung.bearbeiten',
    'veranstaltung.loeschen',
    'nachricht.lesen',
    'nachricht.bearbeiten',
    'nachricht.loeschen',
    'ankuendigung.lesen',
    'ankuendigung.bearbeiten',
    'ankuendigung.loeschen',
    'organisationsinhalt.bearbeiten',
    'medium.hochladen',
    'eingang.veranstaltungsanmeldung.lesen',
    'eingang.veranstaltungsanmeldung.bearbeiten',
    'seite.lesen',
    'seite.bearbeiten',
    'seite.veroeffentlichen',
  ]),
  bildung: new Set<Aktion>([
    ...GRUNDRECHTE,
    'kurs.lesen',
    'kurs.bearbeiten',
    'kurs.loeschen',
    'eingang.voranmeldung.lesen',
    'eingang.voranmeldung.bearbeiten',
    'medium.hochladen',
    'gruppe.lesen',
    'gruppe.bearbeiten',
    'lernende.lesen',
    'lernende.bearbeiten',
    'lernende.aufnehmen',
    'lehrplan.bearbeiten',
    'gemeindekonto.lesen',
    'gemeindekonto.bearbeiten',
    'elifbe.bearbeiten',
    'freigabe.lesen',
    // Lern-App: Redaktion der Kurse, Veröffentlichen, Audio-Studio, Statistik ohne Personenbezug (PLAN §3.9)
    'lernapp.lesen',
    'lernapp.bearbeiten',
    'lernapp.veroeffentlichen',
    'lernapp.audio.bearbeiten',
    'lernapp.statistik.lesen',
  ]),
  mitgliederverwaltung: new Set<Aktion>([
    ...GRUNDRECHTE,
    'eingang.mitgliedsantrag.lesen',
    'eingang.mitgliedsantrag.bearbeiten',
    'gemeindekonto.lesen',
  ]),
  /** Leitung (Vorstand): liest Cockpit und Übersichten, ändert nichts. */
  leitung: new Set<Aktion>([
    ...GRUNDRECHTE,
    'leitung.lesen',
    'veranstaltung.lesen',
    'nachricht.lesen',
    'ankuendigung.lesen',
    'kurs.lesen',
    'gruppe.lesen',
    'seite.lesen',
    'freigabe.lesen',
    'newsletter.lesen',
    'lernapp.lesen',
    'lernapp.statistik.lesen',
  ]),
  /** Imam/Hoca: verfasst religiöse Inhalte und gibt sie frei (ADR 0030). */
  religioese_pruefung: new Set<Aktion>([
    ...GRUNDRECHTE,
    'religioes.freigeben',
    'freigabe.lesen',
    'quran.bearbeiten',
    'hadith.bearbeiten',
    'elifbe.bearbeiten',
    'rezitation.bearbeiten',
    'wissen.bearbeiten',
    'kalender.bearbeiten',
    'medium.hochladen',
    // Lern-App: zwei Freigaben je Baustein, Prüfende bearbeiten nicht selbst (ADR 0040 Nr. 5)
    'lernapp.lesen',
    'lernapp.religioes.pruefen',
  ]),
  /** Kinderschutz: Meldungen aus Chats, Moderationsprotokoll, Notfall-Pause (S-08, S-10, S-11, S-17). */
  kinderschutz: new Set<Aktion>([
    ...GRUNDRECHTE,
    'meldung.chat.lesen',
    'meldung.chat.bearbeiten',
    'moderationsprotokoll.lesen',
    'chat.notfallpause',
  ]),
  /** Sprachprüfung (ADR 0041): liest die Lern-App und prüft Sprache – nur in den eigenen Sprachen (`darfSprachePruefen`). */
  sprachpruefung: new Set<Aktion>([...GRUNDRECHTE, 'lernapp.lesen', 'lernapp.sprache.pruefen']),
};

/** Ziel einer Aktion: Bei organisationsgebundenen Inhalten die Organisation des Inhalts (null = allgemein). */
export type Ziel = { organisation?: OrganisationKuerzel | null };

/**
 * Entscheidet, ob eine Person mit diesen Rollen die Aktion am Ziel ausführen darf.
 * Organisationsredaktion: nur, wenn das Ziel zu einer ihrer Organisationen gehört; allgemeine
 * Inhalte (organisation = null) und Listenansichten ohne Ziel sind ihr nur lesend erlaubt.
 */
/** Rechte einer Rolle; unbekannte Rollen (auch „constructor“, „__proto__“) → keine Rechte. */
function rechteVon(rolle: string): ReadonlySet<Aktion> | undefined {
  return Object.hasOwn(MATRIX, rolle) ? MATRIX[rolle as Rolle] : undefined;
}

export function darf(rollen: readonly RollenZuweisung[], aktion: Aktion, ziel?: Ziel): boolean {
  for (const z of rollen) {
    if (!rechteVon(z.rolle)?.has(aktion)) continue;
    if (z.rolle !== 'organisationsredaktion') return true;
    if (!ORGANISATIONSGEBUNDEN.has(aktion)) return true;
    if (aktion.endsWith('.lesen') && ziel === undefined) return true;
    if (ziel?.organisation && ziel.organisation === z.organisation) return true;
  }
  return false;
}

/** Organisationen, auf die eine Person bei organisationsgebundenen Aktionen beschränkt ist (null = alle). */
export function organisationsFilter(rollen: readonly RollenZuweisung[], aktion: Aktion): OrganisationKuerzel[] | null {
  const uneingeschraenkt = rollen.some((z) => z.rolle !== 'organisationsredaktion' && rechteVon(z.rolle)?.has(aktion));
  if (uneingeschraenkt) return null;
  return rollen
    .filter((z) => z.rolle === 'organisationsredaktion' && z.organisation && rechteVon(z.rolle)?.has(aktion))
    .map((z) => z.organisation as OrganisationKuerzel);
}

/**
 * Sprachprüfung der Lern-App (ADR 0041 Nr. 1): Das Recht `lernapp.sprache.pruefen` gilt nur für die eigenen Sprachen der
 * Person (`lernapp_pruefer_sprache`) – auch für die Administration, die sonst alles darf.
 */
export function darfSprachePruefen(rollen: readonly RollenZuweisung[], sprachen: readonly Sprache[], sprache: Sprache): boolean {
  return darf(rollen, 'lernapp.sprache.pruefen') && sprachen.includes(sprache);
}

/** Eingangsart → Aktionen (ADR 0005). */
export const EINGANG_AKTION = {
  kontakt: { lesen: 'eingang.kontakt.lesen', bearbeiten: 'eingang.kontakt.bearbeiten' },
  veranstaltungsanmeldung: { lesen: 'eingang.veranstaltungsanmeldung.lesen', bearbeiten: 'eingang.veranstaltungsanmeldung.bearbeiten' },
  voranmeldung: { lesen: 'eingang.voranmeldung.lesen', bearbeiten: 'eingang.voranmeldung.bearbeiten' },
  mitgliedsantrag: { lesen: 'eingang.mitgliedsantrag.lesen', bearbeiten: 'eingang.mitgliedsantrag.bearbeiten' },
  moschee_anfrage: { lesen: 'eingang.moschee_anfrage.lesen', bearbeiten: 'eingang.moschee_anfrage.bearbeiten' },
} as const satisfies Record<string, { lesen: Aktion; bearbeiten: Aktion }>;
