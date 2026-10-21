import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testkursQuellen, TESTAUDIO_VERZEICHNIS } from '../../../drizzle/seeds/lernapp-test';
import { alsJsonl, audioListe, fehlende, leseJsonl, vertonbareTexte, waechterTrifft } from '@/lib/lernapp/audio/liste';
import { manifestFehler } from '@/lib/lernapp/audio/import';
import {
  clipsAusBuendel,
  ergaenzeManifest,
  leeresManifest,
  leseManifest,
  ManifestFehler,
  manifestText,
  type NeuerClip,
} from '@/lib/lernapp/audio/manifest';
import {
  GRENZEN,
  kFilter,
  lautheit,
  miss,
  mitRueckerkennung,
  nichtStill,
  physischeFehler,
  silben,
  treffer,
  urteile,
  zahlenAlsWoerter,
  zahlwort,
} from '@/lib/lernapp/audio/pruefung';
import { ALLE_STIMMEN, manifestStimme, STIMMEN, THORSTEN } from '@/lib/lernapp/audio/stimmen';
import type { ImportQuelle } from '@/lib/lernapp/inhalt/import';
import { pruefeAudio } from '@/lib/lernapp/inhalt/pruefer/audio';
import { leereInhalte } from '@/lib/lernapp/inhalt/pruefer/dateien';
import type { Waechter } from '@/lib/lernapp/inhalt/religion';
import { AusspracheDateiSchema, type AudioManifestDatei, type SprachEinheitDatei } from '@/lib/lernapp/inhalt/schema';
import { leseBuendelKopf } from '@/lib/lernapp/paket/buendel';
import { sha256Hex, textHash } from '@/lib/lernapp/paket/hash';
import { ABSCHNITTE } from '@/app/[locale]/(website)/quellen/verzeichnis';

/**
 * Sprachausgabe-Kette L3-05 (ADR 0039 Nr. 3, 6, 7; PLAN §6.8; KERN 4.0 §4): Arbeitsliste mit den Riegeln „nie vertont“,
 * Bündelbau und Manifest, Prüfkette (BS.1770, Rand-Stille, Silbenrate, Urteile), Prüfer und Stimmenregister.
 * Testdaten: neutrale Alltagswörter des Testkurses, synthetische Töne aus den Testbündeln, ein erfundenes Wächter-Wort.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
const STIMME = THORSTEN.id;

/** Wächter-Attrappe: das neutrale Wort „Zebra“ gilt als Lexikon-Treffer (die echten Einträge stehen in waechter/kern.mjs). */
const WAECHTER = {
  lexikon: { arabisch: [], latein: [{ name: 'Test', muster: /(?<![\p{L}\p{N}])zebra(?![\p{L}\p{N}])/u }] },
  index: { koran: new Map(), hadith: new Map() },
} as unknown as Waechter;

/** Sprachkurs-Datei aus dem Testkurs, abgewandelt. */
function datei(aendere: (d: SprachEinheitDatei) => void, pfad = 'sprache/de/a1/de.a1.e01.json'): ImportQuelle {
  const roh = JSON.parse(testkursQuellen().find((q) => q.pfad === 'testkurs/sprache/de/a1/de.a1.e01.json')!.text) as SprachEinheitDatei;
  aendere(roh);
  return { pfad, text: JSON.stringify(roh) };
}

