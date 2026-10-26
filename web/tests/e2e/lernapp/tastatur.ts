import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Echte Tastaturwege für die E2E der Lern-App (Stufe C N9b, KERN 4.0 §8, WCAG 2.1.1, 2.4.3, 2.4.7): Der Fokus wandert nur mit
 * Tab, Umschalt+Tab und Pfeiltasten – kein `locator.focus()`. Jeder Tab-Schritt wird festgehalten und geprüft:
 * - sichtbar: Das fokussierte Element (bei unsichtbaren Optionsfeldern die sichtbare Karte daneben bzw. das Label) liegt im
 *   Bild und trägt einen Fokusring: einen sichtbaren Umriss ≥ 2 px (der Fokusring der Lern-App, `globals.css` `:focus-visible`
 *   bzw. `peer-focus-visible:outline-2`). Ein Schatten zählt nicht – Karten tragen dauerhafte Schatten (`shadow-s1`), ein
 *   fehlender Fokusring fiele sonst nicht auf. Native Mediensteuerung (`<audio controls>`) zeichnet ihren Ring im eigenen
 *   Schatten-DOM; sie zählt als sichtbar, wenn sie im Bild liegt.
 * - Native Mediensteuerung: Tab wandert durch ihre eingebauten Knöpfe (Abspielen, Zeitleiste, Lautstärke, Menü), dabei bleibt
 *   `document.activeElement` dasselbe `<audio>`. Aufeinanderfolgende Halte darauf zählen als ein Halt; mehr als
 *   `MEDIEN_HALTE` hintereinander gelten als Fokusfalle (Tab muss das Element wieder verlassen, WCAG 2.1.2).
 * - logisch: Tab folgt der Dokumentreihenfolge (kein positives `tabindex`), Umschalt+Tab umgekehrt; im Hauptinhalt folgt sie
 *   außerdem der Leserichtung – nach unten, in einer Zeile von links nach rechts bzw. in `rtl` von rechts nach links, nach oben
 *   nur als neue Spalte in Leserichtung (zwei Listen nebeneinander). Feste und
 *   klebende Teile (Rückmeldeblatt) und der Kopf sind von der Leserichtung ausgenommen (ihre Lage hängt vom Bildlauf bzw. vom
 *   Umbruch ab), nicht von der Dokumentreihenfolge.
 */

export type FokusSchritt = {
  /** Kurzbeschreibung für Meldungen */
  was: string;
  /** Position in der Dokumentreihenfolge */
  dom: number;
  /** Rechteck des sichtbaren Ziels in Dokumentkoordinaten */
  x: number;
  y: number;
  b: number;
  h: number;
  sichtbar: boolean;
  ring: boolean;
  /** native Mediensteuerung (`HTMLMediaElement` mit `controls`): Tab-Halte im eigenen Schatten-DOM */
  nativ: boolean;
  /** in einem festen oder klebenden Teil */
  fest: boolean;
  imMain: boolean;
  rtl: boolean;
};

/** Das fokussierte Element beschreiben (`null`: Fokus auf dem Dokument). */
export function fokus(page: Page): Promise<FokusSchritt | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body || el === document.documentElement) return null;
    const alle = document.getElementsByTagName('*');
    const dom = Array.prototype.indexOf.call(alle, el) as number;
    const r0 = el.getBoundingClientRect();
    const winzig = r0.width <= 2 || r0.height <= 2;
    // unsichtbares Optionsfeld (`sr-only`, `peer`): der Ring liegt auf der Karte daneben bzw. auf dem Label
    const kandidaten = [el, ...(winzig ? [el.nextElementSibling, el.closest('label'), el.parentElement] : [])].filter(
      (k): k is HTMLElement => k instanceof HTMLElement,
    );
    const ziel =
      kandidaten.find((k) => {
        const r = k.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      }) ?? el;
    const nativ = el instanceof HTMLMediaElement && el.controls;
    // sichtbarer Umriss ≥ 2 px; durchsichtig (`outline-hidden`) zählt nicht, ein Schatten ebenso wenig (dauerhafte Kartenschatten)
    const durchsichtig = (farbe: string) => farbe === 'transparent' || /^rgba\(.*,\s*0(\.0+)?\)$/.test(farbe);
    const ring =
      nativ ||
      kandidaten.some((k) => {
        const s = getComputedStyle(k);
        return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 && !durchsichtig(s.outlineColor);
      });
    const r = ziel.getBoundingClientRect();
    const sichtbar =
      r.width > 2 &&
      r.height > 2 &&
      r.bottom > 0 &&
      r.top < innerHeight &&
      r.right > 0 &&
      r.left < innerWidth &&
      getComputedStyle(ziel).visibility !== 'hidden';
    let fest = false;
    for (let p: HTMLElement | null = ziel; p; p = p.parentElement) {
      const pos = getComputedStyle(p).position;
      if (pos === 'fixed' || pos === 'sticky') {
        fest = true;
        break;
      }
    }
    const name = (el.getAttribute('aria-label') ?? el.innerText ?? '').trim() || (el as HTMLInputElement).value || '';
    const rolle = el.getAttribute('role') ?? (el instanceof HTMLInputElement ? el.type : '');
    return {
      was: `${el.tagName.toLowerCase()}${rolle ? `[${rolle}]` : ''} „${name.replace(/\s+/g, ' ').slice(0, 50)}“`,
      dom,
      x: r.left + scrollX,
      y: r.top + scrollY,
      b: r.width,
      h: r.height,
      sichtbar,
      ring,
      nativ,
      fest,
      imMain: Boolean(el.closest('main')),
      rtl: getComputedStyle(el).direction === 'rtl',
    };
  });
}

