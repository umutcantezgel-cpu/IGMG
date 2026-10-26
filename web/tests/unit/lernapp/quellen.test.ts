import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ABSCHNITTE, BIBLIOTHEKEN as WEBSITE_BIBLIOTHEKEN } from '@/app/[locale]/(website)/quellen/verzeichnis';
import { ALLE_STIMMEN } from '@/lib/lernapp/audio/stimmen';
import { LIZENZTEXTE } from '@/lib/lernapp/lizenztexte';
import {
  BIBLIOTHEKEN,
  BILDKARTEN,
  DATEN,
  DATEN_IDS,
  DATEN_LIZENZEN,
  ORT_DRITTLIZENZEN,
  SCHRIFTEN,
  SPRACHERKENNUNG,
} from '@/lib/lernapp/quellen';
import { LIZENZ_DATEIEN, MODELL, ORT } from '@/lib/lernapp/sprechen/modell';
import { VORRAT_DATEIEN } from '@/lib/lernapp/sprechen/vorrat';

/**
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7): Fassungen wie in node_modules, Lizenzen wie in den Paketen,
 * Lizenztexte gleich den Lizenzdateien (ohne Urheberzeile), Urheberzeilen aus den Lizenzdateien.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
// onnxruntime-web ist eine Abhängigkeit von transformers.js (pnpm: neben ihm im eigenen node_modules)
const TRANSFORMERS = realpathSync(join(WEB, 'node_modules', '@huggingface', 'transformers'));
const ordner = (name: string) =>
  name === 'onnxruntime-web'
    ? join(TRANSFORMERS, '..', '..', 'onnxruntime-web')
    : name === '@huggingface/jinja' || name === '@huggingface/tokenizers'
      ? join(TRANSFORMERS, '..', name.split('/')[1]!)
      : join(WEB, 'node_modules', name);
const paket = (name: string) => JSON.parse(readFileSync(join(ordner(name), 'package.json'), 'utf8'));
const lizenzNebenGewichten = (datei: string) => readFileSync(join(WEB, 'public', 'lern-app', 'modelle', MODELL.name, datei), 'utf8');
const normal = (s: string) => s.replace(/\s+/g, ' ').trim();
const lernTexte = (sprache: string) => JSON.parse(readFileSync(join(WEB, 'messages', 'lernapp', `${sprache}.json`), 'utf8'));

describe('Quellen der Lern-App', () => {
  it('Bibliotheken: Fassung und Lizenz wie das installierte Paket', () => {
    const zuPaket: Record<string, string> = {
      next: 'next',
      react: 'react',
      'lucide-react': 'lucide-react',
      idb: 'idb',
      'ts-fsrs': 'ts-fsrs',
      'fastest-levenshtein': 'fastest-levenshtein',
      zod: 'zod',
      'altcha-lib': 'altcha-lib',
      transformers: '@huggingface/transformers',
      tokenizers: '@huggingface/tokenizers',
      jinja: '@huggingface/jinja',
      'onnxruntime-web': 'onnxruntime-web',
    };
    for (const b of BIBLIOTHEKEN) {
      const p = paket(zuPaket[b.id]);
      expect(b.version, b.id).toBe(p.version);
      expect(b.lizenz, b.id).toBe(p.license);
    }
  });

  it('Schriften: Fassung der @fontsource-Pakete, OFL, Urheber aus der Lizenzdatei', () => {
    const datei: Record<string, [string, string]> = {
      'atkinson-hyperlegible-next': ['@fontsource/atkinson-hyperlegible-next', 'src/fonts/atkinson-hyperlegible-next-OFL.txt'],
      'noto-sans-arabic': ['@fontsource/noto-sans-arabic', 'src/fonts/noto-sans-arabic-OFL.txt'],
      amiri: ['@fontsource/amiri', 'src/fonts/amiri-OFL.txt'],
    };
    for (const s of SCHRIFTEN) {
      expect(s.lizenz, s.id).toBe('OFL-1.1');
      if (!datei[s.id]) continue;
      const [name, lizenz] = datei[s.id];
      expect(s.version, s.id).toBe(paket(name).version);
      expect(normal(readFileSync(join(WEB, lizenz), 'utf8')), s.id).toContain(normal(s.urheber));
    }
    expect(SCHRIFTEN.map((s) => s.id)).toEqual(['atkinson-hyperlegible-next', 'noto-sans-arabic', 'amiri', 'igmg-wetzlar-titel']);
  });

  it('jede Bibliothek, die Client-Code der Lern-App importiert, steht in der Liste (aus den Quellen ermittelt)', () => {
    const ids = new Set(BIBLIOTHEKEN.map((b) => b.id));
    // Pakete, deren Eintrag anders heißt (react-dom gehört zu React; im Worker gebündelte Pakete unter eigenem Namen)
    const eintragVon: Record<string, string> = {
      'react-dom': 'react',
      '@huggingface/transformers': 'transformers',
      '@huggingface/tokenizers': 'tokenizers',
      '@huggingface/jinja': 'jinja',
    };
    // Client-Code: Komponenten, Seiten und Module der Lern-App ohne `server-only` und ohne Node-Module (die laufen nur auf
    // dem Server oder beim Bau). Erfasst werden statische, dynamische und Seiteneffekt-Importe, keine reinen Typ-Importe.
    const dateien = ['src/components/lernapp', 'src/lib/lernapp', 'src/app/lern-app'].flatMap((o) =>
      readdirSync(join(WEB, o), { recursive: true, encoding: 'utf8' })
        .filter((d) => /\.(ts|tsx|mjs)$/.test(d) && !d.endsWith('.d.ts'))
        .map((d) => join(WEB, o, d)),
    );
    const pakete = new Set<string>();
    for (const datei of dateien) {
      const text = readFileSync(datei, 'utf8');
      if (/^import 'server-only';/m.test(text) || /from 'node:|import\('node:/.test(text)) continue;
      const ohneTypen = text.replace(/^(?:import|export) type [^;]*;/gm, '');
      for (const [, quelle] of ohneTypen.matchAll(/(?:\bfrom|^import|\bimport\()\s*'([^']+)'/gm)) {
        if (quelle!.startsWith('.') || quelle!.startsWith('@/')) continue;
        const teile = quelle!.split('/');
        pakete.add(quelle!.startsWith('@') ? teile.slice(0, 2).join('/') : teile[0]!);
      }
    }
    // Stichprobe der Erkennung: der Melde-Dialog (altcha-lib, L3-06b) und der Worker der Sprechübung
    expect([...pakete]).toEqual(expect.arrayContaining(['react', 'lucide-react', 'idb', 'altcha-lib', '@huggingface/transformers']));
    for (const p of pakete) expect(ids.has(eintragVon[p] ?? p), p).toBe(true);
    // altcha-lib ist exakt gepinnt (L0-E10)
    const abhaengigkeiten = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8')).dependencies as Record<string, string>;
    expect(abhaengigkeiten['altcha-lib']).toBe(BIBLIOTHEKEN.find((b) => b.id === 'altcha-lib')!.version);
    expect(normal(readFileSync(join(WEB, 'node_modules', 'altcha-lib', 'LICENSE.txt'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'altcha-lib')!.urheber),
    );
    // Abhängigkeiten von transformers.js stehen in der Liste und im Lizenzkopf des Workers
    const abhaengig = Object.keys(paket('@huggingface/transformers').dependencies as Record<string, string>).filter((n) =>
      n.startsWith('@huggingface/'),
    );
    expect(abhaengig.sort()).toEqual(['@huggingface/jinja', '@huggingface/tokenizers']);
    const bauschritt = readFileSync(join(WEB, 'scripts', 'lernapp-modelle.mjs'), 'utf8');
    for (const n of [...abhaengig, '@huggingface/transformers', 'onnxruntime-web']) expect(bauschritt, n).toContain(`${n} \${`);
    expect(normal(readFileSync(join(ordner('@huggingface/jinja'), 'LICENSE'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'jinja')!.urheber),
    );
    expect(normal(readFileSync(join(WEB, 'node_modules', 'zod', 'LICENSE'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'zod')!.urheber),
    );
  });

  it('Lizenztexte gleich den Lizenzdateien', () => {
    expect(normal(readFileSync(join(WEB, 'node_modules', 'fastest-levenshtein', 'LICENSE.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'next', 'license.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'idb', 'LICENSE'), 'utf8'))).toContain(normal(LIZENZTEXTE.ISC));
    for (const ofl of ['noto-sans-arabic-OFL.txt', 'amiri-OFL.txt', 'atkinson-hyperlegible-next-OFL.txt'])
      expect(normal(readFileSync(join(WEB, 'src', 'fonts', ofl), 'utf8')), ofl).toContain(normal(LIZENZTEXTE['OFL-1.1']));
    expect(LIZENZTEXTE['OFL-1.1']).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(normal(readFileSync(join(TRANSFORMERS, 'LICENSE'), 'utf8'))).toContain(normal(LIZENZTEXTE['Apache-2.0']));
    expect(normal(lizenzNebenGewichten('LIZENZ-Apache-2.0.txt'))).toContain(normal(LIZENZTEXTE['Apache-2.0']));
    expect(normal(lizenzNebenGewichten('LIZENZ-whisper-MIT.txt'))).toContain(normal(LIZENZTEXTE.MIT));
  });

  it('Spracherkennung (ADR 0042 Nr. 3 und 10): Modell, Bibliotheken und Lizenztexte neben den Gewichten', () => {
    expect(SPRACHERKENNUNG.map((q) => [q.id, q.lizenz])).toEqual([
      ['whisper', 'MIT'],
      ['whisper-base-onnx', 'Apache-2.0'],
    ]);
    // Urheber von Whisper wie im Lizenztext neben den Gewichten; Commit der ONNX-Fassung wie das ausgelieferte Modell
    expect(normal(lizenzNebenGewichten('LIZENZ-whisper-MIT.txt'))).toContain(SPRACHERKENNUNG[0]!.urheber);
    expect(MODELL.commit.startsWith(SPRACHERKENNUNG[1]!.version)).toBe(true);
    expect(MODELL.name).toContain(SPRACHERKENNUNG[1]!.version);
    expect(BIBLIOTHEKEN.find((b) => b.id === 'onnxruntime-web')?.version).toBe(ORT.version);
    expect(LIZENZ_DATEIEN.map((d) => d.pfad)).toEqual(['LIZENZ-whisper-MIT.txt', 'LIZENZ-Apache-2.0.txt']);
  });

  it('Daten (L8-03, ADR 0045 Nr. 3–7, Z-L17): nur zulässige Lizenzen; Lizenz und Namensnennung wie in web/daten/<ordner>/QUELLE.md', () => {
    expect(DATEN.map((d) => d.id)).toEqual([...DATEN_IDS]);
    // KERN 4.0 §1: ausgelieferte Daten nur CC0, CC BY, CC BY-SA (Unlicense = Verzicht wie CC0); nie NC, ND, „nur Forschung“
    expect(Object.keys(DATEN_LIZENZEN).sort()).toEqual(['CC-BY-2.0-FR', 'CC-BY-3.0', 'CC-BY-SA-4.0', 'CC0-1.0', 'Unlicense']);
    const quelle = (ordner: string) => normal(readFileSync(join(WEB, 'daten', ordner, 'QUELLE.md'), 'utf8'));
    for (const d of DATEN.filter((x) => x.gruppe === 'sprache')) {
      const q = quelle(d.ordner);
      expect(q, d.id).toContain(DATEN_LIZENZEN[d.lizenz].name);
      // Tatoeba: die Angabe je Satz aus QUELLE.md; die Zusätze (ohne Benutzername, Paare, „bearbeitet“) stehen dort als Liste
      const kern = d.id === 'tatoeba' ? d.namensnennung.slice(0, d.namensnennung.indexOf('; ohne Benutzername')) : d.namensnennung;
      expect(q, d.id).toContain(normal(kern));
    }
    expect(quelle('tatoeba')).toContain('Teilmenge CC0 1.0');
    expect(DATEN.find((d) => d.id === 'tatoeba')?.auchLizenz).toBe('CC0-1.0');
    expect(quelle('haeufigkeit')).toContain('## wordfreq 3.1.1');
    expect(quelle('haeufigkeit')).toContain('Release v1.0');
    expect(quelle('haeufigkeit')).toContain('525f9b560de45753a5ea01069454e72e9aa541c6');
    const tanzil = quelle('tanzil');
    expect(tanzil).toContain('Copyright (C) 2007-2026 Tanzil Project');
    expect(tanzil).toContain('License: Creative Commons Attribution 3.0');
    expect(tanzil).toContain('Version 1.1');
    const hadith = quelle('hadith');
    expect(hadith).toContain('Lizenz: Unlicense');
    expect(hadith).toContain('df57907be35291c91ad6a6691180e22ca9920784');
    // Koran und Hadith nur als Verweis und Prüfgrundlage (KERN 4.0 §2.2, §3); die Sprachdaten haben eigene Verwendungstexte
    expect(DATEN.filter((d) => d.gruppe === 'religion').map((d) => d.id)).toEqual(['tanzil', 'bukhari']);
    for (const sprache of ['de', 'tr', 'ar'])
      for (const d of DATEN) expect(lernTexte(sprache).lizenzverzeichnis.verwendungen[d.id], `${sprache} ${d.id}`).toBeTruthy();
  });

  it('Bildkarten: Lucide-Fassung wie das Paket und symbole.json; die Feather-Symbole laut Lizenzdatei von Lucide', () => {
    const symbole = JSON.parse(readFileSync(join(WEB, 'inhalte', 'lernapp', 'symbole', 'symbole.json'), 'utf8')).symbole as Record<
      string,
      { quelle: string; lizenz: string }
    >;
    const namen = new Set<string>();
    for (const s of Object.values(symbole)) {
      const [, name, version] = /^lucide:([a-z0-9-]+)@(.+)$/.exec(s.quelle) ?? [];
      expect(version, s.quelle).toBe(BILDKARTEN.version);
      expect(s.lizenz).toBe(BILDKARTEN.lizenz);
      namen.add(name!);
    }
    expect(paket('lucide-react').version).toBe(BILDKARTEN.version);
    const lizenz = readFileSync(join(WEB, 'node_modules', 'lucide-react', 'LICENSE'), 'utf8');
    const feather = new Set(
      lizenz
        .split('derived from the Feather project:')[1]!
        .split('The MIT License')[0]!
        .split(/[\s,]+/)
        .filter(Boolean),
    );
    expect([...namen].filter((n) => feather.has(n)).sort()).toEqual([...BILDKARTEN.feather.symbole]);
    expect(normal(lizenz)).toContain(BILDKARTEN.feather.urheber);
    expect(normal(lizenz)).toContain(normal(LIZENZTEXTE.MIT));
  });

  it('Drittlizenzen von ONNX Runtime (ADR 0042 Nr. 10): Volltext gepinnt und ausgeliefert, Stand wie onnxruntime-web', () => {
    const sha = (pfad: string) => createHash('sha256').update(readFileSync(pfad)).digest('hex');
    const gepinnt = join(WEB, 'daten', 'lernapp-lizenzen', 'onnxruntime-ThirdPartyNotices.txt');
    const ausgeliefert = join(WEB, 'public', ...ORT_DRITTLIZENZEN.pfad.split('/').filter(Boolean));
    expect(sha(gepinnt)).toBe(ORT_DRITTLIZENZEN.sha256);
    expect(sha(ausgeliefert)).toBe(ORT_DRITTLIZENZEN.sha256);
    const quelle = readFileSync(join(WEB, 'daten', 'lernapp-lizenzen', 'QUELLE.md'), 'utf8');
    expect(quelle).toContain(`\`${ORT_DRITTLIZENZEN.sha256}\``);
    expect(quelle).toContain(ORT_DRITTLIZENZEN.stand);
    expect(quelle).toContain(`public${ORT_DRITTLIZENZEN.pfad}`);
    // gleicher Commit wie die ausgelieferte Laufzeit (Fassungskennung endet auf die ersten 9 Zeichen des Commits)
    expect(ORT.version.endsWith(ORT_DRITTLIZENZEN.stand.slice(0, 9))).toBe(true);
    const text = readFileSync(gepinnt, 'utf8');
    expect(text.startsWith('THIRD PARTY SOFTWARE NOTICES AND INFORMATION')).toBe(true);
    expect(text).toMatch(/\nEigen\n+MPL v2\.0\n/);
    // nicht unter /lern-app/modelle/ (dort genau 12 Dateien, scripts/lernapp-modelle.mjs)
    expect(ORT_DRITTLIZENZEN.pfad.startsWith('/lern-app/modelle/')).toBe(false);
    // offline (Z-L17): Der Download der Sprachprüfung legt sie neben die ORT-.wasm in den Vorrat, der Lern-App-SW liefert sie
    // von dort; die Seite sagt das in allen drei Sprachen
    expect(VORRAT_DATEIEN.filter((d) => d.pfad === ORT_DRITTLIZENZEN.pfad)).toEqual([expect.objectContaining({ lizenz: true })]);
    expect(readFileSync(join(WEB, 'public', 'lern-app', 'sw.js'), 'utf8')).toContain("pfad.startsWith('/lern-app/lizenzen/')");
    for (const ui of ['de', 'tr', 'ar']) {
      const t = JSON.parse(readFileSync(join(WEB, 'messages', 'lernapp', `${ui}.json`), 'utf8')) as {
        lizenzverzeichnis: { drittlizenzenText: string };
      };
      expect(t.lizenzverzeichnis.drittlizenzenText, ui).toMatch({ de: /ohne Verbindung/, tr: /bağlantı olmadan/, ar: /دون اتصال/ }[ui]!);
    }
  });

  it('Website /quellen: OFL-Volltext bei den Schriften, libvips (LGPL-3.0-or-later) neben sharp (Stufe C, Z-L17/Z-L19)', () => {
    const schriften = ABSCHNITTE.find((a) => a.id === 'schriften');
    expect(schriften?.zusatz).toBe('ofl');
    expect(schriften?.eintraege.every((e) => e.lizenz?.name === 'SIL Open Font License 1.1')).toBe(true);
    const seite = readFileSync(join(WEB, 'src', 'app', '[locale]', '(website)', 'quellen', 'page.tsx'), 'utf8');
    expect(seite).toContain("{LIZENZTEXTE['OFL-1.1']}");
    const ids = WEBSITE_BIBLIOTHEKEN.map((b) => b.id);
    expect(ids.indexOf('libvips')).toBe(ids.indexOf('sharp') + 1);
    expect(WEBSITE_BIBLIOTHEKEN.find((b) => b.id === 'libvips')?.lizenz.name).toBe('LGPL-3.0-or-later');
    // die mitgelieferte Bibliothek steht wirklich unter dieser Lizenz (optionales Plattformpaket von sharp)
    const libvips = readdirSync(join(WEB, 'node_modules', '.pnpm')).filter((n) => n.startsWith('@img+sharp-libvips-'));
    expect(libvips.length).toBeGreaterThan(0);
    for (const n of libvips) {
      const pj = JSON.parse(
        readFileSync(
          join(WEB, 'node_modules', '.pnpm', n, 'node_modules', '@img', n.split('@')[1]!.replace('img+', ''), 'package.json'),
          'utf8',
        ),
      ) as { license: string };
      expect(pj.license, n).toBe('LGPL-3.0-or-later');
    }
    const texte = JSON.parse(readFileSync(join(WEB, 'messages', 'bereiche', 'quellen.json'), 'utf8'));
    for (const sprache of ['de', 'tr', 'en']) {
      expect(texte[sprache].quellen.ofl.titel, sprache).toBeTruthy();
      expect(texte[sprache].quellen.bibliotheken.zwecke.libvips, sprache).toBeTruthy();
    }
  });

  it('Website /quellen nennt alles, was die Lern-App ausliefert (Daten, Bildkarten, Spracherkennung, Stimmen, Schriften, Bibliotheken)', () => {
    const eintraege = new Map(ABSCHNITTE.flatMap((a) => a.eintraege.map((e) => [e.id, { ...e, abschnitt: a.id }] as const)));
    for (const d of DATEN.filter((x) => x.gruppe === 'sprache')) {
      expect(eintraege.get(d.id)?.abschnitt, d.id).toBe('lernapp-daten');
      expect(eintraege.get(d.id)?.namensnennung, d.id).toBe(d.namensnennung);
      expect(eintraege.get(d.id)?.url, d.id).toBe(d.adresse);
    }
    expect(eintraege.get('tanzil')?.abschnitt).toBe('koran');
    expect(eintraege.get('hadith-api')?.abschnitt).toBe('hadith');
    expect(eintraege.get('lucide-bildkarten')?.abschnitt).toBe('lernapp-daten');
    expect(eintraege.get('onnxruntime-web')?.drittlizenzen?.url).toBe(ORT_DRITTLIZENZEN.pfad);
    expect(eintraege.get('whisper')?.lizenz?.name).toBe('MIT');
    expect(eintraege.get('whisper-onnx')?.lizenz?.name).toBe('Apache-2.0');
    expect(eintraege.get('transformers-js')?.lizenz?.name).toBe('Apache-2.0');
    for (const s of ALLE_STIMMEN)
      expect([...eintraege.values()].some((e) => e.abschnitt === 'sprachausgabe' && e.url === s.modellAdresse)).toBe(true);
    // Schriften und Bibliotheken der Lern-App (Eintrag auf der Website anders benannt bzw. im Abschnitt Spracherkennung)
    const schrift: Record<string, string> = {
      'atkinson-hyperlegible-next': 'atkinson',
      'noto-sans-arabic': 'noto-sans-arabic',
      amiri: 'amiri',
      'igmg-wetzlar-titel': 'source-serif',
    };
    for (const s of SCHRIFTEN) expect(eintraege.get(schrift[s.id]!)?.abschnitt, s.id).toBe('schriften');
    const bibliothek: Record<string, string> = {
      'lucide-react': 'lucide',
      'altcha-lib': 'altcha',
      transformers: 'transformers-js',
      // im Bündel von Transformers.js, dort in der Fassung genannt
      tokenizers: 'transformers-js',
      jinja: 'transformers-js',
    };
    const website = new Set([...WEBSITE_BIBLIOTHEKEN.map((b) => b.id), ...eintraege.keys()]);
    for (const b of BIBLIOTHEKEN) expect(website.has(bibliothek[b.id] ?? b.id), b.id).toBe(true);
    // Texte je Eintrag in de, tr, en (Fassung und Verwendung Pflicht, Änderungen und Hinweis nach Kennzeichen)
    const texte = JSON.parse(readFileSync(join(WEB, 'messages', 'bereiche', 'quellen.json'), 'utf8'));
    for (const sprache of ['de', 'tr', 'en'])
      for (const e of eintraege.values()) {
        const t = texte[sprache].quellen.eintraege[e.id];
        expect(t?.fassung && t?.verwendung, `${sprache} ${e.id}`).toBeTruthy();
        if (e.aenderungen) expect(t.aenderungen, `${sprache} ${e.id}`).toBeTruthy();
        if (e.hinweis) expect(t.hinweis, `${sprache} ${e.id}`).toBeTruthy();
      }
  });
});