describe('Arbeitsliste (audio-liste)', () => {
  it('Testkurs de: alle Lemmata und Sätze, je Text ein Eintrag in der Einheit, mit Stimme und Wortzahl', () => {
    const l = audioListe(testkursQuellen(), 'de', { waechter: WAECHTER, manifest: null })!;
    expect(l.zeilen).toHaveLength(16);
    expect(l.vertonbar).toBe(16);
    expect(new Set(l.zeilen.map((z) => z.einheit))).toEqual(new Set(['de.a1.e01']));
    expect(l.zeilen.every((z) => z.stimme === STIMME && z.textHash === textHash(z.text))).toBe(true);
    expect(l.zeilen.find((z) => z.text === 'Das Haus ist groß.')).toMatchObject({ art: 'satz', woerter: 4 });
    expect(l.zeilen.find((z) => z.text === 'Wasser')).toMatchObject({ art: 'lemma', woerter: 1 });
  });

  it('tr und ar: keine freigegebene Stimme – keine Liste („Audio folgt“)', () => {
    expect(audioListe(testkursQuellen(), 'tr', { waechter: WAECHTER, manifest: null })).toBeNull();
    expect(audioListe(testkursQuellen(), 'ar', { waechter: WAECHTER, manifest: null })).toBeNull();
    expect(STIMMEN).toEqual({ de: THORSTEN, tr: null, ar: null });
  });

  it('nie vertont: Religionsbezug (auch gleichlautend ohne Kennzeichen) und Wächter-Treffer; Entwürfe schon', () => {
    const mitBezug = datei((d) => {
      d.saetze[0]!.religionsbezug = true; // „Ich trinke Wasser.“
      d.saetze[1]!.text = 'Das Zebra ist groß.';
    });
    const e01 = datei(() => {});
    const zweite: ImportQuelle = {
      pfad: 'sprache/de/a1/de.a1.e02.json',
      text: e01.text.replaceAll('de.a1.e01', 'de.a1.e02').replace('"reihenfolge":1', '"reihenfolge":2'),
    };
    const { texte, ausgeschlossen } = vertonbareTexte([mitBezug, zweite], 'de', { waechter: WAECHTER });
    const hashes = new Set(texte.map((t) => t.textHash));
    expect(hashes.has(textHash('Ich trinke Wasser.'))).toBe(false); // in e02 ohne Kennzeichen, trotzdem nie
    expect(hashes.has(textHash('Das Zebra ist groß.'))).toBe(false);
    expect(ausgeschlossen).toEqual(
      expect.arrayContaining([
        { schluessel: 'de.a1.e01.s0001', grund: 'religionsbezug' },
        { schluessel: 'de.a1.e01.s0002', grund: 'waechter' },
      ]),
    );
    // Texte aus beiden Einheiten liegen im Bündel der ersten
    expect(texte.find((t) => t.text === 'Wasser')?.einheit).toBe('de.a1.e01');
    expect(texte.find((t) => t.text === 'Das Haus ist groß.')?.einheit).toBe('de.a1.e02');

    // Entwürfe werden schon vertont (ein neuer Text ergibt einen neuen Hash); gesperrt gibt es nur in der Datenbank
    const entwurf = datei((d) => {
      d.status = 'entwurf';
    });
    expect(vertonbareTexte([entwurf], 'de', { waechter: null }).texte).toHaveLength(16);
  });

  it('nur Sprachkurs-Dateien der Zielsprache: Übersetzungen, Wissen und Koran-Pfad sind keine Quelle', () => {
    const quellen = testkursQuellen();
    const nurUebersetzung = quellen.filter((q) => q.pfad.includes('/uebersetzung/'));
    expect(vertonbareTexte(nurUebersetzung, 'de', { waechter: null }).texte).toEqual([]);
    const fremd: ImportQuelle[] = [
      { pfad: 'islam/grund/islam.grund.e01.json', text: '{"format":"unbekannt"}' },
      { pfad: 'koran/pfad.json', text: '{"format":"unbekannt"}' },
    ];
    expect(vertonbareTexte([...quellen, ...fremd], 'de', { waechter: null }).texte).toHaveLength(16);
  });

  it('fehlend: ohne Clip der aktuellen Stimme und ohne menschliche Aufnahme; ältere Stimme zählt nicht', () => {
    const { texte } = vertonbareTexte(testkursQuellen(), 'de', { waechter: null });
    const clip = (t: string, stimme: string) => ({
      textHash: textHash(t),
      buendel: 'lernapp/audio/de/de.a1.e01-0123456789abcdef.lpa',
      versatz: 100,
      laenge: 10,
      dauerMs: 500,
      stimme,
      sha256: 'a'.repeat(64),
      format: 'webm-opus' as const,
    });
    const m: AudioManifestDatei = {
      ...leeresManifest('de'),
      clips: [
        clip('Wasser', STIMME),
        clip('Brot', 'mensch:00000000-0000-4000-8000-000000000001'),
        clip('Haus', 'tts:coqui-vits-thorsten-onnx@0000000000000000'),
      ],
    };
    const offen = fehlende(texte, m, STIMME).map((t) => t.text);
    expect(offen).not.toContain('Wasser');
    expect(offen).not.toContain('Brot');
    expect(offen).toContain('Haus');
    expect(offen).toHaveLength(14);
  });

  it('JSONL: Hin und zurück; ein falscher textHash bricht ab', () => {
    const l = audioListe(testkursQuellen(), 'de', { waechter: null, manifest: null })!;
    const text = alsJsonl(l.zeilen);
    expect(text.split('\n').filter(Boolean)).toHaveLength(16);
    expect(leseJsonl(text)).toEqual(l.zeilen.map((z) => ({ ...z })));
    expect(() => leseJsonl(text.replace(l.zeilen[0]!.textHash, 'b'.repeat(64)))).toThrow(/textHash/);
  });

  it('Wächter-Treffer über Lexikon und Wortgrenzen', () => {
    expect(waechterTrifft('Ein Zebra.', WAECHTER)).toBe(true);
    expect(waechterTrifft('Zebrastreifen', WAECHTER)).toBe(false);
  });
});

