import { FileText, Pencil } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { HochladenFormular } from '@/components/verwaltung/medien/MedienFormulare';
import { Meldung } from '@/components/verwaltung/Meldung';
import { MAX_BYTES } from '@/lib/medien/verarbeiten';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeMedien, medienFilter } from '@/server/queries/verwaltung/medien';

const MELDUNGEN = ['papierkorb', 'wiederhergestellt', 'geloescht'] as const;

/** Vercel nimmt höchstens 4,5 MB je Anfrage an (ADR 0020); mit Rand für die übrigen Formularfelder. */
const GRENZE_VERCEL = 4_200_000;

/** Verwaltung › Medien (C11, Blatt V11): Raster mit Alt-Text, Filter, Papierkorb, Hochladen. */
export default async function MedienVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/medien'>) {
  const a = await verlangeSeitenRecht('medium.lesen');
  const sp = await searchParams;
  const filter = medienFilter.parse(sp);
  const [t, medien] = await Promise.all([getTranslations('verwaltung.medien'), ladeMedien(filter)]);
  const meldung = MELDUNGEN.find((m) => m === sp.meldung);
  const papierkorb = filter.ansicht === 'papierkorb';
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-display-2">{t('titel')}</h1>
        <p className="max-w-[70ch] text-tinte-2">{t('untertitel')}</p>
      </div>
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}
      <nav aria-label={t('ansichten')} className="flex gap-2">
        {(['aktiv', 'papierkorb'] as const).map((ansicht) => (
          <NextLink
            key={ansicht}
            href={ansicht === 'aktiv' ? '/verwaltung/medien' : '/verwaltung/medien?ansicht=papierkorb'}
            aria-current={filter.ansicht === ansicht ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-pill border px-4 font-bold',
              filter.ansicht === ansicht ? 'border-gruen-700 bg-gruen-700 text-weiss' : 'border-rand bg-weiss text-tinte',
            )}
          >
            {t(ansicht === 'aktiv' ? 'ansichtAktiv' : 'ansichtPapierkorb')}
          </NextLink>
        ))}
      </nav>
      {papierkorb ? <p className="text-tinte-2">{t('papierkorbHinweis')}</p> : null}
      {!papierkorb && darf(a.rollen, 'medium.hochladen') ? (
        <section
          aria-labelledby="medien-hochladen"
          className="flex max-w-3xl flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6"
        >
          <h2 id="medien-hochladen" className="text-24">
            {t('hochladen.titel')}
          </h2>
          <HochladenFormular grenzeBytes={process.env.VERCEL === '1' ? GRENZE_VERCEL : MAX_BYTES} />
        </section>
      ) : null}
      <form method="get" className="flex flex-wrap items-end gap-3">
        {papierkorb ? <input type="hidden" name="ansicht" value="papierkorb" /> : null}
        <label className="flex flex-col gap-1 text-16 font-bold">
          {t('art')}
          <select name="art" defaultValue={filter.art ?? ''} className="min-h-11 rounded-md border border-rand bg-weiss px-3 text-18">
            <option value="">{t('alleArten')}</option>
            <option value="bilder">{t('bilder')}</option>
            <option value="pdf">{t('pdf')}</option>
          </select>
        </label>
        <Button type="submit" variant="outline">
          {t('filtern')}
        </Button>
      </form>
      <p className="text-16 text-tinte-2" role="status">
        {t('anzahl', { anzahl: medien.length })}
      </p>
      {medien.length === 0 ? (
        <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{t(papierkorb ? 'leerPapierkorb' : 'leer')}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {medien.map((m) => (
            <li key={m.id} className="flex flex-col overflow-hidden rounded-lg border border-linie bg-weiss">
              {m.typ.startsWith('image/') ? (
                // Verwaltung: einfache Vorschau ohne Bildoptimierung (Datei ist bereits verkleinert)
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/medien/${m.schluessel}`}
                  alt={m.alt.de}
                  width={m.breite ?? undefined}
                  height={m.hoehe ?? undefined}
                  loading="lazy"
                  className="aspect-video w-full bg-sand object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-sand">
                  <FileText aria-hidden className="size-12 text-tinte-2" />
                </div>
              )}
              <div className="flex flex-1 items-start justify-between gap-3 p-4">
                <p className="line-clamp-2 text-16">{m.alt.de}</p>
                <Button asChild variant="outline" size="icon">
                  <NextLink href={`/verwaltung/medien/${m.id}`}>
                    <Pencil aria-hidden />
                    <span className="sr-only">{t('bearbeiten', { name: m.dateiname ?? m.alt.de })}</span>
                  </NextLink>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
