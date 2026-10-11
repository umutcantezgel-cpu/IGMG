import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { KursFormular } from '@/components/verwaltung/kurse/KursFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { NEUER_KURS } from '@/lib/validierung/kurs';
import { speichereKurs } from '@/server/actions/kurse';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neuer Kurs (V06). Eigene Seite statt Dialog wie bei Veranstaltungen (ABWEICHUNGEN A-V02). */
export default async function NeuerKurs() {
  await verlangeSeitenRecht('kurs.bearbeiten');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.kurse'), formularOptionen()]);
  return (
    <>
      <NextLink
        href="/verwaltung/kurse"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <div>
        <h1 className="text-30 md:text-36">{t('neu')}</h1>
        <p className="text-tinte-2">{t('neuEinleitung')}</p>
      </div>
      <KursFormular aktion={speichereKurs} startwerte={NEUER_KURS} modus="neu" verfuegbarkeit={optionen.verfuegbarkeit} />
    </>
  );
}
