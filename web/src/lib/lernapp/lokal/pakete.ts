import { findeClip, leseBuendelKopf, schneideClip, type BuendelKopf } from '../paket/buendel';
import {
  type Paket,
  paketAdresse,
  PaketSchema,
  type Verzeichnis,
  verzeichnisAdresse,
  type VerzeichnisEinheit,
  VerzeichnisSchema,
} from '../paket/typen';
import type { PaketEintrag, Speicher } from './db';

/**
 * Pakete und Audio-Bündel auf dem Gerät (ADR 0039 Nr. 2, 3, 12; Fortschreibung S4/S5 Nr. 8). Client-Modul.
 *
 * - Kursverzeichnis `/lern-app/pakete/<kurs>`: Netz zuerst, ohne Netz die zuletzt gespeicherte Fassung.
 * - Einheitenpaket `/lern-app/pakete/<kurs>/<einheit>/<hash>`: Vorrat zuerst; aus dem Netz nur, wenn SHA-256 der Bytes gleich
 *   dem Hash der Adresse ist (sonst verworfen). Inhalt im Cache Storage `igmg-lernapp-pakete`, Eintrag im Speicher `pakete`
 *   (Hash, Bytes, offline ja/nein).
 * - Audio-Bündel `/lern-app/audio/<sprache>/<datei>.lpa`: nur als ganze 200-Antwort, nie mit `Range` (CDN-Cache, `Cache.put`
 *   nimmt keine 206); Vorrat `igmg-lernapp-audio`. Abspielen: `clipAus` → `Blob.slice` → Objekt-URL.
 * - „Stufe offline speichern“ (`speichereOffline`) bittet erst dann um dauerhaften Speicher (`navigator.storage.persist()`,
 *   ADR 0038 Nr. 9). Automatisch gespeichert werden nur die aktuelle und die nächste Einheit (`ladePaket`).
 * - Ohne Cache Storage (Tests, alte Browser) laufen alle Funktionen ohne Vorrat weiter.
 */

export const VORRAT_PAKETE = 'igmg-lernapp-pakete';
export const VORRAT_AUDIO = 'igmg-lernapp-audio';

export type Abruf = (adresse: string, init?: RequestInit) => Promise<Response>;
export type PaketOptionen = { abruf?: Abruf; vorrat?: CacheStorage | null; jetzt?: Date };

const standardAbruf: Abruf = (adresse, init) => fetch(adresse, init);
const vorratVon = (o: PaketOptionen): CacheStorage | null =>
  o.vorrat !== undefined ? o.vorrat : typeof caches === 'undefined' ? null : caches;

async function oeffne(vorrat: CacheStorage | null, name: string): Promise<Cache | null> {
  try {
    return vorrat ? await vorrat.open(name) : null;
  } catch {
    return null;
  }
}

