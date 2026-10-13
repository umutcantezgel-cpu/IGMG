import type { Ziel } from '@/i18n/navigation';
import type { GemeindeRolle } from '@/lib/rechte/gemeinde';

/**
 * Bereiche in „Mein Bereich“ je Kontoart (ADR 0026, AUFTRAG 3.5). Noch nicht gebaute Bereiche erscheinen als
 * „bald verfügbar“ (ohne Link, nie kaputt). Pakete, die einen Bereich bauen, setzen hier `gebaut: true`.
 */
export type BereichSchluessel = 'start' | 'kinder' | 'unterricht' | 'lernweg' | 'gruppe' | 'lesezeichen' | 'benachrichtigungen' | 'konto';

export type BereichEintrag = {
  schluessel: BereichSchluessel;
  ziel: Ziel | null;
  /** Nur für diese Kontoarten (leer = alle). */
  rollen: readonly GemeindeRolle[];
  gebaut: boolean;
  /** Nicht für Kinderkonten (< 16), z. B. Benachrichtigungen nur mit Elternfreigabe (ADR 0034). */
  ohneKind?: boolean;
};

export const BEREICHE: readonly BereichEintrag[] = [
  { schluessel: 'start', ziel: '/mein-bereich', rollen: [], gebaut: true },
  { schluessel: 'kinder', ziel: '/mein-bereich/kinder', rollen: ['eltern'], gebaut: false },
  { schluessel: 'unterricht', ziel: '/mein-bereich/unterricht', rollen: ['lehrkraft'], gebaut: false },
  { schluessel: 'lernweg', ziel: null, rollen: ['schueler'], gebaut: false },
  { schluessel: 'gruppe', ziel: null, rollen: ['schueler'], gebaut: false },
  { schluessel: 'lesezeichen', ziel: '/mein-bereich/lesezeichen', rollen: [], gebaut: true },
  { schluessel: 'benachrichtigungen', ziel: '/mein-bereich/benachrichtigungen', rollen: [], gebaut: true, ohneKind: true },
  { schluessel: 'konto', ziel: '/mein-bereich/konto', rollen: [], gebaut: true },
];

/** Einträge, die ein Konto mit diesen Kontoarten sieht (Reihenfolge wie oben). */
export function bereicheFuer(rollen: readonly GemeindeRolle[], istKind = false): BereichEintrag[] {
  return BEREICHE.filter(
    (b) => (b.rollen.length === 0 || b.rollen.some((r) => rollen.includes(r))) && !(istKind && b.ohneKind),
  );
}
