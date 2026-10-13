import { ArrowRight, BookOpen, Languages, ListChecks, ScrollText } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { KARTE, KoranNavigation } from '@/components/verwaltung/koran/Teile';
import { verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { schriftQuran } from '@/app/schriften-quran';
import { RELIGIOESE_ARTEN } from '@/lib/religioes/freigabe';
import { darf } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeKoranUebersicht, type StatusZahlen } from '@/server/queries/verwaltung/koran';

/**
 * Verwaltung › Koran & Hadith (H-Q03/Q04, ADR 0030): Stand der Bereiche und „Freigaben religiös“ – alle Einträge zur
 * Prüfung je Art, mit Hinweis, wenn die angemeldete Person sie selbst verfasst hat (Vier-Augen-Prinzip).
 */
export default async function KoranSeite() {
  const a = await verlangeKoranZugang();
  const [t, u] = await Promise.all([getTranslations('verwaltung.koran'), ladeKoranUebersicht(a.benutzerId, new Date())]);
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const zahlen = (z: StatusZahlen) => t('uebersicht.zahlen', { geprueft: z.geprueft, offen: z.zur_pruefung, entwurf: z.entwurf });
  const summe = (...z: StatusZahlen[]) =>
    z.reduce((s, x) => ({
      entwurf: s.entwurf + x.entwurf,
      zur_pruefung: s.zur_pruefung + x.zur_pruefung,
      geprueft: s.geprueft + x.geprueft,
    }));

  const kachel = (titel: string, pfad: string, symbol: ReactNode, zeilen: (string | null)[], warnung?: string | null) => (
    <li className="flex">
      <NextLink
        href={pfad}
        className="group flex w-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 text-tinte no-underline shadow-s1 hover:border-gruen-700 hover:text-tinte"
      >
        <span className="flex items-center gap-3">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
            {symbol}
          </span>
          <span className="min-w-0 font-display text-24 font-semibold break-words hyphens-auto">{titel}</span>
        </span>
        {zeilen.filter(Boolean).map((z) => (
          <span key={z} className="text-16 text-tinte-2 tabular-nums">
            {z}
          </span>
        ))}
        {warnung ? <span className="text-16 font-bold text-warnung">{warnung}</span> : null}
        <span className="mt-auto inline-flex items-center gap-2 font-bold text-gruen-800">
          {t('uebersicht.oeffnen')}
          <ArrowRight
            aria-hidden
            className="size-5 transition-transform duration-(--dauer-rueckmeldung) group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </span>
      </NextLink>
    </li>
  );

  return (
    <div className={cn('flex flex-col gap-8', schriftQuran.variable)}>
      <VerwaltungsKopf kennung={t('kennung')} titel={t('titel')} einleitung={t('einleitung')} />
      <KoranNavigation aktiv="uebersicht" />

      <section aria-labelledby="koran-bereiche" className="flex flex-col gap-4">
        <h2 id="koran-bereiche" className="sr-only">
          {t('uebersicht.kacheln')}
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {kachel(
            t('uebersicht.ausgabenTitel'),
            '/verwaltung/koran/ausgaben',
            <Languages className="size-6" />,
            [t('uebersicht.ausgabenText', { frei: u.ausgaben.freigegeben, gesamt: u.ausgaben.gesamt })],
            u.ausgaben.veraltet ? t('uebersicht.ausgabenVeraltet', { anzahl: u.ausgaben.veraltet }) : null,
          )}
          {kachel(t('uebersicht.woerterTitel'), '/verwaltung/koran/woerter', <BookOpen className="size-6" />, [
            zahlen(summe(u.arten.quran_wortbedeutung, u.arten.quran_wortbedeutung_ort)),
          ])}
          {kachel(t('uebersicht.tajwidTitel'), '/verwaltung/koran/tajwid', <ListChecks className="size-6" />, [
            zahlen(u.arten.tajwid_regel),
          ])}
          {kachel(t('uebersicht.hadithTitel'), '/verwaltung/koran/hadith', <ScrollText className="size-6" />, [
            zahlen(u.arten.hadith_uebersetzung),
            t('uebersicht.listen', { auswahl: u.listen.auswahl, tages: u.listen['des-tages'] }),
          ])}
        </ul>
      </section>

      <section aria-labelledby="koran-offen" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="koran-offen" className="text-30 font-bold">
            {t('uebersicht.offenTitel')}
          </h2>
          <p className="max-w-text text-18 text-tinte-2">{t('uebersicht.offenEinleitung')}</p>
          {darfFreigeben ? null : <p className="max-w-text text-16 text-tinte-2">{t('uebersicht.keinFreigaberecht')}</p>}
        </div>
        {u.offen.length === 0 ? (
          <ListenLeer text={t('uebersicht.offenLeer')} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {RELIGIOESE_ARTEN.map((art) => {
              const eintraege = u.offen.filter((o) => o.art === art);
              const id = `offen-${art}`;
              return (
                <section key={art} aria-labelledby={id} className={KARTE}>
                  <h3 id={id} className="flex flex-wrap items-baseline justify-between gap-2 text-24 font-bold">
                    {t(`art.${art}`)}
                    <span className="text-18 font-normal text-tinte-2 tabular-nums">{u.arten[art].zur_pruefung}</span>
                  </h3>
                  {eintraege.length === 0 ? (
                    <p className="text-16 text-tinte-2">{t('uebersicht.offenArtLeer')}</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-linie">
                      {eintraege.map((e) => (
                        <li key={e.kennung} className="flex flex-wrap items-center justify-between gap-3 py-3">
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex flex-wrap items-baseline gap-x-3">
                              {e.arabisch ? (
                                <span lang="ar" dir="rtl" className="font-quran text-arabisch-3">
                                  {e.titel}
                                </span>
                              ) : (
                                <span className="font-bold">{e.titel}</span>
                              )}
                              {e.sprache ? <span className="text-16 text-tinte-2">{t(`sprache.${e.sprache}`)}</span> : null}
                            </span>
                            {e.auszug ? (
                              <span lang={e.sprache ?? undefined} className="line-clamp-2 text-16">
                                {e.auszug}
                              </span>
                            ) : null}
                            <span className="text-16 text-tinte-2">
                              {e.verfasstVon ? t('verfasstVon', { name: e.verfasstVon }) : t('verfasstUnbekannt')}
                            </span>
                            {e.eigen && darfFreigeben ? <span className="text-16 font-bold text-warnung">{t('eigen')}</span> : null}
                          </div>
                          <NextLink
                            href={e.pfad}
                            aria-label={t('uebersicht.pruefenAria', { titel: e.titel })}
                            className="inline-flex min-h-12 items-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold text-tinte no-underline hover:bg-gruen-50 hover:text-tinte"
                          >
                            {t('uebersicht.pruefen')}
                            <ArrowRight aria-hidden className="size-5" />
                          </NextLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
