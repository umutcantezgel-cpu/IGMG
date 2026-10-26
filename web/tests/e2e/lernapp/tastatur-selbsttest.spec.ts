import { expect, test } from '@playwright/test';
import { fokus, pruefeSchritte } from './tastatur';

/**
 * Selbsttest des Tastatur-Helfers `fokus()` (Gegenprüfung 2 N9b) ohne die App: eigene Seite per `setContent`, mit der globalen
 * `:focus-visible`-Regel wie `globals.css`. Ein unsichtbares Optionsfeld (`sr-only`) trägt darüber einen berechneten Umriss,
 * der nicht zu sehen ist – zählen darf nur der Ring der sichtbaren Karte daneben (`peer-focus-visible`). Ohne ihn meldet
 * `pruefeSchritte` „kein sichtbarer Fokusring“, mit ihm nichts.
 */

const seite = (mitRing: boolean) => `<!doctype html><html lang="de"><head><style>
  :focus-visible { outline: 2px solid #0a3d2a; outline-offset: 2px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%);
    white-space: nowrap; border-width: 0; }
  .karte { display: flex; min-height: 56px; border: 2px solid #999; box-shadow: 0 1px 3px #0004; }
  ${mitRing ? '.peer:focus-visible + .karte { outline: 2px solid #0a3d2a; outline-offset: 2px; }' : ''}
  .ohne:focus-visible { outline: none; }
</style></head><body><main><fieldset><legend>Wähle</legend>
  <label><input type="radio" name="a" class="peer sr-only"><span class="karte">Option A</span></label>
  <label><input type="radio" name="a" class="peer sr-only"><span class="karte">Option B</span></label>
</fieldset><button type="button">Prüfen</button><button type="button" class="ohne">Ohne Ring</button></main></body></html>`;

test.describe('Tastatur-Helfer fokus()', () => {
  test('sr-only-Optionsfeld: zählt nur der Ring der sichtbaren Karte', async ({ page }) => {
    await page.setContent(seite(false));
    await page.keyboard.press('Tab');
    const ohne = await fokus(page);
    expect(ohne?.was).toContain('input[radio]');
    // das Feld selbst hat über `:focus-visible` einen berechneten Umriss – der darf nicht zählen
    expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
    expect(ohne?.ring).toBe(false);
    expect(ohne?.sichtbar).toBe(true);
    expect(pruefeSchritte([ohne!], { kennung: 'ohne' })).toEqual([`ohne ${ohne!.was}: kein sichtbarer Fokusring`]);

    await page.setContent(seite(true));
    await page.keyboard.press('Tab');
    const mit = await fokus(page);
    expect(mit?.ring).toBe(true);
    expect(mit?.b).toBeGreaterThan(2);
    expect(pruefeSchritte([mit!], { kennung: 'mit' })).toEqual([]);
  });

  test('sichtbarer Knopf: Ring der globalen Regel zählt, ein unterdrückter nicht', async ({ page }) => {
    await page.setContent(seite(true));
    const pruefen = page.getByRole('button', { name: 'Prüfen', exact: true });
    for (let i = 0; i < 5 && !(await pruefen.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    const knopf = await fokus(page);
    expect(knopf?.was).toContain('Prüfen');
    expect(knopf?.ring).toBe(true);
    await page.keyboard.press('Tab');
    const ohneRing = await fokus(page);
    expect(ohneRing?.was).toContain('Ohne Ring');
    expect(ohneRing?.ring).toBe(false);
  });
});
