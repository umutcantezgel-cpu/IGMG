import { ArrowLeft, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VeranstaltungsFormular } from '@/components/verwaltung/veranstaltungen/VeranstaltungsFormular';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { formularWerte } from '@/lib/veranstaltung/formularwerte';
import { speichereVeranstaltung } from '@/server/actions/veranstaltungen';
import { ladeVeranstaltungFuerVerwaltung } from '@/server/queries/verwaltung/veranstaltungen';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Veranstaltung bearbeiten (V02). Ohne Bearbeitungsrecht (fremde Organisation): nur lesen. */
export default async function VeranstaltungBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/veranstaltungen/[id]'>) {
  const a = await verlangeSeitenRecht('veranstaltung.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const z = await ladeVeranstaltungFuerVerwaltung(id);
  if (!z) notFound();
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.veranstaltungen'), formularOptionen(a)]);
  const nurLesen = !darf(a.rollen, 'veranstaltung.bearbeiten', { organisation: z.organisation }) || z.imPapierkorbSeit !== null;
  // Fremde Organisation im Lesemodus trotzdem anzeigen
  const organisationen = optionen.organisationen.some((o) => o.wert === (z.organisation ?? ''))
    ? optionen.organisationen
    : [...optionen.organisationen, { wert: z.organisation ?? '', label: z.organisation ? z.organisation.toUpperCase() : t('allgemein') }];
  return (
    <>
      <NextLink
        href="/verwaltung/veranstaltungen"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-30 md:text-36">{t('bearbeiten')}</h1>
          <p className="text-tinte-2">{z.titel.de}</p>
        </div>
        {z.status === 'veroeffentlicht' && !z.imPapierkorbSeit ? (
          <NextLink
            href={`/veranstaltungen/${z.slug}`}
            prefetch={false}
            className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4"
          >
            {t('oeffentlichAnsehen')}
            <ExternalLink aria-hidden className="size-4" />
          </NextLink>
        ) : null}
      </div>
      {sp.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {z.imPapierkorbSeit ? <Meldung art="info">{t('imPapierkorb')}</Meldung> : null}
      <VeranstaltungsFormular
        aktion={speichereVeranstaltung}
        startwerte={formularWerte(z)}
        modus="bearbeiten"
        kategorien={optionen.kategorien}
        organisationen={organisationen}
        nurLesen={nurLesen}
      />
    </>
  );
}
