import { BookHeart, BookOpen, Highlighter, PenLine, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Weg, type WegStation } from '@/components/website/elifbe/Weg';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('lernen');
  return metadatenFuer({ pfad: '/lernen', titel: t('titel'), beschreibung: t('untertitel') });
}

const symbol = 'size-6 stroke-weiss';

/**
 * Lern-Hub /lernen (Erzählansicht, B-24): der große Lernweg Elifbe → Tajwid → Koran → Hifz → Kurse. Kurze Erklärtexte
 * ohne religiöse Aussagen; Hifz ohne eigene Seite (Plakette „Folgt bald“ bis zum Angebot der Gemeinde). Vollständig
 * statisch.
 */
export default async function LernenSeite() {
  const t = await getTranslations('lernen');
  const tk = await getTranslations('kopf');
  const station = (nr: number) => t('station', { nr });
  const stationen: WegStation[] = [
    {
      kennung: station(1),
      titel: t('elifbeTitel'),
      text: t('elifbeText'),
      ziel: '/elifbe',
      linkText: t('elifbeLink'),
      zeichen: <PenLine aria-hidden className={symbol} />,
    },
    {
      kennung: station(2),
      titel: t('tajwidTitel'),
      text: t('tajwidText'),
      ziel: '/quran/tajwid',
      linkText: t('tajwidLink'),
      zeichen: <Highlighter aria-hidden className={symbol} />,
    },
    {
      kennung: station(3),
      titel: t('koranTitel'),
      text: t('koranText'),
      ziel: '/quran',
      linkText: t('koranLink'),
      zeichen: <BookOpen aria-hidden className={symbol} />,
    },
    {
      kennung: station(4),
      titel: t('hifzTitel'),
      text: t('hifzText'),
      // Noch ohne eigenes Angebot: Plakette in der Fußzeile wie die Links der anderen Stationen (Sichtabnahme L-1)
      plakette: t('bald'),
      zeichen: <BookHeart aria-hidden className={symbol} />,
    },
    {
      kennung: station(5),
      titel: t('kurseTitel'),
      text: t('kurseText'),
      ziel: '/bildung/korankurse',
      linkText: t('kurseLink'),
      zeichen: <Users aria-hidden className={symbol} />,
    },
  ];
  return (
    <Seitenrahmen bereich="bildung" seite="lernen" sprachZiel="/lernen" pfad={[{ label: tk('bildung') }, { label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="lernweg" className="flex flex-col gap-8">
          <div className="flex max-w-einleitung flex-col gap-3">
            <h2 id="lernweg" className="text-display-2">
              {t('wegTitel')}
            </h2>
            <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('wegEinleitung')}</p>
          </div>
          <Weg stationen={stationen} waagerecht beschriftung={t('wegTitel')} />
        </section>
        <section aria-labelledby="begleitung" className="flex flex-col items-start gap-4 rounded-lg bg-sand p-6 md:p-10">
          <h2 id="begleitung" className="text-display-2">
            {t('begleitungTitel')}
          </h2>
          <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{t('begleitungText')}</p>
          <Link
            href="/bildung/voranmeldung"
            className="inline-flex min-h-12 druck items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss"
          >
            {t('voranmeldung')}
          </Link>
        </section>
      </div>
    </Seitenrahmen>
  );
}
