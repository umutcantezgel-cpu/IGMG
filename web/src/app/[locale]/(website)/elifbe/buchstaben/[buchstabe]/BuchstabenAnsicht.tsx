import { ArrowLeft, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Ziel } from '@/components/website/navigation';
import { Buchstabenkarte } from '@/components/website/elifbe/Buchstabenraster';
import { Schreibweg } from '@/components/website/elifbe/Schreibweg';
import { SchreibwegSteuerung } from '@/components/website/elifbe/SchreibwegSteuerung';
import { morphStil } from '@/components/website/morph';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { BUCHSTABEN, type Buchstabe, buchstabeFuer, FORM_ARTEN, formen, HARAKAT, hex, zeichen } from '@/lib/elifbe/alphabet';
import { erlaubt, silbe } from '@/lib/elifbe/silben';
import { ladeBeispielwoerter, ladeElifbeAudio } from '@/server/queries/elifbe';

/**
 * Buchstabenseite: großer Schreibweg (B-17, Morph-Ziel der Buchstabenkarte), Steckbrief, vier Formen, Lesezeichen,
 * leicht verwechselbare Buchstaben, Beispielwörter aus dem Koran (nur Verweise auf `quran_wort`, ohne Bedeutung) und
 * Blättern. Fachbegriffe und Platzhalter bis zur Prüfung durch die Hoca (MN-07).
 */
