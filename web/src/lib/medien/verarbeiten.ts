import 'server-only';
import sharp from 'sharp';
import { type MedienTyp, MedienFehler, type Verarbeitet, mitSchluessel, pruefeDatei } from './typ';
import { type Variantenbreite, variantenBreiten } from './varianten';

export { MAX_BYTES, MedienFehler, erkenneTyp, sichererName } from './typ';
export type { MedienTyp, Verarbeitet } from './typ';

/**
 * Upload-Pipeline für Medien der Website (C11, ADR 0007, K-10): Typprüfung, Größengrenze und Schlüssel aus `typ.ts`
 * (ohne sharp, auch für Funktionen der Lern-App); Bilder hier mit sharp neu kodiert (entfernt EXIF/GPS – Datenschutz),
 * Ausrichtung übernommen, längste Kante höchstens 2560 px. PDF (nur Aushänge) unverändert. sharp/libvips (LGPL-3.0) nur
 * in Funktionen der Website (M-060, ADR 0001); die Lern-App importiert dieses Modul nie (ADR 0042 Nr. 10, Regeltest
 * `tests/unit/lernapp/bundle-regeln.test.ts`).
 */
export const MAX_KANTE = 2560;

export async function verarbeiteDatei(roh: Buffer, dateiname: string): Promise<Verarbeitet> {
  const typ: MedienTyp = pruefeDatei(roh);
  if (typ === 'application/pdf') return mitSchluessel(roh, typ, dateiname);
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
    return mitSchluessel(data, typ, dateiname, { breite: info.width, hoehe: info.height });
  } catch {
    throw new MedienFehler('defekt');
  }
}

/** WebP-Varianten eines bereits verarbeiteten Bildes in den Breiten aus `varianten.ts` (ADR 0020); PDF: keine. */
export async function erzeugeVarianten(
  v: Pick<Verarbeitet, 'daten' | 'typ' | 'breite'>,
): Promise<{ breite: Variantenbreite; daten: Buffer }[]> {
  if (v.typ === 'application/pdf') return [];
  return Promise.all(
    variantenBreiten(v.breite).map(async (breite) => ({
      breite,
      daten: await sharp(v.daten).resize({ width: breite, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    })),
  );
}
