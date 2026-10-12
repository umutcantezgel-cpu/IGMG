import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { AnkuendigungsFormular } from '@/components/verwaltung/ankuendigungen/AnkuendigungsFormular';
import { formularWerte } from '@/components/verwaltung/ankuendigungen/werte';
import { Meldung } from '@/components/verwaltung/Meldung';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { speichereAnkuendigung } from '@/server/actions/ankuendigungen';
import { ladeAnkuendigungFuerVerwaltung } from '@/server/queries/verwaltung/ankuendigungen';
import { formularOptionen } from '../formular-optionen';

/** Verwaltung › Ankündigung bearbeiten (V04). Im Papierkorb nur lesen; fremde Organisation: kein Zugriff (K-06). */
export default async function AnkuendigungBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/ankuendigungen/[id]'>) {
  const a = await verlangeSeitenRecht('ankuendigung.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const z = await ladeAnkuendigungFuerVerwaltung(id);
  if (!z) notFound();
  // Organisationsredaktion: fremde Organisationen weder bearbeiten noch lesen (K-06)
  const filter = organisationsFilter(a.rollen, 'ankuendigung.bearbeiten');
  if (filter !== null && !(z.organisation && filter.includes(z.organisation))) redirect('/verwaltung/kein-zugriff');
  const [t, optionen] = await Promise.all([getTranslations('verwaltung.ankuendigungen'), formularOptionen(a)]);
  const nurLesen = !darf(a.rollen, 'ankuendigung.bearbeiten', { organisation: z.organisation }) || z.imPapierkorbSeit !== null;
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink
        href="/verwaltung/ankuendigungen"
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('bearbeiten')} kennung={tg('gruppe.inhalte')} einleitung={z.titel.de} />
      {sp.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {z.imPapierkorbSeit ? <Meldung art="info">{t('imPapierkorb')}</Meldung> : null}
      <AnkuendigungsFormular
        aktion={speichereAnkuendigung}
        startwerte={formularWerte(z)}
        modus="bearbeiten"
        organisationen={optionen.organisationen}
        nurLesen={nurLesen}
      />
    </>
  );
}
