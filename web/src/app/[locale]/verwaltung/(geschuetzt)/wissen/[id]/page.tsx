import type { JSONContent } from '@tiptap/core';
import { ArrowLeft, ArrowRight, ExternalLink, History, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { PILLE } from '@/components/verwaltung/seiten/Ansichten';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { WissenFormular } from '@/components/verwaltung/wissen/WissenFormular';
import { datumLang, datumOhneWochentag } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { wissenUebersetzungsstand } from '@/lib/validierung/wissen';
import { speichereWissensThema, wissensThemaInPapierkorb } from '@/server/actions/wissen';
import { ladeWissensPruefVerlauf, ladeWissensThemaVerwaltung } from '@/server/queries/verwaltung/wissen';

const FREIGABE_FARBE = {
  entwurf: 'bg-sand text-tinte-2',
  zur_pruefung: 'bg-info-toenung text-info',
  geprueft: 'bg-gruen-50 text-gruen-800',
} as const;

/**
 * Verwaltung › Islamisches Wissen › Thema (F-40, ADR 0030): Stand der religiösen Prüfung (mit der letzten Rückmeldung),
 * Übersetzungsstand, Formular, frühere Fassungen, Papierkorb. `neu` legt ein Thema an.
 */
export default async function WissensThemaBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/wissen/[id]'>) {
  await verlangeSeitenRecht('wissen.bearbeiten');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const neu = id === 'neu';
  const z = neu ? null : await ladeWissensThemaVerwaltung(id);
  if (!neu && !z) notFound();
  const [t, tg, verlauf] = await Promise.all([
    getTranslations('verwaltung.wissen'),
    getTranslations('verwaltung.shell'),
    z ? ladeWissensPruefVerlauf(z.id) : Promise.resolve([]),
  ]);
  const zurueck = (
    <NextLink
      href="/verwaltung/wissen"
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {t('zurueck')}
    </NextLink>
  );
  if (!z)
    return (
      <>
        {zurueck}
        <VerwaltungsKopf titel={t('neuTitel')} kennung={tg('gruppe.inhalte')} />
        <Meldung art="info">{t('regel')}</Meldung>
        <WissenFormular
          aktion={speichereWissensThema}
          startwerte={{ sichtbar: 'ja' }}
          texte={{ De: null, Tr: null, En: null }}
          freigabe={null}
        />
      </>
    );

  const bestand = z.freigabe === 'geprueft' && z.geprueftVon === null;
  const oeffentlich = z.status === 'veroeffentlicht' && z.freigabe === 'geprueft' && !z.imPapierkorbSeit;
  const stand = wissenUebersetzungsstand(z);
  // Letzte Rückmeldung der Prüfung: Zurückweisen mit Kommentar (Status „entwurf“ im Verlauf)
  const rueckmeldung = verlauf.find((v) => v.status === 'entwurf' && v.kommentar);
  const startwerte: Record<string, string> = {
    id: z.id,
    slug: z.slug,
    titelDe: z.titel.de,
    titelTr: z.titel.tr ?? '',
    titelEn: z.titel.en ?? '',
    kurztextDe: z.kurztext?.de ?? '',
    kurztextTr: z.kurztext?.tr ?? '',
    kurztextEn: z.kurztext?.en ?? '',
    sichtbar: z.status === 'veroeffentlicht' ? 'ja' : '',
  };
  const texte = {
    De: (z.inhalt?.de as JSONContent | undefined) ?? null,
    Tr: (z.inhalt?.tr as JSONContent | undefined) ?? null,
    En: (z.inhalt?.en as JSONContent | undefined) ?? null,
  };

  return (
    <>
      {zurueck}
      <VerwaltungsKopf
        titel={z.titel.de}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('formular.adresseFest', { adresse: `/islamisches-wissen/${z.slug}` })}
        aktion={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <NextLink href={`/verwaltung/wissen/${z.id}/revisionen`}>
                <History aria-hidden />
                {t('fruehereFassungen')}
              </NextLink>
            </Button>
            {oeffentlich ? (
              <Button asChild variant="outline">
                <a href={`/islamisches-wissen/${z.slug}`} target="_blank" rel="noopener">
                  <ExternalLink aria-hidden />
                  {t('oeffentlichAnsehen')}
                </a>
              </Button>
            ) : null}
          </div>
        }
      />
      {sp.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}
      {sp.wiederhergestellt ? <Meldung art="erfolg">{t('wiederhergestellt')}</Meldung> : null}
      <section aria-labelledby="stand-titel" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <h2 id="stand-titel" className="flex flex-wrap items-center gap-3 font-display text-24 font-semibold">
          {t('stand.titel')}
          <span className={cn(PILLE, 'font-text', FREIGABE_FARBE[z.freigabe])}>{t(`freigabe.${z.freigabe}`)}</span>
          <span className={cn(PILLE, 'font-text', oeffentlich ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2')}>
            {oeffentlich ? t('website.oeffentlich') : t('website.nichtOeffentlich')}
          </span>
        </h2>
        <p className="max-w-einleitung text-18">
          {bestand
            ? t('stand.bestand')
            : z.freigabe === 'geprueft' && z.geprueftAm
              ? z.geprueftVonName
                ? t('stand.geprueft', { datum: datumOhneWochentag(z.geprueftAm, 'de'), name: z.geprueftVonName })
                : t('stand.geprueftOhneName', { datum: datumOhneWochentag(z.geprueftAm, 'de') })
              : t(`stand.${z.freigabe}`)}
        </p>
        {z.verfasstVonName ? <p className="text-16 text-tinte-2">{t('stand.verfasst', { name: z.verfasstVonName })}</p> : null}
        {z.status === 'entwurf' ? <p className="text-16 font-bold text-tinte-2">{t('stand.ausgeblendet')}</p> : null}
        {rueckmeldung && z.freigabe === 'entwurf' ? (
          <Meldung art="info">
            {t('stand.rueckmeldung', { datum: datumLang(rueckmeldung.am, 'de'), kommentar: rueckmeldung.kommentar ?? '' })}
          </Meldung>
        ) : null}
        <p className="flex flex-wrap gap-x-6 gap-y-1 text-16 tabular-nums">
          {(['tr', 'en'] as const).map((s) => (
            <span key={s}>
              {t('uebersetzungZeile', { sprache: t(`uebersetzungSprache.${s}`), anzahl: stand[s], gesamt: stand.gesamt })}
            </span>
          ))}
        </p>
        {z.freigabe === 'zur_pruefung' ? (
          <NextLink
            href="/verwaltung/freigaben"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
          >
            {t('stand.zurFreigabe')}
            <ArrowRight aria-hidden className="size-4" />
          </NextLink>
        ) : null}
      </section>
      {z.imPapierkorbSeit ? (
        <Meldung art="info">{t('imPapierkorb')}</Meldung>
      ) : (
        <>
          <WissenFormular aktion={speichereWissensThema} startwerte={startwerte} texte={texte} freigabe={z.freigabe} />
          <form action={wissensThemaInPapierkorb} className="flex flex-wrap items-center gap-3 rounded-lg border border-linie bg-weiss p-5">
            <input type="hidden" name="id" value={z.id} />
            <Button type="submit" variant="outline" className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler">
              <Trash2 aria-hidden />
              {t('inDenPapierkorb')}
            </Button>
            <span className="text-16 text-tinte-2">{t('papierkorbHinweis')}</span>
          </form>
        </>
      )}
    </>
  );
}
