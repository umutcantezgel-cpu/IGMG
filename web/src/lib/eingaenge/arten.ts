import { EINGANG_AKTION } from '@/lib/rechte/matrix';

/**
 * Eingangsarten der Verwaltung „Eingänge“ (C08, V08, ADR 0005). Reihenfolge = Filter und Anzeige.
 * Leserecht je Art aus der Matrix (EINGANG_AKTION); die Organisationsredaktion sieht Anmeldungen nur zu Veranstaltungen
 * ihrer Organisation.
 */
export const EINGANG_ARTEN = ['voranmeldung', 'veranstaltungsanmeldung', 'mitgliedsantrag', 'kontakt', 'moschee_anfrage'] as const;
export type EingangArt = (typeof EINGANG_ARTEN)[number];
export const EINGANG_STATUS = ['neu', 'in_bearbeitung', 'erledigt', 'abgelehnt'] as const;
export type EingangStatus = (typeof EINGANG_STATUS)[number];

export const leseRecht = (art: EingangArt) => EINGANG_AKTION[art].lesen;
export const bearbeitungsRecht = (art: EingangArt) => EINGANG_AKTION[art].bearbeiten;

/** Abschlussstatus: ab hier läuft die Löschfrist (erledigtAm + Frist). */
export const ABGESCHLOSSEN: ReadonlySet<EingangStatus> = new Set(['erledigt', 'abgelehnt']);
