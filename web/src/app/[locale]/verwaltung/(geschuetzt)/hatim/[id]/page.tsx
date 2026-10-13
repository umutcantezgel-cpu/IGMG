import { ArrowLeft, Eye, EyeOff, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { HatimFormular } from '@/components/verwaltung/hatim/HatimFormular';
import { pille, SICHTBAR_FARBE, STATUS_FARBE } from '@/components/verwaltung/hatim/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { StandZeichen } from '@/components/website/hatim/HatimRing';
import { pfadFuer } from '@/i18n/navigation';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { hatimWerte } from '@/lib/validierung/hatim';
import { loescheHatim, setzeHatimZustand, speichereHatim, type HatimSchritt } from '@/server/actions/hatim';
import { ladeHatimFuerVerwaltung, ladeHatimNamen } from '@/server/queries/verwaltung/hatim';

/**
 * Verwaltung › Hatim bearbeiten: Titel/Anlass/Daten, Sichtbarkeit und Stand (Knöpfe), die 30 Cüz ohne Namen. Namen
 * der Übernehmenden nur auf ausdrücklichen Klick (`?namen=1`), jeder Abruf im Audit-Log.
 */
export default async function HatimBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/hatim/[id]'>) {
  const a = await verlangeSeitenRecht('hatim.bearbeiten');
  const [{ id }, suche] = await Promise.all([params, searchParams]);
  const h = /^[0-9a-f-]{36}$/i.test(id) ? await ladeHatimFuerVerwaltung(id) : null;
  if (!h) notFound();
  const mitNamen = suche.namen === '1';
  const [t, tg, namen] = await Promise.all([
    getTranslations('verwaltung.hatim'),
    getTranslations('verwaltung.shell'),
    mitNamen ? ladeHatimNamen(id, a) : Promise.resolve(null),
  ]);
  const tag = (d: Date) => datumOhneWochentag(d, 'de');
  const schritt = (s: HatimSchritt, variante: 'default' | 'outline' = 'outline') => (
    <form action={setzeHatimZustand}>
      <input type="hidden" name="id" value={h.id} />
      <input type="hidden" name="schritt" value={s} />
      <Button type="submit" variant={variante}>
        {t(`zustand.${s}`)}
      </Button>
    </form>
  );
  return (
    <>
      <NextLink
        href="/verwaltung/hatim"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={h.titel.de} kennung={tg('gruppe.inhalte')} />
      {suche.angelegt ? <Meldung art="erfolg">{t('angelegt')}</Meldung> : null}

      <section aria-labelledby="hatim-zustand" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <h2 id="hatim-zustand" className="font-display text-24 font-semibold">
          {t('zustand.titel')}
        </h2>
        <p className="flex flex-wrap gap-2">
          <span className={cn(pille, SICHTBAR_FARBE[h.oeffentlich])}>{t(`sichtbarkeit.${h.oeffentlich}`)}</span>
          <span className={cn(pille, STATUS_FARBE[h.status])}>{t(`status.${h.status}`)}</span>
        </p>
        <p className="text-16 text-tinte-2">
          {h.status === 'archiviert'
            ? t('zustand.archivText')
            : h.oeffentlich === 'veroeffentlicht'
              ? t('zustand.veroeffentlichtText')
              : t('zustand.entwurfText')}
        </p>
        <div className="flex flex-wrap gap-3">
          {h.oeffentlich === 'entwurf' ? schritt('veroeffentlichen', 'default') : schritt('zurueckziehen')}
          {h.status === 'offen' ? schritt('abschliessen') : schritt('oeffnen')}
          {h.status !== 'archiviert' ? schritt('archivieren') : null}
          {h.oeffentlich === 'veroeffentlicht' ? (
            <Button asChild variant="outline">
              <NextLink href={pfadFuer({ pathname: '/hatim/[id]', params: { id: h.id } }, 'de')}>
                <ExternalLink aria-hidden />
                {t('oeffentlich')}
              </NextLink>
            </Button>
          ) : null}
        </div>
        {h.oeffentlich === 'entwurf' && h.vergeben === 0 ? (
          <form action={loescheHatim} className="flex flex-wrap items-center gap-3 border-t border-linie pt-4">
            <input type="hidden" name="id" value={h.id} />
            <Button type="submit" variant="outline" className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler">
              {t('zustand.loeschen')}
            </Button>
            <span className="text-16 text-tinte-2">{t('zustand.loeschenText')}</span>
          </form>
        ) : null}
      </section>

      <HatimFormular aktion={speichereHatim} startwerte={{ ...hatimWerte(h), id: h.id }} modus="bearbeiten" />

      <section aria-labelledby="hatim-stand" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="hatim-stand" className="font-display text-24 font-semibold">
              {t('stand.titel')}
            </h2>
            <p className="text-16 text-tinte-2">{t('stand.einleitung')}</p>
          </div>
          <Button asChild variant="outline">
            <NextLink href={mitNamen ? `/verwaltung/hatim/${h.id}` : `/verwaltung/hatim/${h.id}?namen=1`}>
              {mitNamen ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              {mitNamen ? t('stand.namenVerbergen') : t('stand.namenZeigen')}
            </NextLink>
          </Button>
        </div>
        {namen ? (
          <>
            <Meldung art="info">{t('stand.namenHinweis')}</Meldung>
            <div className="relative overflow-x-auto rounded-md border border-linie">
              <table className="w-full min-w-xl border-collapse text-left">
                <caption className="sr-only">{t('stand.tabelle')}</caption>
                <thead className="bg-sand">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-16 font-bold">
                      {t('stand.spalteCuz')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-16 font-bold">
                      {t('stand.spalteName')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-16 font-bold">
                      {t('stand.spalteStand')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {namen.map((z) => (
                    <tr key={z.cuz} className="border-t border-linie">
                      <th scope="row" className="px-4 py-2.5 font-bold">
                        {t('stand.cuz', { nr: z.cuz })}
                      </th>
                      <td className="px-4 py-2.5">{z.name ?? (z.vergebenAm ? t('stand.kontoGeloescht') : '–')}</td>
                      <td className="px-4 py-2.5 text-16">
                        {z.gelesenAm
                          ? t('stand.gelesenAm', { datum: tag(z.gelesenAm) })
                          : z.vergebenAm
                            ? t('stand.seit', { datum: tag(z.vergebenAm) })
                            : t('stand.frei')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {h.teile.map((stand, i) => (
              <li key={i} className="flex items-center gap-2 rounded-md border border-linie px-3 py-2 text-16">
                <StandZeichen stand={stand} kennung={`v-${i}`} />
                <span>
                  <span className="font-bold">{t('stand.cuz', { nr: i + 1 })}</span> · {t(`stand.${stand}`)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
