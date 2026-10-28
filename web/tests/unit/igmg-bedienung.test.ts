import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Kennzahl } from '@/lib/validierung/seiteninhalte/igmg';
import { elemente, montiere } from '../hilfen/haken';

/**
 * Bedienung der IGMG-Seite ohne Browser (Gegenprüfung Marktstart, Paket B): Reiter per Anker (fremde Anker wie der
 * Sprunglink #inhalt ändern nichts, ein Klick wirkt immer) und das Kennzahlfeld der Verwaltung (kurz geleerte Zahl
 * behält Art und Zusatz). Die Hooks bildet tests/hilfen/haken.ts nach; `window` ist ein kleiner Ersatz mit Anker,
 * replaceState (ohne hashchange, wie im Browser) und hashchange.
 */
vi.mock('react', async (original) => ({ ...(await original<object>()), ...(await import('../hilfen/haken')).HAKEN }));
vi.mock('next-intl', () => ({ useTranslations: () => (schluessel: string) => schluessel }));

const hoerer = new Set<() => void>();
const fenster = {
  location: { hash: '' },
  history: {
    state: null,
    replaceState: (_zustand: unknown, _titel: string, adresse: string) => {
      fenster.location.hash = adresse;
    },
  },
  addEventListener: (_art: string, f: () => void) => hoerer.add(f),
  removeEventListener: (_art: string, f: () => void) => hoerer.delete(f),
};
vi.stubGlobal('window', fenster);

const { IGMGTabs } = await import('@/components/website/igmg/IGMGTabs');
const { KennzahlFeld } = await import('@/components/verwaltung/seiteninhalte/Igmg');
const { AuswahlFeld, MehrsprachigFeld, TextFeld, ZahlFeld } = await import('@/components/verwaltung/seiteninhalte/Felder');

describe('Reiter der IGMG-Seite: Anker und Auswahl', () => {
  const props = {
    beschriftung: 'Themen',
    standard: 'ueberblick',
    reiter: [
      { schluessel: 'ueberblick', label: 'Überblick', inhalt: 'A' },
      { schluessel: 'bedeutung', label: 'Bedeutung', inhalt: 'B' },
      { schluessel: 'geschichte', label: 'Geschichte', inhalt: 'C' },
    ],
  };
  type Tabs = ReturnType<typeof montiere<typeof props>>;
  const knoepfe = (tabs: Tabs) => elemente(tabs.baum).filter((e) => e.props.role === 'tab');
  /** Gewählter Reiter und sichtbares Feld müssen übereinstimmen. */
  const aktiv = (tabs: Tabs) => {
    const gewaehlt = knoepfe(tabs).filter((e) => e.props['aria-selected'] === true);
    const sichtbar = elemente(tabs.baum).filter((e) => e.props.role === 'tabpanel' && !e.props.hidden);
    expect(gewaehlt.map((e) => e.key)).toEqual(sichtbar.map((e) => e.key));
    return gewaehlt.map((e) => e.key).join();
  };
  const klicke = (tabs: Tabs, schluessel: string) =>
    tabs.nach(() => (knoepfe(tabs).find((e) => e.key === schluessel)?.props.onClick as () => void)());
  /** Sprung zu einem Anker (Link auf der Seite, Sprunglink, Zurück): neuer Anker, dann hashchange. */
  const springe = (tabs: Tabs, anker: string) =>
    tabs.nach(() => {
      fenster.location.hash = anker;
      for (const f of hoerer) f();
    });

  beforeEach(() => {
    fenster.location.hash = '';
  });

  it('Anker beim Laden: das HTML zeigt den Standardreiter, nach dem Hydrieren den Reiter des Ankers (ohne Einblenden)', () => {
    fenster.location.hash = '#geschichte';
    const tabs = montiere(IGMGTabs, props, { hydrieren: true });
    expect(aktiv(tabs)).toBe('geschichte');
    expect(elemente(tabs.baum).find((e) => e.key === 'geschichte' && e.props.role === 'tabpanel')?.props.className).toBeUndefined();
  });

  it('Anker schon beim ersten Rendern im Browser (Navigation innerhalb der Website) wählt den Reiter', () => {
    fenster.location.hash = '#bedeutung';
    expect(aktiv(montiere(IGMGTabs, props))).toBe('bedeutung');
  });

  it('fremder Anker (Sprunglink #inhalt) lässt den per Anker oder Klick gewählten Reiter stehen', () => {
    fenster.location.hash = '#geschichte';
    const tabs = montiere(IGMGTabs, props, { hydrieren: true });
    springe(tabs, '#inhalt');
    expect(aktiv(tabs)).toBe('geschichte');
    klicke(tabs, 'bedeutung');
    springe(tabs, '#inhalt');
    expect(aktiv(tabs)).toBe('bedeutung');
    springe(tabs, '');
    expect(aktiv(tabs)).toBe('bedeutung');
  });

  it('ein Link auf der Seite zu einem Reiter wählt ihn; der Klick zurück auf den vorher gewählten Reiter wirkt', () => {
    const tabs = montiere(IGMGTabs, props, { hydrieren: true });
    klicke(tabs, 'bedeutung');
    expect([aktiv(tabs), fenster.location.hash]).toEqual(['bedeutung', '#bedeutung']);
    springe(tabs, '#geschichte');
    expect(aktiv(tabs)).toBe('geschichte');
    klicke(tabs, 'bedeutung');
    expect([aktiv(tabs), fenster.location.hash]).toEqual(['bedeutung', '#bedeutung']);
    klicke(tabs, 'ueberblick');
    expect([aktiv(tabs), fenster.location.hash]).toEqual(['ueberblick', '#ueberblick']);
  });

  it('Pfeiltaste wählt den nächsten Reiter und ersetzt den Anker', () => {
    fenster.location.hash = '#geschichte';
    const tabs = montiere(IGMGTabs, props, { hydrieren: true });
    springe(tabs, '#inhalt');
    const taste = knoepfe(tabs).find((e) => e.key === 'geschichte')?.props.onKeyDown as (e: object) => void;
    tabs.nach(() => taste({ key: 'ArrowRight', preventDefault: () => undefined }));
    expect([aktiv(tabs), fenster.location.hash]).toEqual(['ueberblick', '#ueberblick']);
  });
});