/** Synthetische Clips (Töne) aus dem Testbündel de. */
function testClips(): { textHash: string; daten: Uint8Array }[] {
  const ordner = join(TESTAUDIO_VERZEICHNIS, 'de');
  const bytes = new Uint8Array(
    readFileSync(
      join(
        ordner,
        readdirSync(ordner).find((d) => d.endsWith('.lpa'))!,
      ),
    ),
  );
  return leseBuendelKopf(bytes, bytes.length).clips.map((c) => ({
    textHash: c.textHash,
    daten: bytes.slice(c.versatz, c.versatz + c.laenge),
  }));
}

describe('Bündel und Manifest (audio-manifest)', () => {
  const toene = testClips();
  const neu = (i: number, einheit = 'de.a1.e01', stimme = STIMME): NeuerClip => ({ ...toene[i]!, einheit, stimme });
  const stimmen = [manifestStimme(THORSTEN)];
  const keinAlt = () => {
    throw new Error('nicht erwartet');
  };

  it('aus leerem Manifest: ein Bündel je Einheit und Stimme, Versätze und SHA-256 je Clip, Schema und Text', () => {
    const { manifest, buendel, alteBuendel } = ergaenzeManifest({
      alt: leeresManifest('de'),
      neu: [neu(0), neu(1), neu(2, 'de.a1.e02')],
      stimmen,
      alteClips: keinAlt,
    });
    expect(buendel.map((b) => [b.einheit, b.clips])).toEqual([
      ['de.a1.e01', 2],
      ['de.a1.e02', 1],
    ]);
    expect(alteBuendel).toEqual([]);
    for (const c of manifest.clips) {
      const b = buendel.find((x) => x.schluessel === c.buendel)!;
      expect(sha256Hex(b.bytes.subarray(c.versatz, c.versatz + c.laenge))).toBe(c.sha256);
      expect(b.datei).toBe(`${b.einheit}-${b.sha256.slice(0, 16)}.lpa`);
    }
    expect([...manifest.clips].map((c) => c.textHash)).toEqual([...manifest.clips.map((c) => c.textHash)].sort());
    expect(manifest.stimmen).toEqual(stimmen);
    expect(leseManifest(manifestText(manifest))).toEqual(manifest);
    expect(
      manifestText(manifest)
        .split('\n')
        .filter((z) => z.includes('"textHash"')),
    ).toHaveLength(3);
  });

  it('Ergänzen: nur das betroffene Bündel neu (mit den alten Clips), das alte wird genannt; gleiche Eingabe → gleiche Bytes', () => {
    const erst = ergaenzeManifest({ alt: leeresManifest('de'), neu: [neu(0), neu(2, 'de.a1.e02')], stimmen, alteClips: keinAlt });
    const lokal = new Map(erst.buendel.map((b) => [b.schluessel, b.bytes]));
    const gelesen: string[] = [];
    const dann = ergaenzeManifest({
      alt: erst.manifest,
      neu: [neu(1)],
      stimmen,
      alteClips: (s, clips) => {
        gelesen.push(s);
        return clipsAusBuendel(lokal.get(s)!, clips);
      },
    });
    const e01 = erst.buendel.find((b) => b.einheit === 'de.a1.e01')!;
    const e02 = erst.buendel.find((b) => b.einheit === 'de.a1.e02')!;
    expect(gelesen).toEqual([e01.schluessel]);
    expect(dann.buendel.map((b) => [b.einheit, b.clips])).toEqual([['de.a1.e01', 2]]);
    expect(dann.alteBuendel).toEqual([e01.schluessel]);
    expect(dann.manifest.clips.filter((c) => c.buendel === e02.schluessel)).toHaveLength(1);
    expect(dann.manifest.clips).toHaveLength(3);
    // dasselbe noch einmal: Bündel bytegleich, also kein altes
    const nochmal = ergaenzeManifest({
      alt: dann.manifest,
      neu: [neu(1)],
      stimmen,
      alteClips: (s, clips) => clipsAusBuendel(dann.buendel.find((b) => b.schluessel === s)!.bytes, clips),
    });
    expect(nochmal.alteBuendel).toEqual([]);
    expect(nochmal.manifest).toEqual(dann.manifest);
  });

  it('Entfernen (Zurückziehen): Clip fällt aus Manifest und Bündel; ein leeres Bündel entfällt', () => {
    const erst = ergaenzeManifest({ alt: leeresManifest('de'), neu: [neu(0), neu(1), neu(2, 'de.a1.e02')], stimmen, alteClips: keinAlt });
    const lokal = new Map(erst.buendel.map((b) => [b.schluessel, b.bytes]));
    const r = ergaenzeManifest({
      alt: erst.manifest,
      neu: [],
      entfernen: new Set([toene[0]!.textHash, toene[2]!.textHash]),
      stimmen,
      alteClips: (s, clips) => clipsAusBuendel(lokal.get(s)!, clips),
    });
    expect(r.manifest.clips.map((c) => c.textHash)).toEqual([toene[1]!.textHash]);
    expect(r.buendel).toHaveLength(1);
    expect(r.alteBuendel).toHaveLength(2);
  });

  it('Mensch und Sprachausgabe desselben Texts in getrennten Bündeln; doppelte Clips und fehlende Stimmangaben brechen ab', () => {
    const mensch = 'mensch:00000000-0000-4000-8000-000000000001';
    const r = ergaenzeManifest({
      alt: leeresManifest('de'),
      neu: [neu(0), { ...neu(0, 'de.a1.e01', mensch), daten: toene[1]!.daten }],
      stimmen: [
        ...stimmen,
        { id: mensch, art: 'mensch', bezeichnung: '[Sprecherin]', namensnennung: '[Name], CC BY-SA 4.0', wasserzeichen: false },
      ],
      alteClips: keinAlt,
    });
    expect(r.buendel).toHaveLength(2);
    expect(new Set(r.manifest.clips.map((c) => c.buendel)).size).toBe(2);
    expect(() => ergaenzeManifest({ alt: leeresManifest('de'), neu: [neu(0), neu(0, 'de.a1.e02')], stimmen, alteClips: keinAlt })).toThrow(
      ManifestFehler,
    );
    expect(() => ergaenzeManifest({ alt: leeresManifest('de'), neu: [neu(0)], stimmen: [], alteClips: keinAlt })).toThrow(/Stimme/);
    expect(() => clipsAusBuendel(r.buendel[0]!.bytes, [{ ...r.manifest.clips[0]!, sha256: '0'.repeat(64) }])).toThrow(ManifestFehler);
  });
});

