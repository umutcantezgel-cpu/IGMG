import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { abweichungen } from '../../../scripts/lernapp/schemas';
import {
  AudioManifestDateiSchema,
  AusspracheDateiSchema,
  dateiArtVon,
  IslamEinheitDateiSchema,
  KoranPfadDateiSchema,
  pruefeWeitereDatei,
  QuelleSchema,
  SymbolDateiSchema,
} from '@/lib/lernapp/inhalt/schema';

/**
 * Schemas aller Inhaltsdateien (PLAN §6.1, L3-02) und die daraus erzeugten JSON-Schemas. Proben sind neutrale Platzhalter;
 * arabische Schrift nur als Codepunkt-Escape (KERN 4.0 §3).
 */
const INHALTE = join(import.meta.dirname, '../../../inhalte/lernapp');
const lese = (pfad: string) => JSON.parse(readFileSync(join(INHALTE, pfad), 'utf8')) as unknown;
const fehler = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.success ? [] : r.error!.issues.map((i) => i.message);
const ARABISCH = '\u0628\u064E\u064A\u0652\u062A';

describe('vorhandene Dateien', () => {
  it.each(['rahmen/de.rahmen.json', 'rahmen/tr.rahmen.json', 'rahmen/ar.rahmen.json', 'rahmen/leitfaden.json'])('%s ist gültig', (pfad) => {
    const r = pruefeWeitereDatei(pfad, lese(pfad));
    expect(r.ok ? [] : r.fehler).toEqual([]);
  });

  it('Rahmenplan: arabische Schrift (auch als Codepunkt) und falsche Einheitenfolge sind Fehler', () => {
    const r = lese('rahmen/ar.rahmen.json') as { stufen: { einheiten: { titel: string; schluessel: string }[] }[] };
    r.stufen[0]!.einheiten[0]!.titel = `Titel ${ARABISCH}`;
    r.stufen[0]!.einheiten[1]!.schluessel = 'ar.a1.e07';
    const p = pruefeWeitereDatei('rahmen/ar.rahmen.json', r);
    expect(p.ok).toBe(false);
    const text = p.ok ? '' : p.fehler.join('\n');
    expect(text).toMatch(/arabische Schrift nicht erlaubt/);
    expect(text).toMatch(/Einheit ar\.a1\.e07: erwartet ar\.a1\.e02/);
    expect(text).not.toMatch(/[\u0600-\u06FF]/);
  });

  it('Ablage nach Pfad: rahmen, leitfaden, islam, koran, aussprache, audio-manifest, symbole; Schemas und Markdown nicht', () => {
    expect(dateiArtVon('rahmen/tr.rahmen.json')).toBe('rahmen');
    expect(dateiArtVon('rahmen/leitfaden.json')).toBe('leitfaden');
    expect(dateiArtVon('rahmen/RAHMEN-de.md')).toBeNull();
    expect(dateiArtVon('schemas/rahmen.schema.json')).toBeNull();
    expect(dateiArtVon('sprache/de/a1/de.a1.e01.json')).toBe('sprache-einheit');
    expect(dateiArtVon('islam/taharah/islam.grund.e01.json')).toBe('islam-einheit');
    expect(dateiArtVon('koran/pfad.json')).toBe('koran-pfad');
    expect(dateiArtVon('aussprache/ar.json')).toBe('aussprache');
    expect(dateiArtVon('audio-manifest/de.json')).toBe('audio-manifest');
    expect(dateiArtVon('symbole/symbole.json')).toBe('symbole');
    expect(dateiArtVon('sonstiges/x.json')).toBe('unbekannt');
  });

  it('die JSON-Schemas unter inhalte/lernapp/schemas sind aktuell (pnpm lernapp:schemas)', async () => {
    expect(await abweichungen()).toEqual([]);
  });
});

describe('Herkunft', () => {
  it('Quelle: wiktionary:<ausgabe>:<seitentitel> (ADR 0045 Fortschreibung S7 Nr. 7) neben ki, tatoeba, kaikki, redaktion', () => {
    for (const q of ['wiktionary:en:Haus', 'wiktionary:tr:kitap', `wiktionary:en:${ARABISCH}`, 'ki:l3/e/1', 'tatoeba:78', 'redaktion'])
      expect(QuelleSchema.safeParse(q).success, q).toBe(true);
    for (const q of ['wiktionary:fr:x', 'wiktionary:en:', 'openiti:x', 'tatoeba:abc'])
      expect(QuelleSchema.safeParse(q).success, q).toBe(false);
  });
});

