import { ArrowLeft, ExternalLink, History } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { editorOptionen, seitenWerte } from '@/components/verwaltung/seiten/optionen';
import { SeitenFormular } from '@/components/verwaltung/seiten/SeitenFormular';
import { VorschauKnopf } from '@/components/verwaltung/seiten/VorschauKnopf';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { seitenPfad } from '@/lib/cms/slugs';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { gueltigeBloecke } from '@/lib/validierung/bloecke';
import { erzeugeVorschau, speichereSeite } from '@/server/actions/seiten';
import { ladeFreigabeStaende, ladeSeiteFuerVerwaltung } from '@/server/queries/verwaltung/seiten';

const HINWEISE = ['religioesePruefung', 'zurPruefung', 'geplant', 'veroeffentlicht'] as const;

/**
 * Verwaltung › Seite bearbeiten (ADR 0032). Im Papierkorb nur lesen. Fremde Organisation: wie nicht vorhanden (404,
 * K-06). Darüber: Vorschau-Link, frühere Fassungen und der Stand der Prüfung.
 */
export default async function SeiteBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/seiten/[id]'>) {
  const a = await verlangeSeitenRecht('seite.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const z = await ladeSeiteFuerVerwaltung(id, organisationsFilter(a.rollen, 'seite.bearbeiten'));
  if (!z) notFound();
  const jetzt = new Date();
  const [t, tg, optionen, staende] = await Promise.all([
    getTranslations('verwaltung.seiten'),
    getTranslations('verwaltung.shell'),
    editorOptionen(a, z.organisation),
    ladeFreigabeStaende('seite', [z.id]),
  ]);
  const stand = staende.get(z.id);
  const nurLesen = !darf(a.rollen, 'seite.bearbeiten', { organisation: z.organisation }) || z.imPapierkorbSeit !== null;
  const oeffentlich = z.status === 'veroeffentlicht' && !z.imPapierkorbSeit && (!z.veroeffentlichenAm || z.veroeffentlichenAm <= jetzt);
  const hinweis = HINWEISE.find((h) => h === sp.hinweis);
  return (
    <>
      <NextLink href="/verwaltung/seiten" className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4">
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf
        titel={t('bearbeiten')}
        kennung={tg('gruppe.inhalte')}
        einleitung={z.titel.de}
        aktion={
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <NextLink
              href={`/verwaltung/seiten/${z.id}/revisionen`}
              className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
            >
              <History aria-hidden className="size-5" />
              {t('revisionen')}
            </NextLink>
            {oeffentlich ? (
              <NextLink
                href={seitenPfad({ de: z.slugDe, tr: z.slugTr, en: z.slugEn }, 'de')}
                prefetch={false}
                className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
              >
                {t('oeffentlichAnsehen')}
                <ExternalLink aria-hidden className="size-4" />
              </NextLink>
            ) : null}
          </div>
        }
      />
      {sp.angelegt ? <Meldung art={hinweis === 'religioesePruefung' ? 'info' : 'erfolg'}>{hinweis ? t(`hinweis.${hinweis}`) : t('angelegt')}</Meldung> : null}
      {sp.wiederhergestellt ? <Meldung art="erfolg">{t('wiederhergestellt')}</Meldung> : null}
      {z.imPapierkorbSeit ? <Meldung art="info">{t('imPapierkorb')}</Meldung> : null}
      {stand?.status === 'zur_pruefung' ? <Meldung art="info">{t('offenerAntrag', { art: t(`pruefArt.${stand.art}`) })}</Meldung> : null}
      {stand?.status === 'entwurf' && stand.kommentar ? (
        <Meldung art="info">{t('zurueckgewiesen', { kommentar: stand.kommentar })}</Meldung>
      ) : null}
      {!nurLesen ? <VorschauKnopf aktion={erzeugeVorschau} id={z.id} /> : null}
      <SeitenFormular
        aktion={speichereSeite}
        startwerte={seitenWerte(z, stand)}
        startBloecke={gueltigeBloecke(z.bloecke)}
        modus="bearbeiten"
        optionen={optionen}
        nurLesen={nurLesen}
      />
    </>
  );
}
