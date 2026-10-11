import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VeranstaltungsFormular } from '@/components/verwaltung/veranstaltungen/VeranstaltungsFormular';
import { organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { NEUE_VERANSTALTUNG } from '@/lib/veranstaltung/formularwerte';
import { speichereVeranstaltung } from '@/server/actions/veranstaltungen';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neue Veranstaltung (V02 „Neue Veranstaltung“ – als eigene Seite statt Dialog, ABWEICHUNGEN A-V02). */
export default async function NeueVeranstaltung() {
  const a = await verlangeSeitenRecht('veranstaltung.lesen');
  const filter = organisationsFilter(a.rollen, 'veranstaltung.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.veranstaltungen'), formularOptionen(a)]);
  const startwerte = { ...NEUE_VERANSTALTUNG, organisation: optionen.organisationen[0]?.wert ?? '' };
  return (
    <>
      <NextLink
        href="/verwaltung/veranstaltungen"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div>
        <h1 className="text-30 md:text-36">{t('neu')}</h1>
        <p className="text-tinte-2">{t('neuEinleitung')}</p>
      </div>
      <VeranstaltungsFormular aktion={speichereVeranstaltung} startwerte={startwerte} modus="neu" {...optionen} />
    </>
  );
}
