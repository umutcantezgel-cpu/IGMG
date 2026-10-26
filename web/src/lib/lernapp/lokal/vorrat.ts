import type { Lektion } from '../aufgaben/schema';
import { istKurs, istKursSlug, istPaketKurs, istSprache, type KursSlug, STUFEN } from '../kurse';
import { INHALT_LIZENZ, PAKET_FORMAT, paketAdresse, VERZEICHNIS_FORMAT, verzeichnisAdresse } from '../paket/kennungen';
import type { Paket, Verzeichnis, VerzeichnisEinheit } from '../paket/typen';
import type { PaketEintrag, Speicher } from './db';

/**
 * Vorrat der Pakete und Bündel auf dem Gerät (ADR 0039 Nr. 2, 3, 12; Fortschreibung S4/S5 Nr. 8), ohne Zod: Kern für den
 * Lernpfad (KERN 4.0 §9 – eigener Anteil ≤ 30 KB). Integrität über SHA-256 der Bytes gegen die Adresse; geprüft wird hier
 * nur die Form, die Lernpfad und Offline-Speichern brauchen (Verzeichnis ganz, Paket im Kopf). Die volle Prüfung des Pakets
 * gegen `PaketSchema` (Zod) macht `pakete.ts` vor dem Spielen. Client-Modul.
 *
 * - Kursverzeichnis `/lern-app/pakete/<kurs>`: Netz zuerst, ohne Netz die zuletzt gespeicherte Fassung.
 * - Einheitenpaket `/lern-app/pakete/<kurs>/<einheit>/<hash>`: Vorrat zuerst; aus dem Netz nur mit gleichem SHA-256.
 *   Inhalt im Cache Storage `igmg-lernapp-pakete`, Eintrag im Speicher `pakete` (Hash, Bytes, offline ja/nein).
 * - Audio-Bündel: nur als ganze 200-Antwort, nie mit `Range`; Vorrat `igmg-lernapp-audio`.
 * - „Einheit offline speichern“ bittet erst dann um dauerhaften Speicher (`navigator.storage.persist()`, ADR 0038 Nr. 9).
 * - Ohne Cache Storage (Tests, alte Browser) laufen alle Funktionen ohne Vorrat weiter.
 */

export const VORRAT_PAKETE = 'igmg-lernapp-pakete';
export const VORRAT_AUDIO = 'igmg-lernapp-audio';

export type Abruf = (adresse: string, init?: RequestInit) => Promise<Response>;
/** `signal`: bricht laufende Abrufe ab („Stufe offline speichern“ ist abbrechbar, Stufe C N9a). */
export type PaketOptionen = { abruf?: Abruf; vorrat?: CacheStorage | null; jetzt?: Date; signal?: AbortSignal };

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

/** Eintrag aus dem Vorrat entfernen; Fehler des Cache Storage halten nichts auf. */
async function entferne(cache: Cache | null, anfrage: RequestInfo): Promise<void> {
  try {
    await cache?.delete(anfrage);
  } catch {
    // Vorrat nicht verfügbar: nichts zu entfernen
  }
}