const ki = { quelle: 'ki:l6/wissen/1', lizenz: 'CC-BY-SA-4.0' };
const beleg = {
  werk: 'quduri',
  kapitel: 'Kitab at-Tahara, Bab al-Wudu',
  ausgabe: '[Ausgabe]',
  seite: 12,
  passage: 'quduri.ms0042',
  fundstelle: '0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1#ms0042',
};
const islam = () => ({
  format: 'igmg-lernapp-islam',
  version: 1,
  kurs: 'islam',
  bereich: 'taharah',
  stufe: 'grund',
  einheit: { schluessel: 'islam.grund.e01', reihenfolge: 1, thema: { de: '[Thema]' } },
  lektionen: [
    {
      schluessel: 'islam.grund.e01.l01',
      titel: '[Lektion]',
      kinderGeeignet: true,
      aussagen: [{ schluessel: 'islam.grund.e01.l01.a01', text: '[Aussage in eigenen Worten]', belege: [beleg], ...ki }],
      aufgaben: [
        {
          schluessel: 'islam.grund.e01.l01.q01',
          typ: 'wahr_falsch',
          aussage: 'islam.grund.e01.l01.a01',
          behauptung: '[Behauptung]',
          richtig: true,
          begruendung: '[Begründung]',
          ...ki,
        },
      ],
    },
  ],
});

describe('Wissenskurs islam/<bereich>/<einheit>.json (ADR 0040 Nr. 4, 5)', () => {
  it('eine Einheit mit Aussage, Beleg und Quizfrage ist gültig', () => {
    expect(fehler(IslamEinheitDateiSchema.safeParse(islam()))).toEqual([]);
  });

  it('kein Arabisch, mindestens ein Beleg, nur zulässige Werke, passende Schule, Quiz nur aus Aussagen', () => {
    const d = islam();
    d.lektionen[0]!.aussagen[0]!.text = `[Aussage] ${ARABISCH}`;
    expect(fehler(IslamEinheitDateiSchema.safeParse(d))).toContain(
      'arabische Schrift nicht erlaubt (nur Umschrift oder Verweis, KERN 4.0 §3)',
    );

    const ohne = islam();
    (ohne.lektionen[0]!.aussagen[0] as { belege: unknown[] }).belege = [];
    expect(IslamEinheitDateiSchema.safeParse(ohne).success).toBe(false);

    const zurueck = islam();
    Object.assign(zurueck.lektionen[0]!.aussagen[0]!.belege[0]!, { werk: 'maraqi_al_falah', passage: 'maraqi_al_falah.ms0001' });
    expect(fehler(IslamEinheitDateiSchema.safeParse(zurueck)).join()).toMatch(/zurückgestellt/);

    const schule = islam();
    Object.assign(schule.lektionen[0]!.aussagen[0]!.belege[0]!, { werk: 'tahawiyya', passage: 'tahawiyya.ms0003' });
    expect(fehler(IslamEinheitDateiSchema.safeParse(schule)).join()).toMatch(/Fiqh-Aussage braucht ein Fiqh-Werk/);

    const radd = islam();
    Object.assign(radd.lektionen[0]!.aussagen[0]!.belege[0]!, { werk: 'radd_al_muhtar', passage: 'radd_al_muhtar.ms6765' });
    expect(fehler(IslamEinheitDateiSchema.safeParse(radd)).join()).toMatch(/außerhalb des Registers/);

    const quiz = islam();
    quiz.lektionen[0]!.aufgaben[0]!.aussage = 'islam.grund.e01.l01.a09';
    expect(fehler(IslamEinheitDateiSchema.safeParse(quiz)).join()).toMatch(/Aufgabe ohne Aussage/);

    const woertlich = islam();
    Object.assign(woertlich.lektionen[0]!.aussagen[0]!.belege[0]!, { art: 'woertlich' });
    expect(fehler(IslamEinheitDateiSchema.safeParse(woertlich)).join()).toMatch(/sinngemäß, nie wörtlich/);
  });
});

