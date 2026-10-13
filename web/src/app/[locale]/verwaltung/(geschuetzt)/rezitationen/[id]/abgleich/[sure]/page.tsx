import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { REIHENFOLGE } from '@/components/verwaltung/rezitationen/SurenRaster';
import { WerkstattInsel } from '@/components/verwaltung/rezitationen/WerkstattInsel';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { direktUploadAktiv } from '@/lib/medien/eingang';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { ladeWerkstatt } from '@/server/queries/verwaltung/rezitationen';

const LINK = 'inline-flex min-h-12 items-center gap-2 font-bold text-gruen-800 underline underline-offset-4';

/**
 * Rezitations-Werkstatt je Sure (O-Q02, ADR 0029): Kopf mit Sure (Name arabisch aus der Datenbank), Nachbarsuren in
 * der empfohlenen Reihenfolge und die Werkstatt als Client-Insel (lazy). Nur mit `rezitation.bearbeiten`.
 */
export default async function AbgleichSeite({ params }: PageProps<'/[locale]/verwaltung/rezitationen/[id]/abgleich/[sure]'>) {
  await verlangeSeitenRecht('rezitation.bearbeiten');
  const { id, sure } = await params;
  const t = await getTranslations('verwaltung.rezitationen');
  const nr = /^[1-9]\d{0,2}$/.test(sure) ? Number(sure) : 0;
  const daten = nr ? await ladeWerkstatt(id, nr) : null;
  if (!daten)
    return (
      <div className="flex flex-col gap-6">
        <NextLink href="/verwaltung/rezitationen" className={`${LINK} self-start`}>
          <ArrowLeft aria-hidden className="size-5" />
          {t('zurueck')}
        </NextLink>
        <ListenLeer text={t('fehler.nichtGefunden')} />
      </div>
    );
  const stelle = REIHENFOLGE.indexOf(nr);
  const vorige = REIHENFOLGE[stelle - 1];
  const naechste = REIHENFOLGE[stelle + 1];
  const basis = `/verwaltung/rezitationen/${daten.rezitation.id}`;
  return (
    <div className="flex flex-col gap-8">
      <nav aria-label={t('werkstatt.kennung')} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <NextLink href={basis} className={LINK}>
          <ArrowLeft aria-hidden className="size-5" />
          {t('werkstatt.zurueck', { name: daten.rezitation.name.de })}
        </NextLink>
        <span className="flex flex-wrap gap-x-6">
          {vorige ? (
            <NextLink href={`${basis}/abgleich/${vorige}`} className={LINK} rel="prev">
              <ChevronLeft aria-hidden className="size-5" />
              {t('werkstatt.vorige')} ({vorige})
            </NextLink>
          ) : null}
          {naechste ? (
            <NextLink href={`${basis}/abgleich/${naechste}`} className={LINK} rel="next">
              {t('werkstatt.naechste')} ({naechste})
              <ChevronRight aria-hidden className="size-5" />
            </NextLink>
          ) : null}
        </span>
      </nav>
      <VerwaltungsKopf
        kennung={t('werkstatt.kennung')}
        titel={t('werkstatt.titel', { nr: daten.sure.nr, name: daten.sure.umschrift })}
        einleitung={
          <>
            <span lang="ar" dir="rtl" className="font-quran text-arabisch-3 text-tinte">
              {daten.sure.nameAr}
            </span>
            {' · '}
            {t('werkstatt.verse', { anzahl: daten.sure.verseAnzahl })}
            {' · '}
            {daten.rezitation.name.de}
          </>
        }
      />
      <noscript>
        <p className="font-bold">{t('werkstatt.ohneSkript')}</p>
      </noscript>
      <WerkstattInsel daten={daten} direkt={direktUploadAktiv()} darfBearbeiten />
    </div>
  );
}
