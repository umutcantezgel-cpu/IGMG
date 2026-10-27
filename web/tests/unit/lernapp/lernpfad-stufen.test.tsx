import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LernpfadStufen, naechsterTakt, type StationsKontext, verzeichnisFuerLernpfad } from '@/components/lernapp/inseln/LernpfadInsel';
import { formatiere } from '@/lib/lernapp/format';
import type { Stufe } from '@/lib/lernapp/kurse';
import { abschnitte, type PaketInhalt } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { VERZEICHNIS_FORMAT } from '@/lib/lernapp/paket/kennungen';
import type { Verzeichnis, VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * Lernpfad mit echten Kursgrößen (Stufe C N8, Z-L07): Stationen nur für die Stufe der aktuellen Einheit und für von Hand
 * aufgeklappte Stufen; die übrigen Stufen behalten Überschrift und „Stufe abgeschlossen“ und zeigen die Zahl ihrer Einheiten
 * in einem `<details>`. Jede Karte trägt `zeichnen-bei-sicht`. Testdaten: Platzhalter in eckigen Klammern.
 */

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html.replaceAll('<!-- -->', '');
}
const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;

const einheit = (stufe: Stufe, n: number): VerzeichnisEinheit => ({
  schluessel: `tr.${stufe}.e${String(n).padStart(2, '0')}`,
  stufe,
  reihenfolge: n,
  thema: { de: `[Thema ${stufe} ${n}]` },
  hash: '0'.repeat(64),
  bytes: 1000,
  lektionen: 2,
  hinweis: false,
  audio: [],
});
const V: Verzeichnis = {
  format: VERZEICHNIS_FORMAT,
  version: 1,
  kurs: 'tr-aus-de',
  kursId: 'tr',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  stand: 1,
  einheiten: [einheit('a1', 1), einheit('a1', 2), einheit('a2', 1), einheit('a2', 2), einheit('a2', 3), einheit('b1', 1)],
};
const ALLE_A1 = ['tr-aus-de.a1.e01.l01', 'tr-aus-de.a1.e01.l02', 'tr-aus-de.a1.e02.l01', 'tr-aus-de.a1.e02.l02'];

function kontext(ui: 'de' | 'ar' = 'de'): StationsKontext {
  const t = ui === 'de' ? de : ar;
  return {
    ui,
    ziffern: 'oestlich',
    kurs: 'tr-aus-de',
    adresse: `/lern-app/${ui}/tr-aus-de`,
    texte: t.lernpfad,
    stufenTexte: t.ansichten.stufen,
    titelSprache: 'de',
    ausgang: 'de',
    offline: new Map(),
    fehlt: new Set(),
    zeigeLektionen: () => undefined,
    gespeichert: async () => undefined,
    seiten: 'vollstaendig',
    seitenVorhalten: async () => true,
    seitenPruefen: async () => undefined,
    stufeGespeichert: async () => undefined,
  };
}

const stufen = (erledigt: string[], offen: Stufe[] = [], ui: 'de' | 'ar' = 'de') =>
  vorrendern(
    <LernpfadStufen
      abschnitte={abschnitte(V, new Set(erledigt), new Map<string, PaketInhalt>())}
      fertig={new Set(erledigt.length ? ['a1'] : [])}
      offen={new Set(offen)}
      onAufklappen={() => undefined}
      k={kontext(ui)}
    />,
  );

