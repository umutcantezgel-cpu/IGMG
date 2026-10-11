import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { NeuigkeitsFormular } from '@/components/verwaltung/neuigkeiten/NeuigkeitsFormular';
import { NEUE_NACHRICHT } from '@/components/verwaltung/neuigkeiten/formularwerte';
import { organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereNeuigkeit } from '@/server/actions/neuigkeiten';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neue Nachricht (V03 – als eigene Seite statt Dialog, wie bei den Veranstaltungen). */
export default async function NeueNachricht() {
  const a = await verlangeSeitenRecht('nachricht.lesen');
  const filter = organisationsFilter(a.rollen, 'nachricht.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.neuigkeiten'), formularOptionen(a)]);
  const startwerte = { ...NEUE_NACHRICHT, organisation: optionen.organisationen[0]?.wert ?? '' };
  return (
    <>
      <NextLink
        href="/verwaltung/neuigkeiten"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div>
        <h1 className="text-30 md:text-36">{t('neu')}</h1>
        <p className="text-tinte-2">{t('neuEinleitung')}</p>
      </div>
      <NeuigkeitsFormular
        aktion={speichereNeuigkeit}
        startwerte={startwerte}
        texte={{ de: null, tr: null, en: null }}
        modus="neu"
        kategorien={optionen.kategorien}
        organisationen={optionen.organisationen}
      />
    </>
  );
}
