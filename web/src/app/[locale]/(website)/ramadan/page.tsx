import { ArrowRight, Info, Printer } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { DruckKnopf } from '@/components/website/gebetszeiten/DruckKnopf';
import { datumMitJahr } from '@/components/website/gebetszeiten/zeiten';
import { Stern8 } from '@/components/website/Icons';
import { SternMarke } from '@/components/website/kalender/Marken';
import { datumVon, LOCALE, tagTitel } from '@/components/website/kalender/MonatsKalender';
import { PageHeader } from '@/components/website/PageHeader';
import { FastenbogenLive } from '@/components/website/ramadan/FastenbogenLive';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { hijriText } from '@/lib/gebetszeiten/hijri';
import { datumLang, datumOhneWochentag } from '@/lib/i18n/format';
import { monateVonBis, ramadanUm } from '@/lib/kalender/ramadan';
import { tagPlus } from '@/lib/kalender/raster';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeGebetszeitenMonat } from '@/server/queries/gebetszeiten';
import { ladeBesondereTage } from '@/server/queries/kalender';

export const ensureStatic = 'navigation';

const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ramadan');
  return metadatenFuer({ pfad: '/ramadan', titel: t('titelOhneJahr'), beschreibung: t('metaBeschreibung') });
}

/**
 * Ramadan (AUFTRAG 3.10, B-20): Imsakiye aller Ramadan-Tage aus den Gebetszeiten (Import, sonst Berechnung – wie
 * /gebetszeiten), druckbar mit hervorgehobenem Imsak und Iftar; Fastenbogen; Kadir-Nacht und Bayram aus den
 * besonderen Tagen; Teravih und Fitre als Platzhalter der Gemeinde. Außerhalb des Ramadan ein Hinweis ohne Countdown
 * („beginnt voraussichtlich am …“) und – mit Schalter `ramadan_vorschau` – die Imsakiye als Vorschau.
 */
