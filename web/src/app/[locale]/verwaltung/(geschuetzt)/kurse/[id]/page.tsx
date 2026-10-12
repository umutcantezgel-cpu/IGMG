import { ArrowLeft, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { KursFormular } from '@/components/verwaltung/kurse/KursFormular';
import { Meldung } from '@/components/verwaltung/Meldung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { kursFormularWerte } from '@/lib/validierung/kurs';
import { speichereKurs } from '@/server/actions/kurse';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';
import { ladeKursFuerVerwaltung } from '@/server/queries/verwaltung/kurse';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Kurs bearbeiten (V06). Im Papierkorb nur lesen; ohne Bearbeitungsrecht ebenfalls nur lesen. */
export default async function KursBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/kurse/[id]'>) {
  const a = await verlangeSeitenRecht('kurs.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const k = await ladeKursFuerVerwaltung(id);
  if (!k) notFound();
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.kurse'), formularOptionen()]);
  const nurLesen = !darf(a.rollen, 'kurs.bearbeiten') || k.imPapierkorbSeit !== null;
  const bilder = nurLesen ? [] : await ladeBildAuswahl();
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/kurse"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf
        titel={t('bearbeiten')}
        kennung={tg('gruppe.inhalte')}
        einleitung={k.titel.de}
        aktion={
          k.status === 'veroeffentlicht' && !k.imPapierkorbSeit ? (
            <NextLink
              href="/bildung/korankurse"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4"
            >
              {t('oeffentlichAnsehen')}
              <ExternalLink aria-hidden className="size-4" />
            </NextLink>
          ) : null
        }
      />
      {sp.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {k.imPapierkorbSeit ? <Meldung art="info">{t('imPapierkorb')}</Meldung> : null}
      <KursFormular
        aktion={speichereKurs}
        startwerte={kursFormularWerte(k)}
        modus="bearbeiten"
        verfuegbarkeit={optionen.verfuegbarkeit}
        bilder={bilder}
        nurLesen={nurLesen}
      />
    </>
  );
}