/** SHA-256 (hex) mit Web Crypto. */
export async function sha256Hex(daten: ArrayBuffer | Uint8Array): Promise<string> {
  const quelle = daten instanceof Uint8Array ? daten : new Uint8Array(daten);
  const digest = await crypto.subtle.digest('SHA-256', quelle as Uint8Array<ArrayBuffer>);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ——— Kursverzeichnis ———

/** Kursverzeichnis: Netz zuerst (gespeichert im Vorrat), ohne Netz der Vorrat; `null`, wenn beides fehlt oder ungültig ist. */
export async function ladeVerzeichnis(kurs: string, o: PaketOptionen = {}): Promise<Verzeichnis | null> {
  const adresse = verzeichnisAdresse(kurs);
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  try {
    const r = await (o.abruf ?? standardAbruf)(adresse, { cache: 'no-cache', credentials: 'omit' });
    if (r.status === 404) return null;
    if (r.ok) {
      const text = await r.text();
      const p = VerzeichnisSchema.safeParse(JSON.parse(text));
      if (p.success) {
        await cache?.put(adresse, new Response(text, { headers: { 'content-type': 'application/json; charset=utf-8' } }));
        return p.data;
      }
    }
  } catch {
    // offline: Vorrat
  }
  const vorrat = await cache?.match(adresse);
  if (!vorrat) return null;
  const p = VerzeichnisSchema.safeParse(await vorrat.json().catch(() => null));
  return p.success ? p.data : null;
}

// ——— Einheitenpakete ———

export type EinheitVerweis = Pick<VerzeichnisEinheit, 'schluessel' | 'hash' | 'bytes'>;

/** Paket aus dem Vorrat (offline); `null`, wenn es dort fehlt oder nicht zum Hash passt. */
export async function paketImVorrat(kurs: string, einheit: EinheitVerweis, o: PaketOptionen = {}): Promise<Paket | null> {
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  const r = await cache?.match(paketAdresse(kurs, einheit.schluessel, einheit.hash));
  if (!r) return null;
  const bytes = new Uint8Array(await r.arrayBuffer());
  if ((await sha256Hex(bytes)) !== einheit.hash) return null;
  const p = PaketSchema.safeParse(JSON.parse(new TextDecoder().decode(bytes)));
  return p.success ? p.data : null;
}

/**
 * Einheitenpaket laden: Vorrat zuerst, sonst Netz mit Prüfung des Hashs; gespeichert im Vorrat und im Speicher `pakete`.
 * `offline: true` markiert es als bewusst gespeichert (Ring nach Bytes).
 */
export async function ladePaket(
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  o: PaketOptionen & { offline?: boolean } = {},
): Promise<Paket | null> {
  const adresse = paketAdresse(kurs, einheit.schluessel, einheit.hash);
  const vorhanden = await paketImVorrat(kurs, einheit, o);
  if (vorhanden) {
    if (o.offline) await vermerke(sp, kurs, einheit, true, o.jetzt);
    return vorhanden;
  }
  let bytes: Uint8Array;
  try {
    const r = await (o.abruf ?? standardAbruf)(adresse, { credentials: 'omit' });
    if (!r.ok) return null;
    bytes = new Uint8Array(await r.arrayBuffer());
  } catch {
    return null;
  }
  if ((await sha256Hex(bytes)) !== einheit.hash) return null;
  let roh: unknown;
  try {
    roh = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  const p = PaketSchema.safeParse(roh);
  if (!p.success) return null;
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  await cache?.put(
    adresse,
    new Response(bytes as Uint8Array<ArrayBuffer>, { headers: { 'content-type': 'application/json; charset=utf-8' } }),
  );
  await vermerke(sp, kurs, einheit, o.offline ?? false, o.jetzt);
  return p.data;
}

async function vermerke(sp: Speicher, kurs: string, einheit: EinheitVerweis, offline: boolean, jetzt = new Date()): Promise<void> {
  const alt = await sp.lies('pakete', [kurs, einheit.schluessel]);
  const eintrag: PaketEintrag = {
    kurs,
    einheit: einheit.schluessel,
    hash: einheit.hash,
    bytes: einheit.bytes,
    offline: offline || (alt?.hash === einheit.hash && alt.offline),
    geladen: jetzt.toISOString(),
  };
  await sp.schreibe('pakete', [eintrag]);
}

// ——— Audio-Bündel ———

/** Bündel ganz laden (Vorrat zuerst, nie mit `Range`); `null` ohne Netz und Vorrat. */
export async function ladeBuendel(adresse: string, o: PaketOptionen = {}): Promise<Blob | null> {
  const cache = await oeffne(vorratVon(o), VORRAT_AUDIO);
  const vorrat = await cache?.match(adresse);
  if (vorrat) return vorrat.blob();
  try {
    const r = await (o.abruf ?? standardAbruf)(adresse, { credentials: 'omit' });
    if (r.status !== 200) return null;
    const blob = await r.blob();
    await cache?.put(adresse, new Response(blob, { headers: { 'content-type': 'application/octet-stream' } }));
    return blob;
  } catch {
    return null;
  }
}

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

// ——— Offline speichern ———

export type OfflineErgebnis = { einheiten: number; bytes: number; fehlgeschlagen: string[]; dauerhaft: boolean | null };

/**
 * „Stufe offline speichern“: Pakete und Audio-Bündel der Einheiten in den Vorrat, als offline markiert. Bittet vorher um
 * dauerhaften Speicher. `fortschritt` meldet die geladenen Bytes für den Ring (B-27).
 */
export async function speichereOffline(
  sp: Speicher,
  kurs: string,
  einheiten: readonly VerzeichnisEinheit[],
  o: PaketOptionen & { fortschritt?: (geladen: number, gesamt: number) => void } = {},
): Promise<OfflineErgebnis> {
  let dauerhaft: boolean | null = null;
  try {
    dauerhaft = typeof navigator !== 'undefined' && navigator.storage?.persist ? await navigator.storage.persist() : null;
  } catch {
    dauerhaft = null;
  }
  const buendel = [...new Map(einheiten.flatMap((e) => e.audio).map((a) => [a.adresse, a.bytes])).entries()];
  const gesamt = einheiten.reduce((s, e) => s + e.bytes, 0) + buendel.reduce((s, [, b]) => s + b, 0);
  let geladen = 0;
  const fehlgeschlagen: string[] = [];
  for (const e of einheiten) {
    if (await ladePaket(sp, kurs, e, { ...o, offline: true })) geladen += e.bytes;
    else fehlgeschlagen.push(e.schluessel);
    o.fortschritt?.(geladen, gesamt);
  }
  for (const [adresse, b] of buendel) {
    if (await ladeBuendel(adresse, o)) geladen += b;
    else fehlgeschlagen.push(adresse);
    o.fortschritt?.(geladen, gesamt);
  }
  return {
    einheiten: einheiten.length - fehlgeschlagen.filter((f) => !f.startsWith('/')).length,
    bytes: geladen,
    fehlgeschlagen,
    dauerhaft,
  };
}

/**
 * Veraltete Pakete entfernen: Einträge des Kurses, deren Hash das Verzeichnis nicht mehr nennt, verlassen Vorrat und
 * Speicher (ein zurückgezogener Baustein ist damit auch offline weg). Ergebnis: Einheiten, die neu zu laden sind, weil sie
 * offline gespeichert waren.
 */
export async function raeumeAuf(sp: Speicher, verzeichnis: Verzeichnis, o: PaketOptionen = {}): Promise<VerzeichnisEinheit[]> {
  const aktuell = new Map(verzeichnis.einheiten.map((e) => [e.schluessel, e]));
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  const neuLaden: VerzeichnisEinheit[] = [];
  for (const eintrag of await sp.alle('pakete', [[verzeichnis.kurs], [verzeichnis.kurs, []]])) {
    const e = aktuell.get(eintrag.einheit);
    if (e?.hash === eintrag.hash) continue;
    await cache?.delete(paketAdresse(eintrag.kurs, eintrag.einheit, eintrag.hash));
    await sp.loesche('pakete', [eintrag.kurs, eintrag.einheit]);
    if (e && eintrag.offline) neuLaden.push(e);
  }
  return neuLaden;
}
