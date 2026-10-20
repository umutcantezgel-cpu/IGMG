import { describe, expect, it } from 'vitest';
import { AufgabeSchema } from '@/lib/lernapp/aufgaben/schema';
import { hauptVerweis, verweiseVon, vorlageTexte, AufgabeVorlageSchema, SprachEinheitDateiSchema } from '@/lib/lernapp/inhalt/schema';
import { type BauAufgabe, type BauEingabe, type BauEintrag, type BauUebersetzung, baueEinheit, lueckeIn } from '@/lib/lernapp/paket/bauen';
import { alsPfad, SYMBOLE, symbolBild, symbolFehler } from '@/lib/lernapp/symbole';
import { ar } from './hilfen/buckwalter';

/**
 * Paketbau der Typen aus L2-01 (ADR 0039 Nr. 1, PLAN §4): Vorlagen des Inhalts → Aufgaben des Spielers, geprüft gegen das
 * Schema; Bildkarten aus dem Register `symbole.json`; Hörübungen ohne Clip bleiben (Spieler: „Audio folgt“). Neutrale
 * Testwörter, Arabisch nur über Codepunkt-Escapes.
 */
const basis = { status: 'veroeffentlicht' as const, verfasstVon: null, pruefungen: [], religionsbezug: false };
const eintrag = (schluessel: string, text: string, symbol: string | null = null): BauEintrag => ({
  ...basis,
  inhaltHash: `h-${schluessel}`,
  art: schluessel.includes('.s') ? 'satz' : 'lemma',
  schluessel,
  text,
  symbol,
  quelle: 'test:paket-l2',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});
const uebersetzung = (bezug: string, text: string): BauUebersetzung => ({
  ...basis,
  inhaltHash: `u-${bezug}`,
  bezug,
  text,
  alternativen: [],
  quelle: 'test:paket-l2',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});
const aufgabe = (nr: number, typ: string, daten: object): BauAufgabe => ({
  ...basis,
  inhaltHash: `a${nr}`,
  schluessel: `tr.a1.e01.l03.a${String(nr).padStart(2, '0')}`,
  typ,
  daten,
});
const k = (x: string) => `tr.a1.e01.${x}`;

function eingabe(
  aufgaben: BauAufgabe[],
  {
    richtung = 'tr-aus-de',
    eintraege,
    ohneTon = [],
  }: { richtung?: 'tr-aus-de' | 'ar-aus-de'; eintraege?: BauEintrag[]; ohneTon?: string[] } = {},
): BauEingabe {
  const e = eintraege ?? [
    eintrag(k('w001'), 'su', 'wasserglas'),
    eintrag(k('w002'), 'ekmek'),
    eintrag(k('w003'), 'ev', 'haus'),
    eintrag(k('w004'), 'kitap'),
    eintrag(k('m001'), 'üç'),
    eintrag(k('m002'), 'uç'),
    eintrag(k('s0001'), 'Su içiyorum.'),
    eintrag(k('s0002'), 'Ev büyük.'),
  ];
  const de: Record<string, string> = {
    w001: 'Wasser',
    w002: 'Brot',
    w003: 'Haus',
    w004: 'Buch',
    s0001: 'Ich trinke Wasser.',
    s0002: 'Das Haus ist groß.',
  };
  const u = e.flatMap((x) => {
    const t = de[x.schluessel.split('.').at(-1) ?? ''];
    return t ? [uebersetzung(x.schluessel, t)] : [];
  });
  return {
    richtung,
    einheit: {
      ...basis,
      inhaltHash: 'einheit',
      schluessel: richtung === 'ar-aus-de' ? 'ar.a1.e01' : 'tr.a1.e01',
      stufe: 'a1',
      reihenfolge: 1,
      thema: { de: 'Probe' },
      symbol: null,
      nurFuerAusgang: null,
    },
    lektionen: [
      {
        ...basis,
        inhaltHash: 'lektion',
        schluessel: richtung === 'ar-aus-de' ? 'ar.a1.e01.l03' : k('l03'),
        art: 'lektion',
        ziel: {},
        aufgaben,
      },
    ],
    eintraege: new Map(e.map((x) => [x.schluessel, x])),
    uebersetzungen: new Map(u.map((x) => [x.bezug, x])),
    tipps: [],
    audio: new Map(
      e
        .filter((x) => !ohneTon.includes(x.schluessel))
        .map((x, i) => [
          // Text-Hash wie paket/hash.ts (SHA-256 des NFC-Texts); hier über den Bau selbst ermittelt
          x.text,
          {
            adresse: '/lern-app/audio/tr/tr.a1.e01-0123456789abcdef.lpa',
            buendelBytes: 9000,
            versatz: 100 * (i + 1),
            laenge: 80,
            dauerMs: 400,
            stimme: 'test:ton',
          },
        ]),
    ),
  };
}

