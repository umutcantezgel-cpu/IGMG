import 'server-only';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

/**
 * Upload-Pipeline für Medien (C11, ADR 0007, K-10): Typ nur über Magic Bytes (nie über Endung oder MIME-Angabe des
 * Browsers), SVG und alles andere abgelehnt; Bilder mit sharp neu kodiert (entfernt EXIF/GPS – Datenschutz), Ausrichtung
 * übernommen, längste Kante höchstens 2560 px. PDF (nur Aushänge) unverändert. Schlüssel enthält einen Inhalts-Hash.
 */
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_KANTE = 2560;

export type MedienTyp = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif' | 'application/pdf';
const ENDUNG: Record<MedienTyp, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

const beginnt = (b: Buffer, bytes: number[], ab = 0) => bytes.every((x, i) => b[ab + i] === x);

/** Erkennt den Typ an den ersten Bytes; null = nicht erlaubt (auch SVG, GIF, HEIC …). */
export function erkenneTyp(b: Buffer): MedienTyp | null {
  if (b.length < 12) return null;
  if (beginnt(b, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (beginnt(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (beginnt(b, [0x52, 0x49, 0x46, 0x46]) && beginnt(b, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  if (beginnt(b, [0x66, 0x74, 0x79, 0x70], 4)) {
    const marke = b.subarray(8, 12).toString('latin1');
    if (marke === 'avif' || marke === 'avis') return 'image/avif';
  }
  if (beginnt(b, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
  return null;
}

/** Dateiname für den Schlüssel: klein, ASCII, Bindestriche; höchstens 60 Zeichen. */
export function sichererName(name: string): string {
  const basis = name
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return basis || 'datei';
}

export type Verarbeitet = { daten: Buffer; typ: MedienTyp; breite: number | null; hoehe: number | null; schluessel: string; hash: string };

export class MedienFehler extends Error {
  constructor(public readonly grund: 'leer' | 'zuGross' | 'typ' | 'defekt') {
    super(grund);
    this.name = 'MedienFehler';
  }
}

export async function verarbeiteDatei(roh: Buffer, dateiname: string): Promise<Verarbeitet> {
  if (roh.length === 0) throw new MedienFehler('leer');
  if (roh.length > MAX_BYTES) throw new MedienFehler('zuGross');
  const typ = erkenneTyp(roh);
  if (!typ) throw new MedienFehler('typ');
  let daten = roh;
  let breite: number | null = null;
  let hoehe: number | null = null;
  if (typ !== 'application/pdf') {
    try {
      const bild = sharp(roh, { failOn: 'error', limitInputPixels: 100_000_000 })
        .rotate()
        .resize({ width: MAX_KANTE, height: MAX_KANTE, fit: 'inside', withoutEnlargement: true });
      const kodiert =
        typ === 'image/jpeg'
          ? bild.jpeg({ quality: 85, mozjpeg: true })
          : typ === 'image/png'
            ? bild.png({ compressionLevel: 9 })
            : typ === 'image/webp'
              ? bild.webp({ quality: 82 })
              : bild.avif({ quality: 55 });
      const { data, info } = await kodiert.toBuffer({ resolveWithObject: true });
      daten = data;
      breite = info.width;
      hoehe = info.height;
    } catch {
      throw new MedienFehler('defekt');
    }
  }
  const hash = createHash('sha256').update(daten).digest('hex').slice(0, 16);
  return { daten, typ, breite, hoehe, schluessel: `${hash}/${sichererName(dateiname)}.${ENDUNG[typ]}`, hash };
}