/** Höchstens so viele Tab-Halte hintereinander in einer nativen Mediensteuerung (Chromium: Abspielen, Zeitleiste, Ton aus,
 * Lautstärke, Menü – fünf bis sechs), mehr gilt als Fokusfalle. */
export const MEDIEN_HALTE = 10;

/**
 * Aufeinanderfolgende Halte auf demselben Element nativer Mediensteuerung (gleicher `dom`-Index) zu einem Halt zusammenfassen
 * (Tab wandert durch ihre eingebauten Knöpfe im Schatten-DOM); Läufe länger als `MEDIEN_HALTE` melden eine Fokusfalle.
 */
export function fasseMedienZusammen(schritte: FokusSchritt[], kennung = ''): { halte: FokusSchritt[]; maengel: string[] } {
  const halte: FokusSchritt[] = [];
  const maengel: string[] = [];
  let lauf = 0;
  for (const s of schritte) {
    const vorig = halte.at(-1);
    if (vorig && s.nativ && vorig.nativ && s.dom === vorig.dom) {
      lauf++;
      if (lauf === MEDIEN_HALTE) maengel.push(`${kennung} ${s.was}: Tab verlässt die Mediensteuerung nicht (Fokusfalle)`);
      continue;
    }
    lauf = 1;
    halte.push(s);
  }
  return { halte, maengel };
}

/** Prüft eine Folge von Tab-Schritten: sichtbar, Fokusring, Dokumentreihenfolge und Leserichtung im Hauptinhalt. */
export function pruefeSchritte(alle: FokusSchritt[], { rueckwaerts = false, kennung = '' } = {}): string[] {
  const { halte: schritte, maengel } = fasseMedienZusammen(alle, kennung);
  for (const s of schritte) {
    if (!s.sichtbar) maengel.push(`${kennung} ${s.was}: Fokus nicht im Bild`);
    if (!s.ring) maengel.push(`${kennung} ${s.was}: kein sichtbarer Fokusring`);
  }
  for (let i = 1; i < schritte.length; i++) {
    const [a, b] = rueckwaerts ? [schritte[i]!, schritte[i - 1]!] : [schritte[i - 1]!, schritte[i]!];
    if (b.dom <= a.dom) maengel.push(`${kennung} ${a.was} → ${b.was}: gegen die Dokumentreihenfolge`);
    if (!(a.imMain && b.imMain) || a.fest || b.fest) continue;
    const ueberlappung = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    const zeile = ueberlappung > 0.5 * Math.min(a.h, b.h);
    if (zeile) {
      const vor = b.rtl ? b.x + b.b <= a.x + a.b + 2 : b.x >= a.x - 2;
      if (!vor) maengel.push(`${kennung} ${a.was} → ${b.was}: in der Zeile gegen die Leserichtung (${b.rtl ? 'rtl' : 'ltr'})`);
    } else if (b.y + b.h / 2 < a.y + a.h / 2) {
      // nach oben nur als neue Spalte in Leserichtung (zwei Listen nebeneinander, z. B. Paare): ganz hinter der vorigen
      const neueSpalte = b.rtl ? b.x + b.b <= a.x + 2 : b.x >= a.x + a.b - 2;
      if (!neueSpalte) maengel.push(`${kennung} ${a.was} → ${b.was}: springt nach oben`);
    }
  }
  return maengel;
}

const istFokussiert = (ziel: Locator) => ziel.evaluate((el) => el === document.activeElement);

/**
 * Mit Tab (bzw. Umschalt+Tab, wenn das Ziel in der Dokumentreihenfolge vor dem Fokus liegt) zum Ziel. `gruppe`: Das Ziel liegt
 * in einer Gruppe mit wanderndem Tabindex bzw. in einer Radiogruppe – Tab bis in die Gruppe, dann mit `pfeil` weiter. Jeder
 * Schritt wird geprüft (`pruefeSchritte`); Mängel sammelt `maengel`, die Schritte stehen im Ergebnis.
 */