/** SHA-256 (hex) mit Web Crypto. */
export async function sha256Hex(daten: ArrayBuffer | Uint8Array): Promise<string> {
  const quelle = daten instanceof Uint8Array ? daten : new Uint8Array(daten);
  const digest = await crypto.subtle.digest('SHA-256', quelle as Uint8Array<ArrayBuffer>);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ——— Form prüfen (ohne Zod) ———

type Roh = Record<string, unknown>;
const istObjekt = (x: unknown): x is Roh => typeof x === 'object' && x !== null && !Array.isArray(x);
const istGanz = (x: unknown, min = Number.MIN_SAFE_INTEGER): x is number => Number.isInteger(x) && (x as number) >= min;
const nurSchluessel = (x: Roh, erlaubt: readonly string[]) => Object.keys(x).every((k) => erlaubt.includes(k));
const istStufe = (x: unknown) => (STUFEN as readonly unknown[]).includes(x);
const istLernText = (x: unknown) =>
  istObjekt(x) && nurSchluessel(x, ['de', 'tr', 'ar']) && Object.values(x).every((v) => v === undefined || typeof v === 'string');
const istBuendelVerweis = (x: unknown) =>
  istObjekt(x) &&
  nurSchluessel(x, ['adresse', 'bytes']) &&
  typeof x.adresse === 'string' &&
  x.adresse.startsWith('/lern-app/audio/') &&
  istGanz(x.bytes, 1);
const istAudioListe = (x: unknown) => Array.isArray(x) && x.length <= 40 && x.every(istBuendelVerweis);

const EINHEIT_FELDER = ['schluessel', 'stufe', 'reihenfolge', 'thema', 'symbol', 'hash', 'bytes', 'lektionen', 'hinweis', 'audio'];

function istVerzeichnisEinheit(x: unknown): x is VerzeichnisEinheit {
  return (
    istObjekt(x) &&
    nurSchluessel(x, EINHEIT_FELDER) &&
    typeof x.schluessel === 'string' &&
    istStufe(x.stufe) &&
    istGanz(x.reihenfolge) &&
    istLernText(x.thema) &&
    (x.symbol === undefined || typeof x.symbol === 'string') &&
    typeof x.hash === 'string' &&
    /^[0-9a-f]{64}$/.test(x.hash) &&
    istGanz(x.bytes, 1) &&
    istGanz(x.lektionen, 1) &&
    typeof x.hinweis === 'boolean' &&
    istAudioListe(x.audio)
  );
}

/** Kursverzeichnis in der Form von `VerzeichnisSchema` (Unit-Test hält beide gleich). */
export function istVerzeichnis(x: unknown): x is Verzeichnis {
  return (
    istObjekt(x) &&
    nurSchluessel(x, ['format', 'version', 'kurs', 'kursId', 'zielsprache', 'ausgangssprache', 'stand', 'einheiten']) &&
    x.format === VERZEICHNIS_FORMAT &&
    x.version === 1 &&
    istKursSlug(x.kurs) &&
    istKurs(x.kursId) &&
    istSprache(x.zielsprache) &&
    (x.ausgangssprache === null || istSprache(x.ausgangssprache)) &&
    istGanz(x.stand, 0) &&
    Array.isArray(x.einheiten) &&
    x.einheiten.every(istVerzeichnisEinheit)
  );
}

/** Ein Einheitenpaket, so weit Lernpfad und Offline-Speichern es lesen (Lektionen nur mit Kopf). */
export type PaketKopf = Omit<Paket, 'lektionen'> & { lektionen: Pick<Lektion, 'schluessel' | 'titel' | 'art'>[] };

/**
 * Kopf eines Einheitenpakets (Format, Richtung bzw. Wissenskurs, Einheit, Lektionen mit Schlüssel und Art); die volle Prüfung
 * macht `pakete.ts`. Der Prüfvermerk des Wissenskurses (`wissen`) ist ein Objekt oder fehlt.
 */
export function istPaketKopf(x: unknown): x is PaketKopf {
  return (
    istObjekt(x) &&
    x.format === PAKET_FORMAT &&
    x.version === 1 &&
    istPaketKurs(x.kurs) &&
    (x.wissen === undefined || istObjekt(x.wissen)) &&
    istSprache(x.zielsprache) &&
    istSprache(x.ausgangssprache) &&
    istObjekt(x.einheit) &&
    typeof x.einheit.schluessel === 'string' &&
    istStufe(x.einheit.stufe) &&
    typeof x.hinweis === 'boolean' &&
    Array.isArray(x.lektionen) &&
    x.lektionen.length > 0 &&
    x.lektionen.every(
      (l) =>
        istObjekt(l) &&
        typeof l.schluessel === 'string' &&
        typeof l.art === 'string' &&
        (l.titel === undefined || typeof l.titel === 'string') &&
        Array.isArray(l.aufgaben),
    ) &&
    istObjekt(x.eintraege) &&
    Array.isArray(x.tipps) &&
    istAudioListe(x.audio) &&
    x.lizenz === INHALT_LIZENZ
  );
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
      const v: unknown = JSON.parse(text);
      if (istVerzeichnis(v)) {
        await cache?.put(adresse, new Response(text, { headers: { 'content-type': 'application/json; charset=utf-8' } }));
        return v;
      }
    }
  } catch {
    // offline: Vorrat
  }
  const vorrat = await cache?.match(adresse);
  if (!vorrat) return null;
  const v: unknown = await vorrat.json().catch(() => null);
  return istVerzeichnis(v) ? v : null;
}

