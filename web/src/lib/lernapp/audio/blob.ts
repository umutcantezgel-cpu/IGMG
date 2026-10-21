import { sha256Hex } from '../paket/hash';

/**
 * Hochladen der Audio-Bündel in den öffentlichen Blob-Speicher „lernapp“ (`pnpm lernapp:audio-manifest --hochladen`,
 * ADR 0039 Nr. 4 und Fortschreibung L3-05 Nr. 7 und 10). Rein bis auf den übergebenen Zugriff, damit es ohne Netz prüfbar ist.
 *
 * - **Eigener Schlüssel** `LERNAPP_BLOB_READ_WRITE_TOKEN`. Nie `BLOB_READ_WRITE_TOKEN` (privater Medienspeicher, ADR 0020) und
 *   nie `AUDIO_BLOB_READ_WRITE_TOKEN` (Rezitationen, ADR 0029): Gehört der Schlüssel zum selben Speicher wie einer von beiden,
 *   bricht das Skript ab.
 * - **Nur mit `LERNAPP_BLOB_BASIS`**, und zwar der öffentlichen Adresse genau des Speichers, zu dem der Schlüssel gehört. Der
 *   Schlüssel trägt die Speicherkennung (`vercel_blob_rw_<speicher>_<geheimnis>`, so liest ihn `@vercel/blob` 2.8.0), die
 *   Adresse lautet `https://<speicher>.public.blob.vercel-storage.com`.
 * - **Belegt** ist ein Bündel erst, wenn es unter `<LERNAPP_BLOB_BASIS>/<schlüssel>` abrufbar ist und denselben SHA-256 hat
 *   (beim Hochladen zusätzlich: Der Speicher meldet genau diese Adresse).
 * - **Ins Repository** geht das Manifest nur, wenn jedes Bündel, auf das es verweist, in diesem Lauf belegt wurde oder schon im
 *   eingecheckten Manifest stand (dort beim Hochladen belegt). Ein neues Manifest ohne Clips legt das Skript dort nicht an.
 */

/** Name der Umgebungsvariable mit dem Schreibschlüssel des Speichers „lernapp“ (nur lokal, Menschen-Schritt LM-15). */
export const LERNAPP_TOKEN = 'LERNAPP_BLOB_READ_WRITE_TOKEN';
/** Schlüssel anderer Speicher des Projekts – der Speicher „lernapp“ ist ein eigener (ADR 0039, Alternativen). */
const FREMDE_TOKEN = ['BLOB_READ_WRITE_TOKEN', 'AUDIO_BLOB_READ_WRITE_TOKEN'] as const;
const OEFFENTLICHER_HOST = /^([a-z0-9]+)\.public\.blob\.vercel-storage\.com$/;

/** Speicherkennung aus einem Schreibschlüssel (klein geschrieben wie im Hostnamen) oder `null`. */
export function speicherVonToken(token: string | undefined): string | null {
  const [vercel, blob, rw, speicher] = (token ?? '').trim().split('_');
  if (vercel !== 'vercel' || blob !== 'blob' || rw !== 'rw' || !speicher || !/^[A-Za-z0-9]+$/.test(speicher)) return null;
  return speicher.toLowerCase();
}

/** Speicherkennung aus der öffentlichen Basisadresse oder `null` (nur `https://<speicher>.public.blob.vercel-storage.com`). */
export function speicherVonBasis(basis: string | undefined): string | null {
  try {
    const u = new URL((basis ?? '').trim());
    if (u.protocol !== 'https:' || u.pathname.replace(/\/+$/, '') !== '' || u.search || u.hash || u.username || u.port) return null;
    return OEFFENTLICHER_HOST.exec(u.hostname)?.[1] ?? null;
  } catch {
    return null;
  }
}

export type BlobZiel = { token: string; basis: string; speicher: string };

/**
 * Ziel für `--hochladen` aus der Umgebung. `ueberspringen`: kein Schlüssel (Probelauf, LM-15 offen) – gemeldet, das Manifest
 * bleibt lokal. `fehler`: Schlüssel gesetzt, aber das Ziel ist nicht sicher der Speicher „lernapp“ – Abbruch vor dem Bau.
 */
export function blobZiel(
  env: Readonly<Record<string, string | undefined>>,
): { ziel: BlobZiel } | { ueberspringen: string } | { fehler: string } {
  const token = env[LERNAPP_TOKEN]?.trim();
  if (!token) return { ueberspringen: `${LERNAPP_TOKEN} fehlt – Menschen-Schritt LM-15` };
  const speicher = speicherVonToken(token);
  if (!speicher) return { fehler: `${LERNAPP_TOKEN} hat nicht die Form vercel_blob_rw_<speicher>_<geheimnis>` };
  for (const name of FREMDE_TOKEN) {
    const fremd = env[name]?.trim();
    if (fremd && (fremd === token || speicherVonToken(fremd) === speicher))
      return {
        fehler: `${LERNAPP_TOKEN} gehört zum selben Speicher wie ${name} – Lern-Audio liegt im eigenen Speicher „lernapp“ (ADR 0039)`,
      };
  }
  const basis = env.LERNAPP_BLOB_BASIS?.trim();
  if (!basis)
    return {
      fehler: '--hochladen braucht LERNAPP_BLOB_BASIS (öffentliche Adresse des Speichers „lernapp“), um jedes Bündel danach zu prüfen',
    };
  const basisSpeicher = speicherVonBasis(basis);
  if (!basisSpeicher)
    return {
      fehler:
        'LERNAPP_BLOB_BASIS ist nicht die öffentliche Adresse eines Blob-Speichers (https://<speicher>.public.blob.vercel-storage.com)',
    };
  if (basisSpeicher !== speicher) return { fehler: `${LERNAPP_TOKEN} und LERNAPP_BLOB_BASIS gehören zu verschiedenen Speichern` };
  return { ziel: { token, basis: basis.replace(/\/+$/, ''), speicher } };
}

