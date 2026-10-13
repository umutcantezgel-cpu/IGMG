/**
 * Aufnahmen aus dem Browser (MediaRecorder, WebM/Opus) tragen keine Dauer im Kopf: Chromium zeigt dann „unendlich“ und
 * springt nur unzuverlässig an eine Stelle – die Werkstatt und der Player springen aber an jeden Versanfang. Diese
 * reine Funktion trägt die Dauer (EBML-Element `Duration` in `Segment › Info`) nach, bevor die Datei hochgeladen wird.
 * Alles andere bleibt Byte für Byte gleich. Unbekannter Aufbau oder schon vorhandene Dauer: Datei unverändert zurück.
 */
const ID_EBML = 0x1a45dfa3;
const ID_SEGMENT = 0x18538067;
const ID_INFO = 0x1549a966;
const ID_CLUSTER = 0x1f43b675;
const ID_DAUER = 0x4489;
const ID_ZEITSKALA = 0x2ad7b1;

type Kopf = { id: number; groesse: number | null; inhalt: number };

/** Länge eines EBML-Ganzzahlfelds aus dem ersten Byte (1–8), 0 = ungültig. */
function vintLaenge(b: number): number {
  for (let i = 0; i < 8; i++) if (b & (0x80 >> i)) return i + 1;
  return 0;
}

/** Element-Kopf an `p`: ID (mit Markierungsbits), Größe (null = unbekannt) und Beginn des Inhalts. */
function leseKopf(d: Uint8Array, p: number): Kopf | null {
  const idLaenge = vintLaenge(d[p] ?? 0);
  if (!idLaenge || idLaenge > 4 || p + idLaenge >= d.length) return null;
  let id = 0;
  for (let i = 0; i < idLaenge; i++) id = id * 256 + d[p + i];
  const q = p + idLaenge;
  const gLaenge = vintLaenge(d[q] ?? 0);
  if (!gLaenge || q + gLaenge > d.length) return null;
  let groesse = d[q] & (0xff >> gLaenge);
  let alleEins = groesse === 0xff >> gLaenge;
  for (let i = 1; i < gLaenge; i++) {
    groesse = groesse * 256 + d[q + i];
    if (d[q + i] !== 0xff) alleEins = false;
  }
  return { id, groesse: alleEins ? null : groesse, inhalt: q + gLaenge };
}

/** Größenfeld mit 8 Byte (passt immer, ändert keine andere Länge). */
function groesse8(wert: number): Uint8Array {
  const b = new Uint8Array(8);
  b[0] = 0x01;
  let rest = wert;
  for (let i = 7; i >= 1; i--) {
    b[i] = rest % 256;
    rest = Math.floor(rest / 256);
  }
  return b;
}

function idBytes(id: number): Uint8Array {
  const b: number[] = [];
  for (let rest = id; rest > 0; rest = Math.floor(rest / 256)) b.unshift(rest % 256);
  return Uint8Array.from(b);
}

function verbinde(...teile: Uint8Array[]): Uint8Array {
  const ergebnis = new Uint8Array(teile.reduce((n, t) => n + t.length, 0));
  let p = 0;
  for (const t of teile) {
    ergebnis.set(t, p);
    p += t.length;
  }
  return ergebnis;
}

/** Liest die Dauer (in Millisekunden) aus `Segment › Info`, null ohne Dauer oder bei unbekanntem Aufbau. */
export function webmDauer(d: Uint8Array): number | null {
  const info = findeInfo(d);
  if (!info) return null;
  return info.dauerMs;
}

function findeInfo(d: Uint8Array): { kopfStart: number; kopf: Kopf; segment: Kopf & { start: number }; dauerMs: number | null; skala: number } | null {
  const ebml = leseKopf(d, 0);
  if (!ebml || ebml.id !== ID_EBML || ebml.groesse === null) return null;
  const segStart = ebml.inhalt + ebml.groesse;
  const segment = leseKopf(d, segStart);
  if (!segment || segment.id !== ID_SEGMENT) return null;
  let p = segment.inhalt;
  while (p < d.length) {
    const k = leseKopf(d, p);
    if (!k || k.id === ID_CLUSTER) return null;
    if (k.groesse === null) return null;
    if (k.id === ID_INFO) {
      let skala = 1_000_000;
      let dauer: number | null = null;
      let q = k.inhalt;
      const ende = k.inhalt + k.groesse;
      while (q < ende) {
        const c = leseKopf(d, q);
        if (!c || c.groesse === null) return null;
        const wert = d.subarray(c.inhalt, c.inhalt + c.groesse);
        if (c.id === ID_ZEITSKALA) skala = wert.reduce((n, b) => n * 256 + b, 0) || skala;
        if (c.id === ID_DAUER && (c.groesse === 4 || c.groesse === 8)) {
          const sicht = new DataView(wert.buffer, wert.byteOffset, wert.byteLength);
          dauer = c.groesse === 8 ? sicht.getFloat64(0) : sicht.getFloat32(0);
        }
        q = c.inhalt + c.groesse;
      }
      return { kopfStart: p, kopf: k, segment: { ...segment, start: segStart }, dauerMs: dauer === null ? null : (dauer * skala) / 1e6, skala };
    }
    p = k.inhalt + k.groesse;
  }
  return null;
}

/** Trägt die Dauer in eine WebM-Datei ohne Dauer ein (siehe Dateikopf). */
export function webmMitDauer(d: Uint8Array, dauerMs: number): Uint8Array {
  if (!(dauerMs > 0)) return d;
  const info = findeInfo(d);
  if (!info || info.dauerMs !== null || info.kopf.groesse === null) return d;
  const { kopfStart, kopf, segment, skala } = info;
  const dauerElement = new Uint8Array(11);
  dauerElement.set([0x44, 0x89, 0x88]);
  new DataView(dauerElement.buffer).setFloat64(3, (dauerMs * 1e6) / skala);
  const alterInhalt = d.subarray(kopf.inhalt, kopf.inhalt + kopf.groesse);
  const neueInfo = verbinde(idBytes(ID_INFO), groesse8(kopf.groesse + dauerElement.length), alterInhalt, dauerElement);
  const zuwachs = neueInfo.length - (kopf.inhalt + kopf.groesse - kopfStart);
  // Segment mit bekannter Größe (selten bei MediaRecorder): Größe anpassen
  const segmentKopf =
    segment.groesse === null
      ? d.subarray(segment.start, segment.inhalt)
      : verbinde(idBytes(ID_SEGMENT), groesse8(segment.groesse + zuwachs));
  return verbinde(
    d.subarray(0, segment.start),
    segmentKopf,
    d.subarray(segment.inhalt, kopfStart),
    neueInfo,
    d.subarray(kopf.inhalt + kopf.groesse),
  );
}