/** Sinus (Spitze `a`) mit Stille davor und danach. */
function ton(rate: number, sekunden: number, a = 1, stilleS = 0, hz = 997): Float32Array {
  const n = Math.round(sekunden * rate);
  const rand = Math.round(stilleS * rate);
  const x = new Float32Array(n + 2 * rand);
  for (let i = 0; i < n; i++) x[rand + i] = a * Math.sin((2 * Math.PI * hz * i) / rate);
  return x;
}

describe('Prüfkette (audio-pruefen)', () => {
  it('K-Bewertung bei 48 kHz gleich den Koeffizienten der Norm BS.1770-4', () => {
    const [regal, pass] = kFilter(48_000);
    const norm = [
      [1.53512485958697, -2.69169618940638, 1.19839281085285],
      [1, -1.69065929318241, 0.73248077421585],
      [1, -2, 1],
      [1, -1.99004745483398, 0.99007225036621],
    ];
    [regal.b, regal.a, pass.b, pass.a].forEach((ist, i) => ist.forEach((v, j) => expect(v).toBeCloseTo(norm[i]![j]!, 10)));
  });

  it('Lautheit: 997-Hz-Sinus mit Spitze 0 dBFS = −3,01 LUFS, −20 dB = −23,01 LUFS; Stille = −∞', () => {
    expect(lautheit(ton(48_000, 5), 48_000)).toBeCloseTo(-3.01, 2);
    expect(lautheit(ton(48_000, 5, 0.1), 48_000)).toBeCloseTo(-23.01, 2);
    expect(lautheit(new Float32Array(48_000), 48_000)).toBe(-Infinity);
  });

  it('Rand-Stille und Netto-Dauer; Silben nach Vokalgruppen', () => {
    const x = ton(48_000, 1, 0.3, 0.5, 440);
    const { start, ende } = nichtStill(x, 48_000);
    expect(start / 48_000).toBeGreaterThan(0.4);
    expect(start / 48_000).toBeLessThan(0.5);
    expect((ende - start) / 48_000).toBeGreaterThan(0.95);
    expect(silben('Ich trinke Wasser.', 'de')).toBe(5);
    expect(silben('Heute ist es neu.', 'de')).toBe(5);
    expect(silben('Su içiyorum.', 'tr')).toBe(5);
    expect(silben('Seite 12', 'de')).toBeNull();
  });

  it('physische Fehler: kurz, Rand, Lautheit, Clipping; ein normierter Clip besteht', () => {
    const gut = ton(48_000, 1.2, 0.1, 0.05, 440);
    const m = miss(gut, 48_000, 'Das Haus ist groß.', 'de');
    expect(physischeFehler({ ...m, lufs: -23.2 })).toEqual([]);
    expect(physischeFehler({ ...m, nettoS: 0.2, lufs: -23 })).toContain('netto_kurz');
    expect(physischeFehler({ ...m, randVornS: 0.5, lufs: -23 })).toContain('rand_vorn');
    expect(physischeFehler({ ...m, lufs: -25 })).toContain('lautheit');
    expect(physischeFehler({ ...m, lufs: -23, clipping: 3 })).toContain('clipping');
    expect(physischeFehler({ ...m, lufs: -23, silben: 8, silbenProS: 9 })).toContain('silbenrate');
    expect(physischeFehler({ ...m, lufs: -23, silben: 1, silbenProS: 1 })).toEqual([]);
  });

  it('Urteile nach PLAN §6.8 Nr. 6: Schwellen 0,75/0,6, erster Versuch neu, danach hören', () => {
    expect(urteile({ physisch: [], treffer: 0.8, versuch: 1 }).urteil).toBe('ok');
    expect(urteile({ physisch: [], treffer: GRENZEN.trefferGut, versuch: 1 }).urteil).toBe('ok');
    expect(urteile({ physisch: [], treffer: 0.7, versuch: 1 })).toEqual({ urteil: 'neu_erzeugen', gruende: ['rueckerkennung_mittel'] });
    expect(urteile({ physisch: [], treffer: 0.7, versuch: 2 }).urteil).toBe('hoeren');
    expect(urteile({ physisch: [], treffer: 0.5, versuch: 1 }).urteil).toBe('hoeren');
    expect(urteile({ physisch: ['lautheit'], treffer: null, versuch: 1 }).urteil).toBe('neu_erzeugen');
    expect(urteile({ physisch: ['lautheit'], treffer: null, versuch: 2 }).urteil).toBe('hoeren');
    expect(urteile({ physisch: [], treffer: null, versuch: 1 }).urteil).toBe('ok');
  });

  it('Rückerkennung nur für de-Sätze ab 4 Wörtern; Trefferanteil mild wie in der Sprechübung', () => {
    expect(mitRueckerkennung({ sprache: 'de', art: 'satz', woerter: 4 })).toBe(true);
    expect(mitRueckerkennung({ sprache: 'de', art: 'satz', woerter: 3 })).toBe(false);
    expect(mitRueckerkennung({ sprache: 'de', art: 'lemma', woerter: 4 })).toBe(false);
    expect(mitRueckerkennung({ sprache: 'tr', art: 'satz', woerter: 6 })).toBe(false);
    expect(treffer(' Das Haus ist gross.', 'Das Haus ist groß.', 'de')).toBe(1);
    expect(treffer('Das Haus ist.', 'Das Haus ist groß.', 'de')).toBe(0.75);
  });

  it('Zahlwörter: whisper schreibt Ziffern – de vergleicht beide Seiten als Zahlwort', () => {
    expect([0, 1, 7, 12, 21, 30, 99, 100, 101, 345, 1000, 2026].map(zahlwort)).toEqual([
      'null',
      'eins',
      'sieben',
      'zwölf',
      'einundzwanzig',
      'dreißig',
      'neunundneunzig',
      'hundert',
      'hunderteins',
      'dreihundertfünfundvierzig',
      'tausend',
      'zweitausendsechsundzwanzig',
    ]);
    expect(() => zahlwort(10_000)).toThrow(RangeError);
    expect(zahlenAlsWoerter('Um 5.00 Uhr, 10 vor 12, 007, 12345, B2', 'de')).toBe('Um  fünf .00 Uhr,  zehn  vor  zwölf , 007, 12345, B2');
    expect(zahlenAlsWoerter('Saat 10', 'tr')).toBe('Saat 10');
    expect(treffer('Es ist 10 vor 12.', 'Es ist zehn vor zwölf.', 'de')).toBe(1);
    expect(treffer('2 und 2 ist 4.', 'Zwei und zwei ist vier.', 'de')).toBe(1);
    expect(treffer('Zwei und zwei ist vier.', '2 und 2 ist 4.', 'de')).toBe(1);
    expect(treffer('Es ist 548.', 'Es ist fünf vor acht.', 'de')).toBe(0.4);
  });
});