export async function tabZu(
  page: Page,
  ziel: Locator,
  {
    gruppe,
    pfeil = 'ArrowDown',
    hoechstens = 60,
    maengel,
    kennung = '',
  }: { gruppe?: Locator; pfeil?: string; hoechstens?: number; maengel?: string[]; kennung?: string } = {},
): Promise<FokusSchritt[]> {
  await expect(ziel).toBeAttached();
  if (await istFokussiert(ziel)) return [];
  // Richtung: liegt das Ziel (bzw. die Gruppe) vor dem aktuellen Fokus?
  const rueckwaerts = await (gruppe ?? ziel).evaluate((el) => {
    const f = document.activeElement;
    if (!f || f === document.body) return false;
    return Boolean(f.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) && !el.contains(f);
  });
  const vorher = await fokus(page);
  const schritte: FokusSchritt[] = vorher ? [vorher] : [];
  const inGruppe = () => (gruppe ? gruppe.evaluate((g) => g.contains(document.activeElement)) : Promise.resolve(false));
  let n = 0;
  for (; n < hoechstens; n++) {
    await page.keyboard.press(rueckwaerts ? 'Shift+Tab' : 'Tab');
    const f = await fokus(page);
    if (f) schritte.push(f);
    if ((await istFokussiert(ziel)) || (await inGruppe())) break;
  }
  expect(n, `${kennung}: Ziel nach ${hoechstens} Tab-Schritten nicht erreicht (${schritte.map((s) => s.was).join(' › ')})`).toBeLessThan(
    hoechstens,
  );
  for (let p = 0; gruppe && !(await istFokussiert(ziel)) && p < 30; p++) await page.keyboard.press(pfeil);
  await expect(ziel).toBeFocused();
  // der Schritt vor dem Weg gehört nur als Ausgangspunkt dazu (Reihenfolge), nicht als eigener Fund
  const gepruefte = pruefeSchritte(schritte, { rueckwaerts, kennung }).filter((m) => !vorher || !m.startsWith(`${kennung} ${vorher.was}:`));
  maengel?.push(...gepruefte);
  return schritte;
}

/** Tab bis zum Ziel, dann Enter. */
export async function tabUndEnter(page: Page, ziel: Locator, optionen: Parameters<typeof tabZu>[2] = {}) {
  await tabZu(page, ziel, optionen);
  await page.keyboard.press('Enter');
}

/**
 * Option einer Radiogruppe nur mit der Tastatur wählen: Tab bis in die Gruppe (gleicher `name`; der Browser setzt den Fokus
 * auf die gewählte bzw. erste Option), dann Pfeil nach unten bis zur Option (wählt sie); steht der Fokus schon auf ihr, wählt
 * die Leertaste. Andere Bedienelemente derselben Übung (z. B. „Anhören“) zählen nicht als Gruppe.
 */
export async function waehleMitTasten(
  page: Page,
  radio: Locator,
  { maengel, kennung = '', hoechstens = 60 }: { maengel?: string[]; kennung?: string; hoechstens?: number } = {},
) {
  await expect(radio).toBeAttached();
  const name = await radio.getAttribute('name');
  const inGruppe = () =>
    page.evaluate((n) => {
      const f = document.activeElement;
      return f instanceof HTMLInputElement && f.type === 'radio' && f.name === n;
    }, name);
  if (!(await inGruppe())) {
    const rueckwaerts = await radio.evaluate((el) => {
      const f = document.activeElement;
      return Boolean(f && f !== document.body && f.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING);
    });
    const vorher = await fokus(page);
    const schritte: FokusSchritt[] = vorher ? [vorher] : [];
    let n = 0;
    for (; n < hoechstens; n++) {
      await page.keyboard.press(rueckwaerts ? 'Shift+Tab' : 'Tab');
      const f = await fokus(page);
      if (f) schritte.push(f);
      if (await inGruppe()) break;
    }
    expect(
      n,
      `${kennung}: Radiogruppe nach ${hoechstens} Tab-Schritten nicht erreicht (${schritte.map((s) => s.was).join(' › ')})`,
    ).toBeLessThan(hoechstens);
    maengel?.push(
      ...pruefeSchritte(schritte, { rueckwaerts, kennung }).filter((m) => !vorher || !m.startsWith(`${kennung} ${vorher.was}:`)),
    );
  }
  for (let p = 0; !(await radio.evaluate((el) => el === document.activeElement)) && p < 30; p++) await page.keyboard.press('ArrowDown');
  await expect(radio).toBeFocused();
  if (!(await radio.isChecked())) await page.keyboard.press('Space');
  await expect(radio).toBeChecked();
}

/** Sprunglink „Zum Inhalt“: erster Tab-Halt der Seite, sichtbar; Enter setzt den Fokus auf den Hauptinhalt. */
export async function zumInhalt(page: Page, text: string, maengel?: string[]) {
  await page.keyboard.press('Tab');
  const sprung = page.getByRole('link', { name: text, exact: true });
  await expect(sprung).toBeFocused();
  const f = await fokus(page);
  if (f && (!f.sichtbar || !f.ring)) maengel?.push(`Sprunglink: ${!f.sichtbar ? 'nicht im Bild' : 'ohne Fokusring'}`);
  await page.keyboard.press('Enter');
  await expect(page.locator('main#inhalt')).toBeFocused();
}
