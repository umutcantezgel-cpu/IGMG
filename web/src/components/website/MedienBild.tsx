import { getImageProps } from 'next/image';
import { preload } from 'react-dom';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import type { BildDaten } from '@/lib/medien/bild';
import { variantenSrcSet } from '@/lib/medien/varianten';
import { cn } from '@/lib/utils';

/**
 * Darstellungsbreiten (`sizes`) der Raster mit mindestens 340 px breiten Karten (Nachrichten, Veranstaltungen,
 * Kurse): drei Spalten ab 1132 px Viewport (höchstens 410 px je Karte), zwei Spalten ab 768 px (je höchstens 50 vw),
 * sonst volle Breite.
 */
export const SIZES_RASTER = '(min-width: 1132px) 410px, (min-width: 768px) 50vw, 100vw';
/**
 * Aufmacher der Startseite (flex 2 1 560 px neben der Seitenspalte): ab 968 px Viewport nebeneinander, 812 px im
 * Container; darunter steht er in voller Breite.
 */
export const SIZES_AUFMACHER = '(min-width: 1344px) 812px, (min-width: 968px) 62vw, 100vw';
/** Hauptspalte der Nachrichtendetailseite (flex 2 1 600 px neben der Seitenspalte): 832 px im Container. */
export const SIZES_HAUPTSPALTE = '(min-width: 1344px) 832px, (min-width: 996px) 62vw, 100vw';
/**
 * Bild im Fließtext der Nachrichtendetailseite. Die Textspalte (68ch, bei 1440 px rund 793 px) liegt innerhalb der
 * Hauptspalte (832 px, darunter 62 vw). Als Angabe nimmt die Hauptspalte die Obergrenze, damit der Browser nie eine zu
 * kleine Datei wählt, die dann hochskaliert würde.
 */
export const SIZES_TEXTSPALTE = '(min-width: 1344px) 832px, (min-width: 996px) 62vw, 100vw';

/**
 * Gepflegtes Bild aus der Mediathek (C11b, ADR 0007) als Server-Komponente ohne Client-JavaScript (K-12).
 * `getImageProps` (next/image) liefert die Attribute des `<img>`: Optimierung über `/_next/image`, Breiten-srcset.
 * Höhe und Rundung bestimmt `className` wie beim bisherigen Platzhalter, das Bild füllt die Fläche mit object-cover.
 * Alt-Text je Sprache mit sichtbarem Rückfall auf Deutsch (`lang="de"`, K-02). Keine Bildunterschrift.
 * `vorladen`: Bild oberhalb des Falzes (Titelbild) – eager, hohe Priorität und ein Preload-Hinweis (`link rel="preload"`).
 */
export function MedienBild({
  bild,
  sprache,
  sizes,
  className,
  vorladen = false,
}: {
  bild: BildDaten;
  sprache: Sprache;
  /** Pflicht: Darstellungsbreite je Haltepunkt; der Browser wählt daraus die passende Datei des srcset. */
  sizes: string;
  className?: string;
  vorladen?: boolean;
}) {
  const alt = waehle(bild.alt, sprache);
  const { props } = getImageProps({
    src: bild.url,
    alt: alt.text,
    width: bild.breite,
    height: bild.hoehe,
    sizes,
    className: cn('block w-full object-cover', className),
    loading: vorladen ? 'eager' : 'lazy',
    fetchPriority: vorladen ? 'high' : undefined,
    preload: vorladen,
  });
  // Auf Vercel gibt es im Services-Modus keine Bildoptimierung (`images.unoptimized`, BETRIEB.md §9): Die beim
  // Hochladen erzeugten WebP-Varianten bilden das srcset (ADR 0020), ältere Medien liefern dort das Original.
  if (process.env.VERCEL === '1') props.srcSet = variantenSrcSet(bild.url, bild.breite);
  if (vorladen) preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'high' });
  // Die Image-Komponente ist Client-Code (K-12); getImageProps liefert hier nur die Attribute, das Element bleibt ein img.
  // eslint-disable-next-line @next/next/no-img-element -- kein next/image-Element, daher kein Client-JavaScript
  return <img {...props} alt={alt.text} lang={alt.rueckfall ? 'de' : undefined} />;
}
