import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { KonzeptHinweis, SOFORT } from '@/components/website/KonzeptHinweis';
import { KONZEPTHINWEIS_GESEHEN } from '@/components/website/konzepthinweis-merker';

/**
 * Konzept-Hinweis (Z-08): Das Inline-Skript öffnet den Dialog vor der Hydrierung modal – steht er in einem ausgelagert
 * gestreamten Suspense-Inhalt (`<div hidden id="S:…">`), erst nachdem React ihn an seinen Platz verschoben hat. Ein
 * vorher geöffneter Dialog verlöre beim Verschieben die Modalität und erschiene erst nach der Hydrierung erneut (LCP).
 * Geprüft mit nachgebauten DOM-Teilen (Testumgebung ohne Browser).
 */
function lauf({ versteckt = false, gesehen = false } = {}) {
  let offen = false;
  let imVersteck = versteckt;
  const titel = { focus: vi.fn() };
  const dialog = {
    isConnected: true,
    get open() {
      return offen;
    },
    showModal: vi.fn(() => {
      if (offen) throw new Error('schon offen');
      offen = true;
    }),
    closest: (s: string) => (s === '[hidden]' && imVersteck ? {} : null),
    addEventListener: vi.fn(),
  };
  const beobachter: { rueckruf: () => void; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  class Beobachter {
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(public rueckruf: () => void) {
      beobachter.push(this);
    }
  }
  const wurzel = {};
  const dokument = {
    documentElement: wurzel,
    getElementById: (id: string) => (id === 'konzepthinweis' ? dialog : id === 'hinweis-titel' ? titel : null),
  };
  const speicher = { getItem: vi.fn(() => (gesehen ? '1' : null)), setItem: vi.fn() };
  new Function('document', 'localStorage', 'MutationObserver', SOFORT)(dokument, speicher, Beobachter);
  return {
    dialog,
    titel,
    beobachter,
    wurzel,
    speicher,
    verschiebe: () => {
      imVersteck = false;
    },
    oeffneVonAussen: () => {
      offen = true;
    },
  };
}

const texte = {
  titelDe: 'Titel',
  titelTr: 'Başlık',
  textDe: 'Text',
  textTr: 'Metin',
  blockDe: 'Block',
  blockTr: 'Blok',
  knopfDe: 'Verstanden',
  knopfTr: 'Anladım',
  einmalDe: 'Einmal',
  einmalTr: 'Bir kez',
  punkteDe: ['a', 'b'],
  punkteTr: ['c', 'd'],
};

describe('Konzept-Hinweis: Inline-Skript', () => {
  it('im Seitengerüst: öffnet sofort modal, Fokus auf dem Titel, Merker beim Schließen', () => {
    const z = lauf();
    expect(z.dialog.showModal).toHaveBeenCalledTimes(1);
    expect(z.titel.focus).toHaveBeenCalledTimes(1);
    expect(z.beobachter).toHaveLength(0);
    const [typ, beimSchliessen] = z.dialog.addEventListener.mock.calls[0] as [string, () => void];
    expect(typ).toBe('close');
    beimSchliessen();
    expect(z.speicher.setItem).toHaveBeenCalledWith(KONZEPTHINWEIS_GESEHEN, '1');
  });

  it('im ausgelagerten Suspense-Inhalt: öffnet erst, wenn der Dialog nicht mehr im versteckten Teil steht', () => {
    const z = lauf({ versteckt: true });
    expect(z.dialog.showModal).not.toHaveBeenCalled();
    expect(z.beobachter).toHaveLength(1);
    expect(z.beobachter[0].observe).toHaveBeenCalledWith(z.wurzel, { childList: true, subtree: true });
    // Andere Einfügungen beim Weiterlesen des Dokuments: weiter warten
    z.beobachter[0].rueckruf();
    expect(z.dialog.showModal).not.toHaveBeenCalled();
    // React verschiebt den Inhalt an seinen Platz
    z.verschiebe();
    z.beobachter[0].rueckruf();
    expect(z.dialog.showModal).toHaveBeenCalledTimes(1);
    expect(z.titel.focus).toHaveBeenCalledTimes(1);
    expect(z.beobachter[0].disconnect).toHaveBeenCalled();
  });

  it('schon anderweitig geöffnet (Hydrierung zuerst): kein zweites showModal', () => {
    const z = lauf({ versteckt: true });
    z.oeffneVonAussen();
    z.beobachter[0].rueckruf();
    expect(z.dialog.showModal).not.toHaveBeenCalled();
    expect(z.beobachter[0].disconnect).toHaveBeenCalled();
  });

  it('schon gesehen: bleibt zu, kein Beobachter', () => {
    const z = lauf({ gesehen: true });
    expect(z.dialog.showModal).not.toHaveBeenCalled();
    expect(z.dialog.addEventListener).not.toHaveBeenCalled();
    expect(z.beobachter).toHaveLength(0);
  });
});

describe('Konzept-Hinweis: Markup vom Server', () => {
  const html = renderToStaticMarkup(<KonzeptHinweis texte={texte} />);

  it('modaler Alarmdialog mit Titel und Beschreibung, Schließen ohne JavaScript', () => {
    expect(html).toMatch(/^<dialog id="konzepthinweis" role="alertdialog" aria-labelledby="hinweis-titel" aria-describedby="hinweis-text"/);
    expect(html).toContain('<h2 id="hinweis-titel" tabindex="-1"');
    expect(html).toMatch(/<form [^>]*method="dialog"/);
    expect(html).toContain('<button type="submit"');
  });

  it('enthält das Inline-Skript unverändert', () => {
    expect(html).toContain(`<script>${SOFORT}</script>`);
  });
});
