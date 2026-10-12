import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { KursFormular } from '@/components/verwaltung/kurse/KursFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { NEUER_KURS } from '@/lib/validierung/kurs';
import { speichereKurs } from '@/server/actions/kurse';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Neuer Kurs (V06). Eigene Seite statt Dialog wie bei Veranstaltungen (ABWEICHUNGEN A-V02). */
export default async function NeuerKurs() {
  await verlangeSeitenRecht('kurs.bearbeiten');
  const [t, optionen, bilder] = await Promise.all([getTranslations('verwaltung.kurse'), formularOptionen(), ladeBildAuswahl()]);
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/kurse"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neu')} kennung={tg('gruppe.inhalte')} einleitung={t('neuEinleitung')} />
      <KursFormular aktion={speichereKurs} startwerte={NEUER_KURS} modus="neu" verfuegbarkeit={optionen.verfuegbarkeit} bilder={bilder} />
    </>
  );
}
