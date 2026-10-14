import { ArrowDown, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { NachOben } from '@/components/website/NachOben';
import { PageHeader } from '@/components/website/PageHeader';
import { CuzRing } from '@/components/website/quran/CuzRing';
import { SurenRaster } from '@/components/website/quran/SurenRaster';
import { SurenSuche } from '@/components/website/quran/SurenSuche';
import { OfflineListe } from '@/components/website/quran/OfflineListe';
import { Weiterlesen } from '@/components/website/quran/Weiterlesen';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { TAJWID_FAMILIEN } from '@/lib/quran/tajwid';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeCuzBereiche, ladeQuranStand } from '@/server/queries/quran';
import '@/components/website/quran/quran.css';

export const ensureStatic = 'navigation';

/** Farbfeld einer Tajwid-Familie: vier geschützte Leerzeichen, die Familienklasse zeichnet Farbe und Muster. */
const FARBFELD = '\u00a0'.repeat(4);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quranSeite');
  return metadatenFuer({ pfad: '/quran', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Übersicht /quran (O-Q01, Erzählansicht): zuerst alle 114 Suren mit Suche im Browser (Kachel → Surenseite mit Morph
 * des Medaillons), daneben ab lg bzw. danach „Weiterlesen“ aus dem Gerät, Cüz-Ring mit Liste der 30 Cüz und der
 * Tajwid-Hinweis. Bis lg führen Sprungmarken zu Weiterlesen und Cüz, auf langen Strecken „Nach oben“ (Sichtabnahme
 * K-3, K-4).
 */
export default async function QuranEinstieg() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('quranSeite');
  const tu = await getTranslations('quranSeite.uebersicht');
  const [{ suren }, bereiche] = await Promise.all([ladeQuranStand(), ladeCuzBereiche()]);
  const cuzZiel = (nr: number) => ({ pathname: '/quran/cuz/[nr]', params: { nr: String(nr) } }) as const;

  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel="/quran" pfad={[{ label: t('breadcrumb') }]}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      {suren.length === 0 ? (
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
            <Zustandsgrafik art="leer" />
            <p className="text-20 font-bold">{t('keineSuren')}</p>
            <p className="max-w-text text-18 text-tinte-2">{t('keineSurenText')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Erst die Auswahl aller Suren, daneben (ab lg) bzw. danach Weiterlesen, Cüz und Tajwid (Sichtabnahme K-3):
              Reihenfolge im Dokument = Reihenfolge im Bild auf jeder Breite */}
          <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8 lg:grid-cols-12 lg:gap-8">
            <section aria-labelledby="suren-titel" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
              <div className="flex max-w-einleitung flex-col gap-2">
                <h2 id="suren-titel" className="text-display-2">
                  {tu('surenTitel')}
                </h2>
                <p className="text-18 leading-einleitung text-pretty text-tinte-2">{tu('surenText')}</p>
              </div>
              {/* Sprungmarken bis lg: Weiterlesen und Cüz stehen dort nach der langen Liste */}
              <nav aria-label={tu('sprungLabel')} className="flex flex-wrap gap-2 lg:hidden">
                {[
                  { ziel: '#weiterlesen', text: tu('weiterlesenTitel') },
                  { ziel: '#cuz', text: tu('cuzTitel') },
                ].map((s) => (
                  <a
                    key={s.ziel}
                    href={s.ziel}
                    className="inline-flex min-h-12 items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
                  >
                    {s.text}
                    <ArrowDown aria-hidden className="size-5" />
                  </a>
                ))}
              </nav>
              <SurenSuche
                texte={{
                  label: tu('sucheLabel'),
                  platzhalter: tu('suchePlatzhalter'),
                  hilfe: tu('sucheHilfe'),
                  keine: tu('trefferKeine'),
                  treffer: tu.raw('treffer') as string,
                }}
              >
                <SurenRaster suren={suren} />
              </SurenSuche>
            </section>

            <div className="flex min-w-0 flex-col gap-abschnitt-klein lg:col-span-4 lg:gap-8">
              <div id="weiterlesen" className="flex flex-col gap-4">
                <Weiterlesen
                  namen={suren.map((s) => s.umschrift)}
                  pfadSure={pfadFuer({ pathname: '/quran/[sure]', params: { sure: '__s__' } }, sprache)}
                  pfadCuz={pfadFuer({ pathname: '/quran/cuz/[nr]', params: { nr: '__n__' } }, sprache)}
                  texte={{
                    titel: tu('weiterlesenTitel'),
                    stelle: tu.raw('weiterlesenStelle') as string,
                    stelleCuz: tu.raw('weiterlesenCuz') as string,
                    link: tu('weiterlesenLink'),
                    lesezeichenTitel: tu('lesezeichenTitel'),
                    lesezeichenLink: tu('lesezeichenLink'),
                    leer: tu('weiterlesenLeer'),
                    geraet: tu('geraetHinweis'),
                  }}
                />
                <OfflineListe
                  texte={{
                    liste: t('offline.liste'),
                    listeGroesse: t.raw('offline.listeGroesse') as string,
                    listeEntfernen: t.raw('offline.listeEntfernen') as string,
                  }}
                />
              </div>
              <section id="cuz" aria-labelledby="cuz-titel" className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex max-w-einleitung flex-col gap-2">
                    <h2 id="cuz-titel" className="text-display-2">
                      {tu('cuzTitel')}
                    </h2>
                    <p className="text-18 leading-einleitung text-pretty text-tinte-2">{tu('cuzText')}</p>
                  </div>
                  {/* Telefon und Tablet: kleine Rosette als Schmuck neben der Überschrift, gewählt wird im Raster (K-4) */}
                  <div className="size-16 shrink-0 lg:hidden">
                    <CuzRing schmuck mitte={tu('cuzMitte')} eintraege={bereiche.map((b) => ({ nr: b.nr, href: '' }))} />
                  </div>
                </div>
                <div className="mx-auto aspect-square w-full max-w-80 max-lg:hidden">
                  <CuzRing mitte={tu('cuzMitte')} eintraege={bereiche.map((b) => ({ nr: b.nr, href: pfadFuer(cuzZiel(b.nr), sprache) }))} />
                </div>
                <nav aria-label={tu('cuzListe')}>
                  <ol className="grid grid-cols-6 gap-2">
                    {bereiche.map((b) => (
                      <li key={b.nr}>
                        <Link
                          href={cuzZiel(b.nr)}
                          prefetch={false}
                          aria-label={tu('cuzLabel', { nr: b.nr, sure: b.von.sure, vers: b.von.vers })}
                          className="flex aspect-square min-h-12 items-center justify-center rounded-md border border-linie bg-weiss font-bold text-tinte tabular-nums no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
                        >
                          {b.nr}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              </section>
              <section aria-labelledby="tajwid-titel" className="flex flex-col gap-3 rounded-lg border border-linie bg-sand p-6">
                <h2 id="tajwid-titel" className="text-24">
                  {tu('tajwidTitel')}
                </h2>
                <p className="text-18 text-tinte-2">{tu('tajwidText')}</p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-16">
                  {TAJWID_FAMILIEN.map((f) => (
                    <li key={f}>
                      {/* Farbfeld mit dem Muster der Familie, daneben der Name in ihrer Farbe (wie Wortkarte und Seitenleiste) */}
                      <span className="inline-flex items-center gap-1.5">
                        <span aria-hidden className={`tj tj-${f} tj-probe`}>
                          {FARBFELD}
                        </span>
                        <span className={`tj tj-${f} bg-none font-bold no-underline`}>{t(`familien.${f}`)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/quran/tajwid" className="inline-flex min-h-12 items-center gap-2 self-start font-bold">
                  {tu('tajwidLink')}
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </section>
            </div>
          </div>
          <NachOben text={tu('nachOben')} />
        </>
      )}
    </Seitenrahmen>
  );
}
