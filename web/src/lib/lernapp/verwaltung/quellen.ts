/**
 * Quellenregister der Lern-App in der Verwaltung (L3-06, PLAN §7.1, ADR 0025/0045): liest die `QUELLE.md` der gepinnten
 * Datensätze unter `web/daten/` (Titel, Lizenz, Namensnennung, Dateien mit SHA-256) und führt die Stimmen der
 * Sprachausgabe mit ihrer Herkunftskette (Beleg `_lernapp/belege/S3-stimmen.md` §4, ohne Arabisch). Rein: Das Lesen der
 * Dateien liegt in `server/queries/lernapp/quellen.ts`.
 */

/** Datensätze der Lern-App (Sprachdaten, Modelle, Quellenregister Wissen) und die Daten des Religionswächters. */
export const LERNAPP_DATENSAETZE = [
  { ordner: 'tatoeba', zweck: 'saetze' },
  { ordner: 'kaikki', zweck: 'woerterbuch' },
  { ordner: 'haeufigkeit', zweck: 'haeufigkeit' },
  { ordner: 'lernapp-modelle', zweck: 'modelle' },
  { ordner: 'hanafi-quellen', zweck: 'wissen' },
  { ordner: 'tanzil', zweck: 'waechter' },
  { ordner: 'hadith', zweck: 'waechter' },
] as const;
export type DatensatzZweck = (typeof LERNAPP_DATENSAETZE)[number]['zweck'];

export type QuellenDatei = { abschnitt: string; datei: string; bytes: number | null; sha256: string };
export type QuellenBeschreibung = {
  titel: string;
  lizenzen: string[];
  namensnennungen: string[];
  dateien: QuellenDatei[];
};

const SHA = /\b[0-9a-f]{64}\b/;

function zellen(zeile: string): string[] | null {
  const t = zeile.trim();
  if (!t.startsWith('|') || !t.endsWith('|')) return null;
  return t
    .slice(1, -1)
    .split('|')
    .map((z) => z.trim());
}

const istTrenner = (z: string[]) => z.every((x) => /^:?-{3,}:?$/.test(x));
/** Markdown-Hervorhebungen und Code-Striche entfernen (Anzeige als Text). */
const klar = (s: string) => s.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').trim();

/**
 * Liest eine `QUELLE.md`: Titel (erste Überschrift, ohne „QUELLE:“), Lizenzen und Namensnennungen aus zweispaltigen
 * Angabentabellen (`| Lizenz | … |`) bzw. der Spalte „Lizenz“ mehrspaltiger Tabellen, Dateien aus jeder Tabelle mit einer
 * Spalte „SHA-256“ (erste Spalte = Datei bzw. Pfad, „Bytes“ falls vorhanden), je mit der Abschnittsüberschrift.
 */
