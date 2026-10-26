import { type Lektion, LektionSchema } from '../aufgaben/schema';
import type { BedeutungsSprache } from '../koran/typen';
import { findeClip, leseBuendelKopf, schneideClip, type BuendelKopf } from '../paket/buendel';
import { type Paket, PaketSchema } from '../paket/typen';
import type { Speicher } from './db';
import { ladeKoranPaket, ladeKoranVerzeichnis } from './koran';
import {
  type EinheitVerweis,
  istPaketKopf,
  ladePaketGeprueft,
  type PaketKopf,
  type PaketOptionen,
  paketImVorratGeprueft,
  type Pruefung,
} from './vorrat';

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
 * `PaketSchema` dazu, die Wiederholung, Einstufung und Tipps vor dem Lesen der Aufgaben brauchen. Der Spieler prüft nur die
 * gespielte Lektion voll (`ladeLektion`, Stufe C N8).
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

/** Eine Lektion zum Spielen samt dem Kopf ihres Pakets (Einheit, Lektionen mit Schlüssel und Titel für „Weiter lernen“). */
export type LektionImPaket = { paket: PaketKopf; lektion: Lektion };

/**
 * Prüfung für den Spieler (Stufe C N8): das Paket nur im Kopf (ohne Zod, wie im Lernpfad), die gespielte Lektion voll gegen
 * `LektionSchema`. Die volle Prüfung des ganzen Pakets (≈ 120 Aufgaben) kostete beim Öffnen einer Lektion ≈ 10–45 ms auf dem
 * Hauptfaden (CPU ungedrosselt); jede andere Lektion wird geprüft, wenn sie gespielt wird. Die Bytes sind wie immer über
 * SHA-256 gegen die Adresse geprüft.
 */
export const nurLektion =
  (schluessel: string): Pruefung<LektionImPaket> =>
  (roh) => {
    if (!istPaketKopf(roh)) return null;
    const l = roh.lektionen.find((x) => x.schluessel === schluessel);
    const geprueft = l ? LektionSchema.safeParse(l) : null;
    return geprueft?.success ? { paket: roh, lektion: geprueft.data } : null;
  };

/** Lektion zum Spielen laden: Vorrat zuerst, sonst Netz (Hash geprüft); voll geprüft wird nur diese Lektion (`nurLektion`). */
export const ladeLektion = (
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  schluessel: string,
  o: PaketOptionen & { offline?: boolean } = {},
): Promise<LektionImPaket | null> => ladePaketGeprueft(sp, kurs, einheit, nurLektion(schluessel), o);

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

/**
 * Lektion des Koran-Arabisch-Pfads (L6-05) für den Spieler: Verzeichnis der Sprache (Netz zuerst), Einheit mit dieser
 * Lektion, Paket unter seinem SHA-256, Lektion gegen `LektionSchema` geprüft und nur aus `koran_wort` (sonst `null`). Dazu
 * der Schlüssel der nächsten spielbaren Lektion im Pfad (aus dem Verzeichnis), sonst `null`.
 */
export async function ladeKoranLektion(
  sprache: BedeutungsSprache,
  schluessel: string,
  abruf?: typeof fetch,
): Promise<{ lektion: Lektion; naechste: string | null } | null> {
  const v = await ladeKoranVerzeichnis(sprache, abruf);
  const einheit = v?.einheiten.find((e) => e.lektionen.includes(schluessel));
  const paket = v && einheit ? await ladeKoranPaket(sprache, einheit, abruf) : null;
  const roh = paket?.lektionen.find((l) => l.schluessel === schluessel);
  const lektion = roh ? LektionSchema.safeParse(roh) : null;
  if (!v || !lektion?.success || lektion.data.kurs !== 'koran' || !lektion.data.aufgaben.every((a) => a.typ === 'koran_wort')) return null;
  const reihe = v.einheiten.flatMap((e) => e.lektionen);
  return { lektion: lektion.data, naechste: reihe[reihe.indexOf(schluessel) + 1] ?? null };
}
