import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EIGENE_EINWILLIGUNG_FRIST_TAGE, einwilligungsLage } from '@/lib/konto/sechzehn';
import { FEHLER, istKritisch, sprachlichGesperrt } from '@/lib/lernapp/freigabe';
import { elternSehenLernwoche } from '@/lib/lernapp/gruppe/regeln';

/**
 * Handbücher und GO-LIVE der Lern-App gegen den Code (Gegenprüfung L8-03-04, Mängel 2–4): Was die Texte über Verhalten sagen,
 * prüft der Test am Code, damit beide nicht wieder auseinanderlaufen.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
const lies = (pfad: string) => readFileSync(join(WEB, pfad), 'utf8').replace(/\s+/g, ' ');

describe('Handbuch Lehrkräfte: Lernwoche der Eltern', () => {
  it('Eltern sehen sie bis 30 Tage nach dem 16. Geburtstag (Übergang), danach nicht mehr', () => {
    expect(EIGENE_EINWILLIGUNG_FRIST_TAGE).toBe(30);
    expect(elternSehenLernwoche(einwilligungsLage('2026-10-01', '2026-09-30'))).toBe(true);
    expect(elternSehenLernwoche(einwilligungsLage('2026-10-01', '2026-10-30'))).toBe(true);
    expect(elternSehenLernwoche(einwilligungsLage('2026-10-01', '2026-10-31'))).toBe(false);
    const text = lies('docs/handbuch/lernapp-lehrkraefte.md');
    expect(text).toContain(`bis ${EIGENE_EINWILLIGUNG_FRIST_TAGE} Tage nach dem 16. Geburtstag (Übergang)`);
    expect(text).not.toMatch(/Lernwoche[^.]*, bis es 16 ist\./);
  });
});

describe('Handbuch Sprachprüfung: Abgelehnt und Kommentar', () => {
  const pruefung = (urteil: 'ok' | 'korrektur' | 'abgelehnt', kategorie: (typeof FEHLER)[number] | null) => ({
    pruefendeId: 'p1',
    pruefendeRollen: ['sprachpruefung'],
    art: 'sprache_ziel' as const,
    urteil,
    inhaltHash: 'h',
    kategorie,
    am: new Date(0),
  });

  it('„Abgelehnt“ verbirgt mit jeder Kategorie, „Korrektur“ nur mit einer kritischen', () => {
    for (const k of FEHLER) {
      expect(sprachlichGesperrt('h', [pruefung('abgelehnt', k)]), k).toBe(true);
      expect(sprachlichGesperrt('h', [pruefung('korrektur', k)]), k).toBe(istKritisch(k));
    }
    expect(lies('docs/handbuch/lernapp-sprachpruefung.md')).toContain(
      '**„Abgelehnt“** verbirgt den Eintrag ebenso sofort wie ein kritisches Urteil – mit jeder Kategorie, auch einer leichten.',
    );
  });

  it('der Religionswächter prüft auch den Kommentar; das Handbuch rät, die Formel nicht zu zitieren', () => {
    const aktion = lies('src/server/actions/lernapp-sprachpruefung.ts');
    expect(aktion).toMatch(
      /\['korrektur', korrektur\], \['kommentar', kommentar\],? \] as const\) \{ const befund = text \? waechterBefund\(/,
    );
    expect(lies('docs/handbuch/lernapp-sprachpruefung.md')).toContain('**ohne die Formel oder die Wortfolge zu zitieren**');
  });
});

describe('GO-LIVE: „Fehler melden“ braucht G1', () => {
  it('die Melde-Route antwortet ohne Datenbank mit 404 und ohne ALTCHA-Geheimnis mit 503; GO-LIVE nennt G1', () => {
    const route = lies('src/app/api/lernapp/meldung/route.ts');
    expect(route).toContain("if (!datenbankVerfuegbar() || !(await funktionAn('lernapp_meldungen'))) return antwort(404);");
    expect(route).toContain("if (!altchaBereit()) return antwort(503, 'nicht_eingerichtet');");
    const zeile = readFileSync(join(WEB, '..', '_lernapp', 'GO-LIVE.md'), 'utf8')
      .split('\n')
      .find((z) => z.startsWith('| `lernapp_meldungen` |'));
    expect(zeile).toContain('`ALTCHA_GEHEIMNIS` (`web/docs/GO-LIVE.md` G1)');
    expect(zeile).toContain('**offen: G1.**');
    expect(zeile).not.toMatch(/\| erledigt/);
  });
});
