import { Sun, Sunrise, Sunset } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Nachtzeichen } from '@/components/website/Icons';
import type { Gebet } from '@/lib/gebetszeiten/typen';

/**
 * Zeichen der sechs Gebetszeiten (eine Icon-Familie, K-008: 24-px-Raster, 2-px-Strich, runde Enden). Tag: Lucide
 * `Sunrise`, `Sun`, `Sunset`; Nacht (Imsak, Yatsı): `Nachtzeichen` – Stern über dem Horizont statt Mondsichel (MN-27,
 * AUFTRAG 4: keine Mondsichel). Genutzt von der Gebetszeitenleiste und der Seite /gebetszeiten; dekorativ (`aria-hidden`).
 */
export const GEBET_ZEICHEN: Record<Gebet, ComponentType<SVGProps<SVGSVGElement>>> = {
  imsak: Nachtzeichen,
  gunes: Sunrise,
  ogle: Sun,
  ikindi: Sun,
  aksam: Sunset,
  yatsi: Nachtzeichen,
};
