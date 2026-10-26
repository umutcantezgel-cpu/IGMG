import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Medien ohne Bildverarbeitung (C11, ADR 0007, K-10; ADR 0042 Nr. 10, Z-L19): Typ nur über Magic Bytes (nie über Endung
 * oder MIME-Angabe des Browsers), Größengrenze, sicherer Dateiname und Schlüssel mit Inhalts-Hash. Dieses Modul lädt
 * kein `sharp` (libvips, LGPL-3.0): Funktionen der Lern-App (z. B. die Sprecher-Vereinbarung als PDF im Audio-Studio)
 * nutzen nur dieses Modul. Die Bildpipeline der Website (`verarbeiten.ts`, M-060 / ADR 0001) baut darauf auf.
 */
export const MAX_BYTES = 10 * 1024 * 1024;

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

/** Grundprüfung jeder hochgeladenen Datei: nicht leer, höchstens `MAX_BYTES`, erlaubter Typ (sonst `MedienFehler`). */
export function pruefeDatei(roh: Buffer): MedienTyp {
  if (roh.length === 0) throw new MedienFehler('leer');
  if (roh.length > MAX_BYTES) throw new MedienFehler('zuGross');
  const typ = erkenneTyp(roh);
  if (!typ) throw new MedienFehler('typ');
  return typ;
}

/** Ablage-Angaben zu fertigen Daten: Inhalts-Hash (16 Hex-Zeichen) und Schlüssel `<hash>/<name>.<endung>`. */
export function mitSchluessel(
  daten: Buffer,
  typ: MedienTyp,
  dateiname: string,
  masse: { breite: number | null; hoehe: number | null } = { breite: null, hoehe: null },
): Verarbeitet {
  const hash = createHash('sha256').update(daten).digest('hex').slice(0, 16);
  return { daten, typ, ...masse, schluessel: `${hash}/${sichererName(dateiname)}.${ENDUNG[typ]}`, hash };
}

/**
 * PDF prüfen und unverändert übernehmen (Aushänge, Vereinbarungen); ein anderer erlaubter Typ ergibt `null`, damit der
 * Aufrufer „kein PDF“ melden kann. Schlüssel und Hash sind dieselben wie in der Bildpipeline (`verarbeiteDatei`).
 */
export function verarbeitePdf(roh: Buffer, dateiname: string): Verarbeitet | null {
  const typ = pruefeDatei(roh);
  return typ === 'application/pdf' ? mitSchluessel(roh, typ, dateiname) : null;
}
