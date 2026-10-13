import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Ziel } from '@/components/website/navigation';
import { PageHeader } from '@/components/website/PageHeader';
import { RichText } from '@/components/website/RichText';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { haraka, type HarakaSchluessel } from '@/lib/elifbe/alphabet';
import { buchstabenDer, LEKTIONEN, type Lektion } from '@/lib/elifbe/lektionen';
import { lesereihen, type SilbenArt, silbentafel } from '@/lib/elifbe/silben';
import { ladeLektionstexte } from '@/server/queries/elifbe';

const MED: Record<string, HarakaSchluessel> = { 'med-fatha': 'fatha', 'med-kasra': 'kasra', 'med-damma': 'damma' };

/**
 * Lektion: Erklärung nur nach Freigabe (sonst Platzhalter), Silbentafel Buchstabe × Lesezeichen (aus Codepunkten,
 * von rechts nach links wie im Elifbe-Heft) und gemischte Lesereihen mit aufklappbarer Umschrift.
 */
export async function LektionAnsicht({ lektion }: { lektion: Lektion }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('elifbe');
  const texte = (await ladeLektionstexte())[lektion.nr];
  const titel = t(`lektionen.${lektion.schluessel}.titel`);
  const kurz = t(`lektionen.${lektion.schluessel}.kurz`);
  const buchstaben = buchstabenDer(lektion);
  const tafel = silbentafel(buchstaben, lektion.arten);
  const reihen = lesereihen(buchstaben, lektion.arten, lektion.nr);
  const vorher = LEKTIONEN[lektion.nr - 2];
  const naechste = LEKTIONEN[lektion.nr];
  const sprachZiel: Ziel = { pathname: '/elifbe/lektion/[lektion]', params: { lektion: lektion.slug } };
  const spalte = (art: SilbenArt) => (art in MED ? `${haraka(MED[art]!).name[sprache]} + ${t('lektionen.med.titel')}` : haraka(art as HarakaSchluessel).name[sprache]);
  const nameLang = sprache === 'tr' ? undefined : 'tr';

  return (
    <Seitenrahmen
      bereich="bildung"
      seite="elifbe"
      sprachZiel={sprachZiel}
      pfad={[{ label: t('pfadLernen'), ziel: '/lernen' }, { label: t('titel'), ziel: '/elifbe' }, { label: titel }]}
    >
      <PageHeader
        kennung={t('lektion.kennung', { nr: lektion.nr, anzahl: LEKTIONEN.length })}
        titel={titel}
        untertitel={t('lektion.untertitel', { kurz })}
      />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="erklaerung-titel" className="flex max-w-einleitung flex-col gap-3">
          <h2 id="erklaerung-titel" className="text-display-2">
            {t('lektion.erklaerungTitel')}
          </h2>
          {texte ? (
            <>
              <Text feld={texte.ziel} sprache={sprache} als="p" className="text-20 leading-einleitung" />
              <RichText doc={texte.inhalt?.[sprache] ?? texte.inhalt?.de} lang={texte.inhalt?.[sprache] ? undefined : 'de'} sprache={sprache} />
            </>
          ) : (
            <p className="text-18 text-tinte-2">{t('lektion.erklaerungPlatzhalter')}</p>
          )}
        </section>

        <section aria-labelledby="tafel-titel" className="flex flex-col gap-5">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="tafel-titel" className="text-display-2">
              {t('lektion.tafelTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('lektion.tafelText')}</p>
          </div>
          {lektion.arten.length === 1 ? (
            <ul dir="rtl" aria-label={t('lektion.tafel', { titel })} className="grid grid-cols-3 gap-3 font-text leading-normal sm:grid-cols-5 md:grid-cols-6 md:gap-4 lg:grid-cols-8">
              {tafel.flatMap(({ buchstabe, silben }) =>
                silben.map((s) =>
                  s ? (
                    <li key={s.schluessel} dir="ltr" className="flex flex-col items-center rounded-lg border border-linie bg-weiss px-2 pt-1 pb-3 text-center shadow-s1">
                      <span lang="ar" dir="rtl" className="text-48 leading-loose text-gruen-950">
                        {s.text}
                      </span>
                      <span className="text-18 font-bold">{s.umschrift[sprache]}</span>
                      <span lang={nameLang} className="text-16 text-tinte-2">
                        {buchstabe.elifbe}
                      </span>
                    </li>
                  ) : null,
                ),
              )}
            </ul>
          ) : (
            <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss shadow-s1">
              <table dir="rtl" className="w-full border-collapse font-text leading-normal">
                <caption className="sr-only">{t('lektion.tafel', { titel })}</caption>
                <thead className="bg-sand">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-16 font-bold">
                      {t('lektion.spalteBuchstabe')}
                    </th>
                    {lektion.arten.map((a) => (
                      <th key={a} scope="col" className="px-3 py-3 text-center text-16 font-bold">
                        {spalte(a)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tafel.map(({ buchstabe, silben }) => (
                    <tr key={buchstabe.slug} className="border-t border-linie">
                      <th scope="row" className="px-3 py-2 text-18 font-bold">
                        <span lang={nameLang}>{buchstabe.elifbe}</span>
                      </th>
                      {silben.map((s, i) =>
                        s ? (
                          <td key={s.schluessel} className="px-3 py-1 text-center">
                            <span lang="ar" className="block text-36 leading-loose text-gruen-950">
                              {s.text}
                            </span>
                            <span dir="ltr" className="block text-16 font-bold text-tinte-2">
                              {s.umschrift[sprache]}
                            </span>
                          </td>
                        ) : (
                          <td key={i} className="px-3 py-1 text-center text-tinte-3" aria-hidden>
                            ·
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="reihen-titel" className="flex flex-col gap-5">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="reihen-titel" className="text-display-2">
              {t('lektion.reihenTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('lektion.reihenText')}</p>
          </div>
          <ol className="flex flex-col gap-3">
            {reihen.map((reihe, i) => (
              <li key={i} className="flex flex-col gap-1 rounded-lg border border-linie bg-weiss px-4 py-3 shadow-s1 md:flex-row md:items-center md:gap-6 md:px-6">
                <span className="shrink-0 text-16 font-bold text-gruen-800 md:w-24">{t('lektion.reihe', { nr: i + 1 })}</span>
                <p lang="ar" dir="rtl" className="flex flex-1 flex-wrap gap-x-6 gap-y-1 text-48 leading-loose text-gruen-950 md:gap-x-10">
                  {reihe.map((s) => (
                    <span key={s.schluessel}>{s.text}</span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
          <details className="group rounded-lg border border-linie bg-sand">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 font-bold text-gruen-800">{t('lektion.umschriftZeigen')}</summary>
            <ol className="flex flex-col gap-2 px-4 pb-4">
              {reihen.map((reihe, i) => (
                <li key={i} className="flex flex-wrap gap-x-2 text-18">
                  <span className="font-bold text-tinte-2">{t('lektion.reihe', { nr: i + 1 })}:</span>
                  {/* Umschrift in Lesereihenfolge (rechts nach links = erste Silbe zuerst) */}
                  <span>{reihe.map((s) => s.umschrift[sprache]).join(' · ')}</span>
                </li>
              ))}
            </ol>
          </details>
        </section>

        <nav aria-label={t('titel')} className="grid gap-3 border-t border-linie pt-8 sm:grid-cols-3">
          {vorher ? (
            <Link
              href={{ pathname: '/elifbe/lektion/[lektion]', params: { lektion: vorher.slug } }}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline shadow-s1 hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte"
            >
              <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span className="flex flex-col">
                <span className="text-16 text-tinte-2">{t('lektion.zurueck')}</span>
                <span className="font-bold">{t(`lektionen.${vorher.schluessel}.titel`)}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/elifbe/ueben"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gruen-700 px-6 py-3 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98"
          >
            {t('lektion.ueben')}
          </Link>
          {naechste ? (
            <Link
              href={{ pathname: '/elifbe/lektion/[lektion]', params: { lektion: naechste.slug } }}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline shadow-s1 hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte sm:flex-row-reverse sm:text-right"
            >
              <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span className="flex flex-col">
                <span className="text-16 text-tinte-2">{t('lektion.weiter')}</span>
                <span className="font-bold">{t(`lektionen.${naechste.schluessel}.titel`)}</span>
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </Seitenrahmen>
  );
}
