import type { Sprache } from '../kurse';
import { AUDIO_MANIFEST_FORMAT, type AudioManifestDatei, AudioManifestDateiSchema } from '../inhalt/schema';
import { baueBuendel, buendelBlobSchluessel, buendelDatei, leseBuendelKopf, leseBuendelPfad } from '../paket/buendel';
import { sha256Hex } from '../paket/hash';

/**
 * Audio-Manifest und Bündelbau (`pnpm lernapp:audio-manifest`, ADR 0039 Nr. 3, 6.3–6.4 mit Fortschreibung S4/S5; PLAN
 * §6.8 Schritte 4–5). Rein: Bytes rein, Bytes und Manifest raus; Dateisystem, Blob und Prüfbericht bleiben im Skript.
 *
 * - **Bündel je Zielsprache, Einheit und Stimme** (`<einheit>-<sha16>.lpa`): Ein Bündel nimmt je Text höchstens einen Clip
 *   auf; eine menschliche Aufnahme und die Sprachausgabe desselben Texts liegen deshalb in verschiedenen Bündeln.
 * - **Neubau nur der betroffenen Bündel:** neue oder ersetzte Clips und entfernte Texte (Zurückziehen, `entfernen`) bauen das
 *   Bündel ihrer Gruppe neu – mit den übrigen Clips aus dem alten Bündel. Neue Bytes → neuer Name; das alte Bündel bleibt
 *   im Blob, bis Menschen es löschen (`alteBuendel`).
 * - **Manifest:** je Clip textHash → Bündel (Blob-Schlüssel), Versatz, Länge, Dauer, Stimme, SHA-256 des Clips, Format;
 *   sortiert nach textHash und Stimme (gleiche Eingabe → gleiche Datei).
 */

export type ManifestStimme = AudioManifestDatei['stimmen'][number];
export type ManifestClip = AudioManifestDatei['clips'][number];

export type NeuerClip = { textHash: string; stimme: string; einheit: string; daten: Uint8Array };

export type GebautesBuendel = {
  sprache: Sprache;
  einheit: string;
  stimme: string;
  datei: string;
  /** Blob-Schlüssel `lernapp/audio/<sprache>/<datei>` */
  schluessel: string;
  sha256: string;
  bytes: Uint8Array;
  clips: number;
};

export class ManifestFehler extends Error {}

export function leeresManifest(sprache: Sprache): AudioManifestDatei {
  return { format: AUDIO_MANIFEST_FORMAT, version: 1, sprache, stimmen: [], clips: [] };
}

/** Manifest aus JSON lesen und prüfen (Schema samt Querbezügen). */
export function leseManifest(text: string): AudioManifestDatei {
  const r = AudioManifestDateiSchema.safeParse(JSON.parse(text));
  if (!r.success) throw new ManifestFehler(r.error.issues.map((i) => `${i.path.join('.') || '$'}: ${i.message}`).join('; '));
  return r.data;
}

/** Manifest als JSON (eine Zeile je Clip, damit Diffs lesbar bleiben). */
export function manifestText(m: AudioManifestDatei): string {
  const kopf = JSON.stringify({ format: m.format, version: m.version, sprache: m.sprache, stimmen: m.stimmen }, null, 2);
  const clips = m.clips.map((c) => `    ${JSON.stringify(c)}`).join(',\n');
  return `${kopf.slice(0, -2)},\n  "clips": [${clips ? `\n${clips}\n  ` : ''}]\n}\n`;
}

