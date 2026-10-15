import { getImageProps, type ImageProps } from 'next/image';
import { preload } from 'react-dom';

/** Statische Bildangaben: ohne Platzhalter, Ereignisse und das veraltete `priority` (Next 16: `preload`). */
export type BildEingabe = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'onLoad' | 'onError' | 'onLoadingComplete' | 'priority'>;

/** Attribute des `<img>` wie von next/image (`getImageProps`) – reine Daten, auch als Prop für Client-Komponenten. */
export type BildAttribute = ReturnType<typeof getImageProps>['props'];

/** Attribute für ein `<img>` (Adresse über /_next/image bzw. unverändert mit `images.unoptimized`, srcset, Maße). */
export function bildAttribute(eingabe: BildEingabe): BildAttribute {
  return getImageProps(eingabe).props;
}

/**
 * Statisches Bild als Server-Komponente ohne Client-JavaScript (K-12, Z-08): dieselben Attribute wie `<Image>` aus
 * next/image, aber die Image-Komponente selbst ist Client-Code und brächte rund 5 kB gz in jede Route, die sie nutzt
 * (auch aus einer Server-Komponente heraus). `preload`: Vorladehinweis im Kopf wie bei `<Image preload>`.
 */
export function Bild(eingabe: BildEingabe) {
  const props = bildAttribute(eingabe);
  if (eingabe.preload) {
    preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: props.fetchPriority });
  }
  // eslint-disable-next-line @next/next/no-img-element -- kein next/image-Element, daher kein Client-JavaScript
  return <img {...props} alt={eingabe.alt} />;
}