/** Zugriff auf den Speicher (im Skript `@vercel/blob` und `fetch`, im Test eine Attrappe). */
export type BlobZugriff = {
  /** Liegt der Schlüssel schon im Speicher des Tokens? */
  vorhanden(schluessel: string): Promise<boolean>;
  /** Hochladen ohne Überschreiben; Rückgabe: die Adresse, die der Speicher meldet. */
  hochladen(schluessel: string, bytes: Uint8Array): Promise<string>;
  /** Öffentlicher Abruf ohne Schlüssel; `null` bei 404 oder Fehler. */
  abrufen(adresse: string): Promise<Uint8Array | null>;
};

/**
 * Ein Bündel, das belegt werden soll. `sha256`: voller SHA-256 oder die 16 Hex-Zeichen aus dem Dateinamen. `bytes`: liefert
 * die Bytes erst beim Belegen (je Bündel, nicht alle zugleich im Speicher); fehlt es oder liefert `null`, wird nur geprüft.
 */
export type ZuBelegen = { schluessel: string; sha256: string; bytes?: () => Uint8Array | null };

const gleicheAdresse = (a: string, b: string) => {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
};

/**
 * Lädt fehlende Bündel hoch (nur mit Bytes) und prüft danach jedes über die öffentliche Adresse: gleicher SHA-256 – bei
 * vorliegenden Bytes deren voller SHA-256, der zum Dateinamen passen muss. Je Bündel ein Abruf; Fehler eines Bündels halten die
 * übrigen nicht auf. Rückgabe: belegte Schlüssel, Zahl der hochgeladenen, Fehler.
 */
export async function belegeImBlob(
  ziel: BlobZiel,
  liste: readonly ZuBelegen[],
  zugriff: BlobZugriff,
): Promise<{ belegt: Set<string>; hochgeladen: number; fehler: string[] }> {
  const belegt = new Set<string>();
  const fehler: string[] = [];
  let hochgeladen = 0;
  for (const b of liste) {
    const adresse = `${ziel.basis}/${b.schluessel}`;
    try {
      const daten = b.bytes?.() ?? null;
      const erwartet = daten ? sha256Hex(daten) : b.sha256;
      if (!erwartet.startsWith(b.sha256)) {
        fehler.push(`${b.schluessel}: Inhalt passt nicht zum Dateinamen`);
        continue;
      }
      if (daten && !(await zugriff.vorhanden(b.schluessel).catch(() => false))) {
        const gemeldet = await zugriff.hochladen(b.schluessel, daten);
        hochgeladen++;
        if (!gleicheAdresse(gemeldet, adresse)) {
          fehler.push(`${b.schluessel}: der Speicher meldet eine andere Adresse als LERNAPP_BLOB_BASIS`);
          continue;
        }
      }
      const da = await zugriff.abrufen(adresse);
      if (!da) fehler.push(`${b.schluessel}: unter LERNAPP_BLOB_BASIS nicht abrufbar`);
      else if (!sha256Hex(da).startsWith(erwartet)) fehler.push(`${b.schluessel}: SHA-256 unter LERNAPP_BLOB_BASIS weicht ab`);
      else belegt.add(b.schluessel);
    } catch (e) {
      fehler.push(`${b.schluessel}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { belegt, hochgeladen, fehler };
}

/**
 * Darf das Manifest ins Repository? Ja, wenn jedes Bündel, auf das es verweist, belegt ist oder schon im eingecheckten
 * Manifest stand (`eingecheckt`: dessen Bündel, `null` ohne eingechecktes Manifest) – und es nicht ein neues, leeres wäre.
 * `fehlen`: Bündel ohne Beleg (dann bleibt das Manifest lokal).
 */
export function manifestInsRepository(o: {
  verweise: Iterable<string>;
  eingecheckt: ReadonlySet<string> | null;
  belegt: ReadonlySet<string>;
}): { ja: boolean; fehlen: string[]; leer: boolean } {
  const verweise = [...new Set(o.verweise)];
  const fehlen = verweise.filter((s) => !o.belegt.has(s) && !o.eingecheckt?.has(s)).sort();
  const leer = o.eingecheckt === null && verweise.length === 0;
  return { ja: !fehlen.length && !leer, fehlen, leer };
}