describe('Koran-Pfad koran/pfad.json (nur Verweise)', () => {
  const pfad = () => ({
    format: 'igmg-lernapp-koran-pfad',
    version: 1,
    kurs: 'koran',
    einheiten: [
      {
        schluessel: 'koran.grund.e01',
        stufe: 'grund',
        reihenfolge: 1,
        thema: { de: '[Thema]' },
        lektionen: [
          {
            schluessel: 'koran.grund.e01.l01',
            wortformen: ['1:2:1', '1:2:2'],
            aufgaben: [
              { schluessel: 'koran.grund.e01.l01.a01', typ: 'koran_wort', art: 'bedeutung', wortform: '1:2:1', ablenker: ['1:2:2'] },
            ],
          },
        ],
      },
    ],
  });
  it('gültig; Arabisch, ungültige Stellen und fremde Wortformen sind Fehler', () => {
    expect(fehler(KoranPfadDateiSchema.safeParse(pfad()))).toEqual([]);
    const a = pfad();
    a.einheiten[0]!.thema = { de: ARABISCH };
    expect(KoranPfadDateiSchema.safeParse(a).success).toBe(false);
    const b = pfad();
    b.einheiten[0]!.lektionen[0]!.wortformen = ['115:1:1'];
    expect(KoranPfadDateiSchema.safeParse(b).success).toBe(false);
    const c = pfad();
    c.einheiten[0]!.lektionen[0]!.aufgaben[0]!.wortform = '2:255:1';
    expect(fehler(KoranPfadDateiSchema.safeParse(c)).join()).toMatch(/Wortform nicht in der Lektion/);
  });
});

describe('Aussprache, Audio-Manifest, Bildkarten', () => {
  it('Aussprache: ersatz oder phoneme, Text eindeutig; Arabisch erlaubt (Sprachkurs-Ordner)', () => {
    const d = {
      format: 'igmg-lernapp-aussprache',
      version: 1,
      sprache: 'ar',
      eintraege: [{ text: ARABISCH, ersatz: ARABISCH, quelle: 'redaktion' }],
    };
    expect(fehler(AusspracheDateiSchema.safeParse(d))).toEqual([]);
    expect(AusspracheDateiSchema.safeParse({ ...d, eintraege: [{ text: 'x', quelle: 'redaktion' }] }).success).toBe(false);
    expect(AusspracheDateiSchema.safeParse({ ...d, eintraege: [d.eintraege[0], d.eintraege[0]] }).success).toBe(false);
  });

  it('Audio-Manifest: Stimme passend zur Art, Clip-Stimme im Manifest, Bündel der Sprache, Clips eindeutig', () => {
    const h = 'a'.repeat(64);
    const d = {
      format: 'igmg-lernapp-audio-manifest',
      version: 1,
      sprache: 'de',
      stimmen: [
        { id: 'tts:coqui-vits-thorsten-onnx@abcdef1', art: 'sprachausgabe', bezeichnung: '[Stimme]', namensnennung: '[Namensnennung]' },
      ],
      clips: [
        {
          textHash: h,
          buendel: 'lernapp/audio/de/de.a1.e01-0123456789abcdef.lpa',
          versatz: 0,
          laenge: 10,
          dauerMs: 500,
          stimme: 'tts:coqui-vits-thorsten-onnx@abcdef1',
          sha256: h,
          format: 'webm-opus',
        },
      ],
    };
    expect(fehler(AudioManifestDateiSchema.safeParse(d))).toEqual([]);
    expect(AudioManifestDateiSchema.safeParse({ ...d, stimmen: [{ ...d.stimmen[0], art: 'mensch' }] }).success).toBe(false);
    expect(AudioManifestDateiSchema.safeParse({ ...d, clips: [d.clips[0], d.clips[0]] }).success).toBe(false);
    expect(
      AudioManifestDateiSchema.safeParse({ ...d, clips: [{ ...d.clips[0], buendel: 'lernapp/audio/tr/x-0123456789abcdef.lpa' }] }).success,
    ).toBe(false);
  });

  it('Bildkarten: Lizenz passend zur Herkunft, OpenMoji mit Namensnennung, nur Pfaddaten', () => {
    const s = { id: 'tasse', motiv: 'Tasse', pfade: ['M4 4h16v16H4z'], quelle: 'lucide:coffee@1.0.0', lizenz: 'ISC' };
    const d = { format: 'igmg-lernapp-symbole', version: 1, symbole: [s] };
    expect(fehler(SymbolDateiSchema.safeParse(d))).toEqual([]);
    expect(SymbolDateiSchema.safeParse({ ...d, symbole: [{ ...s, lizenz: 'MIT' }] }).success).toBe(false);
    expect(
      SymbolDateiSchema.safeParse({ ...d, symbole: [{ ...s, quelle: 'openmoji:1F375@17.0.0', lizenz: 'CC-BY-SA-4.0' }] }).success,
    ).toBe(false);
    expect(SymbolDateiSchema.safeParse({ ...d, symbole: [{ ...s, pfade: ['<script>'] }] }).success).toBe(false);
  });
});