describe('Wächter „nie vertont“ im Prüfer und im Import', () => {
  const clip = (t: string, stimme = STIMME) => ({
    textHash: textHash(t),
    buendel: 'lernapp/audio/de/de.a1.e01-0123456789abcdef.lpa',
    versatz: 100,
    laenge: 10,
    dauerMs: 500,
    stimme,
    sha256: 'a'.repeat(64),
    format: 'webm-opus' as const,
  });

  it('Prüfer: Clip zu Religionsbezug oder Wissenstext blockiert; Sprachausgabe ohne Freigabe der Sprache blockiert', () => {
    const inhalte = leereInhalte();
    const d = JSON.parse(datei((x) => (x.saetze[0]!.religionsbezug = true)).text) as SprachEinheitDatei;
    inhalte.sprache.push({ pfad: 'sprache/de/a1/de.a1.e01.json', daten: d });
    inhalte.islam.push({ pfad: 'islam/x.json', daten: { aussagen: [{ text: 'Ein Satz aus dem Wissenskurs.' }] } as never });
    inhalte.audio.push({
      pfad: 'audio-manifest/de.json',
      daten: {
        ...leeresManifest('de'),
        stimmen: [manifestStimme(THORSTEN)],
        clips: [clip('Ich trinke Wasser.'), clip('Ein Satz aus dem Wissenskurs.'), clip('Wasser')],
      },
    });
    const tr = 'tts:fremde-stimme@0123456789abcdef';
    inhalte.audio.push({
      pfad: 'audio-manifest/tr.json',
      daten: {
        ...leeresManifest('tr'),
        stimmen: [{ id: tr, art: 'sprachausgabe', bezeichnung: 'x', namensnennung: 'x', wasserzeichen: false }],
        clips: [{ ...clip('su', tr), buendel: 'lernapp/audio/tr/tr.a1.e01-0123456789abcdef.lpa' }],
      },
    });
    const befunde = pruefeAudio(inhalte).liste;
    expect(befunde.map((b) => [b.datei, b.ort, b.schwere])).toEqual([
      ['audio-manifest/de.json', 'clips.0', 'blockierend'],
      ['audio-manifest/de.json', 'clips.1', 'blockierend'],
      ['audio-manifest/tr.json', 'stimmen.0', 'blockierend'],
    ]);
  });

  it('Import: dieselben Regeln (fail closed)', () => {
    const m = { ...leeresManifest('de'), stimmen: [manifestStimme(THORSTEN)], clips: [clip('Ich trinke Wasser.')] };
    expect(manifestFehler(m, new Set([textHash('Ich trinke Wasser.')]))).toHaveLength(1);
    expect(manifestFehler(m, new Set())).toEqual([]);
  });
});