// ——— Einheitenpakete ———

export type EinheitVerweis = Pick<VerzeichnisEinheit, 'schluessel' | 'hash' | 'bytes'>;
/** Prüft ein gelesenes Paket (JSON) und liefert es in der gewünschten Form, sonst `null`. */
export type Pruefung<P> = (roh: unknown) => P | null;

const kopf: Pruefung<PaketKopf> = (roh) => (istPaketKopf(roh) ? roh : null);

const lies = (bytes: Uint8Array): unknown => {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

/** Bytes eines Pakets aus dem Vorrat (offline), nur wenn sie zum Hash passen; sonst `null` („nicht im Vorrat“). */
async function bytesImVorrat(kurs: string, einheit: EinheitVerweis, o: PaketOptionen): Promise<Uint8Array | null> {
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  const r = await cache?.match(paketAdresse(kurs, einheit.schluessel, einheit.hash));
  if (!r) return null;
  const bytes = new Uint8Array(await r.arrayBuffer());
  return (await sha256Hex(bytes)) === einheit.hash ? bytes : null;
}

/** Paket aus dem Vorrat (offline); `null`, wenn es dort fehlt, nicht zum Hash passt oder die Prüfung scheitert. */
export async function paketImVorratGeprueft<P>(
  kurs: string,
  einheit: EinheitVerweis,
  pruefe: Pruefung<P>,
  o: PaketOptionen = {},
): Promise<P | null> {
  const bytes = await bytesImVorrat(kurs, einheit, o);
  return bytes ? pruefe(lies(bytes)) : null;
}

/**
 * Vermerk im Speicher `pakete`. Hatte die Einheit dort eine andere Fassung (alter Hash), verlässt deren Paket den Vorrat –
 * je Einheit liegt höchstens die aktuelle Fassung auf dem Gerät (Restliste L6, Quellen-Seite ohne alte Fassungen).
 */
async function vermerke(
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  offline: boolean,
  jetzt = new Date(),
  cache: Cache | null = null,
): Promise<void> {
  const alt = await sp.lies('pakete', [kurs, einheit.schluessel]);
  if (alt && alt.hash !== einheit.hash) await entferne(cache, paketAdresse(kurs, einheit.schluessel, alt.hash));
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

/**
 * Einheitenpaket laden: Vorrat zuerst, sonst Netz mit Prüfung des Hashs; gespeichert im Vorrat und im Speicher `pakete`.
 * `offline: true` markiert es als bewusst gespeichert (Ring nach Bytes).
 *
 * Liegt das Paket mit passendem Hash im Vorrat, scheitert aber die Prüfung (etwa eine Lektion, die es in dieser Fassung
 * nicht gibt – ein veraltetes `?l=`), bleibt es bei `null`: Das Netz lieferte dieselben Bytes, das ganze Paket wird nicht
 * erneut geladen (Stufe C N9a, Gegenprüfung N8 Nr. 5f). Aus dem Netz kommt nur, was nicht im Vorrat liegt.
 */
export async function ladePaketGeprueft<P>(
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  pruefe: Pruefung<P>,
  o: PaketOptionen & { offline?: boolean } = {},
): Promise<P | null> {
  const adresse = paketAdresse(kurs, einheit.schluessel, einheit.hash);
  const imVorrat = await bytesImVorrat(kurs, einheit, o);
  if (imVorrat) {
    const vorhanden = pruefe(lies(imVorrat));
    if (vorhanden && o.offline) await vermerke(sp, kurs, einheit, true, o.jetzt, await oeffne(vorratVon(o), VORRAT_PAKETE));
    return vorhanden;
  }
  let bytes: Uint8Array;
  try {
    const r = await (o.abruf ?? standardAbruf)(adresse, { credentials: 'omit', signal: o.signal });
    if (!r.ok) return null;
    bytes = new Uint8Array(await r.arrayBuffer());
  } catch {
    return null;
  }
  if ((await sha256Hex(bytes)) !== einheit.hash) return null;
  const p = pruefe(lies(bytes));
  if (!p) return null;
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  await cache?.put(
    adresse,
    new Response(bytes as Uint8Array<ArrayBuffer>, { headers: { 'content-type': 'application/json; charset=utf-8' } }),
  );
  await vermerke(sp, kurs, einheit, o.offline ?? false, o.jetzt, cache);
  return p;
}

/** Paketkopf laden (Lernpfad: Lektionen, Tipps; automatisches Speichern der aktuellen und nächsten Einheit). */
export const ladePaketKopf = (sp: Speicher, kurs: string, einheit: EinheitVerweis, o: PaketOptionen & { offline?: boolean } = {}) =>
  ladePaketGeprueft(sp, kurs, einheit, kopf, o);

/** Paketkopf aus dem Vorrat (ohne Netz). */
export const paketKopfImVorrat = (kurs: string, einheit: EinheitVerweis, o: PaketOptionen = {}) =>
  paketImVorratGeprueft(kurs, einheit, kopf, o);

const PAKET_PFAD = /^\/lern-app\/pakete\/([^/]+)\/([^/]+)\/([0-9a-f]{64})$/;

type PaketAdresse = { kurs: string; schluessel: string; hash: string; anfrage: Request };

/** Einheitenpakete im Vorrat nach ihrer Adresse (Kurs, Einheit, Hash); ohne Cache Storage oder bei Fehlern leer. */
async function paketAdressen(cache: Cache | null): Promise<PaketAdresse[]> {
  let anfragen: readonly Request[] = [];
  try {
    anfragen = cache ? await cache.keys() : [];
  } catch {
    return [];
  }
  return anfragen.flatMap((anfrage) => {
    const [, kurs = '', schluessel = '', hash = ''] = PAKET_PFAD.exec(new URL(anfrage.url).pathname) ?? [];
    return kurs ? [{ kurs, schluessel, hash, anfrage }] : [];
  });
}

/** Hash je Einheit aus dem zuletzt gespeicherten Kursverzeichnis (ohne Netz); `null`, wenn es fehlt oder ungültig ist. */
async function aktuelleHashes(cache: Cache, kurs: string): Promise<Map<string, string> | null> {
  const r = await cache.match(verzeichnisAdresse(kurs)).catch(() => undefined);
  const v: unknown = r ? await r.json().catch(() => null) : null;
  return istVerzeichnis(v) ? new Map(v.einheiten.map((e) => [e.schluessel, e.hash])) : null;
}

/**
 * Alle Einheitenpakete im Vorrat (ohne Netz), je mit passendem Hash und gültigem Kopf – für die Namensnennung je Satz und
 * Eintrag auf `/lern-app/<ui>/quellen` (ADR 0039 Nr. 9). Kursverzeichnisse und Ungültiges fallen weg. Je Einheit zählt nur
 * die Fassung, die das zuletzt gespeicherte Kursverzeichnis nennt; ältere Fassungen und Einheiten, die es nicht mehr nennt,
 * verlassen dabei den Vorrat (ohne gespeichertes Verzeichnis bleibt alles, was zum Hash passt).
 */
export async function paketeImVorrat(o: PaketOptionen = {}): Promise<{ kurs: KursSlug; paket: PaketKopf }[]> {
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  if (!cache) return [];
  const aktuell = new Map<string, Map<string, string> | null>();
  const liste: { kurs: KursSlug; paket: PaketKopf }[] = [];
  for (const { kurs, schluessel, hash, anfrage } of await paketAdressen(cache)) {
    if (!istKursSlug(kurs)) continue;
    if (!aktuell.has(kurs)) aktuell.set(kurs, await aktuelleHashes(cache, kurs));
    const hashes = aktuell.get(kurs);
    if (hashes && hashes.get(schluessel) !== hash) {
      await entferne(cache, anfrage);
      continue;
    }
    const paket = await paketImVorratGeprueft(kurs, { schluessel, hash, bytes: 1 }, kopf, o);
    if (paket?.einheit.schluessel === schluessel) liste.push({ kurs, paket });
  }
  return liste;
}

// ——— Audio-Bündel ———

/** Bündel ganz laden (Vorrat zuerst, nie mit `Range`); `null` ohne Netz und Vorrat. */
export async function ladeBuendel(adresse: string, o: PaketOptionen = {}): Promise<Blob | null> {
  const cache = await oeffne(vorratVon(o), VORRAT_AUDIO);
  const vorrat = await cache?.match(adresse);
  if (vorrat) return vorrat.blob();
  try {
    const r = await (o.abruf ?? standardAbruf)(adresse, { credentials: 'omit', signal: o.signal });
    if (r.status !== 200) return null;
    const blob = await r.blob();
    await cache?.put(adresse, new Response(blob, { headers: { 'content-type': 'application/octet-stream' } }));
    return blob;
  } catch {
    return null;
  }
}

// ——— Offline speichern ———

/**
 * Dem Hauptfaden zwischen zwei Schritten Luft lassen (Eingaben, Zeichnen des Rings): `scheduler.yield()`, wo es das gibt,
 * sonst ein Zeitgeber (Stufe C N8, INP „offline speichern“).
 */
export function nachgeben(): Promise<void> {
  const planer = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return typeof planer?.yield === 'function' ? planer.yield() : new Promise((weiter) => setTimeout(weiter, 0));
}

/** Ergebnis von `speichereOffline`; `abgebrochen`: auf Wunsch angehalten (`signal`), Gespeichertes bleibt gespeichert. */
export type OfflineErgebnis = {
  einheiten: number;
  bytes: number;
  fehlgeschlagen: string[];
  dauerhaft: boolean | null;
  abgebrochen: boolean;
};

/** Bündel der Einheiten, je Adresse einmal (spätere Einheiten verweisen auf die Bündel früherer). */
const buendelVon = (einheiten: readonly Pick<VerzeichnisEinheit, 'audio'>[]) => [
  ...new Map(einheiten.flatMap((e) => e.audio).map((a) => [a.adresse, a.bytes])).entries(),
];

/**
 * Speicherbedarf von Einheiten samt Tönen in Bytes – jedes Bündel einmal (vor dem Speichern genannt, Ring nach Bytes). `vorhanden`:
 * Bündel, die schon im Vorrat liegen (etwa die Töne bereits gespeicherter Einheiten), zählen nicht mit.
 */
export function offlineBedarf(
  einheiten: readonly Pick<VerzeichnisEinheit, 'bytes' | 'audio'>[],
  vorhanden: ReadonlySet<string> = new Set(),
): number {
  return einheiten.reduce((s, e) => s + e.bytes, 0) + buendelVon(einheiten).reduce((s, [a, b]) => s + (vorhanden.has(a) ? 0 : b), 0);
}

/**
 * „Einheit offline speichern“ und „Stufe offline speichern“: Pakete und Audio-Bündel der Einheiten in den Vorrat, als offline
 * markiert. Bittet vorher um dauerhaften Speicher (nicht beim Nachladen einer neuen Fassung, `nachladen`). `fortschritt`
 * meldet die geladenen Bytes für den Ring (B-27); zwischen den Schritten gibt die Funktion den Hauptfaden frei
 * (`nachgeben`). `signal` hält an: vor jedem Schritt geprüft, laufende Abrufe brechen ab; was schon gespeichert ist, bleibt.
 *
 * Je Einheit erst ihre Bündel, dann ihr Paket: Als offline gespeichert markiert (`offline: true` im Speicher `pakete`) wird eine
 * Einheit erst, wenn ihre Töne im Vorrat liegen (Gegenprüfung N9a). Bricht das Speichern in den Tönen ab oder scheitert ein
 * Bündel, bleibt die Einheit ungespeichert – „Stufe offline speichern“ bzw. „Einheit offline speichern“ steht wieder da, und
 * beim Nachladen einer neuen Fassung (`nachladen`) bleibt der alte Vermerk, bis alles da ist (`raeumeAuf` nennt sie erneut).
 * Ein Bündel, auf das mehrere Einheiten verweisen, wird einmal geladen; scheitert es, fehlt es allen. `vorhanden`: Bündel,
 * die schon im Vorrat liegen – sie werden nur im Vorrat bestätigt und zählen für den Ring nicht (wie `offlineBedarf`).
 */
export async function speichereOffline(
  sp: Speicher,
  kurs: string,
  einheiten: readonly VerzeichnisEinheit[],
  o: PaketOptionen & {
    fortschritt?: (geladen: number, gesamt: number) => void;
    nachladen?: boolean;
    vorhanden?: ReadonlySet<string>;
  } = {},
): Promise<OfflineErgebnis> {
  let dauerhaft: boolean | null = null;
  try {
    dauerhaft = !o.nachladen && typeof navigator !== 'undefined' && navigator.storage?.persist ? await navigator.storage.persist() : null;
  } catch {
    dauerhaft = null;
  }
  const vorhanden = o.vorhanden ?? new Set<string>();
  const gesamt = offlineBedarf(einheiten, vorhanden);
  let geladen = 0;
  let gespeichert = 0;
  const fehlgeschlagen: string[] = [];
  // Bündel → im Vorrat? (je Adresse ein Versuch)
  const buendel = new Map<string, boolean>();
  const ergebnis = (abgebrochen: boolean): OfflineErgebnis => ({
    einheiten: gespeichert,
    bytes: geladen,
    fehlgeschlagen: abgebrochen ? [] : fehlgeschlagen,
    dauerhaft,
    abgebrochen,
  });
  // in Häppchen: vor jedem Bündel und jedem Paket nachgeben, damit Eingaben und der Ring nicht warten
  for (const e of einheiten) {
    let toene = true;
    for (const { adresse, bytes } of e.audio) {
      if (!buendel.has(adresse)) {
        await nachgeben();
        if (o.signal?.aborted) return ergebnis(true);
        const ok = Boolean(await ladeBuendel(adresse, o));
        buendel.set(adresse, ok);
        if (ok && !vorhanden.has(adresse)) geladen += bytes;
        if (!ok) fehlgeschlagen.push(adresse);
        o.fortschritt?.(geladen, gesamt);
      }
      toene &&= buendel.get(adresse) === true;
    }
    await nachgeben();
    if (o.signal?.aborted) return ergebnis(true);
    // ohne Töne nicht als gespeichert markieren (das Paket lädt der Spieler bei Bedarf)
    if (toene && (await ladePaketKopf(sp, kurs, e, { ...o, offline: true }))) {
      geladen += e.bytes;
      gespeichert++;
    } else fehlgeschlagen.push(e.schluessel);
    o.fortschritt?.(geladen, gesamt);
  }
  return ergebnis(Boolean(o.signal?.aborted));
}

/**
 * Veraltete Pakete entfernen: Pakete des Kurses, deren Hash das Verzeichnis nicht mehr nennt, verlassen den Vorrat, auch
 * solche ohne Eintrag im Speicher (z. B. aus einer Zeit ohne IndexedDB). Der Eintrag im Speicher geht mit, wenn die Einheit
 * nicht mehr im Verzeichnis steht (ein zurückgezogener Baustein ist damit auch offline sofort weg) oder nicht offline
 * gespeichert war. Hat eine offline gespeicherte Einheit nur eine neue Fassung, bleibt ihr Eintrag (alter Hash, `offline`),
 * bis das Nachladen gelingt (`vermerke` ersetzt ihn): Bricht das Netz vorher ab, geht die Markierung nicht verloren, und das
 * nächste Aufräumen nennt die Einheit erneut; bis dahin zeigt der Ring „nicht gespeichert“ (B-27). Ergebnis: Einheiten, die
 * neu zu laden sind, weil sie offline gespeichert waren. Der Lernpfad ruft es nach jedem Laden des Verzeichnisses auf
 * (`LernpfadInsel`).
 */
export async function raeumeAuf(sp: Speicher, verzeichnis: Verzeichnis, o: PaketOptionen = {}): Promise<VerzeichnisEinheit[]> {
  const aktuell = new Map(verzeichnis.einheiten.map((e) => [e.schluessel, e]));
  const cache = await oeffne(vorratVon(o), VORRAT_PAKETE);
  const neuLaden: VerzeichnisEinheit[] = [];
  for (const eintrag of await sp.alle('pakete', [[verzeichnis.kurs], [verzeichnis.kurs, []]])) {
    const e = aktuell.get(eintrag.einheit);
    if (e?.hash === eintrag.hash) continue;
    await entferne(cache, paketAdresse(eintrag.kurs, eintrag.einheit, eintrag.hash));
    if (e && eintrag.offline) neuLaden.push(e);
    else await sp.loesche('pakete', [eintrag.kurs, eintrag.einheit]);
  }
  for (const p of await paketAdressen(cache))
    if (p.kurs === verzeichnis.kurs && aktuell.get(p.schluessel)?.hash !== p.hash) await entferne(cache, p.anfrage);
  return neuLaden;
}
