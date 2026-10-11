import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AnkuendigungsFormular } from '@/components/verwaltung/ankuendigungen/AnkuendigungsFormular';
import { NEUE_ANKUENDIGUNG } from '@/components/verwaltung/ankuendigungen/werte';
import { organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereAnkuendigung } from '@/server/actions/ankuendigungen';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neue Ankündigung (V04): eigene Seite statt Dialog, wie bei den Veranstaltungen (ABWEICHUNGEN). */
export default async function NeueAnkuendigung() {
  const a = await verlangeSeitenRecht('ankuendigung.lesen');
  const filter = organisationsFilter(a.rollen, 'ankuendigung.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.ankuendigungen'), formularOptionen(a)]);
  const startwerte = { ...NEUE_ANKUENDIGUNG, organisation: optionen.organisationen[0]?.wert ?? '' };
  return (
    <>
      <NextLink
        href="/verwaltung/ankuendigungen"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div>
        <h1 className="text-30 md:text-36">{t('neu')}</h1>
        <p className="text-tinte-2">{t('neuEinleitung')}</p>
      </div>
      <AnkuendigungsFormular aktion={speichereAnkuendigung} startwerte={startwerte} modus="neu" organisationen={optionen.organisationen} />
    </>
  );
}
