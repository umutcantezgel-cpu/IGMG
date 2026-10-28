import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mikrofonErlaubtHier } from '@/components/lernapp/sprechen/aufnahme';
import { imVorrat } from '@/components/lernapp/sprechen/erkennung';
import {
  gutVerstaendlich,
  istWiederholung,
  maxNeueTokens,
  mitErkennung,
  pruefePegel,
  richteAus,
  SCHWELLEN,
  vergleichsWoerter,
  werteAus,
  wortTrifft,
  zielWoerter,
} from '@/lib/lernapp/sprechen/auswertung';
import {
  type GeraetUmgebung,
  LEERER_STAND,
  liesSprechStand,
  MIN_FREI_BYTES,
  pruefeGeraet,
  type SprechStand,
  standNachLaden,
} from '@/lib/lernapp/sprechen/geraet';
import {
  ABTASTRATE,
  ARBEITER_BYTES,
  arbeiterAdresse,
  bewerteProbe,
  GESAMT_BYTES,
  GESAMT_MB,
  LIZENZ_DATEIEN,
  MODELL,
  MODELL_DATEIEN,
  modellAdresse,
  ORT,
  ORT_HINWEISE,
  ortAdresse,
  probeClip,
  VORRAT_MODELLE,
  VORRAT_PFLICHT,
} from '@/lib/lernapp/sprechen/modell';
import { ar } from './hilfen/buckwalter';

/**
 * Sprechübung (ADR 0042 mit Fortschreibung S2/S5): Auswertung nur über die Wörter des Zielsatzes (mild + tolerant),
 * Schwellen de 0,6 / tr 0,5 / ar ohne Rückmeldung, Kurzsatzregel, Schutz vor Halluzination (Wiederholung, Längenkappe,
 * relative Pegelprüfung), Gerätecheck, Probelauf, Dateien vom eigenen Ursprung. Audio nur synthetisch (Töne, Rauschen).
 */

describe('Auswertung: Wörter des Zielsatzes', () => {
  it('Vergleichsform mild: de ß/ss und Umlaut-Ersatz, tr Sonderbuchstaben, ar ohne Harakat und mit Taa marbuta', () => {
    expect(vergleichsWoerter('Die Straße ist groß.', 'de')).toEqual(vergleichsWoerter('die strasse ist gross', 'de'));
    expect(vergleichsWoerter('Grüße', 'de')).toEqual(vergleichsWoerter('gruesse', 'de'));
    expect(vergleichsWoerter('Işık çok güzel.', 'tr')).toEqual(vergleichsWoerter('isik cok guzel', 'tr'));
    expect(vergleichsWoerter(ar('madiynapN'), 'ar')).toEqual(vergleichsWoerter(ar('madiynah'), 'ar'));
  });

  it('tolerant: ab 4 Zeichen ein Zeichen Abstand, kürzere Wörter nur gleich', () => {
    expect(wortTrifft('wasser', 'wasser')).toBe(true);
    expect(wortTrifft('wasser', 'waser')).toBe(true);
    expect(wortTrifft('haus', 'maus')).toBe(true);
    expect(wortTrifft('ist', 'isst')).toBe(false);
    expect(wortTrifft('ich', 'ach')).toBe(false);
    expect(wortTrifft('wasser', 'wesen')).toBe(false);
  });

  it('Ausrichtung in Reihenfolge, auch über Wortgrenzen (getrennt bzw. zusammen gehört)', () => {
    expect(richteAus(['ich', 'trinke', 'wasser'], ['ich', 'trinke', 'wasser'])).toEqual([true, true, true]);
    expect(richteAus(['ich', 'trinke', 'wasser'], ['ich', 'denke', 'wasser'])).toEqual([true, false, true]);
    expect(richteAus(['kiz', 'kardesim'], ['kizkardesim'])).toEqual([true, true]);
    expect(richteAus(['kizkardesim'], ['kiz', 'kardesim'])).toEqual([true]);
    expect(richteAus(['a', 'b'], [])).toEqual([false, false]);
  });

  it('Schwellen und Kurzsatzregel (≤ 4 Wörter: eines darf fehlen)', () => {
    expect(SCHWELLEN).toEqual({ de: 0.6, tr: 0.5, ar: null });
    expect(mitErkennung('ar')).toBe(false);
    expect(gutVerstaendlich([true, true, false], 0.9)).toBe(true);
    expect(gutVerstaendlich([true, false, false], 0.1)).toBe(false);
    expect(gutVerstaendlich([false], 0)).toBe(false);
    expect(gutVerstaendlich([true, true, true, false, false], 0.6)).toBe(true);
    expect(gutVerstaendlich([true, true, false, false, false], 0.6)).toBe(false);
    expect(gutVerstaendlich([true, true, true, false, false, false], 0.5)).toBe(true);
  });

  it('Wiederholungsprüfung: 4-Gramm ≥ 4-mal oder mehr als doppelt so lang wie das Ziel', () => {
    const schleife = Array.from({ length: 4 }, () => ['a', 'b', 'c', 'd']).flat();
    expect(istWiederholung(schleife, 20)).toBe(true);
    expect(istWiederholung(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3)).toBe(true);
    expect(istWiederholung(['ich', 'trinke', 'wasser'], 3)).toBe(false);
  });

  it('Längenkappe max_new_tokens = ⌈1,5 × Zieltokens⌉ + 8', () => {
    expect(maxNeueTokens(0)).toBe(8);
    expect(maxNeueTokens(5)).toBe(16);
    expect(maxNeueTokens(10)).toBe(23);
  });

  it('werteAus: Status und Markierung – nie eine Abschrift im Ergebnis', () => {
    const gut = werteAus('Ich trinke Wasser', 'Ich trinke Wasser.', 'de');
    expect(gut).toEqual({ status: 'gut', treffer: [true, true, true], anteil: 1 });
    expect(Object.keys(gut).sort()).toEqual(['anteil', 'status', 'treffer']);
    expect(werteAus('Das war es.', 'Das Haus ist sehr groß und alt.', 'de').status).toBe('teilweise');
    expect(werteAus('', 'Ich trinke Wasser.', 'de').status).toBe('nichtVerstanden');
    expect(werteAus('Untertitel von Untertitel von Untertitel von Untertitel von', 'Ich trinke Wasser.', 'de').status).toBe(
      'nichtVerstanden',
    );
    expect(werteAus('su iciyorum', 'Su içiyorum.', 'tr').status).toBe('gut');
    // Arabisch: keine automatische Rückmeldung mit whisper-base
    expect(werteAus(ar('>anaA >a$orabu'), ar('>anaA >a$orabu'), 'ar').status).toBe('nichtVerstanden');
    expect(zielWoerter('Ich trinke Wasser.', 'de').anzeige).toEqual(['Ich', 'trinke', 'Wasser']);
  });
});

