import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { FreigabeEntscheidung } from '@/components/verwaltung/freigaben/FreigabeEntscheidung';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { FreieSeiteInhalt } from '@/components/website/bloecke/FreieSeiteInhalt';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { entscheideFreigabe } from '@/server/actions/freigaben';
import { seiteMitMedien } from '@/server/queries/seiten';
import { ladeFreigabeStaende, ladeSeiteFuerVerwaltung } from '@/server/queries/verwaltung/seiten';

/**
 * Verwaltung › Freigaben › Seite prüfen (ADR 0030, ADR 0032): Die Prüferin sieht die Seite so, wie sie veröffentlicht
 * aussähe (auch ohne Recht auf das Modul „Seiten“), und entscheidet darunter. Nur für Seiten im Papierkorb nicht.
 */
export default async function SeitePruefen({ params }: PageProps<'/[locale]/verwaltung/freigaben/seite/[id]'>) {
  const a = await verlangeSeitenRecht('freigabe.lesen');
  const { id } = await params;
  const z = await ladeSeiteFuerVerwaltung(id);
  if (!z || z.imPapierkorbSeit) notFound();
  const [t, tg, staende, seite] = await Promise.all([
    getTranslations('verwaltung.freigaben'),
    getTranslations('verwaltung.shell'),
    ladeFreigabeStaende('seite', [z.id]),
    seiteMitMedien(z),
  ]);
  const stand = staende.get(z.id);
  const offen = stand?.status === 'zur_pruefung';
  const darfEs = offen
    ? stand.art === 'religioes'
      ? darf(a.rollen, 'religioes.freigeben')
      : darf(a.rollen, 'seite.veroeffentlichen', { organisation: z.organisation })
    : false;
  return (
    <>
      <NextLink
        href="/verwaltung/freigaben"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('vorschauTitel')} kennung={tg('gruppe.inhalte')} einleitung={t('vorschauHinweis')} />
      <div className="overflow-hidden rounded-lg border border-linie bg-papier">
        <FreieSeiteInhalt eingebettet seite={seite} sprache="de" />
      </div>
      {offen ? (
        <section aria-labelledby="entscheidung" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <h2 id="entscheidung" className="font-display text-24 font-semibold">
            {t(`gruppe.${stand.art}`)}
          </h2>
          {darfEs ? (
            <FreigabeEntscheidung aktion={entscheideFreigabe} inhaltTyp="seite" inhaltId={z.id} titel={z.titel.de} />
          ) : (
            <Meldung art="info">{stand.art === 'religioes' ? t('nurReligioes') : t('nurVeroeffentlichen')}</Meldung>
          )}
        </section>
      ) : (
        <Meldung art="info">{t('fehler.nichtMehrOffen')}</Meldung>
      )}
    </>
  );
}