/** Einheit eines Bündels aus seinem Blob-Schlüssel. */
export function einheitVonBuendel(schluessel: string): string {
  const p = leseBuendelPfad(schluessel.replace(/^lernapp\/audio\//, ''));
  if (!p) throw new ManifestFehler(`Bündel ungültig: ${schluessel}`);
  return p.einheit;
}

/** Clips eines Bündels aus seinen Bytes (geprüft gegen das Manifest: Länge und SHA-256 je Clip). */
export function clipsAusBuendel(bytes: Uint8Array, erwartet: readonly ManifestClip[]): Map<string, Uint8Array> {
  const kopf = leseBuendelKopf(bytes, bytes.length);
  const aus = new Map<string, Uint8Array>();
  for (const c of kopf.clips) aus.set(c.textHash, bytes.subarray(c.versatz, c.versatz + c.laenge));
  for (const e of erwartet) {
    const d = aus.get(e.textHash);
    if (!d || d.length !== e.laenge || sha256Hex(d) !== e.sha256)
      throw new ManifestFehler(`Clip ${e.textHash} passt nicht zum Bündel ${e.buendel}`);
  }
  return aus;
}

const gruppe = (einheit: string, stimme: string) => `${einheit}|${stimme}`;
const ordne = (a: ManifestClip, b: ManifestClip) =>
  a.textHash < b.textHash ? -1 : a.textHash > b.textHash ? 1 : a.stimme < b.stimme ? -1 : a.stimme > b.stimme ? 1 : 0;

/**
 * Plan des Neubaus: betroffene Gruppen (Einheit und Stimme) – neue Clips, ersetzte und entfernte alte Clips – und je
 * bisherigem Bündel die Clips, die der Neubau aus ihm übernimmt (`uebrig`; leer: Das Bündel entfällt oder bleibt).
 */
function planeNeubau(alt: AudioManifestDatei, neu: ReadonlyMap<string, NeuerClip>, entfernen: ReadonlySet<string>) {
  const betroffen = new Set<string>();
  for (const c of neu.values()) betroffen.add(gruppe(c.einheit, c.stimme));
  const altJeBuendel = new Map<string, ManifestClip[]>();
  for (const c of alt.clips) altJeBuendel.set(c.buendel, [...(altJeBuendel.get(c.buendel) ?? []), c]);
  for (const c of alt.clips)
    if (neu.has(`${c.textHash}|${c.stimme}`) || entfernen.has(c.textHash)) betroffen.add(gruppe(einheitVonBuendel(c.buendel), c.stimme));
  return [...altJeBuendel].map(([schluessel, clips]) => {
    const einheit = einheitVonBuendel(schluessel);
    const imBuendel = clips.filter((c) => betroffen.has(gruppe(einheit, c.stimme)));
    const uebrig = imBuendel.filter((c) => !entfernen.has(c.textHash) && !neu.has(`${c.textHash}|${c.stimme}`));
    return { schluessel, einheit, clips, imBuendel, uebrig };
  });
}

const neuJeSchluessel = (neu: readonly NeuerClip[]) => new Map(neu.map((c) => [`${c.textHash}|${c.stimme}`, c]));

/**
 * Bisherige Bündel, aus denen der Neubau Clips übernimmt – genau die, für die {@link ergaenzeManifest} `alteClips` ruft. Das
 * Skript holt nur diese, je Bündel einmal (lokal oder aus dem Blob), statt aller Bündel des Manifests.
 */
export function alteBuendelFuerNeubau(eingabe: {
  alt: AudioManifestDatei;
  neu: readonly NeuerClip[];
  entfernen?: ReadonlySet<string>;
}): string[] {
  return planeNeubau(eingabe.alt, neuJeSchluessel(eingabe.neu), eingabe.entfernen ?? new Set())
    .filter((p) => p.uebrig.length)
    .map((p) => p.schluessel)
    .sort();
}

/**
 * Neue Clips ins Manifest aufnehmen und die betroffenen Bündel neu bauen.
 *
 * @param alt          bisheriges Manifest (oder leer)
 * @param neu          neue bzw. ersetzende Clips (je textHash und Stimme höchstens einer)
 * @param entfernen    textHashes, deren Clips aller Stimmen entfallen (Zurückziehen, Religionsbezug, gelöschte Texte)
 * @param stimmen      Angaben der verwendeten Stimmen (Namensnennung); bisherige Einträge bleiben, wenn noch benutzt
 * @param alteClips    Bytes der Clips eines bisherigen Bündels (Blob-Schlüssel) – nur für betroffene Gruppen gerufen
 */
export function ergaenzeManifest(eingabe: {
  alt: AudioManifestDatei;
  neu: readonly NeuerClip[];
  entfernen?: ReadonlySet<string>;
  stimmen: readonly ManifestStimme[];
  alteClips: (schluessel: string, clips: readonly ManifestClip[]) => Map<string, Uint8Array>;
}): { manifest: AudioManifestDatei; buendel: GebautesBuendel[]; alteBuendel: string[] } {
  const { alt } = eingabe;
  const sprache = alt.sprache;
  const entfernen = eingabe.entfernen ?? new Set<string>();
  const neuJe = new Map<string, NeuerClip>();
  for (const c of eingabe.neu) {
    const k = `${c.textHash}|${c.stimme}`;
    if (neuJe.has(k)) throw new ManifestFehler(`Clip doppelt: ${c.textHash} (${c.stimme})`);
    if (entfernen.has(c.textHash)) throw new ManifestFehler(`Clip für einen entfernten Text: ${c.textHash}`);
    neuJe.set(k, c);
  }

  const bleiben: ManifestClip[] = [];
  const zuBauen = new Map<string, { einheit: string; stimme: string; clips: { textHash: string; daten: Uint8Array }[] }>();
  const alteBuendel = new Set<string>();
  const sammle = (einheit: string, stimme: string, textHash: string, daten: Uint8Array) => {
    const k = gruppe(einheit, stimme);
    const g = zuBauen.get(k) ?? { einheit, stimme, clips: [] };
    g.clips.push({ textHash, daten });
    zuBauen.set(k, g);
  };
  for (const { schluessel, einheit, clips, imBuendel, uebrig } of planeNeubau(alt, neuJe, entfernen)) {
    if (!imBuendel.length) {
      bleiben.push(...clips);
      continue;
    }
    if (imBuendel.length !== clips.length) throw new ManifestFehler(`Bündel ${schluessel} mischt Stimmen`);
    alteBuendel.add(schluessel);
    if (!uebrig.length) continue;
    const bytes = eingabe.alteClips(schluessel, uebrig);
    for (const c of uebrig) sammle(einheit, c.stimme, c.textHash, bytes.get(c.textHash)!);
  }
  for (const c of neuJe.values()) sammle(c.einheit, c.stimme, c.textHash, c.daten);

  // Ein Text hat je Stimme genau einen Clip, auch über Einheiten hinweg
  const schonDa = new Set(bleiben.map((c) => `${c.textHash}|${c.stimme}`));
  for (const g of zuBauen.values())
    for (const c of g.clips) {
      const k = `${c.textHash}|${g.stimme}`;
      if (schonDa.has(k)) throw new ManifestFehler(`Clip ${c.textHash} (${g.stimme}) liegt schon in einem anderen Bündel`);
      schonDa.add(k);
    }

  const buendel: GebautesBuendel[] = [];
  const neueClips: ManifestClip[] = [];
  for (const g of [...zuBauen.values()].sort((a, b) => (gruppe(a.einheit, a.stimme) < gruppe(b.einheit, b.stimme) ? -1 : 1))) {
    const { bytes, kopf } = baueBuendel({ sprache, einheit: g.einheit, clips: g.clips });
    const sha = sha256Hex(bytes);
    const datei = buendelDatei(g.einheit, sha);
    const schluessel = buendelBlobSchluessel(sprache, datei);
    buendel.push({ sprache, einheit: g.einheit, stimme: g.stimme, datei, schluessel, sha256: sha, bytes, clips: kopf.clips.length });
    for (const k of kopf.clips)
      neueClips.push({
        textHash: k.textHash,
        buendel: schluessel,
        versatz: k.versatz,
        laenge: k.laenge,
        dauerMs: k.dauerMs,
        stimme: g.stimme,
        sha256: sha256Hex(bytes.subarray(k.versatz, k.versatz + k.laenge)),
        format: 'webm-opus',
      });
  }

  const clips = [...bleiben, ...neueClips].sort(ordne);
  const benutzt = new Set(clips.map((c) => c.stimme));
  const stimmenJe = new Map<string, ManifestStimme>();
  for (const s of [...alt.stimmen, ...eingabe.stimmen]) if (benutzt.has(s.id)) stimmenJe.set(s.id, s);
  for (const s of benutzt) if (!stimmenJe.has(s)) throw new ManifestFehler(`Angaben zur Stimme fehlen: ${s}`);
  const manifest: AudioManifestDatei = {
    format: AUDIO_MANIFEST_FORMAT,
    version: 1,
    sprache,
    stimmen: [...stimmenJe.values()].sort((a, b) => (a.id < b.id ? -1 : 1)),
    clips,
  };
  const geprueft = AudioManifestDateiSchema.safeParse(manifest);
  if (!geprueft.success) throw new ManifestFehler(geprueft.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  // Ein unverändert neu gebautes Bündel (gleiche Bytes) ist kein altes
  for (const b of buendel) alteBuendel.delete(b.schluessel);
  return { manifest, buendel, alteBuendel: [...alteBuendel].sort() };
}