export function leseQuelleMd(text: string): QuellenBeschreibung {
  const zeilen = text.split('\n');
  const titelZeile = zeilen.find((z) => /^#\s/.test(z)) ?? '';
  const titel = klar(titelZeile.replace(/^#\s+/, '').replace(/^QUELLE:\s*/i, ''));
  const lizenzen: string[] = [];
  const namensnennungen: string[] = [];
  const dateien: QuellenDatei[] = [];
  let abschnitt = '';
  let kopf: string[] | null = null;
  /** erster Absatz eines Abschnitts „Lizenz …“ in Prosa (Rückfall, wenn keine Tabelle die Lizenz nennt) */
  let lizenzProsa: string | null = null;
  for (let i = 0; i < zeilen.length; i++) {
    const zeile = zeilen[i] ?? '';
    if (/^#{2,}\s/.test(zeile)) {
      abschnitt = klar(zeile.replace(/^#+\s+/, ''));
      kopf = null;
      continue;
    }
    const z = zellen(zeile);
    if (!z) {
      kopf = null;
      if (lizenzProsa === null && /^Lizenz/i.test(abschnitt) && zeile.trim() && !zeile.startsWith('-')) lizenzProsa = klar(zeile).slice(0, 400);
      continue;
    }
    if (istTrenner(z)) continue;
    const naechste = zellen(zeilen[i + 1] ?? '');
    if (!kopf && naechste && istTrenner(naechste)) {
      kopf = z.map(klar);
      continue;
    }
    if (!kopf) continue;
    // Angabentabelle: | Feld | Angabe |
    if (kopf.length === 2 && z.length === 2) {
      const feld = klar(z[0] ?? '');
      const wert = klar(z[1] ?? '');
      if (/^Lizenz$/i.test(feld) && wert) lizenzen.push(wert);
      if (/^Namensnennung$/i.test(feld) && wert) namensnennungen.push(wert);
      continue;
    }
    const lizenzSpalte = kopf.findIndex((k) => /^Lizenz$/i.test(k));
    if (lizenzSpalte >= 0 && z[lizenzSpalte]) lizenzen.push(klar(z[lizenzSpalte] ?? ''));
    const shaSpalte = kopf.findIndex((k) => /SHA-256/i.test(k));
    if (shaSpalte < 0) continue;
    const sha = SHA.exec(z[shaSpalte] ?? '')?.[0];
    if (!sha) continue;
    const bytesSpalte = kopf.findIndex((k) => /^Bytes$/i.test(k));
    const bytes = bytesSpalte >= 0 ? Number((z[bytesSpalte] ?? '').replace(/[^\d]/g, '')) : NaN;
    dateien.push({ abschnitt, datei: klar(z[0] ?? ''), bytes: Number.isFinite(bytes) && bytes > 0 ? bytes : null, sha256: sha });
  }
  if (!lizenzen.length && lizenzProsa) lizenzen.push(lizenzProsa);
  return { titel, lizenzen: [...new Set(lizenzen)], namensnennungen: [...new Set(namensnennungen)], dateien };
}

/** Stand einer Stimme nach S3/L3-E10 (KERN 4.0 §4). */
export type StimmenStand = 'standard' | 'geplant' | 'zurueckgestellt' | 'nicht_verwendet' | 'abgelehnt';

export type StimmenHerkunft = {
  /** Schlüssel der Texte unter `verwaltung.lernapp.quellen.stimme.<id>` (Gewichte, Daten, Code, Befund, Namensnennung) */
  id: 'thorsten' | 'piperMls' | 'glowTts' | 'chatterbox' | 'clartts';
  /** Eigenname der Stimme bzw. des Modells */
  name: string;
  sprachen: readonly ('de' | 'tr' | 'ar')[];
  stand: StimmenStand;
  /** Kennung im Audio-Manifest (`tts:<modell>@<sha>`), sobald Clips erzeugt sind */
  manifest: string | null;
  /** Lizenzkennungen von Gewichten und Daten */
  lizenzGewichte: string;
  lizenzDaten: string;
  /** Hat die Stimme eine Namensnennung (Text unter `…stimme.<id>.namensnennung`)? */
  namensnennung: boolean;
  beleg: string;
};

/**
 * Stimmen mit Herkunftskette aus Daten, Basismodell und Gewichten (L0-E03; Beleg S3 §4/§5, geprüft am 17. und 20.10.2026).
 * Hier nur sprachneutrale Angaben (Eigennamen, Lizenzkennungen, Belege); die Beschreibungen stehen in
 * `messages/verwaltung/lernapp.json`. Werke nur beschrieben, ohne arabische Titel (KERN 4.0 §3).
 */
export const STIMMEN: readonly StimmenHerkunft[] = [
  {
    id: 'thorsten',
    name: 'Coqui-VITS Thorsten',
    sprachen: ['de'],
    stand: 'standard',
    manifest: 'tts:coqui-vits-thorsten-onnx@<sha>',
    lizenzGewichte: 'Apache-2.0',
    lizenzDaten: 'CC0-1.0',
    namensnennung: true,
    beleg: '_lernapp/belege/S3-stimmen.md §4, §5; ADR 0045 (S3/S8 Nr. 1)',
  },
  {
    id: 'piperMls',
    name: 'Piper de_DE-mls-medium',
    sprachen: ['de'],
    stand: 'nicht_verwendet',
    manifest: null,
    lizenzGewichte: 'CC-BY-4.0',
    lizenzDaten: 'CC-BY-4.0',
    namensnennung: false,
    beleg: '_lernapp/belege/S3-stimmen.md §3.5, §4',
  },
  {
    id: 'glowTts',
    name: 'Coqui glow-tts tr + HiFi-GAN',
    sprachen: ['tr'],
    stand: 'zurueckgestellt',
    manifest: null,
    lizenzGewichte: 'MIT',
    lizenzDaten: '[ungeklärt]',
    namensnennung: false,
    beleg: '_lernapp/belege/S3-stimmen.md §4, §5; ADR 0045 (S3/S8 Nr. 2)',
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox Multilingual V3',
    sprachen: ['tr', 'ar'],
    stand: 'abgelehnt',
    manifest: null,
    lizenzGewichte: 'MIT',
    lizenzDaten: '[undokumentiert]',
    namensnennung: false,
    beleg: '_lernapp/belege/S3-stimmen.md §3.6, §4, §5; ADR 0045 (S3/S8 Nr. 2–3)',
  },
  {
    id: 'clartts',
    name: 'ClArTTS (eigene Stimme)',
    sprachen: ['ar'],
    stand: 'geplant',
    manifest: null,
    lizenzGewichte: '–',
    lizenzDaten: 'CC-BY-4.0',
    namensnennung: false,
    beleg: '_lernapp/belege/S3-stimmen.md §4, §6; ADR 0045 (S3/S8 Nr. 3)',
  },
];
