import { ImageResponse } from 'next/og';
import { text } from '@/lib/i18n/inhalt';
import {
  OG_GROESSE,
  fuelle,
  inhaltOderStandard,
  kennungMitDatum,
  ladeOgSymbol,
  ogGestaltung,
  ogOptionen,
  ogTexte,
  spracheAus,
} from '@/lib/seo/og-bild';
import { ladeNachricht, ladeNachrichtenSlugs } from '@/server/queries/nachrichten';

/**
 * Open-Graph-Bild eines Beitrags (K-16, D-O4): Bereich und Veröffentlichungsdatum als Kennung, der Titel in der
 * Displayschrift. Beim Bau alle veröffentlichten Slugs (wie die Seite); unbekannte Slugs – und ohne Datenbank
 * (Beispielmodus) alle nicht vorgerenderten – bekommen das Standardbild.
 */
export async function generateStaticParams() {
  const slugs = await ladeNachrichtenSlugs();
  return (slugs.length ? slugs : ['_']).map((slug) => ({ slug }));
}

type Werte = { locale?: string; slug?: string };
type Parameter = Promise<Werte>;

/** Alt-Text mit Titel in der Sprache des Bildes; ohne Beitrag das Standard-Alt. */
export async function generateImageMetadata({ params }: { params?: Parameter }) {
  const werte: Werte = (await params) ?? {};
  const sprache = spracheAus(werte.locale);
  const slug = werte.slug;
  const beitrag = slug ? await inhaltOderStandard(() => ladeNachricht(slug)) : null;
  const texte = ogTexte(sprache);
  const alt = beitrag ? fuelle(texte.alt.nachricht, { titel: text(beitrag.titel, sprache) }) : texte.alt.standard;
  return [{ id: 'beitrag', alt, size: OG_GROESSE, contentType: 'image/png' }];
}

export default async function BeitragBild({ params }: { params: Parameter }) {
  const { locale, slug } = await params;
  const sprache = spracheAus(locale);
  const texte = ogTexte(sprache);
  const beitrag = slug ? await inhaltOderStandard(() => ladeNachricht(slug)) : null;
  const symbol = await ladeOgSymbol();
  if (!beitrag) {
    return new ImageResponse(
      ogGestaltung({
        wortmarke: texte.wortmarke,
        symbol,
        titel: texte.wortmarke,
        zeile: texte.untertitel,
        ohneWortmarke: true,
      }),
      await ogOptionen(),
    );
  }
  return new ImageResponse(
    ogGestaltung({
      wortmarke: texte.wortmarke,
      symbol,
      kennung: kennungMitDatum(texte.art.nachricht, new Date(beitrag.veroeffentlichtAm), sprache),
      titel: text(beitrag.titel, sprache),
    }),
    await ogOptionen(),
  );
}
