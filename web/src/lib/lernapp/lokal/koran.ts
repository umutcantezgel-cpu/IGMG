import {
  type BedeutungsSprache,
  KORAN_PAKET_FORMAT,
  KORAN_VERZEICHNIS_FORMAT,
  type KoranPaket,
  koranPaketAdresse,
  type KoranVerzeichnis,
  type KoranVerzeichnisEinheit,
  koranVerzeichnisAdresse,
} from '../koran/typen';
import { sha256Hex } from './vorrat';

/**
 * Koran-Arabisch-Pfad im Browser (L6-05): Verzeichnis je Sprache (der Service Worker fragt „Netz zuerst“) und Einheitenpaket
 * unter seinem SHA-256 (Vorrat zuerst; aus dem Netz nur mit gleichem Hash). Geprüft wird die Form, die Lernpfad und Spieler
 * brauchen; die Lektionen prüft der Spieler wie jede andere (`LektionSchema`). Client-Modul ohne Zod.
 */

type Roh = Record<string, unknown>;
const istObjekt = (x: unknown): x is Roh => typeof x === 'object' && x !== null && !Array.isArray(x);

export function istKoranVerzeichnis(x: unknown, sprache: BedeutungsSprache): x is KoranVerzeichnis {
  return (
    istObjekt(x) &&
    x.format === KORAN_VERZEICHNIS_FORMAT &&
    x.version === 1 &&
    x.kurs === 'koran' &&
    x.sprache === sprache &&
    Array.isArray(x.einheiten) &&
    x.einheiten.every(
      (e) =>
        istObjekt(e) &&
        typeof e.schluessel === 'string' &&
        typeof e.stufe === 'string' &&
        typeof e.hash === 'string' &&
        /^[0-9a-f]{64}$/.test(e.hash) &&
        Number.isInteger(e.woerter) &&
        Number.isInteger(e.bedeutungen) &&
        Array.isArray(e.lektionen) &&
        e.lektionen.every((l) => typeof l === 'string'),
    )
  );
}

export function istKoranPaket(x: unknown, sprache: BedeutungsSprache, einheit: string): x is KoranPaket {
  return (
    istObjekt(x) &&
    x.format === KORAN_PAKET_FORMAT &&
    x.version === 1 &&
    x.kurs === 'koran' &&
    x.sprache === sprache &&
    istObjekt(x.einheit) &&
    x.einheit.schluessel === einheit &&
    Array.isArray(x.woerter) &&
    x.woerter.every((w) => istObjekt(w) && typeof w.stelle === 'string' && !('audio' in w)) &&
    Array.isArray(x.lektionen) &&
    Array.isArray(x.quellen)
  );
}

export async function ladeKoranVerzeichnis(sprache: BedeutungsSprache, abruf = fetch): Promise<KoranVerzeichnis | null> {
  try {
    const antwort = await abruf(koranVerzeichnisAdresse(sprache));
    if (!antwort.ok) return null;
    const v: unknown = await antwort.json();
    return istKoranVerzeichnis(v, sprache) ? v : null;
  } catch {
    return null;
  }
}

export async function ladeKoranPaket(
  sprache: BedeutungsSprache,
  e: Pick<KoranVerzeichnisEinheit, 'schluessel' | 'hash'>,
  abruf = fetch,
): Promise<KoranPaket | null> {
  try {
    const antwort = await abruf(koranPaketAdresse(sprache, e.schluessel, e.hash));
    if (!antwort.ok) return null;
    const bytes = new Uint8Array(await antwort.arrayBuffer());
    if ((await sha256Hex(bytes)) !== e.hash) return null;
    const p: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return istKoranPaket(p, sprache, e.schluessel) ? p : null;
  } catch {
    return null;
  }
}
