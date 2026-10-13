import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { HadithListe } from '@/components/website/hadith/HadithListe';
import { QuellenZeile } from '@/components/website/hadith/QuellenZeile';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { hadithSicht } from '@/lib/hadith/anzeige';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithAuswahl } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hadith.auswahl');
  return metadatenFuer({ pfad: '/hadith/auswahl', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Auswahl (AUFTRAG 3.3): kuratierte Liste `hadith_auswahl` („auswahl“) in fester Reihenfolge, als Karten wie im Buch.
 * Leer → ehrlicher Zustand. Der Weg „Im Buch lesen“ erscheint nur mit freigeschalteter Gesamtsammlung.
 */
export default async function HadithAuswahlSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, th, auswahl, schalter] = await Promise.all([
    getTranslations('hadith.auswahl'),
    getTranslations('hadith'),
    ladeHadithAuswahl(),
    funktionAn('hadith_gesamt'),
  ]);
  const name = text(auswahl.sammlung?.name, sprache) || th('bukhari.titel');
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hadith"
      sprachZiel="/hadith/auswahl"
      pfad={[{ label: th('breadcrumb'), ziel: '/hadith' }, { label: t('titel') }]}
    >
      <PageHeader kennung={th('breadcrumb')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        {auswahl.hadithe.length ? (
          <div className="max-w-seitenkopf">
            <HadithListe
              hadithe={auswahl.hadithe}
              sammlungName={name}
              beschriftung={t('liste')}
              imBuch={hadithSicht(schalter, 1).buecherVerlinken}
            />
          </div>
        ) : (
          <div role="status" className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
            <Zustandsgrafik art="leer" />
            <h2 className="font-text text-24 font-bold tracking-normal">{t('leerTitel')}</h2>
            <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('leerText')}</p>
            <Link
              href="/hadith"
              className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
            >
              <ArrowLeft aria-hidden className="size-5" />
              {t('zurueck')}
            </Link>
          </div>
        )}
        {auswahl.sammlung ? <QuellenZeile /> : null}
      </div>
    </Seitenrahmen>
  );
}
