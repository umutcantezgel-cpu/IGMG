import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * K-12 (JS ≤ 180 kB): Regeln für Client-Code öffentlicher Seiten, die `pnpm messen` sonst erst spät zeigt
 * (FEHLERSTATISTIK A18, E-026, E-030).
 */
const WURZEL = join(import.meta.dirname, '..', '..', 'src');
function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
const OEFFENTLICH = [
  join(WURZEL, 'components', 'website'),
  join(WURZEL, 'components', 'formular'),
  join(WURZEL, 'app', '[locale]', '(website)'),
];
const client = OEFFENTLICH.flatMap(dateien).filter((p) => readFileSync(p, 'utf8').startsWith("'use client'"));

describe('Client-Code öffentlicher Seiten', () => {
  it('es gibt Client-Komponenten (Prüfung greift)', () => {
    expect(client.length).toBeGreaterThan(10);
  });

  it.each(client.map((p) => [p.slice(WURZEL.length + 1), p]))(
    '%s: kein tailwind-merge (cn), kein next-intl, keine Pfadtabelle aus next-intl',
    (_n, p) => {
      // nur Laufzeit-Importe zählen (`import type` entfällt beim Kompilieren)
      const laufzeit = readFileSync(p, 'utf8')
        .split('\n')
        .filter((z) => z.startsWith('import ') && !z.startsWith('import type '));
      expect(laufzeit.filter((z) => /from '(@\/lib\/utils|next-intl[^']*|@\/i18n\/routing)'/.test(z))).toEqual([]);
    },
  );

  it.each(client.map((p) => [p.slice(WURZEL.length + 1), p]))(
    '%s: kein islamischer Kalender im Browser (H-L01: Datumszeilen kommen vom Server)',
    (_n, p) => {
      expect(readFileSync(p, 'utf8')).not.toMatch(/from '@\/lib\/gebetszeiten\/hijri'/);
    },
  );

  it('kein next/image-Element in öffentlichem Code: Bild (Server) bzw. fertige img-Attribute statt Client-Komponente (Z-08)', () => {
    const alle = OEFFENTLICH.flatMap(dateien);
    expect(
      alle.filter((p) => /import Image from 'next\/image'/.test(readFileSync(p, 'utf8'))).map((p) => p.slice(WURZEL.length + 1)),
    ).toEqual([]);
  });

  it('nur eine Fehlergrenze (global-error.tsx), sie importiert keine gemeinsamen Seitenbausteine', () => {
    expect(() => statSync(join(WURZEL, 'app', '[locale]', 'error.tsx'))).toThrow();
    const s = readFileSync(join(WURZEL, 'app', 'global-error.tsx'), 'utf8');
    expect(s).not.toMatch(/PageHeader|Seitenkopf|Statusblock|lucide-react|@\/i18n\//);
    // H-L01: die gestaltete Ansicht (mit Seitenkopf und Zustandsgrafik) nur dynamisch, nie statisch im Bundle jeder Route
    expect(s).not.toMatch(/^import .*fehler\/FehlerAnsicht/m);
    expect(s).toMatch(/import\('@\/components\/website\/fehler\/FehlerAnsicht'\)/);
  });
});
