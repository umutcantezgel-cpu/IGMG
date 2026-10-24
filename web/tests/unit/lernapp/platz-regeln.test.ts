import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Platz für Inseln, die ihren Inhalt erst im Browser laden (CLS ≤ 0,1, KERN §9; L8-02): Die Seite reserviert um die Insel
 * eine Bildschirmhöhe (`min-h-svh`), damit der Fuß beim Laden außerhalb des ersten Bildschirms liegt und nicht springt.
 * Lighthouse maß ohne diesen Platz auf `/lern-app/tr/koran` CLS 0,19 und auf `…/tipps?e=…` CLS 0,151 (Verschiebung: Fuß).
 */
const LERNAPP = join(import.meta.dirname, '..', '..', '..', 'src', 'app', 'lern-app', '[ui]', '[kurs]');

const FAELLE: [seite: string, inseln: string[]][] = [
  ['page.tsx', ['LernpfadInsel', 'KoranPfadInsel']],
  ['tipps/page.tsx', ['TippsInsel']],
  ['ueben/page.tsx', ['UebenInsel']],
  ['einstufung/page.tsx', ['EinstufungInsel']],
  ['wiederholen/page.tsx', ['WiederholenInsel']],
];

/** Offene JSX-Elemente vor `stelle` (einfacher Stapel über öffnende und schließende Tags, ohne selbstschließende). */
function umgebendeTags(text: string, stelle: number): string[] {
  const stapel: string[] = [];
  for (const m of text.slice(0, stelle).matchAll(/<(\/?)([A-Za-z][\w.]*)((?:[^<>"{}]|"[^"]*"|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*?)(\/?)>/g)) {
    const [, zu, name, attribute, selbst] = m;
    if (selbst) continue;
    if (zu) {
      const i = stapel.findLastIndex((s) => s.startsWith(`${name} `) || s === name);
      if (i >= 0) stapel.splice(i);
    } else stapel.push(`${name} ${attribute ?? ''}`.trim());
  }
  return stapel;
}

describe('Platz für nachladende Inseln der Lern-App (CLS)', () => {
  for (const [seite, inseln] of FAELLE)
    for (const insel of inseln)
      it(`${seite}: <${insel}> liegt in einem Element mit min-h-svh`, () => {
        const text = readFileSync(join(LERNAPP, seite), 'utf8');
        const rueckgabe = text.indexOf('return (', text.indexOf('export default'));
        const stelle = text.indexOf(`<${insel}`, rueckgabe);
        expect(stelle, `<${insel}> in ${seite}`).toBeGreaterThan(rueckgabe);
        const offen = umgebendeTags(text.slice(rueckgabe), stelle - rueckgabe);
        expect(offen.some((t) => /className="[^"]*\bmin-h-svh\b/.test(t))).toBe(true);
      });
});
