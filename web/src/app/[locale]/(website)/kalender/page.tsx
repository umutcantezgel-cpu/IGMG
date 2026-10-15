import { ArrowRight, Info, Printer } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { DruckKnopf } from '@/components/website/gebetszeiten/DruckKnopf';
import { Stern8 } from '@/components/website/Icons';
import { SternMarke, TerminMarke } from '@/components/website/kalender/Marken';
import { datumVon, LOCALE, MonatsKalender } from '@/components/website/kalender/MonatsKalender';
import { PageHeader } from '@/components/website/PageHeader';
import { RichText } from '@/components/website/RichText';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text } from '@/components/website/Text';
import { webcalAdresse } from '@/components/website/veranstaltungen/KalenderAbo';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { hijriText } from '@/lib/gebetszeiten/hijri';
import { datumLang } from '@/lib/i18n/format';
import { folgemonate, monatText, tageImMonat } from '@/lib/kalender/raster';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeBesondereTage, ladeKalenderTermine } from '@/server/queries/kalender';

export const ensureStatic = 'navigation';

const KNOPF =
  'inline-flex min-h-12 items-center justify-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss druck';
const TEXTLINK = 'inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kalender');
  return metadatenFuer({ pfad: '/kalender', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/**
 * Kalender (AUFTRAG 3.10): zwölf Monate ab dem laufenden mit Hidschri-Tagen, besonderen Tagen (geprüft oder
 * „vorläufig – berechnet“), Veranstaltungen und iCal-Abo der besonderen Tage. Achtstern-Marken statt Mondsicheln.
 * Statisch; „heute“ kommt aus dem stündlich erneuerten Datum (`heuteBerlin`). Druckbar.
 */
export default async function KalenderSeite() {
  const sprache = (await getLocale()) as Locale;
  const locale = LOCALE[sprache];
  const [t, tk, heute] = await Promise.all([getTranslations('kalender'), getTranslations('kopf'), heuteBerlin()]);
  const monate = folgemonate(heute.datum.slice(0, 7), 12);
  const von = `${monate[0]}-01`;
  const bis = `${monate.at(-1)}-${String(tageImMonat(monate.at(-1)!)).padStart(2, '0')}`;
  const [tage, { termine, regelmaessig }] = await Promise.all([ladeBesondereTage(von, bis), ladeKalenderTermine(von, bis)]);
  const kommend = tage.filter((b) => b.datum >= heute.datum);
  const icalPfad = `/api/ical/${sprache}/kalender`;
  const ramadanImZeitraum = tage.some((b) => b.art === 'ramadan_beginn');

  return (
    <Seitenrahmen bereich="islam" seite="kalender" sprachZiel="/kalender" pfad={[{ label: tk('islam') }, { label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <section aria-labelledby="kalender-besondere" className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex flex-col gap-1">
              <h2 id="kalender-besondere" className="flex items-center gap-2.5 text-display-2">
                <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
                {t('besondereTitel')}
              </h2>
              <p className="text-tinte-2">{t('besondereEinleitung')}</p>
              <p className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                <span className="rounded-pill bg-warnung-toenung px-2.5 py-0.5 font-bold text-warnung">{t('vorlaeufig')}</span>
                {t('vorlaeufigLang')}
              </p>
            </div>
            {kommend.length ? (
              <ol className="grid gap-3 md:grid-cols-2">
                {kommend.map((b) => (
                  <li key={b.id} data-vorlaeufig={b.vorlaeufig} className="flex gap-3 rounded-lg border border-linie bg-weiss p-4">
                    <SternMarke vorlaeufig={b.vorlaeufig} className="mt-0.5 size-7" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-16 text-tinte-2">
                        <time dateTime={b.datum}>{datumLang(datumVon(b.datum), sprache)}</time>
                        <br />
                        {hijriText(b.datum, locale)}
                      </span>
                      <h3 className="font-text text-18 leading-snug font-bold tracking-normal">
                        {b.schluessel ? t(`tage.${b.schluessel}`) : <Text feld={b.titel} sprache={sprache} />}
                        {b.tage > 1 ? <span className="font-normal text-tinte-2"> · {t('dauer', { anzahl: b.tage })}</span> : null}
                      </h3>
                      <span
                        className={
                          b.vorlaeufig
                            ? 'self-start rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung'
                            : 'self-start rounded-pill bg-gruen-50 px-2.5 py-0.5 text-16 font-bold text-gruen-800'
                        }
                      >
                        {b.vorlaeufig ? t('vorlaeufig') : t('bestaetigt')}
                      </span>
                      {b.beschreibung ? (
                        <RichText
                          doc={b.beschreibung[sprache] ?? b.beschreibung.de}
                          lang={b.beschreibung[sprache] ? undefined : 'de'}
                          className="text-16"
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-tinte-2">{t('besondereLeer')}</p>
            )}
            {ramadanImZeitraum ? (
              <Link href="/ramadan" className={TEXTLINK}>
                {t('ramadanLink')}
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            ) : null}
          </section>

          <aside className="flex flex-col gap-6">
            <section aria-labelledby="kalender-hinweis" className="flex flex-col gap-3 rounded-lg bg-sand p-6">
              <h2 id="kalender-hinweis" className="flex items-center gap-2 font-text text-20 font-bold tracking-normal">
                <Info aria-hidden className="size-5 shrink-0 text-gruen-700" />
                {t('hinweisTitel')}
              </h2>
              <p className="text-16">{t('hinweis')}</p>
              <p className="text-16">{t('nachtHinweis')}</p>
              <h3 className="mt-2 font-text text-16 font-bold tracking-normal">{t('legende.titel')}</h3>
              <ul className="flex flex-col gap-2 text-16">
                <li className="flex items-center gap-2">
                  <SternMarke vorlaeufig={false} className="size-5" />
                  {t('legende.besonders')} ({t('bestaetigt')})
                </li>
                <li className="flex items-center gap-2">
                  <SternMarke vorlaeufig className="size-5" />
                  {t('legende.besonders')} ({t('vorlaeufig')})
                </li>
                <li className="flex items-center gap-2">
                  <TerminMarke className="size-5" />
                  {t('legende.veranstaltung')}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-5 shrink-0 rounded-sm bg-gruen-50 ring-1 ring-linie" />
                  {t('legende.ramadan')}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-5 shrink-0 rounded-sm ring-2 ring-gruen-700" />
                  {t('legende.heute')}
                </li>
                <li>{t('legende.hijri')}</li>
              </ul>
            </section>
            <section
              aria-labelledby="kalender-abo"
              className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 print:hidden"
            >
              <h2 id="kalender-abo" className="flex items-start gap-2.5 font-text text-20 leading-snug font-bold tracking-normal">
                <Stern8 className="mt-1.5 size-4 shrink-0 text-tinte-2" />
                {t('abo.titel')}
              </h2>
              <p className="text-16 text-tinte-2">{t('abo.text')}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <a href={webcalAdresse(icalPfad)} className={KNOPF}>
                  {t('abo.abonnieren')}
                </a>
                <a href={icalPfad} download="igmg-wetzlar-besondere-tage.ics" className={TEXTLINK}>
                  {t('abo.datei')}
                </a>
              </div>
            </section>
            <div className="print:hidden">
              <DruckKnopf>
                <Printer aria-hidden className="size-5" />
                <span>{t('drucken')}</span>
              </DruckKnopf>
            </div>
          </aside>
        </div>

        <nav aria-label={t('inhalt')} className="print:hidden">
          <ul className="flex flex-wrap gap-2">
            {monate.map((m) => (
              <li key={m}>
                <a
                  href={`#monat-${m}`}
                  aria-label={t('zumMonat', { monat: monatText(m, locale) })}
                  className="inline-flex min-h-12 items-center rounded-pill border border-rand bg-weiss px-4 font-bold text-gruen-800 no-underline hover:bg-gruen-50"
                >
                  {monatText(m, locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-6 xl:grid-cols-2 xl:items-start print:block">
          {monate.map((m) => (
            <MonatsKalender key={m} monat={m} sprache={sprache} heute={heute.datum} tage={tage} termine={termine} />
          ))}
        </div>

        {regelmaessig.length ? (
          <section aria-labelledby="kalender-regelmaessig" className="flex flex-col gap-3 rounded-lg bg-sand p-6 print:hidden">
            <h2 id="kalender-regelmaessig" className="text-24">
              {t('regelmaessig.titel')}
            </h2>
            <p className="text-tinte-2">{t('regelmaessig.text')}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {regelmaessig.map((x) => (
                <li key={x.id}>
                  <Link
                    href={{ pathname: '/veranstaltungen/[slug]', params: { slug: x.slug } }}
                    className="inline-flex min-h-12 items-center font-bold text-gruen-700 underline underline-offset-4"
                  >
                    <Text feld={x.titel} sprache={sprache} />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/veranstaltungen" className={TEXTLINK}>
              {t('regelmaessig.link')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </section>
        ) : null}
      </div>
    </Seitenrahmen>
  );
}
