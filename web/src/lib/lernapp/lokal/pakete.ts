import { findeClip, leseBuendelKopf, schneideClip, type BuendelKopf } from '../paket/buendel';
import { type Paket, PaketSchema } from '../paket/typen';
import type { Speicher } from './db';
import { type EinheitVerweis, ladePaketGeprueft, type PaketOptionen, paketImVorratGeprueft, type Pruefung } from './vorrat';

/**
 * Pakete und Audio-Bündel auf dem Gerät (ADR 0039 Nr. 2, 3, 12; Fortschreibung S4/S5 Nr. 8). Client-Modul.
 *
 * - Kursverzeichnis `/lern-app/pakete/<kurs>`: Netz zuerst, ohne Netz die zuletzt gespeicherte Fassung.
 * - Einheitenpaket `/lern-app/pakete/<kurs>/<einheit>/<hash>`: Vorrat zuerst; aus dem Netz nur, wenn SHA-256 der Bytes gleich
 *   dem Hash der Adresse ist (sonst verworfen). Inhalt im Cache Storage `igmg-lernapp-pakete`, Eintrag im Speicher `pakete`
 *   (Hash, Bytes, offline ja/nein).
 * - Audio-Bündel `/lern-app/audio/<sprache>/<datei>.lpa`: nur als ganze 200-Antwort, nie mit `Range` (CDN-Cache, `Cache.put`
 *   nimmt keine 206); Vorrat `igmg-lernapp-audio`. Abspielen: `clipAus` → `Blob.slice` → Objekt-URL.
 * - „Einheit offline speichern“ (`speichereOffline`) bittet erst dann um dauerhaften Speicher (`navigator.storage.persist()`,
 *   ADR 0038 Nr. 9). Automatisch gespeichert werden nur die aktuelle und die nächste Einheit (`ladePaket`).
 * - Ohne Cache Storage (Tests, alte Browser) laufen alle Funktionen ohne Vorrat weiter.
 *
 * Der Kern ohne Zod liegt in `vorrat.ts` (Lernpfad, Offline-Speichern); hier kommt die volle Prüfung des Pakets gegen
 * `PaketSchema` dazu, die Spieler, Wiederholung und Tipps vor dem Lesen der Aufgaben brauchen.
 */

export {
  type Abruf,
  type EinheitVerweis,
  ladeBuendel,
  ladeVerzeichnis,
  type OfflineErgebnis,
  type PaketOptionen,
  raeumeAuf,
  sha256Hex,
  speichereOffline,
  VORRAT_AUDIO,
  VORRAT_PAKETE,
} from './vorrat';

const voll: Pruefung<Paket> = (roh) => {
  const p = PaketSchema.safeParse(roh);
  return p.success ? p.data : null;
};

/** Paket aus dem Vorrat (offline); `null`, wenn es dort fehlt, nicht zum Hash passt oder ungültig ist. */
export const paketImVorrat = (kurs: string, einheit: EinheitVerweis, o: PaketOptionen = {}): Promise<Paket | null> =>
  paketImVorratGeprueft(kurs, einheit, voll, o);

/**
 * Einheitenpaket laden: Vorrat zuerst, sonst Netz mit Prüfung des Hashs; gespeichert im Vorrat und im Speicher `pakete`.
 * `offline: true` markiert es als bewusst gespeichert (Ring nach Bytes).
 */
export const ladePaket = (
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  o: PaketOptionen & { offline?: boolean } = {},
): Promise<Paket | null> => ladePaketGeprueft(sp, kurs, einheit, voll, o);

/** Kopf eines geladenen Bündels lesen (Index der Clips). */
export async function buendelKopf(buendel: Blob): Promise<BuendelKopf> {
  const anfang = new Uint8Array(await buendel.slice(0, 8).arrayBuffer());
  const laenge = new DataView(anfang.buffer).getUint32(4, false);
  return leseBuendelKopf(new Uint8Array(await buendel.slice(0, 8 + laenge).arrayBuffer()), buendel.size);
}

/** Clip zu einem Text-Hash als eigener Blob (`audio/webm`), oder `null`. */
export async function clipAus(buendel: Blob, textHash: string, kopf?: BuendelKopf): Promise<Blob | null> {
  const k = kopf ?? (await buendelKopf(buendel));
  const clip = findeClip(k, textHash);
  return clip ? schneideClip(buendel, clip) : null;
}
