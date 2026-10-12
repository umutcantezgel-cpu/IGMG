import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { NeuigkeitsFormular } from '@/components/verwaltung/neuigkeiten/NeuigkeitsFormular';
import { NEUE_NACHRICHT } from '@/components/verwaltung/neuigkeiten/formularwerte';
import { organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereNeuigkeit } from '@/server/actions/neuigkeiten';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neue Nachricht (V03 – als eigene Seite statt Dialog, wie bei den Veranstaltungen). */
export default async function NeueNachricht() {
  const a = await verlangeSeitenRecht('nachricht.lesen');
  const filter = organisationsFilter(a.rollen, 'nachricht.bearbeiten');
  if (filter !== null && filter.length === 0) redirect('/verwaltung/kein-zugriff');
  const [t, optionen, bilder] = await Promise.all([getTranslations('verwaltung.neuigkeiten'), formularOptionen(a), ladeBildAuswahl()]);
  const startwerte = { ...NEUE_NACHRICHT, organisation: optionen.organisationen[0]?.wert ?? '' };
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/neuigkeiten"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neu')} kennung={tg('gruppe.inhalte')} einleitung={t('neuEinleitung')} />
      <NeuigkeitsFormular
        aktion={speichereNeuigkeit}
        startwerte={startwerte}
        texte={{ de: null, tr: null, en: null }}
        modus="neu"
        kategorien={optionen.kategorien}
        organisationen={optionen.organisationen}
        bilder={bilder}
      />
    </>
  );
}