/** Audio-Map nach Text-Hash (wie die Abfrage); `eingabe` legt sie nach Text an, hier umschlüsseln. */
async function mitHashes(e: BauEingabe): Promise<BauEingabe> {
  const { textHash } = await import('@/lib/lernapp/paket/hash');
  return { ...e, audio: new Map([...e.audio].map(([text, a]) => [textHash(text), a])) };
}

const lektion = async (e: BauEingabe) => {
  const r = baueEinheit(await mitHashes(e), { ungeprueftZeigen: false });
  expect(r?.warnungen ?? []).toEqual([]);
  return r!.paket.lektionen[0]!.aufgaben;
};

describe('Vorlagen der Typen aus L2-01', () => {
  it('Schema, Verweise, Hauptverweis und eigene Texte', () => {
    const v = AufgabeVorlageSchema.parse({
      schluessel: 'x',
      typ: 'luecke',
      ziel: k('s0001'),
      wort: 1,
      ablenker: ['a'],
      alternativen: ['b'],
    });
    expect(verweiseVon(v)).toEqual([k('s0001')]);
    expect(hauptVerweis(v)).toBe(k('s0001'));
    expect(vorlageTexte(v)).toEqual(['a', 'b']);
    const f = AufgabeVorlageSchema.parse({
      schluessel: 'f',
      typ: 'formen',
      zeilen: ['ben'],
      spalten: ['x'],
      zellen: [{ zeile: 0, spalte: 0, loesungen: ['içiyorum'] }],
    });
    expect(verweiseVon(f)).toEqual([]);
    expect(hauptVerweis(f)).toBeNull();
    expect(vorlageTexte(f)).toEqual(['ben', 'x', 'içiyorum']);
    expect(AufgabeVorlageSchema.safeParse({ schluessel: 'h', typ: 'harakat', ziel: k('w004'), varianten: [] }).success).toBe(false);
  });

  it('Inhaltsdatei: harakat nur im Kurs ar, Formen-Zellen in der Tabelle, Motiv-Schlüssel klein', () => {
    const datei = (kurs: 'tr' | 'ar', aufgaben: object[], lemmata: object[] = []) => ({
      format: 'igmg-lernapp-sprache',
      version: 1,
      kurs,
      stufe: 'a1',
      einheit: { schluessel: `${kurs}.a1.e01`, reihenfolge: 1, thema: { de: 'Probe' } },
      lemmata,
      lektionen: [{ schluessel: `${kurs}.a1.e01.l03`, aufgaben }],
    });
    const harakat = (kurs: 'tr' | 'ar') => ({
      schluessel: `${kurs}.a1.e01.l03.a01`,
      typ: 'harakat',
      ziel: `${kurs}.a1.e01.w004`,
      varianten: ['x'],
    });
    expect(SprachEinheitDateiSchema.safeParse(datei('ar', [harakat('ar')])).success).toBe(true);
    expect(SprachEinheitDateiSchema.safeParse(datei('tr', [harakat('tr')])).success).toBe(false);
    const formen = {
      schluessel: 'tr.a1.e01.l03.a01',
      typ: 'formen',
      zeilen: ['ben'],
      spalten: ['x'],
      zellen: [{ zeile: 1, spalte: 0, loesungen: ['a'] }],
    };
    expect(SprachEinheitDateiSchema.safeParse(datei('tr', [formen])).success).toBe(false);
    const lemma = (symbol: string) => ({ schluessel: 'tr.a1.e01.w001', lemma: 'ev', symbol, quelle: 'test:x', lizenz: 'CC-BY-SA-4.0' });
    const frei = { schluessel: 'tr.a1.e01.l03.a02', typ: 'frei', ziel: 'tr.a1.e01.w001', nach: 'ziel' };
    expect(SprachEinheitDateiSchema.safeParse(datei('tr', [frei], [lemma('haus')])).success).toBe(true);
    expect(SprachEinheitDateiSchema.safeParse(datei('tr', [frei], [lemma('Haus')])).success).toBe(false);
  });

  it('Lücke im Satz: Wort ohne Satzzeichen am Rand, Text davor und danach', () => {
    expect(lueckeIn('Su içiyorum.', 1)).toEqual({ vor: 'Su ', wort: 'içiyorum', nach: '.' });
    expect(lueckeIn('„Ev büyük“, dedi.', 0)).toEqual({ vor: '„', wort: 'Ev', nach: ' büyük“, dedi.' });
    expect(lueckeIn('Su içiyorum.', 2)).toBeNull();
    expect(lueckeIn('Su — içiyorum.', 1)).toBeNull();
    const satz = `${ar('>anaA')} ${ar('>a$orabu')} ${ar("AlomaA'a")}.`;
    expect(lueckeIn(satz, 1)).toEqual({ vor: `${ar('>anaA')} `, wort: ar('>a$orabu'), nach: ` ${ar("AlomaA'a")}.` });
  });
});

