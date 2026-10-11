import { ArrowLeft, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { formularWerte } from '@/components/verwaltung/neuigkeiten/formularwerte';
import { NeuigkeitsFormular } from '@/components/verwaltung/neuigkeiten/NeuigkeitsFormular';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereNeuigkeit } from '@/server/actions/neuigkeiten';
import { ladeNachrichtFuerVerwaltung } from '@/server/queries/verwaltung/neuigkeiten';
import { formularOptionen } from '../formular-optionen';

/**
 * Verwaltung › Nachricht bearbeiten. Im Papierkorb nur lesen. Fremde Organisation: wie nicht vorhanden (404), damit
 * die Seite keine Auskunft über fremde Beiträge gibt (K-06). Die Abfrage prüft die Organisation selbst.
 */
export default async function NachrichtBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/neuigkeiten/[id]'>) {
  const a = await verlangeSeitenRecht('nachricht.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const filter = organisationsFilter(a.rollen, 'nachricht.bearbeiten');
  const z = await ladeNachrichtFuerVerwaltung(id, filter);
  if (!z) notFound();
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.neuigkeiten'), formularOptionen(a)]);
  const nurLesen = !darf(a.rollen, 'nachricht.bearbeiten', { organisation: z.organisation }) || z.imPapierkorbSeit !== null;
  // Organisation des Beitrags immer in der Auswahl (Lesemodus im Papierkorb)
  const organisationen = optionen.organisationen.some((o) => o.wert === (z.organisation ?? ''))
    ? optionen.organisationen
    : [...optionen.organisationen, { wert: z.organisation ?? '', label: z.organisation ? z.organisation.toUpperCase() : t('allgemein') }];
  return (
    <>
      <NextLink
        href="/verwaltung/neuigkeiten"
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
            href={`/nachrichten/${z.slug}`}
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
      <NeuigkeitsFormular
        aktion={speichereNeuigkeit}
        startwerte={formularWerte(z)}
        texte={{ de: z.inhalt?.de ?? null, tr: z.inhalt?.tr ?? null, en: z.inhalt?.en ?? null }}
        modus="bearbeiten"
        kategorien={optionen.kategorien}
        organisationen={organisationen}
        nurLesen={nurLesen}
      />
    </>
  );
}
