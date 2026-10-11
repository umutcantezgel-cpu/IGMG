import { ImageResponse } from 'next/og';
import { OG_GROESSE, ladeOgSymbol, ogGestaltung, ogOptionen, ogTexte, spracheAus } from '@/lib/seo/og-bild';

/**
 * Standard-Open-Graph-Bild je Sprache (K-16, D-O4): Monogramm, der Name „IGMG Wetzlar“ groß als Titel und der
 * Untertitel der Startseite darunter. Es gilt für alle Seiten ohne eigenes Bild. Texte aus den Sprachdateien; keine Laufzeitdaten.
 */
type Werte = { locale?: string };
type Parameter = Promise<Werte>;

/** Alt-Text je Sprache: ein statischer `alt`-Export kann weder Sprache noch Titel kennen. */
export async function generateImageMetadata({ params }: { params?: Parameter }) {
  const werte: Werte = (await params) ?? {};
  return [{ id: 'standard', alt: ogTexte(spracheAus(werte.locale)).alt.standard, size: OG_GROESSE, contentType: 'image/png' }];
}

export default async function StandardBild({ params }: { params: Parameter }) {
  const texte = ogTexte(spracheAus((await params).locale));
  return new ImageResponse(
    ogGestaltung({
      wortmarke: texte.wortmarke,
      symbol: await ladeOgSymbol(),
      titel: texte.wortmarke,
      zeile: texte.untertitel,
      ohneWortmarke: true,
    }),
    await ogOptionen(),
  );
}