export default async function RamadanSeite() {
  const sprache = (await getLocale()) as Locale;
  const locale = LOCALE[sprache];
  const [t, tk, tl, tkal, heute, vorschauAn] = await Promise.all([
    getTranslations('ramadan'),
    getTranslations('kopf'),
    getTranslations('leiste'),
    getTranslations('kalender'),
    heuteBerlin(),
    funktionAn('ramadan_vorschau'),
  ]);
  const zeitraum = ramadanUm(heute.datum);
  const jahr = zeitraum ? zeitraum.von.slice(0, 4) : String(heute.jahr);
  const titel = t('titel', { jahr });
  const pfad = [{ label: tk('islam') }, { label: t('titelOhneJahr') }];
  if (!zeitraum) {
    return (
      <Seitenrahmen bereich="islam" seite="ramadan" sprachZiel="/ramadan" pfad={pfad}>
        <PageHeader kennung={t('kennung')} titel={t('titelOhneJahr')} untertitel={t('untertitel')} />
      </Seitenrahmen>
    );
  }
  const laeuft = zeitraum.laeuft;
  const zeigeTabelle = laeuft || vorschauAn;
  const [monate, besondere] = await Promise.all([
    zeigeTabelle ? Promise.all(monateVonBis(zeitraum.von, zeitraum.bis).map((m) => ladeGebetszeitenMonat(m))) : Promise.resolve([]),
    ladeBesondereTage(tagPlus(zeitraum.von, -45), tagPlus(zeitraum.bis, 75)),
  ]);
  const tage = monate.flatMap((m) => m.tage).filter((d) => d.datum >= zeitraum.von && d.datum <= zeitraum.bis);
  const berechnet = monate.some((m) => m.quelle !== 'import' && !m.bestaetigt);
  const kadir = besondere.find(
    (b) => b.schluessel === 'kadir' || (b.art === 'kandil' && b.datum >= zeitraum.von && b.datum <= zeitraum.bis),
  );
  const tagNr = laeuft ? tage.findIndex((d) => d.datum === heute.datum) + 1 : 0;
  const tv = (k: string) => tkal(k);
  const bogenTage = laeuft ? tage : tage.slice(0, 1);
  const bogenTexte = {
    titel: laeuft ? t('bogen.titel') : t('bogen.titelVorschau'),
    beschreibung: t('bogen.beschreibung'),
    imsak: t('bogen.imsak'),
    iftar: t('bogen.iftar'),
    vorImsak: t.raw('bogen.vorImsak') as string,
    fastet: t.raw('bogen.fastet') as string,
    nachIftar: t.raw('bogen.nachIftar') as string,
    label: t.raw('bogen.label') as string,
    datum: Object.fromEntries(bogenTage.map((d) => [d.datum, datumMitJahr(d.datum, sprache)])),
  };

  return (
    <Seitenrahmen bereich="islam" seite="ramadan" sprachZiel="/ramadan" pfad={pfad}>
      <PageHeader kennung={t('kennung')} titel={titel} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="ramadan-stand" className="flex flex-col gap-2 rounded-lg bg-sand p-6 md:p-8">
          <h2 id="ramadan-stand" className="text-24 text-pretty">
            {laeuft && tagNr > 0
              ? t('laeuft', { tag: tagNr })
              : t('beginntVoraussichtlich', { jahr, datum: datumOhneWochentag(datumVon(zeitraum.von), sprache) })}
          </h2>
          {laeuft ? null : <p>{t('endetVoraussichtlich', { datum: datumOhneWochentag(datumVon(zeitraum.bis), sprache) })}</p>}
          <p className="inline-flex items-start gap-2 text-16 font-bold text-warnung">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
            {t('vorlaeufig')}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start print:hidden">
          <div className="flex flex-col gap-6">
            {bogenTage.length ? (
              <FastenbogenLive
                tage={bogenTage.map((d) => ({ datum: d.datum, imsak: d.imsak, aksam: d.aksam }))}
                referenz={laeuft ? heute.datum : bogenTage[0].datum}
                vorschau={!laeuft}
                texte={bogenTexte}
              />
            ) : null}
            <section aria-labelledby="ramadan-gemeinde" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
              <h2 id="ramadan-gemeinde" className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
                <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
                {t('gemeinde.titel')}
              </h2>
              <dl className="flex flex-col gap-3">
                {(['teravih', 'fitre', 'iftar'] as const).map((k) => (
                  <div key={k} className="flex flex-col">
                    <dt className="font-bold">{t(`gemeinde.${k}Titel`)}</dt>
                    <dd className="text-tinte-2">{t(`gemeinde.${k}`)}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/spenden" className={TEXTLINK}>
                {t('gemeinde.spendenLink')}
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </section>
          </div>
          <section aria-labelledby="ramadan-naechte" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
            <h2 id="ramadan-naechte" className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
              <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
              {t('naechte.titel')}
            </h2>
            <ul className="flex flex-col gap-3">
              {besondere
                .filter((b) => b.datum >= tagPlus(zeitraum.von, -30) && b.datum <= tagPlus(zeitraum.bis, 3))
                .map((b) => (
                  <li key={b.id} className="flex gap-3">
                    <SternMarke vorlaeufig={b.vorlaeufig} className="mt-0.5 size-6" />
                    <div className="flex flex-col">
                      <span className="font-bold">{tagTitel(b, sprache, tv)}</span>
                      <span className="text-16 text-tinte-2">
                        <time dateTime={b.datum}>{datumLang(datumVon(b.datum), sprache)}</time> · {hijriText(b.datum, locale)}
                      </span>
                      {b.art === 'kandil' ? <span className="text-16 text-tinte-2">{t('naechte.nacht')}</span> : null}
                      {b.vorlaeufig ? (
                        <span className="mt-1 self-start rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
                          {tkal('vorlaeufig')}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
            </ul>
            <Link href="/kalender" className={TEXTLINK}>
              {t('kalenderLink')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </section>
        </div>

        {zeigeTabelle && tage.length ? (
          <section aria-labelledby="ramadan-imsakiye" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 id="ramadan-imsakiye" className="flex flex-wrap items-center gap-3 text-display-2">
                  {t('imsakiye.titel', { jahr })}
                  {laeuft ? null : (
                    <span className="rounded-pill bg-info-toenung px-3 py-0.5 font-text text-16 font-bold tracking-normal text-info">
                      {t('imsakiye.vorschau')}
                    </span>
                  )}
                </h2>
                <p className="text-tinte-2">{t('imsakiye.untertitel')}</p>
                {berechnet ? (
                  <p className="inline-flex items-start gap-2 text-16 text-warnung">
                    <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
                    {t('imsakiye.berechnetText')}
                  </p>
                ) : null}
              </div>
              <DruckKnopf>
                <Printer aria-hidden className="size-5" />
                <span>{t('imsakiye.drucken')}</span>
              </DruckKnopf>
            </div>
            <div className="relative overflow-x-auto rounded-md border border-linie">
              <table className="w-full min-w-2xl border-collapse text-18 tabular-nums">
                <caption className="sr-only">{t('imsakiye.tabelle', { jahr })}</caption>
                <thead>
                  <tr className="bg-sand text-left">
                    <th scope="col" className="px-3 py-3">
                      {t('imsakiye.tag')}
                    </th>
                    <th scope="col" className="px-3 py-3">
                      {t('imsakiye.datum')}
                    </th>
                    <th scope="col" className="bg-gruen-100 px-3 py-3 text-gruen-800">
                      {t('imsakiye.imsak')}
                    </th>
                    <th scope="col" className="px-3 py-3">
                      {tl('gunes')}
                    </th>
                    <th scope="col" className="px-3 py-3">
                      {tl('ogle')}
                    </th>
                    <th scope="col" className="px-3 py-3">
                      {tl('ikindi')}
                    </th>
                    <th scope="col" className="bg-gruen-100 px-3 py-3 text-gruen-800">
                      {t('imsakiye.iftar')}
                    </th>
                    <th scope="col" className="px-3 py-3">
                      {tl('yatsi')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tage.map((d, i) => {
                    const istHeute = d.datum === heute.datum;
                    const istKadir = kadir?.datum === d.datum;
                    return (
                      <tr
                        key={d.datum}
                        aria-current={istHeute ? 'date' : undefined}
                        className={cn('border-t border-linie', istHeute ? 'bg-gruen-50 font-bold' : 'bg-weiss')}
                      >
                        <th scope="row" className="px-3 py-2.5 text-left font-bold">
                          {i + 1}
                        </th>
                        <td className="px-3 py-2.5">
                          <span className="flex flex-wrap items-center gap-x-2">
                            {datumMitJahr(d.datum, sprache)}
                            {istHeute ? (
                              <span className="rounded-pill bg-gruen-700 px-2 text-16 text-weiss">{t('imsakiye.heute')}</span>
                            ) : null}
                            {istKadir ? (
                              <span className="inline-flex items-center gap-1 text-16 text-gruen-800">
                                <SternMarke vorlaeufig={kadir.vorlaeufig} className="size-4" />
                                {t('imsakiye.kadir')}
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="bg-gruen-50 px-3 py-2.5 font-bold text-gruen-800">{d.imsak}</td>
                        <td className="px-3 py-2.5">{d.gunes}</td>
                        <td className="px-3 py-2.5">{d.ogle}</td>
                        <td className="px-3 py-2.5">{d.ikindi}</td>
                        <td className="bg-gruen-50 px-3 py-2.5 font-bold text-gruen-800">{d.aksam}</td>
                        <td className="px-3 py-2.5">{d.yatsi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <p className="max-w-text text-tinte-2">{t('keineVorschau')}</p>
        )}
      </div>
    </Seitenrahmen>
  );
}