describe('Lernpfad: nur die aktuelle Stufe mit Stationen (LernpfadStufen)', () => {
  it('neues Gerät: A1 offen mit zwei Stationen, A2 und B1 zu mit der Zahl ihrer Einheiten', async () => {
    const html = await stufen([]);
    expect(anzahl(html, /lernweg-station/g)).toBe(2);
    expect(anzahl(html, /zeichnen-bei-sicht/g)).toBe(2);
    // Schätzhöhe je Karte nach der Zahl ihrer Lektionen (ohne Paket auf dem Gerät: keine, Gegenprüfung N8 Nr. 5d)
    expect(anzahl(html, /--lektionen:0/g)).toBe(2);
    expect(html).toContain('[Thema a1 1]');
    expect(html).not.toContain('[Thema a2 1]');
    expect(html).toContain('data-stufe-zu="a2"');
    expect(html).toContain('data-stufe-zu="b1"');
    expect(html).not.toContain('data-stufe-zu="a1"');
    // Knopfname mit Stufe und Handlung (Gegenprüfung N8 Nr. 5c)
    expect(html).toContain(`${formatiere(de.lernpfad.stufeZeigen, { stufe: 'A2', anzahl: 3 }, 'de')}</summary>`);
    expect(html).toContain(`${formatiere(de.lernpfad.stufeZeigen, { stufe: 'B1', anzahl: 1 }, 'de')}</summary>`);
    expect(formatiere(de.lernpfad.stufeZeigen, { stufe: 'A2', anzahl: 3 }, 'de')).toBe('A2: 3 Einheiten zeigen');
    // alle Stufen behalten ihre Überschrift
    for (const s of ['a1', 'a2', 'b1']) expect(html).toContain(`id="stufe-${s}"`);
  });

  it('A1 geschafft: A2 offen (aktuelle Einheit), A1 zu, „Stufe abgeschlossen“ bleibt sichtbar an A1', async () => {
    const html = await stufen(ALLE_A1);
    expect(anzahl(html, /lernweg-station/g)).toBe(3);
    expect(html).toContain('[Thema a2 1]');
    expect(html).not.toContain('[Thema a1 1]');
    expect(html).toContain('data-stufe-zu="a1"');
    expect(html).toContain(`data-stufe-abgeschlossen="a1"`);
    expect(html).toContain(de.ansichten.stufen.abgeschlossen);
  });

  it('von Hand aufgeklappte Stufe rendert ihre Stationen im <details>', async () => {
    const html = await stufen([], ['b1']);
    expect(anzahl(html, /lernweg-station/g)).toBe(3);
    expect(html).toContain('[Thema b1 1]');
    expect(html).toContain('data-stufe-zu="b1"');
  });

  it('große Stufe: zuerst vier Stationen, die übrigen folgen je Takt (kein langer Block beim Aufbau)', async () => {
    const gross: Verzeichnis = { ...V, einheiten: [1, 2, 3, 4, 5, 6, 7].map((n) => einheit('a1', n)) };
    const html = await vorrendern(
      <LernpfadStufen
        abschnitte={abschnitte(gross, new Set(), new Map<string, PaketInhalt>())}
        fertig={new Set()}
        offen={new Set()}
        onAufklappen={() => undefined}
        k={kontext()}
      />,
    );
    expect(anzahl(html, /lernweg-station/g)).toBe(4);
    expect(html).toContain('[Thema a1 4]');
    expect(html).not.toContain('[Thema a1 5]');
  });

  it('arabische Oberfläche: Zahl der Einheiten mit arabischer Pluralform und östlichen Ziffern', async () => {
    const html = await stufen([], [], 'ar');
    expect(html).toContain(`${formatiere(ar.lernpfad.stufeZeigen, { stufe: ar.lernpfad.stufe.a2, anzahl: 3 }, 'ar')}</summary>`);
    expect(formatiere(ar.lernpfad.stufeZeigen, { stufe: ar.lernpfad.stufe.a2, anzahl: 3 }, 'ar')).toContain('٣');
  });
});

describe('Wissenskurs in der Vorschau (L3-E22): Entwurf statt Prüfvermerk, Marke an der Einheit', () => {
  const E = 'islam.grund.e01';
  const aussagen = [{ schluessel: `${E}.l01.a01`, text: '[Aussage]', quelle: '[Quelle]' }];
  const W: Verzeichnis = {
    ...V,
    kurs: 'islam',
    kursId: 'islam',
    zielsprache: 'de',
    ausgangssprache: null,
    einheiten: [{ ...einheit('grund', 1), schluessel: E, vorschau: true }],
  };
  const paket: PaketInhalt = {
    lektionen: [
      { schluessel: `${E}.l01`, titel: '[Geprüft]', art: 'lektion' },
      { schluessel: `${E}.l02`, titel: '[Entwurf]', art: 'lektion' },
    ],
    tipps: [],
    wissen: {
      [`${E}.l01`]: { geprueftAm: '2026-10-21', kinderGeeignet: true, aussagen },
      [`${E}.l02`]: { entwurf: true, kinderGeeignet: false, aussagen: [{ ...aussagen[0]!, strittig: true }] },
      // ungültig: beides zugleich → kein Vermerk
    },
  };
  const k = { ...kontext(), kurs: 'islam' as const, adresse: '/lern-app/de/islam', ausgang: null };
  const zeichne = (p: PaketInhalt) =>
    vorrendern(
      <LernpfadStufen
        abschnitte={abschnitte(W, new Set(), new Map([[E, p]]))}
        fertig={new Set()}
        offen={new Set()}
        onAufklappen={() => undefined}
        k={k}
      />,
    );

  it('geprüfte Lektion mit Prüfvermerk, ungeprüfte mit „Entwurf“; die Einheit trägt die Text-Marke', async () => {
    const html = await zeichne(paket);
    expect(html).toContain(`data-einheit-entwurf="${E}"`);
    expect(html).toContain(de.lernpfad.einheitEntwurf);
    expect(html).toContain(`data-pruefvermerk="${E}.l01"`);
    expect(html).not.toContain(`data-pruefvermerk="${E}.l02"`);
    expect(html).toContain(`data-entwurf="${E}.l02"`);
    expect(html).toContain(de.lernpfad.entwurfVermerk);
    // Kennzeichnung bleibt: strittig, Inhalt mit Quellenzeile
    expect(html).toContain(de.lernpfad.strittig);
    expect(html).toContain(`data-lektionsinhalt="${E}.l02"`);
  });

  it('leeres Verzeichnis (Vorschau aus): erst aufräumen, dann der Platzhalter; fremdes oder fehlendes ohne Aufräumen', async () => {
    const aufraeumen = vi.fn(async () => []);
    const leer = { ...W, einheiten: [] };
    expect(await verzeichnisFuerLernpfad('islam', leer, aufraeumen)).toBeNull();
    expect(aufraeumen).toHaveBeenCalledWith(leer);
    // ein Fehler beim Aufräumen hält den Platzhalter nicht auf
    expect(await verzeichnisFuerLernpfad('islam', leer, async () => Promise.reject(new Error('[kein Speicher]')))).toBeNull();
    aufraeumen.mockClear();
    expect(await verzeichnisFuerLernpfad('islam', null, aufraeumen)).toBeNull();
    expect(await verzeichnisFuerLernpfad('tr-aus-de', leer, aufraeumen)).toBeNull();
    expect(await verzeichnisFuerLernpfad('islam', W, aufraeumen)).toBe(W);
    expect(aufraeumen).not.toHaveBeenCalled();
  });

  it('Vermerk mit Datum und Entwurf zugleich (oder ohne beides) gilt nicht – weder Prüfvermerk noch Entwurf', async () => {
    const kaputt: PaketInhalt = {
      ...paket,
      wissen: {
        [`${E}.l01`]: { geprueftAm: '2026-10-21', entwurf: true, kinderGeeignet: true, aussagen },
        [`${E}.l02`]: { kinderGeeignet: true, aussagen },
      },
    };
    const html = await zeichne(kaputt);
    expect(html).not.toContain('data-pruefvermerk=');
    expect(html).not.toContain('data-entwurf=');
  });
});