describe('Paketbau der Typen aus L2-01', () => {
  it('alle Vorlagen ergeben gültige Aufgaben des Spielers (Ziel vorn, Karten je Richtung)', async () => {
    const aufgaben = await lektion(
      eingabe([
        aufgabe(1, 'bild_wort', { ziel: k('w003'), ablenker: [k('w004'), k('w001')] }),
        aufgabe(2, 'frei', { ziel: k('w002'), nach: 'ziel', alternativen: ['ekmeği'] }),
        aufgabe(3, 'frei', { ziel: k('w002'), nach: 'ausgang' }),
        aufgabe(4, 'hoeren_waehlen', { anweisung: 'waehleBedeutung', ziel: k('w001'), ablenker: [k('w002'), k('w003')] }),
        aufgabe(5, 'hoeren_schreiben', { ziel: k('w004') }),
        aufgabe(6, 'minimalpaare', { ziel: k('m001'), ablenker: [k('m002')] }),
        aufgabe(7, 'luecke', { ziel: k('s0001'), wort: 1, ablenker: ['içiyorsun', 'içiyor'] }),
        aufgabe(8, 'satzbau', { ziel: k('s0002') }),
        aufgabe(9, 'formen', {
          lemma: k('w001'),
          zeilen: ['ben', 'sen'],
          spalten: ['şimdiki zaman'],
          zellen: [
            { zeile: 0, spalte: 0, loesungen: ['içiyorum'], vorgabe: true },
            { zeile: 1, spalte: 0, loesungen: ['içiyorsun'] },
          ],
        }),
      ]),
    );
    for (const a of aufgaben) expect(AufgabeSchema.safeParse(a).success, a.typ).toBe(true);
    expect(aufgaben.map((a) => a.typ)).toEqual([
      'bild_wort',
      'frei',
      'frei',
      'hoeren_waehlen',
      'hoeren_schreiben',
      'minimalpaare',
      'luecke',
      'satzbau',
      'formen',
    ]);
    const [bild, freiZiel, freiAusgang, hw, hs, mp, lw, sb, fo] = aufgaben as never as Record<string, never>[];
    expect(bild).toMatchObject({
      karten: ['tr-aus-de:tr.a1.e01.w003'],
      bild: { symbol: 'haus', pfade: SYMBOLE.get('haus')!.elemente.map(alsPfad) },
      optionen: [
        { text: 'ev', sprache: 'tr' },
        { text: 'kitap', sprache: 'tr' },
        { text: 'su', sprache: 'tr' },
      ],
      richtig: 0,
      beschreibung: { text: 'Haus', sprache: 'de' },
    });
    expect(freiZiel).toMatchObject({ vorgabe: { text: 'Brot', sprache: 'de' }, sprache: 'tr', loesungen: ['ekmek', 'ekmeği'] });
    expect(freiAusgang).toMatchObject({ vorgabe: { text: 'ekmek', sprache: 'tr' }, sprache: 'de', loesungen: ['Brot'] });
    expect(hw).toMatchObject({
      hoeren: { text: 'su', audio: { versatz: 100 } },
      optionen: [{ text: 'Wasser' }, { text: 'Brot' }, { text: 'Haus' }],
    });
    expect(hs).toMatchObject({ hoeren: { text: 'kitap' }, loesungen: ['kitap'] });
    expect(mp).toMatchObject({
      hoeren: { text: 'üç' },
      optionen: [
        { text: 'üç', sprache: 'tr' },
        { text: 'uç', sprache: 'tr' },
      ],
    });
    expect((mp as unknown as { optionen: object[] }).optionen[0]).not.toHaveProperty('audio');
    expect(lw).toMatchObject({
      vor: 'Su ',
      nach: '.',
      optionen: ['içiyorum', 'içiyorsun', 'içiyor'],
      loesungen: ['içiyorum'],
      hilfe: { text: 'Ich trinke Wasser.' },
    });
    expect(sb).toMatchObject({ kacheln: ['Ev', 'büyük'], loesungen: ['Ev büyük.'], vorgabe: { text: 'Das Haus ist groß.' } });
    expect(fo).toMatchObject({ karten: ['tr-aus-de:tr.a1.e01.w001'], titel: { text: 'su', sprache: 'tr' }, sprache: 'tr' });
  });

  it('Hörübung ohne Clip bleibt im Paket (ohne audio); Bildkarte ohne Motiv fällt mit Warnung weg', async () => {
    const e = await mitHashes(
      eingabe(
        [
          aufgabe(1, 'hoeren_waehlen', { anweisung: 'waehleGehoertes', ziel: k('w001'), ablenker: [k('w002')] }),
          aufgabe(2, 'bild_wort', { ziel: k('w002'), ablenker: [k('w004')] }),
        ],
        { ohneTon: [k('w001')] },
      ),
    );
    const r = baueEinheit(e, { ungeprueftZeigen: false })!;
    const [hw] = r.paket.lektionen[0]!.aufgaben;
    expect(hw).toMatchObject({ typ: 'hoeren_waehlen', hoeren: { text: 'su', sprache: 'tr' } });
    expect((hw as { hoeren: object }).hoeren).not.toHaveProperty('audio');
    expect(r.paket.lektionen[0]!.aufgaben).toHaveLength(1);
    expect(r.warnungen).toEqual(['tr.a1.e01.l03.a02: Lemma ohne Motiv']);
  });

  it('harakat nur mit Zielsprache Arabisch; Varianten mit gleichem Gerüst, Bedeutung als Hilfe', async () => {
    const kitab = ar('kitaAb');
    const eintraege = [eintrag('ar.a1.e01.w004', kitab)];
    const e = eingabe(
      [{ ...aufgabe(1, 'harakat', { ziel: 'ar.a1.e01.w004', varianten: [ar('kataAb'), ar('kitiAb')] }), schluessel: 'ar.a1.e01.l03.a01' }],
      {
        richtung: 'ar-aus-de',
        eintraege,
      },
    );
    e.uebersetzungen = new Map([['ar.a1.e01.w004', uebersetzung('ar.a1.e01.w004', 'Buch')]]);
    const [ha] = await lektion(e);
    expect(ha).toMatchObject({
      typ: 'harakat',
      anweisung: 'waehleVokalisierung',
      vorgabe: { text: 'Buch', sprache: 'de' },
      optionen: [
        { text: kitab, sprache: 'ar' },
        { text: ar('kataAb'), sprache: 'ar' },
        { text: ar('kitiAb'), sprache: 'ar' },
      ],
      richtig: 0,
    });
    // dieselbe Vorlage in einer anderen Zielsprache ergibt nichts
    const tr = await mitHashes(eingabe([aufgabe(1, 'harakat', { ziel: k('w004'), varianten: ['kitab'] })]));
    expect(baueEinheit(tr, { ungeprueftZeigen: false })).toBeNull();
  });
});