export async function BuchstabenAnsicht({ b }: { b: Buchstabe }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('elifbe');
  const [woerter, audio] = await Promise.all([ladeBeispielwoerter(b.codepunkt), ladeElifbeAudio()]);
  const aufnahme = audio[`buchstabe:${hex(b.codepunkt)}`];
  const name = b.elifbe;
  const nameLang = sprache === 'tr' ? undefined : 'tr';
  const arabischerName = b.name[sprache] !== b.elifbe ? b.name[sprache] : null;
  const sprachZiel: Ziel = { pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: b.slug } };
  const vorher = BUCHSTABEN[b.nr - 2];
  const naechster = BUCHSTABEN[b.nr];
  const form = formen(b);
  const harakat = HARAKAT.filter((h) => erlaubt(b, h.schluessel)).map((h) => ({ h, s: silbe(b, h.schluessel) }));
  const aehnlich = b.aehnlich.map(buchstabeFuer).filter((x): x is Buchstabe => Boolean(x));
  const punkte = b.punkte.anzahl === 0 ? t('punkte.keine') : t(`punkte.${b.punkte.lage as 'oben' | 'unten' | 'innen'}`, { anzahl: b.punkte.anzahl });
  const verbindung = !b.verbindetRechts ? t('buchstabe.verbindetGar', { name }) : b.verbindetLinks ? t('buchstabe.verbindetJa', { name }) : t('buchstabe.verbindetNein', { name });

  return (
    <Seitenrahmen
      bereich="bildung"
      seite="elifbe"
      sprachZiel={sprachZiel}
      pfad={[
        { label: t('pfadLernen'), ziel: '/lernen' },
        { label: t('titel'), ziel: '/elifbe' },
        { label: t('pfadBuchstaben'), ziel: '/elifbe/buchstaben' },
        { label: name },
      ]}
    >
      <PageHeader
        kennung={t('buchstabe.kennung', { nr: b.nr })}
        titel={name}
        titelLang={nameLang}
        untertitel={arabischerName ? t('buchstabe.auchGenannt', { name: arabischerName }) : t('buchstabe.untertitel', { name })}
      />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-5">
          {/* Schreibweg (großer Moment) */}
          <section aria-labelledby="schreibweg-titel" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-8 lg:col-span-3">
            <div className="flex flex-col gap-1">
              <h2 id="schreibweg-titel" className="text-24">
                {t('buchstabe.schreibwegTitel', { name })}
              </h2>
              <p className="text-18 text-pretty text-tinte-2">{t('buchstabe.schreibwegText')}</p>
            </div>
            <div className="mx-auto aspect-square w-full max-w-120" style={morphStil(`b-${b.slug}-glyphe`)}>
              <Schreibweg buchstabe={b} id="schreibweg" bild={t('buchstabe.schreibwegBild', { name })} className="size-full" />
            </div>
            <SchreibwegSteuerung ziel="schreibweg" texte={{ nochmal: t('buchstabe.nochmal'), pfeile: t('buchstabe.pfeile') }} />
            <p className="text-16 text-tinte-2">{t('buchstabe.vorschlag')}</p>
          </section>

          {/* Steckbrief */}
          <section aria-labelledby="steckbrief-titel" className="flex flex-col gap-5 rounded-lg bg-sand p-5 md:p-8 lg:col-span-2">
            <h2 id="steckbrief-titel" className="text-24">
              {t('buchstabe.steckbrief')}
            </h2>
            <dl className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-16 font-bold text-tinte-2">{t('buchstabe.punkte')}</dt>
                <dd className="text-18">{punkte}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-16 font-bold text-tinte-2">{t('buchstabe.verbindung')}</dt>
                <dd className="text-18">{verbindung}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-16 font-bold text-tinte-2">{t('buchstabe.mahrec')}</dt>
                <dd className="flex flex-col gap-1">
                  <span className="text-18">{t(`mahrec.${b.mahrec}`)}</span>
                  <span className="text-16 text-tinte-2">{t('buchstabe.mahrecPlatzhalter')}</span>
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-16 font-bold text-tinte-2">{t('buchstabe.audio')}</dt>
                <dd className="flex flex-col gap-2">
                  {aufnahme ? (
                    <>
                      <audio controls preload="none" src={aufnahme.url} className="w-full" />
                      <span className="text-16 text-tinte-2">{t('buchstabe.audioSprecher', { name: aufnahme.sprecher })}</span>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled
                        className="inline-flex min-h-12 items-center gap-3 self-start rounded-pill bg-weiss px-5 font-bold text-tinte-2 disabled:cursor-not-allowed"
                      >
                        <Volume2 aria-hidden className="size-5" />
                        {t('buchstabe.audioFolgt')}
                      </button>
                      <span className="text-16 text-tinte-2">{t('buchstabe.audioText')}</span>
                    </>
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Vier Formen */}
        <section aria-labelledby="formen-titel" className="flex flex-col gap-5">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="formen-titel" className="text-display-2">
              {t('buchstabe.formenTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">
              {!b.verbindetRechts
                ? t('buchstabe.formenGar')
                : b.verbindetLinks
                  ? t('buchstabe.formenText')
                  : t('buchstabe.formenNicht', { name })}
            </p>
          </div>
          <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss shadow-s1">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">{t('buchstabe.formenTabelle', { name })}</caption>
              <thead>
                <tr className="bg-sand">
                  {FORM_ARTEN.map((f) => (
                    <th key={f} scope="col" className="px-3 py-3 text-center text-16 font-bold">
                      {t(`formen.${f}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {FORM_ARTEN.map((f) => (
                    <td key={f} lang="ar" dir="rtl" className="border-l border-linie px-3 py-2 text-center text-display-1 leading-loose text-gruen-950 first:border-l-0">
                      {form[f]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Mit Lesezeichen */}
        <section aria-labelledby="harakat-titel" className="flex flex-col gap-5">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="harakat-titel" className="text-display-2">
              {t('buchstabe.harakatTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('buchstabe.harakatText')}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {harakat.map(({ h, s }) => (
              <li key={h.schluessel} className="flex flex-col items-center gap-1 rounded-lg border border-linie bg-weiss px-3 pt-2 pb-4 text-center shadow-s1">
                <span lang="ar" dir="rtl" className="text-48 leading-loose text-gruen-950">
                  {s.text}
                </span>
                <span className="text-18 font-bold">{s.umschrift[sprache]}</span>
                <span className="text-16 text-tinte-2">{h.name[sprache]}</span>
              </li>
            ))}
          </ul>
          <p className="max-w-einleitung text-16 text-tinte-2">{t('buchstabe.umschriftHinweis')}</p>
        </section>

        {/* Leicht zu verwechseln */}
        {aehnlich.length ? (
          <section aria-labelledby="aehnlich-titel" className="flex flex-col gap-5">
            <div className="flex max-w-einleitung flex-col gap-2">
              <h2 id="aehnlich-titel" className="text-display-2">
                {t('buchstabe.aehnlichTitel')}
              </h2>
              <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('buchstabe.aehnlichText')}</p>
            </div>
            <ul dir="rtl" className="grid grid-cols-3 gap-3 font-text leading-normal sm:grid-cols-4 md:grid-cols-6 md:gap-4">
              <li dir="ltr" aria-hidden className="flex flex-col items-center justify-end rounded-lg border-2 border-gruen-700 bg-gruen-50 px-2 pt-8 pb-3">
                <span lang="ar" dir="rtl" className="text-48 leading-loose text-gruen-950">
                  {zeichen(b)}
                </span>
                <span lang={nameLang} className="text-18 font-bold">
                  {name}
                </span>
              </li>
              {aehnlich.map((x) => (
                <li key={x.slug} dir="ltr">
                  <Buchstabenkarte b={x} sprache={sprache} label={t('raster.karte', { name: x.elifbe, nr: x.nr })} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Im Koran entdecken: nur Verweise auf quran_wort */}
        <section aria-labelledby="beispiele-titel" className="flex flex-col gap-5">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="beispiele-titel" className="text-display-2">
              {t('buchstabe.beispieleTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">
              {woerter.length ? t('buchstabe.beispieleText', { name }) : t('buchstabe.beispieleKeine', { name })}
            </p>
          </div>
          {woerter.length ? (
            <>
              <ul className="grid gap-4 md:grid-cols-3">
                {woerter.map((w) => (
                  <li key={`${w.sure}-${w.vers}-${w.pos}`} className="flex flex-col items-center gap-3 rounded-lg border border-linie bg-weiss p-5 text-center shadow-s1">
                    <span lang="ar" dir="rtl" className="text-display-1 leading-loose text-gruen-950">
                      {w.textAr}
                    </span>
                    <span className="text-16 text-tinte-2">{t('buchstabe.wort', { pos: w.pos })}</span>
                    <Link
                      href={{ pathname: '/quran/[sure]', params: { sure: String(w.sure) }, hash: `v-${w.vers}` }}
                      aria-label={t('buchstabe.fundstelleLink', { sure: w.sure, vers: w.vers })}
                      className="inline-flex min-h-12 items-center gap-2 font-bold"
                    >
                      <BookOpen aria-hidden className="size-5" />
                      {t('buchstabe.fundstelle', { sure: w.sure, vers: w.vers })}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-16 text-tinte-2">{t('buchstabe.beispieleQuelle')}</p>
            </>
          ) : null}
        </section>

        {/* Blättern */}
        <nav aria-label={t('pfadBuchstaben')} className="grid gap-3 border-t border-linie pt-8 sm:grid-cols-2">
          {vorher ? (
            <Link
              href={{ pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: vorher.slug } }}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline shadow-s1 hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte"
            >
              <ArrowLeft aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span className="flex flex-col">
                <span className="text-16 text-tinte-2">{t('buchstabe.zurueck')}</span>
                <span lang={nameLang} className="font-bold">
                  {vorher.elifbe}
                </span>
              </span>
              <span lang="ar" dir="rtl" aria-hidden className="ms-auto text-36 text-gruen-950">
                {zeichen(vorher)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {naechster ? (
            <Link
              href={{ pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: naechster.slug } }}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline shadow-s1 hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte sm:flex-row-reverse sm:text-right"
            >
              <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span className="flex flex-col">
                <span className="text-16 text-tinte-2">{t('buchstabe.weiter')}</span>
                <span lang={nameLang} className="font-bold">
                  {naechster.elifbe}
                </span>
              </span>
              <span lang="ar" dir="rtl" aria-hidden className="ms-auto text-36 text-gruen-950 sm:ms-0 sm:me-auto">
                {zeichen(naechster)}
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </Seitenrahmen>
  );
}
