import { ArrowRight, Library } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { BuchKacheln } from '@/components/website/hadith/BuchKacheln';
import { QuellenZeile } from '@/components/website/hadith/QuellenZeile';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithUebersicht } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const sprache = (await getLocale()) as Locale;
  const [t, u, schalter] = await Promise.all([getTranslations('hadith.bukhari'), ladeHadithUebersicht(), funktionAn('hadith_gesamt')]);
  const daten = await metadatenFuer({
    pfad: '/hadith/bukhari',
    titel: text(u.sammlung?.name, sprache) || t('titel'),
    beschreibung: t('untertitel', { anzahl: u.buecher.length }),
  });
  // Solange die Gesamtsammlung nicht freigeschaltet ist, steht hier nur ein Hinweis: nicht in den Suchindex
  return schalter ? daten : { ...daten, robots: { index: false, follow: true } };
}

/**
 * Sahih al-Bukhari, alle Bücher (AUFTRAG 3.3): Raster der 97 Bücher mit Nummer im Achtstern, Titel der Quelle und
 * Anzahl. Ohne Schalter `hadith_gesamt` (Produktion bis zur Rechtsfreigabe MN-06) ein ehrlicher Hinweis mit dem Weg
 * zur Auswahl; ohne Import ein Leerzustand.
 */
export default async function BukhariSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, th, u, schalter] = await Promise.all([
    getTranslations('hadith.bukhari'),
    getTranslations('hadith'),
    ladeHadithUebersicht(),
    funktionAn('hadith_gesamt'),
  ]);
  const name = text(u.sammlung?.name, sprache) || t('titel');
  const zahl = (n: number) => new Intl.NumberFormat(sprache).format(n);
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hadith"
      sprachZiel="/hadith/bukhari"
      pfad={[{ label: th('breadcrumb'), ziel: '/hadith' }, { label: name }]}
    >
      <PageHeader
        kennung={th('breadcrumb')}
        titel={name}
        untertitel={schalter && u.buecher.length ? t('untertitel', { anzahl: zahl(u.buecher.length) }) : undefined}
      />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        {!schalter || !u.buecher.length ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
            <Zustandsgrafik art="leer" />
            {schalter ? (
              <p className="max-w-text text-20 text-tinte-2">{t('leer')}</p>
            ) : (
              <>
                <h2 className="font-text text-24 font-bold tracking-normal">{t('ausTitel')}</h2>
                <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('ausText')}</p>
                <Link
                  href="/hadith/auswahl"
                  className="inline-flex min-h-12 druck items-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss"
                >
                  {t('zurAuswahl')}
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </>
            )}
          </div>
        ) : (
          <nav aria-labelledby="hadith-buecher" className="flex flex-col gap-6">
            <h2 id="hadith-buecher" className="flex items-center gap-3 text-display-2">
              <Library aria-hidden className="size-7 shrink-0 text-gruen-700" />
              {t('liste')}
            </h2>
            <BuchKacheln buecher={u.buecher} />
          </nav>
        )}
        {u.sammlung ? <QuellenZeile /> : null}
      </div>
    </Seitenrahmen>
  );
}