describe('Register der Bildkarten', () => {
  it('Motive geprüft geladen; nur Gegenstände aus Lucide (ISC); ohne Freigabe nur im Testkurs', () => {
    expect(SYMBOLE.size).toBeGreaterThanOrEqual(50);
    for (const [name, e] of SYMBOLE) {
      expect(e.quelle, name).toMatch(/^lucide:[a-z0-9-]+@1\.55\.0$/);
      expect(e.lizenz).toBe('ISC');
    }
    // keine Menschen, Tiere, Gesichter oder religiösen Zeichen in den Lucide-Namen (Inhaltsleitfaden §5)
    const verboten =
      /user|person|baby|smile|face|frown|laugh|angry|eye|hand|footprint|bird|cat|dog|fish|rabbit|snail|turtle|bug|squirrel|church|moon|cross|star|heart|skull|wine|beer|cigarette|dice|spade|club|sword|gun|crosshair|guitar|drum|piano|music|flag|map/;
    for (const e of SYMBOLE.values()) expect(verboten.test(e.quelle), e.quelle).toBe(false);
    expect(symbolBild('haus')).toEqual({ symbol: 'haus', pfade: SYMBOLE.get('haus')!.elemente.map(alsPfad) });
    // Lucide liefert auch Kreise, Rechtecke und Linien; im Paket stehen nur Pfade
    expect(SYMBOLE.get('uhr')!.elemente.some((e) => e.art === 'circle')).toBe(true);
    expect(symbolBild('uhr')!.pfade.every((d) => /^M/.test(d))).toBe(true);
    expect(symbolBild('gibt-es-nicht')).toBeNull();
    expect(symbolFehler('haus', 'test:lernapp-testkurs')).toBeNull();
    expect(symbolFehler('haus', 'ki:lauf-1')).toMatch(/ohne Freigabe/);
    expect(symbolFehler('gibt-es-nicht', 'test:x')).toMatch(/unbekannt/);
  });
});
