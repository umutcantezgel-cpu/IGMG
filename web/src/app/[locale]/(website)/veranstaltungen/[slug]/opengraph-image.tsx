import { ImageResponse } from 'next/og';
import { text, type Sprache } from '@/lib/i18n/inhalt';
import { OG_GROESSE, fuelle, ladeOgSymbol, ogGestaltung, ogTexte, spracheAus, terminZeile } from '@/lib/seo/og-bild';
import { ladeVeranstaltung, ladeVeranstaltungsSlugs } from '@/server/queries/veranstaltungen';

/**
 * Open-Graph-Bild einer Veranstaltung (K-16, D-O4): Name und Termin auf der Standardgestaltung.
 * Beim Bau alle veröffentlichten Slugs (wie die Seite); unbekannte Slugs bekommen das Standardbild.
 */
export async function generateStaticParams() {
  const slugs = await ladeVeranstaltungsSlugs();
  return (slugs.length ? slugs : ['_']).map((slug) => ({ slug }));
}

type Werte = { locale?: string; slug?: string };
type Parameter = Promise<Werte>;

/** Termin als Zeile aus dem nächsten Vorkommen (Beginn und optionales Ende als ISO-Text). */
function zeileFuer(beginn: string, ende: string | null, sprache: Sprache): string {
  return terminZeile(new Date(beginn), ende ? new Date(ende) : null, sprache);
}

/** Alt-Text mit Name und Termin in der Sprache des Bildes; ohne Veranstaltung das Standard-Alt. */
export async function generateImageMetadata({ params }: { params?: Parameter }) {
  const werte: Werte = (await params) ?? {};
  const sprache = spracheAus(werte.locale);
  const texte = ogTexte(sprache);
  const veranstaltung = werte.slug ? await ladeVeranstaltung(werte.slug) : null;
  const alt = veranstaltung
    ? fuelle(texte.alt.veranstaltung, {
        titel: text(veranstaltung.titel, sprache),
        zeit: zeileFuer(veranstaltung.beginn, veranstaltung.ende, sprache),
      })
    : texte.alt.standard;
  return [{ id: 'termin', alt, size: OG_GROESSE, contentType: 'image/png' }];
}

export default async function TerminBild({ params }: { params: Parameter }) {
  const { locale, slug } = await params;
  const sprache = spracheAus(locale);
  const texte = ogTexte(sprache);
  const veranstaltung = slug ? await ladeVeranstaltung(slug) : null;
  const symbol = await ladeOgSymbol();
  if (!veranstaltung) {
    return new ImageResponse(ogGestaltung({ wortmarke: texte.wortmarke, symbol, titel: texte.untertitel }), { ...OG_GROESSE });
  }
  return new ImageResponse(
    ogGestaltung({
      wortmarke: texte.wortmarke,
      symbol,
      art: texte.art.veranstaltung,
      titel: text(veranstaltung.titel, sprache),
      zeile: zeileFuer(veranstaltung.beginn, veranstaltung.ende, sprache),
    }),
    { ...OG_GROESSE },
  );
}