describe('Stimmen, Aussprache und Namensnennung', () => {
  it('Kennung trägt den SHA des ONNX-Exports; Lizenzen frei; Namensnennung auf /quellen', () => {
    expect(THORSTEN.id).toBe(`tts:coqui-vits-thorsten-onnx@${THORSTEN.quelle.onnxSha256.slice(0, 16)}`);
    expect(ALLE_STIMMEN).toEqual([THORSTEN]);
    expect([THORSTEN.modellLizenz, THORSTEN.datenLizenz]).toEqual(['Apache-2.0', 'CC0-1.0']);
    const eintrag = ABSCHNITTE.find((a) => a.id === 'sprachausgabe')?.eintraege.find((e) => e.id === 'thorsten-vits');
    expect(eintrag?.url).toBe(THORSTEN.modellAdresse);
    expect(eintrag?.herkunft?.url).toBe(THORSTEN.datenAdresse);
  });

  it('aussprache/de.json: Schema; Phoneme nur für die Thorsten-Stimme und einzelne Wörter; Buchstabennamen vollständig', () => {
    const d = AusspracheDateiSchema.parse(JSON.parse(readFileSync(join(WEB, 'inhalte', 'lernapp', 'aussprache', 'de.json'), 'utf8')));
    expect(d.sprache).toBe('de');
    for (const e of d.eintraege.filter((x) => x.phoneme)) {
      expect(e.stimmen).toEqual([STIMME]);
      expect(e.text).not.toMatch(/\s/);
    }
    const buchstaben = d.eintraege.filter((e) => e.grund === 'Buchstabenname').map((e) => e.text);
    expect(buchstaben).toEqual(expect.arrayContaining([...'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß']));
    expect(d.eintraege.find((e) => e.text === 'z. B.')?.ersatz).toBe('zum Beispiel');
  });
});