describe('Häppchen: die übrigen Stationen erst nach der ersten Eingabe oder nach einer Ruhezeit (Stufe C N9a, INP)', () => {
  const g = globalThis as unknown as Record<string, unknown>;
  afterEach(() => {
    vi.useRealTimers();
    delete g.window;
    delete g.requestAnimationFrame;
    vi.resetModules();
  });

  /** Frisches Modul (der Auslöser gilt einmal je Seite) mit einem Fenster aus `EventTarget` und Bildern über Zeitgeber. */
  async function frisch() {
    vi.useFakeTimers();
    const fenster = new EventTarget();
    g.window = fenster;
    g.requestAnimationFrame = (f: () => void) => setTimeout(f, 16);
    vi.resetModules();
    const m = await import('@/components/lernapp/inseln/LernpfadInsel');
    let fertig = false;
    void m.nachEingabeOderRuhe().then(() => {
      fertig = true;
    });
    return { m, fenster, fertig: () => fertig };
  }

  it('nach allen Takten stehen alle Stationen (je Takt vier, nie mehr als die Stufe hat)', () => {
    for (const n of [1, 4, 5, 14, 16]) {
      const takte = [naechsterTakt(0, n)];
      while (takte.at(-1)! < n) takte.push(naechsterTakt(takte.at(-1)!, n));
      expect(takte.at(-1), String(n)).toBe(n);
      expect(takte.length, String(n)).toBe(Math.ceil(n / 4));
      expect(naechsterTakt(n, n)).toBe(n);
    }
  });

  it('erste Eingabe (Klick, Taste): weiter nach dem nächsten Bild, nicht vorher', async () => {
    for (const art of ['click', 'keyup']) {
      const { fenster, fertig } = await frisch();
      await vi.advanceTimersByTimeAsync(100);
      expect(fertig(), art).toBe(false);
      fenster.dispatchEvent(new Event(art));
      expect(fertig(), art).toBe(false);
      await vi.advanceTimersByTimeAsync(20);
      expect(fertig(), art).toBe(true);
      vi.useRealTimers();
    }
  });

  it('Bildlauf und Rad lösen nichts aus (das Tippen danach träfe sonst auf die Häppchen); die Ruhezeit gilt weiter', async () => {
    const { m, fenster, fertig } = await frisch();
    for (const art of ['scroll', 'wheel']) fenster.dispatchEvent(new Event(art));
    await vi.advanceTimersByTimeAsync(m.RUHE_MS - 50);
    expect(fertig()).toBe(false);
    await vi.advanceTimersByTimeAsync(100);
    expect(fertig()).toBe(true);
  });

  it('ohne Eingabe nach der Ruhezeit; einmal je Seite, danach sofort', async () => {
    const { m, fertig } = await frisch();
    await vi.advanceTimersByTimeAsync(m.RUHE_MS - 50);
    expect(fertig()).toBe(false);
    await vi.advanceTimersByTimeAsync(100);
    expect(fertig()).toBe(true);
    let wieder = false;
    void m.nachEingabeOderRuhe().then(() => {
      wieder = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(wieder).toBe(true);
  });
});
