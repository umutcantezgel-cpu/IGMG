import { describe, expect, it, vi } from 'vitest';
import { ERSTER_TAB } from '@/components/website/quran/erster-tab';

/**
 * Erster Tab auf den Leseseiten (Z-08): Ohne Startpunkt der Fokus-Navigation übernimmt das Inline-Skript den ersten
 * Tab und fokussiert das erste (mit Umschalt das letzte) erreichbare Element – dasselbe Ziel wie der Browser, aber ohne
 * dessen Suche durch alle nicht gezeichneten Verse. Geprüft mit nachgebauten DOM-Teilen.
 */
type Ziel = {
  name: string;
  tabIndex: number;
  focus: ReturnType<typeof vi.fn>;
  matches: (s: string) => boolean;
  closest: (s: string) => object | null;
  checkVisibility: () => boolean;
};
const ziel = (name: string, { tabIndex = 0, gesperrt = false, sichtbar = true, inert = false } = {}): Ziel => ({
  name,
  tabIndex,
  focus: vi.fn(),
  matches: (s) => s === ':disabled' && gesperrt,
  closest: (s) => (s === '[inert]' && inert ? {} : null),
  checkVisibility: () => sichtbar,
});

function umgebung({ hash = '', fokus = false, modal = false, ziele = [] as Ziel[] } = {}) {
  const hoerer = new Map<string, (e?: unknown) => void>();
  const body = {};
  const dokument = {
    body,
    activeElement: fokus ? { name: 'fokus' } : body,
    addEventListener: vi.fn((typ: string, fn: (e?: unknown) => void, capture: boolean) => {
      expect(capture).toBe(true);
      hoerer.set(typ, fn);
    }),
    removeEventListener: vi.fn((typ: string) => hoerer.delete(typ)),
    querySelector: (s: string) => (s === ':modal' && modal ? {} : null),
    querySelectorAll: () => ziele,
  };
  new Function('document', 'location', ERSTER_TAB)(dokument, { hash });
  return { hoerer, dokument };
}
const taste = (zusatz: Partial<KeyboardEvent> = {}) => ({
  key: 'Tab',
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  defaultPrevented: false,
  preventDefault: vi.fn(),
  ...zusatz,
});

describe('Erster Tab ohne Dokumentsuche', () => {
  const liste = () => [
    ziel('versteckt', { sichtbar: false }),
    ziel('minus', { tabIndex: -1 }),
    ziel('gesperrt', { gesperrt: true }),
    ziel('inert', { inert: true }),
    ziel('sprunglink'),
    ziel('mitte'),
    ziel('fusszeile'),
    ziel('unsichtbar-ende', { sichtbar: false }),
  ];

  it('Tab: erstes erreichbares Element, Standardverhalten verhindert, danach entfernt', () => {
    const ziele = liste();
    const { hoerer } = umgebung({ ziele });
    expect([...hoerer.keys()].sort()).toEqual(['focusin', 'keydown', 'pointerdown']);
    const e = taste();
    hoerer.get('keydown')?.(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(ziele.find((z) => z.name === 'sprunglink')?.focus).toHaveBeenCalled();
    expect(ziele.filter((z) => z.focus.mock.calls.length).map((z) => z.name)).toEqual(['sprunglink']);
    expect(hoerer.size).toBe(0);
  });

  it('Umschalt+Tab: letztes erreichbares Element', () => {
    const ziele = liste();
    const { hoerer } = umgebung({ ziele });
    hoerer.get('keydown')?.(taste({ shiftKey: true }));
    expect(ziele.filter((z) => z.focus.mock.calls.length).map((z) => z.name)).toEqual(['fusszeile']);
  });

  it('andere Tasten und Tab mit Strg/Alt/Meta: Browser bleibt zuständig', () => {
    const ziele = liste();
    const { hoerer } = umgebung({ ziele });
    for (const e of [taste({ key: 'Enter' }), taste({ ctrlKey: true }), taste({ altKey: true }), taste({ metaKey: true })]) {
      hoerer.get('keydown')?.(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
    }
    expect(ziele.some((z) => z.focus.mock.calls.length)).toBe(false);
    expect(hoerer.has('keydown')).toBe(true);
  });

  it('Startpunkt vorhanden (Fokus, Zeiger, Anker): nichts übernehmen', () => {
    const mitFokus = umgebung({ fokus: true, ziele: liste() });
    const e = taste();
    mitFokus.hoerer.get('keydown')?.(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(mitFokus.hoerer.size).toBe(0);

    const mitZeiger = umgebung({ ziele: liste() });
    mitZeiger.hoerer.get('pointerdown')?.();
    expect(mitZeiger.hoerer.size).toBe(0);

    const mitAnker = umgebung({ hash: '#v255', ziele: liste() });
    expect(mitAnker.hoerer.size).toBe(0);
  });

  it('offener modaler Dialog: Browser bleibt zuständig', () => {
    const ziele = liste();
    const { hoerer } = umgebung({ modal: true, ziele });
    const e = taste();
    hoerer.get('keydown')?.(e);
    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(ziele.some((z) => z.focus.mock.calls.length)).toBe(false);
  });
});
