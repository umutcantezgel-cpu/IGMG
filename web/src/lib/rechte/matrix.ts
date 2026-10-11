/**
 * Rechte-Matrix (K-06, ADR 0003). Reine Daten und Funktionen – ohne Datenbank, vollständig unit-testbar.
 * Jede Server Action und jede Verwaltungsroute ruft `verlangeRecht(aktion, ziel)` (pruefe.ts) auf.
 */

export const ROLLEN = ['administration', 'redaktion', 'organisationsredaktion', 'bildung', 'mitgliederverwaltung'] as const;
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

/** Matrix Rolle → erlaubte Aktionen. Administration darf alles (ADR 0003). */
export const MATRIX: Record<Rolle, ReadonlySet<Aktion>> = {
  administration: new Set<Aktion>(AKTIONEN),
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
  ]),
  bildung: new Set<Aktion>([
    ...GRUNDRECHTE,
    'kurs.lesen',
    'kurs.bearbeiten',
    'kurs.loeschen',
    'eingang.voranmeldung.lesen',
    'eingang.voranmeldung.bearbeiten',
    'medium.hochladen',
  ]),
  mitgliederverwaltung: new Set<Aktion>([...GRUNDRECHTE, 'eingang.mitgliedsantrag.lesen', 'eingang.mitgliedsantrag.bearbeiten']),
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

/** Eingangsart → Aktionen (ADR 0005). */
export const EINGANG_AKTION = {
  kontakt: { lesen: 'eingang.kontakt.lesen', bearbeiten: 'eingang.kontakt.bearbeiten' },
  veranstaltungsanmeldung: { lesen: 'eingang.veranstaltungsanmeldung.lesen', bearbeiten: 'eingang.veranstaltungsanmeldung.bearbeiten' },
  voranmeldung: { lesen: 'eingang.voranmeldung.lesen', bearbeiten: 'eingang.voranmeldung.bearbeiten' },
  mitgliedsantrag: { lesen: 'eingang.mitgliedsantrag.lesen', bearbeiten: 'eingang.mitgliedsantrag.bearbeiten' },
  moschee_anfrage: { lesen: 'eingang.moschee_anfrage.lesen', bearbeiten: 'eingang.moschee_anfrage.bearbeiten' },
} as const satisfies Record<string, { lesen: Aktion; bearbeiten: Aktion }>;
