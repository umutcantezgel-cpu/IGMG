import { access, constants } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

/**
 * Erreichbarkeitsprobe des Medienspeichers (AUFTRAG V-11, Cockpit und `pnpm startklar`). Nur lesend: Vercel Blob listet
 * höchstens einen Eintrag, S3 fragt den Bucket ab, das Dateisystem prüft das Schreibrecht des Verzeichnisses. Es wird
 * nichts geschrieben. Ohne `server-only`, damit auch die Kommandozeile sie nutzen kann; die Umgebung kommt als Parameter.
 * Meldungen nennen nie Werte von Geheimnissen, nur die Art des Fehlers.
 */
export type SpeicherArt = 'blob' | 's3' | 'dateisystem';
export type SpeicherProbe = { erreichbar: boolean; art: SpeicherArt; meldung: string };
export type Umgebung = Readonly<Record<string, string | undefined>>;

const ZEITLIMIT_MS = 4000;

/**
 * Führt die Anfrage mit Abbruch nach dem Zeitlimit aus. Der Abbruch beendet die Anfrage selbst (auch die eingebauten
 * Wiederholungen von Vercel Blob), damit `pnpm startklar` nicht im Hintergrund weiterläuft. Das Ergebnis kommt genau
 * nach dem Zeitlimit: Vercel Blob bemerkt den Abbruch erst beim nächsten Versuch nach seiner Wartezeit (gemessen
 * 5,7 s statt 4 s, unter Last über 10 s) – deshalb das Rennen gegen die Uhr.
 */
async function mitZeitlimit<T>(anfrage: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const abbruch = new AbortController();
  let uhr: ReturnType<typeof setTimeout> | undefined;
  const zeitlimit = new Promise<never>((_, ablehnen) => {
    uhr = setTimeout(() => {
      abbruch.abort();
      ablehnen(Object.assign(new Error('Zeitlimit'), { name: 'Zeitlimit' }));
    }, ZEITLIMIT_MS);
  });
  const lauf = anfrage(abbruch.signal);
  // Nach dem Zeitlimit endet die Anfrage beim nächsten Versuch des SDK; ihr Fehler ist dann ohne Belang
  lauf.catch(() => undefined);
  try {
    return await Promise.race([lauf, zeitlimit]);
  } catch (e) {
    if (abbruch.signal.aborted) throw Object.assign(new Error('Zeitlimit'), { name: 'Zeitlimit' });
    throw e;
  } finally {
    clearTimeout(uhr);
  }
}

export function speicherArt(env: Umgebung): SpeicherArt {
  return env.SPEICHER === 's3' ? 's3' : env.SPEICHER === 'blob' ? 'blob' : 'dateisystem';
}

export async function pruefeSpeicher(env: Umgebung): Promise<SpeicherProbe> {
  const art = speicherArt(env);
  try {
    if (art === 'blob') {
      if (!env.BLOB_READ_WRITE_TOKEN)
        return { erreichbar: false, art, meldung: 'Vercel Blob ist nicht erreichbar: BLOB_READ_WRITE_TOKEN fehlt.' };
      const { list } = await import('@vercel/blob');
      await mitZeitlimit((abortSignal) => list({ limit: 1, token: env.BLOB_READ_WRITE_TOKEN, abortSignal }));
      return { erreichbar: true, art, meldung: 'Vercel Blob antwortet (lesende Probe).' };
    }
    if (art === 's3') {
      if (!env.S3_BUCKET) return { erreichbar: false, art, meldung: 'Der S3-Speicher ist nicht erreichbar: S3_BUCKET fehlt.' };
      const { HeadBucketCommand, S3Client } = await import('@aws-sdk/client-s3');
      const client = new S3Client({
        endpoint: env.S3_ENDPUNKT || undefined,
        region: env.S3_REGION || 'eu-central-1',
        forcePathStyle: true,
        maxAttempts: 1,
        credentials: { accessKeyId: env.S3_ZUGANG ?? '', secretAccessKey: env.S3_GEHEIMNIS ?? '' },
      });
      try {
        await mitZeitlimit((abortSignal) => client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }), { abortSignal }));
      } finally {
        client.destroy();
      }
      return { erreichbar: true, art, meldung: `Der S3-Bucket ${env.S3_BUCKET} antwortet (lesende Probe).` };
    }
    // Dateisystem: das Verzeichnis oder, falls es noch fehlt, der nächste vorhandene Elternordner muss beschreibbar sein
    // turbopackIgnore: Pfad erst zur Laufzeit bekannt, sonst verfolgt der Bau das ganze Projekt in die Cockpit-Route
    const verzeichnis = resolve(/*turbopackIgnore: true*/ env.MEDIEN_VERZEICHNIS ?? '.medien');
    let ziel = verzeichnis;
    for (;;) {
      try {
        await access(ziel, constants.F_OK);
        break;
      } catch {
        const oben = dirname(ziel);
        if (oben === ziel) break;
        ziel = oben;
      }
    }
    await access(ziel, constants.W_OK);
    return { erreichbar: true, art, meldung: `Das Medienverzeichnis ${verzeichnis} ist beschreibbar.` };
  } catch (e) {
    // Nur Art bzw. Code des Fehlers (z. B. ECONNREFUSED, NoSuchBucket, BlobAccessError), nie Werte
    const code = (e as { code?: unknown }).code;
    const grund =
      typeof code === 'string' && /^[A-Z_]{3,40}$/.test(code)
        ? code
        : e instanceof Error && e.name && e.name !== 'Error'
          ? e.name
          : 'unbekannter Fehler';
    return { erreichbar: false, art, meldung: `Der Medienspeicher (${art}) antwortet nicht (${grund}).` };
  }
}
