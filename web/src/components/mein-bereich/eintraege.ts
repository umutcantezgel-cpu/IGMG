import type { Ziel } from '@/i18n/navigation';
import type { GemeindeRolle } from '@/lib/rechte/gemeinde';

/**
 * Bereiche in „Mein Bereich“ je Kontoart (ADR 0026, AUFTRAG 3.5). Noch nicht gebaute Bereiche erscheinen als
 * „bald verfügbar“ (ohne Link, nie kaputt). Bereiche hinter einem Funktionsschalter (ADR 0035) verschwinden ganz,
 * wenn er aus ist; ihre Seiten antworten dann mit 404.
 */
export type BereichSchluessel = 'start' | 'kinder' | 'unterricht' | 'lernweg' | 'gruppe' | 'lesezeichen' | 'benachrichtigungen' | 'konto';

/** Funktionsschalter, von denen ein Bereich abhängt (Teilmenge von `FUNKTIONEN` in `src/lib/funktionen.ts`). */
export type BereichFunktion = 'lernplattform' | 'push';

export type BereichEintrag = {
  schluessel: BereichSchluessel;
  ziel: Ziel | null;
  /** Nur für diese Kontoarten (leer = alle). */
  rollen: readonly GemeindeRolle[];
  gebaut: boolean;
  /** Nicht für Kinderkonten (< 16). */
  ohneKind?: boolean;
  /** Für Kinderkonten nur mit Freigabe der Eltern „Push für das Kind“ (ADR 0034). */
  kindNurMitFreigabe?: boolean;
  /** Verschwindet, wenn dieser Funktionsschalter aus ist. */
  funktion?: BereichFunktion;
};

export const BEREICHE: readonly BereichEintrag[] = [
  { schluessel: 'start', ziel: '/mein-bereich', rollen: [], gebaut: true },
  { schluessel: 'kinder', ziel: '/mein-bereich/kinder', rollen: ['eltern'], gebaut: true, funktion: 'lernplattform' },
  { schluessel: 'unterricht', ziel: '/mein-bereich/unterricht', rollen: ['lehrkraft'], gebaut: true, funktion: 'lernplattform' },
  // Lernweg (B-24) steht auf der Startseite der Schüler
  {
    schluessel: 'lernweg',
    ziel: { pathname: '/mein-bereich', hash: 'lernweg' },
    rollen: ['schueler'],
    gebaut: true,
    funktion: 'lernplattform',
  },
  // Ziel je Konto (eigene Gruppe), siehe `bereicheFuer`
  { schluessel: 'gruppe', ziel: null, rollen: ['schueler'], gebaut: true, funktion: 'lernplattform' },
  { schluessel: 'lesezeichen', ziel: '/mein-bereich/lesezeichen', rollen: [], gebaut: true },
  {
    schluessel: 'benachrichtigungen',
    ziel: '/mein-bereich/benachrichtigungen',
    rollen: [],
    gebaut: true,
    kindNurMitFreigabe: true,
    funktion: 'push',
  },
  { schluessel: 'konto', ziel: '/mein-bereich/konto', rollen: [], gebaut: true },
];

/** Lage des Kontos für die Navigation (vom Rahmen auf dem Server ermittelt). */
export type BereichLage = {
  /** Ausgeschaltete Funktionen. */
  aus?: readonly BereichFunktion[];
  /** Kinderkonto mit Elternfreigabe „Push für das Kind“. */
  kindPush?: boolean;
  /** Ziel „Meine Gruppe“ (Schüler); null = keine Gruppe (Eintrag entfällt), undefined = unbekannt (bald verfügbar). */
  gruppe?: Ziel | null;
};

/** Einträge, die ein Konto mit diesen Kontoarten sieht (Reihenfolge wie oben). */
export function bereicheFuer(rollen: readonly GemeindeRolle[], istKind = false, lage: BereichLage = {}): BereichEintrag[] {
  return BEREICHE.filter(
    (b) =>
      (b.rollen.length === 0 || b.rollen.some((r) => rollen.includes(r))) &&
      !(istKind && b.ohneKind) &&
      !(istKind && b.kindNurMitFreigabe && !lage.kindPush) &&
      !(b.funktion && lage.aus?.includes(b.funktion)) &&
      !(b.schluessel === 'gruppe' && lage.gruppe === null),
  ).map((b) => (b.schluessel === 'gruppe' ? { ...b, ziel: lage.gruppe ?? null, gebaut: Boolean(lage.gruppe) } : b));
}
