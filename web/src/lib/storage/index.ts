import 'server-only';
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';

/** Speicher-Adapter (ADR 0007): Dateisystem in der Entwicklung, S3-kompatibel im Betrieb. */
export interface Speicher {
  schreibe(schluessel: string, daten: Buffer, typ: string): Promise<void>;
  lies(schluessel: string): Promise<ReadableStream<Uint8Array> | null>;
  loesche(schluessel: string): Promise<void>;
  existiert(schluessel: string): Promise<boolean>;
}

/** Schlüssel nur aus [a-z0-9/._-], kein „..“ – verhindert Pfad-Ausbrüche. */
export function pruefeSchluessel(schluessel: string): string {
  if (!/^[a-z0-9][a-z0-9/._-]{0,200}$/.test(schluessel) || schluessel.includes('..')) {
    throw new Error('Ungültiger Speicherschlüssel.');
  }
  return schluessel;
}

export class DateisystemSpeicher implements Speicher {
  private readonly wurzel: string;
  constructor(verzeichnis: string) {
    this.wurzel = resolve(verzeichnis);
  }
  private pfad(schluessel: string): string {
    const p = resolve(join(this.wurzel, pruefeSchluessel(schluessel)));
    if (!p.startsWith(this.wurzel + '/')) throw new Error('Ungültiger Speicherschlüssel.');
    return p;
  }
  async schreibe(schluessel: string, daten: Buffer): Promise<void> {
    const p = this.pfad(schluessel);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, daten, { flag: 'wx' });
  }
  async lies(schluessel: string): Promise<ReadableStream<Uint8Array> | null> {
    const p = this.pfad(schluessel);
    if (!(await this.existiert(schluessel))) return null;
    return Readable.toWeb(createReadStream(p)) as ReadableStream<Uint8Array>;
  }
  async loesche(schluessel: string): Promise<void> {
    await rm(this.pfad(schluessel), { force: true });
  }
  async existiert(schluessel: string): Promise<boolean> {
    try {
      return (await stat(this.pfad(schluessel))).isFile();
    } catch {
      return false;
    }
  }
}

export class S3Speicher implements Speicher {
  private readonly client: S3Client;
  constructor(private readonly bucket: string) {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPUNKT || undefined,
      region: process.env.S3_REGION || 'eu-central-1',
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.S3_ZUGANG ?? '', secretAccessKey: process.env.S3_GEHEIMNIS ?? '' },
    });
  }
  async schreibe(schluessel: string, daten: Buffer, typ: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: pruefeSchluessel(schluessel), Body: daten, ContentType: typ }));
  }
  async lies(schluessel: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const antwort = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: pruefeSchluessel(schluessel) }));
      return antwort.Body ? (antwort.Body.transformToWebStream() as ReadableStream<Uint8Array>) : null;
    } catch {
      return null;
    }
  }
  async loesche(schluessel: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: pruefeSchluessel(schluessel) }));
  }
  async existiert(schluessel: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: pruefeSchluessel(schluessel) }));
      return true;
    } catch {
      return false;
    }
  }
}

let instanz: Speicher | null = null;
export function speicher(): Speicher {
  if (instanz) return instanz;
  instanz =
    process.env.SPEICHER === 's3'
      ? new S3Speicher(process.env.S3_BUCKET ?? '')
      : new DateisystemSpeicher(process.env.MEDIEN_VERZEICHNIS ?? '.medien');
  return instanz;
}
