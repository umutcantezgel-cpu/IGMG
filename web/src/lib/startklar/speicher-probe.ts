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

function mitZeitlimit<T>(versprechen: Promise<T>): Promise<T> {
  let uhr: ReturnType<typeof setTimeout> | undefined;
  const ablauf = new Promise<never>((_, nein) => {
    uhr = setTimeout(() => nein(Object.assign(new Error('Zeitlimit'), { name: 'Zeitlimit' })), ZEITLIMIT_MS);
  });
  return Promise.race([versprechen, ablauf]).finally(() => clearTimeout(uhr));
}

export function speicherArt(env: Umgebung): SpeicherArt {
  return env.SPEICHER === 's3' ? 's3' : env.SPEICHER === 'blob' ? 'blob' : 'dateisystem';
}

export async function pruefeSpeicher(env: Umgebung): Promise<SpeicherProbe> {
  const art = speicherArt(env);
  try {
    if (art === 'blob') {
      if (!env.BLOB_READ_WRITE_TOKEN) return { erreichbar: false, art, meldung: 'Vercel Blob ist nicht erreichbar: BLOB_READ_WRITE_TOKEN fehlt.' };
      const { list } = await import('@vercel/blob');
      await mitZeitlimit(list({ limit: 1, token: env.BLOB_READ_WRITE_TOKEN }));
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
        await mitZeitlimit(client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET })));
      } finally {
        client.destroy();
      }
      return { erreichbar: true, art, meldung: `Der S3-Bucket ${env.S3_BUCKET} antwortet (lesende Probe).` };
    }
    // Dateisystem: das Verzeichnis oder, falls es noch fehlt, der nächste vorhandene Elternordner muss beschreibbar sein
    const verzeichnis = resolve(env.MEDIEN_VERZEICHNIS ?? '.medien');
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
    const grund = typeof code === 'string' && /^[A-Z_]{3,40}$/.test(code) ? code : e instanceof Error && e.name && e.name !== 'Error' ? e.name : 'unbekannter Fehler';
    return { erreichbar: false, art, meldung: `Der Medienspeicher (${art}) antwortet nicht (${grund}).` };
  }
}