/** Synthetisches Signal: Stille, Rauschen bzw. Tonstöße (keine Sprache, keine Aufnahme). */
function signal(teile: { s: number; db: number | null; ton?: boolean }[]): Float32Array {
  const n = teile.reduce((s, t) => s + Math.round(t.s * ABTASTRATE), 0);
  const pcm = new Float32Array(n);
  let i = 0;
  let saat = 7;
  const zufall = () => ((saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;
  for (const t of teile) {
    const amp = t.db === null ? 0 : 10 ** (t.db / 20) * Math.SQRT2;
    for (let k = 0; k < Math.round(t.s * ABTASTRATE); k++, i++)
      pcm[i] = t.db === null ? 0 : t.ton ? amp * Math.sin((2 * Math.PI * 220 * k) / ABTASTRATE) : (amp / Math.SQRT2) * zufall();
  }
  return pcm;
}

describe('Pegelprüfung (relativ, vor der Erkennung)', () => {
  it('Stille, gleichmäßiges Rauschen und Brummen gelten nicht als Sprache', () => {
    expect(pruefePegel(signal([{ s: 3, db: null }]), ABTASTRATE).ok).toBe(false);
    expect(pruefePegel(signal([{ s: 3, db: -50 }]), ABTASTRATE).ok).toBe(false);
    expect(pruefePegel(signal([{ s: 3, db: -41, ton: true }]), ABTASTRATE).ok).toBe(false);
  });

  it('Tonstöße über dem Rauschboden gelten als Sprache – auch leise (keine feste Schwelle)', () => {
    const laut = signal([
      { s: 0.5, db: -60 },
      { s: 0.6, db: -20, ton: true },
      { s: 0.5, db: -60 },
    ]);
    expect(pruefePegel(laut, ABTASTRATE)).toMatchObject({ ok: true });
    const leise = signal([
      { s: 0.5, db: -75 },
      { s: 0.5, db: -58, ton: true },
      { s: 0.5, db: -75 },
    ]);
    expect(pruefePegel(leise, ABTASTRATE).ok).toBe(true);
  });

  it('weniger als 0,3 s über dem Boden reicht nicht', () => {
    const kurz = signal([
      { s: 1, db: -60 },
      { s: 0.2, db: -20, ton: true },
      { s: 1, db: -60 },
    ]);
    expect(pruefePegel(kurz, ABTASTRATE).ok).toBe(false);
  });
});

const GERAET: GeraetUmgebung = {
  modulWorker: true,
  wasmSimd: true,
  mikrofon: true,
  aufnahme: true,
  audio16k: true,
  vorrat: true,
  freiBytes: 2 * 1024 ** 3,
  speicherGb: 8,
  isoliert: true,
};

describe('Gerätecheck, Probelauf und Stand', () => {
  it('alles da → ok; jede fehlende Fähigkeit, zu wenig Platz oder Speicher → Rückfall', () => {
    expect(pruefeGeraet(GERAET)).toEqual({ ok: true, maengel: [], hinweise: [] });
    for (const [feld, mangel] of [
      ['modulWorker', 'worker'],
      ['wasmSimd', 'wasm'],
      ['mikrofon', 'mikrofon'],
      ['aufnahme', 'aufnahme'],
      ['audio16k', 'audio'],
      ['vorrat', 'vorrat'],
    ] as const)
      expect(pruefeGeraet({ ...GERAET, [feld]: false })).toMatchObject({ ok: false, maengel: [mangel] });
    expect(pruefeGeraet({ ...GERAET, freiBytes: MIN_FREI_BYTES - 1 }).maengel).toEqual(['platz']);
    expect(pruefeGeraet({ ...GERAET, speicherGb: 2 }).maengel).toEqual(['speicher']);
  });

  it('unbekannter Speicher ist erlaubt (Hinweis), ohne Isolation nur ein Thread (Hinweis)', () => {
    expect(pruefeGeraet({ ...GERAET, speicherGb: null, freiBytes: null, isoliert: false })).toEqual({
      ok: true,
      maengel: [],
      hinweise: ['speicherUnbekannt', 'ohneThreads'],
    });
  });

  it('Probelauf: bis 5 s normal, bis 12 s langsam, darüber und bei Fehler Rückfall', () => {
    expect(bewerteProbe(900)).toBe('normal');
    expect(bewerteProbe(5000)).toBe('normal');
    expect(bewerteProbe(5001)).toBe('langsam');
    expect(bewerteProbe(12_000)).toBe('langsam');
    expect(bewerteProbe(12_001)).toBe('rueckfall');
    expect(bewerteProbe(null)).toBe('rueckfall');
    const clip = probeClip();
    expect(clip.length).toBe(2 * ABTASTRATE);
    expect(Math.max(...clip.map(Math.abs))).toBeLessThan(1);
  });

  it('gemerkter Stand: nur für dieses Modell, Unlesbares ist leer', () => {
    expect(liesSprechStand(null)).toEqual(LEERER_STAND);
    expect(liesSprechStand('{kaputt')).toEqual(LEERER_STAND);
    expect(liesSprechStand(JSON.stringify({ modell: 'anderes', geladen: true }))).toEqual(LEERER_STAND);
    expect(liesSprechStand(JSON.stringify({ modell: MODELL.name, geladen: true, probe: { ergebnis: 'rueckfall', ms: 'x' } }))).toEqual({
      modell: MODELL.name,
      geladen: true,
      probe: { ergebnis: 'rueckfall', ms: null },
    });
  });

  it('Ladeversuch: Abbruch ändert nichts, Ladefehler (429, Netz) nur für diese Übung, Rückfall nur nach dem Probelauf', () => {
    const merke = (stand: SprechStand) => liesSprechStand(JSON.stringify(stand));
    // Abbruch beim Aushängen („Ich kann gerade nicht sprechen“, Weiter, Navigation): Stand unverändert
    expect(standNachLaden(LEERER_STAND, { art: 'abgebrochen' })).toBe(LEERER_STAND);
    const langsam: SprechStand = { modell: MODELL.name, geladen: false, probe: { ergebnis: 'langsam', ms: 7000 } };
    expect(standNachLaden(langsam, { art: 'abgebrochen' })).toBe(langsam);
    // Ladefehler: nicht geladen, kein Rückfall – die nächste Sprechübung bietet das Laden wieder an
    const nachFehler = merke(standNachLaden(LEERER_STAND, { art: 'ladefehler' }));
    expect(nachFehler).toEqual({ modell: MODELL.name, geladen: false, probe: null });
    expect(merke(standNachLaden(langsam, { art: 'ladefehler' }))).toEqual(langsam);
    // auch nach mehreren Fehlern hintereinander kein Rückfall
    expect(standNachLaden(standNachLaden(nachFehler, { art: 'ladefehler' }), { art: 'ladefehler' }).probe).toBeNull();
    // Probelauf: erst jetzt geladen, Urteil gemerkt; gescheitert oder zu langsam → Rückfall (dauerhaft, ADR 0042 Nr. 7)
    expect(standNachLaden(LEERER_STAND, { art: 'probe', ms: 900 })).toEqual({
      modell: MODELL.name,
      geladen: true,
      probe: { ergebnis: 'normal', ms: 900 },
    });
    expect(standNachLaden(LEERER_STAND, { art: 'probe', ms: 7000 }).probe).toEqual({ ergebnis: 'langsam', ms: 7000 });
    expect(merke(standNachLaden(LEERER_STAND, { art: 'probe', ms: null })).probe).toEqual({ ergebnis: 'rueckfall', ms: null });
    expect(standNachLaden(LEERER_STAND, { art: 'probe', ms: 12_001 }).probe?.ergebnis).toBe('rueckfall');
  });
});

describe('Dateien vom eigenen Ursprung', () => {
  it('genau 10 Dateien der Sprechübung: 7 Modell-/Konfigurationsdateien, ORT .mjs und .wasm (ohne asyncify/jsep/jspi), Worker; ≈ 95 MB', () => {
    expect(MODELL_DATEIEN).toHaveLength(7);
    expect(MODELL_DATEIEN.filter((d) => d.pfad.endsWith('_quantized.onnx'))).toHaveLength(2);
    expect([ORT.mjs, ORT.wasm]).toEqual(['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']);
    expect(GESAMT_MB).toBeGreaterThanOrEqual(93);
    expect(GESAMT_MB).toBeLessThanOrEqual(96);
    for (const a of [
      ...MODELL_DATEIEN.map((d) => modellAdresse(d.pfad)),
      ortAdresse(ORT.mjs),
      ortAdresse(ORT.wasm),
      arbeiterAdresse('abc'),
    ])
      expect(a).toMatch(/^\/lern-app\/modelle\//);
  });

  it('QUELLE.md (Bauschritt mit SHA-Prüfung) nennt genau diese Dateien und Größen; Versionen exakt gepinnt', () => {
    const web = join(import.meta.dirname, '../../..');
    const quelle = readFileSync(join(web, 'daten/lernapp-modelle/QUELLE.md'), 'utf8');
    const zeilen = [...quelle.matchAll(/^\| `([^`]+)` +\| `([^`]+)` +\| (\d+) +\| `([0-9a-f]{64})` +\|$/gm)].map((m) => ({
      ziel: m[2]!,
      bytes: Number(m[3]),
    }));
    expect(zeilen).toEqual([
      ...MODELL_DATEIEN.map((d) => ({ ziel: `public${modellAdresse(d.pfad)}`, bytes: d.bytes })),
      { ziel: `public${ortAdresse(ORT.wasm)}`, bytes: ORT.wasmBytes },
      { ziel: `public${ortAdresse(ORT.mjs)}`, bytes: expect.any(Number) as number },
      ...LIZENZ_DATEIEN.map((d) => ({ ziel: `public${modellAdresse(d.pfad)}`, bytes: d.bytes })),
    ]);
    expect(quelle).toContain(MODELL.commit);
    const paket = JSON.parse(readFileSync(join(web, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
    expect(paket.dependencies['@huggingface/transformers']).toBe('4.3.0');
    const sperre = readFileSync(join(web, 'pnpm-lock.yaml'), 'utf8');
    expect(sperre).toContain(`onnxruntime-web@${ORT.version}:`);
    expect(sperre).not.toContain('onnxruntime-node@');
  });

  it('Lizenztexte neben den Gewichten (ADR 0042 Nr. 3): gleich den gepinnten Texten, nicht im Download', () => {
    const web = join(import.meta.dirname, '../../..');
    const oeffentlich = (pfad: string) => readFileSync(join(web, 'public', modellAdresse(pfad)));
    expect(LIZENZ_DATEIEN.map((d) => d.pfad)).toEqual(['LIZENZ-whisper-MIT.txt', 'LIZENZ-Apache-2.0.txt']);
    for (const d of LIZENZ_DATEIEN) {
      const text = oeffentlich(d.pfad);
      expect(text.length, d.pfad).toBe(d.bytes);
      expect(text.equals(readFileSync(join(web, 'daten/lernapp-modelle', d.pfad))), d.pfad).toBe(true);
    }
    expect(oeffentlich('LIZENZ-whisper-MIT.txt').toString()).toContain('Copyright (c) 2022 OpenAI');
    expect(oeffentlich('LIZENZ-Apache-2.0.txt').toString()).toContain('Apache License');
    // nicht Teil der Sprachprüfung: weder in der angezeigten Größe noch in den Dateien des Downloads (wohl aber die
    // Drittlizenzen von ORT, die mit dem Download in den Vorrat kommen – Z-L17)
    expect(GESAMT_BYTES).toBe(MODELL_DATEIEN.reduce((s, d) => s + d.bytes, 0) + ORT.wasmBytes + ARBEITER_BYTES + ORT_HINWEISE.bytes);
    expect(readFileSync(join(web, 'public', ORT_HINWEISE.pfad)).length).toBe(ORT_HINWEISE.bytes);
    expect(MODELL_DATEIEN.some((d) => d.pfad.startsWith('LIZENZ-'))).toBe(false);
    // der Bauschritt prüft sie und versieht den Worker mit einem Lizenzkopf
    const bauschritt = readFileSync(join(web, 'scripts/lernapp-modelle.mjs'), 'utf8');
    expect(bauschritt).toMatch(/lizenzen\.length !== 2/);
    expect(bauschritt).toMatch(/postBanner: lizenzkopf/);
  });

  it('ohne Knopf nur aus dem Vorrat: Encoder, Decoder und ORT-.wasm müssen dort liegen (kein stilles Nachladen)', async () => {
    expect(VORRAT_PFLICHT).toEqual([
      modellAdresse('onnx/encoder_model_quantized.onnx'),
      modellAdresse('onnx/decoder_model_merged_quantized.onnx'),
      ortAdresse(ORT.wasm),
    ]);
    // Cache Storage als Attrappe: Name → gespeicherte Adressen
    const speicher = (inhalt: Record<string, string[]>, kaputt = false) =>
      ({
        has: async (name: string) => {
          if (kaputt) throw new Error('SecurityError');
          return name in inhalt;
        },
        open: async (name: string) => ({ match: async (adresse: string) => (inhalt[name]?.includes(adresse) ? {} : undefined) }),
      }) as unknown as CacheStorage;
    expect(await imVorrat(speicher({ [VORRAT_MODELLE]: [...VORRAT_PFLICHT] }))).toBe(true);
    // vom Browser geräumt (Speicherdruck) – nur der Worker liegt noch da, oder der Vorrat fehlt ganz
    expect(await imVorrat(speicher({ [VORRAT_MODELLE]: VORRAT_PFLICHT.filter((a) => !a.includes('decoder')) }))).toBe(false);
    expect(await imVorrat(speicher({}))).toBe(false);
    expect(await imVorrat(speicher({ [VORRAT_MODELLE]: [...VORRAT_PFLICHT] }, true))).toBe(false);
    expect(await imVorrat(undefined)).toBe(false);
  });

  it('Worker-Adresse trägt nur eine bereinigte Bau-Kennung', () => {
    expect(arbeiterAdresse('a1b2c3d4e5f6a7')).toBe('/lern-app/modelle/sprechen/whisper.worker.mjs?v=a1b2c3d4e5f6');
    expect(arbeiterAdresse('../x?y=1')).toBe('/lern-app/modelle/sprechen/whisper.worker.mjs?v=xy1');
    expect(arbeiterAdresse('')).toBe('/lern-app/modelle/sprechen/whisper.worker.mjs?v=lokal');
  });

  it('Mikrofon nur auf …/ueben und …/wiederholen', () => {
    expect(mikrofonErlaubtHier('/lern-app/de/tr-aus-de/ueben')).toBe(true);
    expect(mikrofonErlaubtHier('/lern-app/ar/de-aus-ar/wiederholen')).toBe(true);
    expect(mikrofonErlaubtHier('/lern-app/de/tr-aus-de')).toBe(false);
    expect(mikrofonErlaubtHier('/lern-app/de/einstellungen')).toBe(false);
  });
});