describe('Kennzahlfeld der Verwaltung', () => {
  /** Feld mit Elternzustand: jede Änderung geht wie im Formular als neuer `wert` zurück ins Feld. */
  function kennzahlFeld(start: Kennzahl | null, ohneWert: '' | null) {
    let wert = start;
    const props = () => ({ pfad: 'zahlen.moscheen', label: 'Moscheen', wert, ohneWert, onChange: (neu: Kennzahl | null) => (wert = neu) });
    const feld = montiere(KennzahlFeld, props());
    const finde = (typ: unknown) => elemente(feld.baum).find((e) => e.type === typ);
    return {
      get wert() {
        return wert;
      },
      finde,
      eingabe(typ: unknown, neu: unknown) {
        feld.nach(() => (finde(typ)?.props.onChange as (neu: unknown) => void)(neu));
        feld.mitProps(props());
      },
    };
  }

  it('Rücktaste leert die Zahl: gespeichert wäre „ohne Wert“, Art und Zusatz bleiben stehen und kommen mit der nächsten Zahl zurück', () => {
    const feld = kennzahlFeld({ wert: 12, art: 'rund', zusatz: { de: 'davon 3 im Aufbau' } }, '');
    feld.eingabe(ZahlFeld, null);
    expect(feld.wert).toBe('');
    expect(feld.finde(ZahlFeld)?.props.wert).toBeNull();
    expect(feld.finde(AuswahlFeld)?.props.wert).toBe('rund');
    expect(feld.finde(MehrsprachigFeld)?.props.wert).toEqual({ de: 'davon 3 im Aufbau' });
    feld.eingabe(ZahlFeld, 15);
    expect(feld.wert).toEqual({ wert: 15, art: 'rund', zusatz: { de: 'davon 3 im Aufbau' } });
  });

  it('Art und Zusatz bei leerer Zahl geändert gelten für die nächste Zahl', () => {
    const feld = kennzahlFeld({ wert: 700, art: 'ueber' }, null);
    feld.eingabe(ZahlFeld, null);
    expect(feld.wert).toBeNull();
    feld.eingabe(AuswahlFeld, 'rund');
    feld.eingabe(MehrsprachigFeld, { de: 'Testzusatz', tr: '' });
    expect(feld.wert).toBeNull();
    feld.eingabe(ZahlFeld, 800);
    expect(feld.wert).toEqual({ wert: 800, art: 'rund', zusatz: { de: 'Testzusatz' } });
  });

  it('ohne frühere Zahl nur das Zahlenfeld; ein alter Text bleibt bis zur ersten Zahl; neue Zahlen sind „genau“', () => {
    const leer = kennzahlFeld(null, null);
    expect(leer.finde(AuswahlFeld)).toBeUndefined();
    expect(leer.finde(MehrsprachigFeld)).toBeUndefined();
    leer.eingabe(ZahlFeld, 5);
    expect(leer.wert).toEqual({ wert: 5, art: 'genau' });

    const alt = kennzahlFeld('[Zahl fehlt: Moscheen]', '');
    expect(alt.finde(TextFeld)?.props.wert).toBe('[Zahl fehlt: Moscheen]');
    expect(alt.finde(AuswahlFeld)).toBeUndefined();
    alt.eingabe(ZahlFeld, 518);
    expect(alt.wert).toEqual({ wert: 518, art: 'genau' });
    expect(alt.finde(TextFeld)).toBeUndefined();
  });

  it('Art und Zusatz an einer Zahl ändern die Kennzahl sofort', () => {
    const feld = kennzahlFeld({ wert: 44, art: 'genau', zusatz: { de: 'Testzusatz' } }, '');
    feld.eingabe(AuswahlFeld, 'ueber');
    expect(feld.wert).toEqual({ wert: 44, art: 'ueber', zusatz: { de: 'Testzusatz' } });
    feld.eingabe(MehrsprachigFeld, { de: '' });
    expect(feld.wert).toEqual({ wert: 44, art: 'ueber' });
  });
});
