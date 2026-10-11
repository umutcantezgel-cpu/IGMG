import { darf, organisationsFilter, type RollenZuweisung } from '@/lib/rechte/matrix';
import { KONTAKT_BEREICH, ORGANISATIONEN, VERWALTUNG_BEREICHE, type Organisationskuerzel } from './bereiche';

/** Eine Karte der Übersicht. `bearbeiten` entscheidet zwischen „Bearbeiten“ und „Ansehen“. */
export type Karte = {
  bereich: string;
  gruppe: 'seiten' | 'kontakt' | 'organisation';
  kuerzel?: Organisationskuerzel;
  bearbeiten: boolean;
};

/**
 * Karten der Übersicht für diese Rollen (V05). Recht über die Liste: `seiteninhalt.lesen` oder
 * `organisationsinhalt.bearbeiten`. Leer heißt: kein Zugriff. Die Organisationsredaktion sieht nur die Karten ihrer
 * Organisation(en) (K-06).
 */
export function uebersichtFuer(rollen: readonly RollenZuweisung[]): Karte[] {
  const alleBereiche = darf(rollen, 'seiteninhalt.lesen');
  const organisationen = organisationsFilter(rollen, 'organisationsinhalt.bearbeiten');
  const karten: Karte[] = [];
  if (alleBereiche) {
    const bearbeiten = darf(rollen, 'seiteninhalt.bearbeiten');
    for (const bereich of VERWALTUNG_BEREICHE) karten.push({ bereich, gruppe: 'seiten', bearbeiten });
    karten.push({ bereich: KONTAKT_BEREICH, gruppe: 'kontakt', bearbeiten });
  }
  for (const org of ORGANISATIONEN) {
    if (organisationen !== null && !organisationen.includes(org.kuerzel)) continue;
    if (organisationen === null && !alleBereiche) continue;
    karten.push({
      bereich: org.bereich,
      gruppe: 'organisation',
      kuerzel: org.kuerzel,
      bearbeiten: darf(rollen, 'organisationsinhalt.bearbeiten', { organisation: org.kuerzel }),
    });
  }
  return karten;
}
