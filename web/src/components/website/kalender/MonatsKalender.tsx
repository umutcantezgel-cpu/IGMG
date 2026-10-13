import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { hijriText } from '@/lib/gebetszeiten/hijri';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { text } from '@/lib/i18n/inhalt';
import { deckt, type KalenderTag } from '@/lib/kalender/abgleich';
import { hijriMonatText, monatText, monatsRaster, wochentagNamen } from '@/lib/kalender/raster';
import { cn } from '@/lib/utils';
import type { KalenderTermin } from '@/server/queries/kalender';
import { SternMarke, TerminMarke } from './Marken';

export const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** Titel eines besonderen Tags: Vorschlag aus den Sprachdateien, bestätigter Eintrag aus der Datenbank. */
export function tagTitel(tag: KalenderTag, sprache: Locale, t: (k: string) => string): string {
  return tag.schluessel ? t(`tage.${tag.schluessel}`) : text(tag.titel, sprache);
}

export function datumVon(datum: string): Date {
  return new Date(`${datum}T12:00:00Z`);
}

/**
 * Ein Monat des Gemeindekalenders: Raster (Tabelle Mo–So mit gregorianischem und Hidschri-Tag, Achtstern-Marken,
 * Ramadan-Tönung, „heute“) und daneben die Einträge des Monats als Liste. Die Tabelle trägt alles auch als Text
 * (sr-only), damit sie ohne Bild verständlich bleibt. Reine Server-Komponente, druckbar.
 */
export async function MonatsKalender({
  monat,
  sprache,
  heute,
  tage,
  termine,
}: {
  monat: string;
  sprache: Locale;
  heute: string;
  tage: KalenderTag[];
  termine: KalenderTermin[];
}) {
  const t = await getTranslations('kalender');
  const tv = (k: string) => t(k);
  const raster = monatsRaster(monat);
  const locale = LOCALE[sprache];
  const name = monatText(monat, locale);
  const wochentage = wochentagNamen(locale);
  const hijriMonate = raster.hijriMonate.map((h) => hijriMonatText(h.ab, locale)).join(' – ');
  const imMonat = (d: string) => d.startsWith(monat);
  const tageImMonat = tage.filter((tag) => imMonat(tag.datum));
  const termineImMonat = termine.filter((x) => imMonat(x.datum));
  const id = `monat-${monat}`;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titel`}
      className="flex scroll-mt-24 break-inside-avoid flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 md:p-8"
    >
      <header className="flex flex-col gap-1">
        <h2 id={`${id}-titel`} className="text-30">
          {name}
        </h2>
        <p className="text-16 text-tinte-2">{t('hijriSpanne', { monate: hijriMonate })}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start xl:grid-cols-1">
        <table className="w-full table-fixed border-collapse text-center tabular-nums">
          <caption className="sr-only">{t('tabelle', { monat: name })}</caption>
          <thead>
            <tr>
              {wochentage.map((w) => (
                <th key={w.lang} scope="col" className="pb-2 text-16 font-bold text-tinte-2">
                  <abbr title={w.lang} className="no-underline">
                    {w.kurz.replace('.', '')}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {raster.wochen.map((woche) => (
              <tr key={woche[0].datum}>
                {woche.map((tag) => {
                  if (!tag.imMonat) return <td key={tag.datum} className="p-0.5" />;
                  const besondere = tage.filter((b) => deckt(b, tag.datum));
                  const hatTermin = termine.some((x) => x.datum === tag.datum);
                  const ramadan = tag.hijri.monat === 9;
                  const istHeute = tag.datum === heute;
                  return (
                    <td key={tag.datum} className="p-0.5 align-top">
                      <div
                        data-datum={tag.datum}
                        className={cn(
                          'relative flex min-h-14 flex-col items-center justify-start rounded-md pt-1 pb-1.5',
                          ramadan ? 'bg-gruen-50' : 'bg-papier',
                          istHeute && 'ring-2 ring-gruen-700',
                        )}
                      >
                        <span className={cn('text-18 leading-tight font-bold', istHeute ? 'text-gruen-800' : 'text-tinte')}>{tag.tag}</span>
                        <span className="text-16 leading-tight text-tinte-2" aria-hidden="true">
                          {tag.hijri.tag}
                        </span>
                        <span className="sr-only">
                          {`, ${t('hijriTag', { tag: tag.hijri.tag })}`}
                          {ramadan ? `, ${t('ramadan')}` : ''}
                          {istHeute ? `, ${t('heute')}` : ''}
                          {besondere.map((b) => `, ${tagTitel(b, sprache, tv)}${b.vorlaeufig ? ` (${t('vorlaeufig')})` : ''}`).join('')}
                        </span>
                        {besondere.length || hatTermin ? (
                          <span className="absolute top-1 right-1 flex flex-col gap-0.5" aria-hidden="true">
                            {besondere.length ? <SternMarke vorlaeufig={besondere.every((b) => b.vorlaeufig)} className="size-4" /> : null}
                            {hatTermin ? <TerminMarke className="size-3" /> : null}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {tageImMonat.length || termineImMonat.length ? (
          <ul className="flex flex-col gap-3">
            {tageImMonat.map((b) => (
              <li key={b.id} className="flex gap-3 rounded-md border border-linie p-3">
                <SternMarke vorlaeufig={b.vorlaeufig} className="mt-0.5 size-6" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-16 text-tinte-2">
                    <time dateTime={b.datum}>{datumLang(datumVon(b.datum), sprache)}</time>
                    {' · '}
                    {hijriText(b.datum, locale)}
                  </span>
                  <span className="font-bold">
                    {b.schluessel ? t(`tage.${b.schluessel}`) : <Text feld={b.titel} sprache={sprache} />}
                    {b.tage > 1 ? <span className="font-normal text-tinte-2"> · {t('dauer', { anzahl: b.tage })}</span> : null}
                  </span>
                  {b.vorlaeufig ? (
                    <span className="mt-1 self-start rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
                      {t('vorlaeufig')}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
            {termineImMonat.map((x) => (
              <li key={`${x.id}-${x.beginn}`} className="flex gap-3 rounded-md border border-linie p-3">
                <TerminMarke className="mt-1.5 size-4" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-16 text-tinte-2">
                    <time dateTime={x.beginn}>{datumLang(new Date(x.beginn), sprache)}</time>
                    {' · '}
                    {x.ganztaegig ? t('ganztaegig') : uhrzeit(new Date(x.beginn), sprache)}
                  </span>
                  <Link
                    href={{ pathname: '/veranstaltungen/[slug]', params: { slug: x.slug } }}
                    className="inline-flex min-h-12 items-center font-bold text-gruen-700 underline underline-offset-4"
                  >
                    <Text feld={x.titel} sprache={sprache} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-16 text-tinte-2">{t('imMonat.keine')}</p>
        )}
      </div>
    </section>
  );
}
