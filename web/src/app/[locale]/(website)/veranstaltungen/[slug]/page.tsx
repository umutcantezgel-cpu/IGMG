import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  CircleAlert,
  CircleCheck,
  CircleMinus,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  UserRound,
  Users,
} from 'lucide-react';
import type { JSONContent } from '@tiptap/core';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { terminDatum } from '@/components/website/EventCard';
import { LOGOS } from '@/components/website/navigation';
import { RichText } from '@/components/website/RichText';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text, textMitSprache } from '@/components/website/Text';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { AnmeldeFormular } from '@/components/website/veranstaltungen/AnmeldeFormular';
import { TeilenKnopf } from '@/components/website/veranstaltungen/TeilenKnopf';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { datumLang, zeitspanne } from '@/lib/i18n/format';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { meldeAn } from '@/server/actions/formulare/veranstaltungsanmeldung';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { ladeAnmeldezahl, ladeVeranstaltung, ladeVeranstaltungsSlugs, type VeranstaltungsDetail } from '@/server/queries/veranstaltungen';

export const ensureStatic = 'navigation';

/** Beim Bau alle veröffentlichten Slugs; neue entstehen bei der ersten Anfrage (ensureStatic verlangt ≥ 1 Wert). */
export async function generateStaticParams() {
  const slugs = await ladeVeranstaltungsSlugs();
  return (slugs.length ? slugs : ['_']).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/veranstaltungen/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const v = await ladeVeranstaltung(slug);
  if (!v) return {};
  const sprache = locale as Locale;
  return metadatenFuer({
    pfad: { pathname: '/veranstaltungen/[slug]', params: { slug } },
    titel: text(v.titel, sprache),
    beschreibung: text(v.kurztext, sprache) || undefined,
  });
}

type Status = 'offen' | 'ausgebucht' | 'vergangen' | null;
const STATUS_STIL = {
  offen: { klasse: 'bg-gruen-50 text-gruen-800', Icon: CircleCheck },
  ausgebucht: { klasse: 'bg-fehler-toenung text-fehler', Icon: CircleAlert },
  vergangen: { klasse: 'bg-sand text-tinte-2', Icon: CircleMinus },
} as const;
const ORG_TOENUNG = {
  at: 'bg-org-at-toenung text-org-at-text',
  kt: 'bg-org-kt-toenung text-org-kt-text',
  gt: 'bg-org-gt-toenung text-org-gt-text',
  kgt: 'bg-org-kgt-toenung text-org-kgt-text',
} as const;
const ORG_BAND = { at: 'bg-org-at', kt: 'bg-org-kt', gt: 'bg-org-gt', kgt: 'bg-org-kgt' } as const;

function statusVon(v: VeranstaltungsDetail, angemeldet: number): Status {
  if (v.vergangen) return 'vergangen';
  if (!v.anmeldungAktiv) return null;
  if (v.plaetze !== null && angemeldet >= v.plaetze) return 'ausgebucht';
  return 'offen';
}

/** Initialen nur für echte Namen; Platzhalter „[…]“ zeigen ein Personensymbol (G-05). */
function initialen(name: string): string | null {
  if (name.startsWith('[')) return null;
  const teile = name.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w));
  return teile.length
    ? teile
        .slice(0, 3)
        .map((w) => w[0])
        .join('')
    : null;
}

const knopfPrimaer =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss';
const knopfRahmen =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[22px] font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800';
const karte = 'rounded-lg border border-linie bg-weiss';

/**
 * Veranstaltungsdetails (design/EventDetails.dc.html, Blatt S05). URL-Daten nur innerhalb von Suspense lesen
 * (keeping-pages-static, Schritt 3); mit ensureStatic 'navigation' wartet die erste Anfrage auf die ganze Seite.
 */
export default function VeranstaltungSeite({ params }: PageProps<'/[locale]/veranstaltungen/[slug]'>) {
  return (
    <Suspense fallback={null}>
      <Veranstaltung params={params} />
    </Suspense>
  );
}

async function Veranstaltung({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const sprache = locale as Locale;
  const v = await ladeVeranstaltung(slug);
  if (!v) notFound();
  const [t, tk, tp, kontaktSeite, angemeldet] = await Promise.all([
    getTranslations('veranstaltung'),
    getTranslations('karten'),
    getTranslations('kopf'),
    ladeSeiteninhalt('kontakt'),
    v.anmeldungAktiv ? ladeAnmeldezahl(v.id) : Promise.resolve(0),
  ]);
  const titel = textMitSprache(v.titel, sprache);
  const status = statusVon(v, angemeldet);
  const beginn = new Date(v.beginn);
  const datum = await terminDatum(v, sprache);
  const wiederkehrend = v.wiederholung.art !== 'einmalig';
  const quote = v.plaetze ? Math.min(100, Math.round((angemeldet / v.plaetze) * 100)) : null;
  const verfuegbar = v.plaetze !== null ? Math.max(0, v.plaetze - angemeldet) : null;
  const orgName = v.organisation ? tk(`orgName_${v.organisation}`) : null;
  // Rich-Text in der Sprache, sonst sichtbarer Rückfall auf Deutsch (K-02)
  const beschreibungSprache = v.beschreibung ? (sprache !== 'de' && v.beschreibung[sprache] ? sprache : 'de') : null;
  const anmeldbar = status === 'offen';

  const infokarte = (Icon: typeof Calendar, label: string, inhalt: React.ReactNode) => (
    <div className="flex gap-3 rounded-md bg-sand p-4">
      <dt className="flex pt-0.5 text-gruen-700">
        <Icon aria-hidden className="size-6" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="flex flex-1 flex-col leading-[1.35]">
        <span aria-hidden className="text-16 text-tinte-2">
          {label}
        </span>
        {inhalt}
      </dd>
    </div>
  );

  return (
    <Seitenrahmen
      bereich="moschee"
      seite="veranstaltungen"
      sprachZiel={{ pathname: '/veranstaltungen/[slug]', params: { slug } }}
      pfad={[{ label: tp('veranstaltungen'), ziel: '/veranstaltungen' }, { label: t('seite') }]}
    >
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-6 px-4 pt-4 pb-12 md:px-8 md:pt-8 md:pb-24">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4">
          <ArrowLeft aria-hidden className="size-5" />
          {t('zurueck')}
        </Link>

        <section aria-labelledby="ev-titel" className={cn(karte, 'overflow-hidden rounded-lg shadow-s1')}>
          <div aria-hidden className={cn('h-1.5', v.organisation ? ORG_BAND[v.organisation] : 'bg-gruen-700')} />
          <div className="flex flex-col gap-6 p-5 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              {v.organisation && orgName ? (
                <>
                  <Image
                    src={LOGOS[v.organisation]}
                    alt={t('logoAlt', { organisation: orgName })}
                    width={40}
                    height={40}
                    className="size-10 rounded-sm border border-linie"
                  />
                  <span className={cn('inline-flex rounded-pill px-3 py-0.5 text-16 font-bold', ORG_TOENUNG[v.organisation])}>
                    {orgName}
                  </span>
                </>
              ) : null}
              {status ? (
                <span
                  className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-16 font-bold', STATUS_STIL[status].klasse)}
                >
                  {(() => {
                    const I = STATUS_STIL[status].Icon;
                    return <I aria-hidden className="size-4" />;
                  })()}
                  {t(status)}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <h1 id="ev-titel" lang={titel.lang} className="text-[clamp(2.25rem,1.5rem+1.7vw,3rem)] leading-[1.15] break-words">
                {titel.text}
              </h1>
              <p className="text-20 text-tinte-2">{tk(`kat_${v.kategorie}`)}</p>
            </div>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-3">
              {infokarte(
                Calendar,
                t('datum'),
                <>
                  <strong>{datum}</strong>
                  {wiederkehrend && !v.vergangen ? (
                    <span className="text-16">{t('naechster', { datum: datumLang(beginn, sprache) })}</span>
                  ) : null}
                </>,
              )}
              {infokarte(Clock, t('uhrzeit'), <strong>{zeitspanne(beginn, v.ende ? new Date(v.ende) : null, sprache)}</strong>)}
              {infokarte(
                MapPin,
                t('ort'),
                <>
                  {v.ort ? <Text feld={v.ort} sprache={sprache} als="strong" /> : null}
                  <span className="text-16">{kontaktSeite.adresse}</span>
                </>,
              )}
              {v.anmeldungAktiv
                ? infokarte(
                    Users,
                    t('teilnehmer'),
                    <span className="flex flex-col gap-1.5">
                      <strong className="tabular-nums">{v.plaetze !== null ? `${angemeldet} / ${v.plaetze}` : angemeldet}</strong>
                      {v.plaetze !== null ? (
                        <span
                          role="progressbar"
                          aria-label={t('auslastung')}
                          aria-valuenow={angemeldet}
                          aria-valuemin={0}
                          aria-valuemax={v.plaetze}
                          className="block h-2 overflow-hidden rounded-pill border border-rand bg-weiss"
                        >
                          <span className="block h-full bg-gruen-700" style={{ width: `${quote}%` }} />
                        </span>
                      ) : null}
                    </span>,
                  )
                : v.zielgruppe || v.teilnehmerHinweis
                  ? infokarte(Users, tk('zielgruppe'), <Text feld={v.zielgruppe ?? v.teilnehmerHinweis} sprache={sprache} als="strong" />)
                  : null}
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              {anmeldbar ? (
                <a href="#anmeldung" className={knopfPrimaer}>
                  <Check aria-hidden className="size-5" />
                  {t('jetztAnmelden')}
                </a>
              ) : null}
              <TeilenKnopf titel={titel.text} texte={{ teilen: t('teilen'), kopiert: t('kopiert'), fehler: t('teilenFehler') }} />
              <a
                href={`/api/ical/${sprache}/veranstaltung/${v.slug}`}
                download={`${v.slug}.ics`}
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-rand bg-weiss px-[18px] font-bold text-tinte no-underline hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte"
              >
                <Bookmark aria-hidden className="size-5" />
                {t('merken')}
                <span className="sr-only">: {t('merkenHinweis')}</span>
              </a>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[2_1_560px] flex-col gap-6">
            {v.beschreibung || v.schlagwoerter.length ? (
              <section aria-labelledby="ev-beschreibung" className={cn(karte, 'flex flex-col gap-4 p-5 md:p-8')}>
                <h2 id="ev-beschreibung" className="text-30">
                  {t('beschreibung')}
                </h2>
                {v.beschreibung && beschreibungSprache ? (
                  <RichText
                    doc={v.beschreibung[beschreibungSprache] as JSONContent}
                    lang={beschreibungSprache !== sprache ? 'de' : undefined}
                    className="text-pretty"
                  />
                ) : (
                  <Text feld={v.kurztext} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty" />
                )}
                {v.schlagwoerter.length ? (
                  <ul aria-label={t('schlagwoerter')} className="flex flex-wrap gap-2">
                    {v.schlagwoerter.map((s, i) => (
                      <li
                        key={i}
                        className="inline-flex rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 font-bold text-tinte-2"
                      >
                        <Text feld={s} sprache={sprache} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}

            {v.programm.length ? (
              <section aria-labelledby="ev-programm" className={cn(karte, 'flex flex-col gap-4 p-5 md:p-8')}>
                <h2 id="ev-programm" className="text-30">
                  {t('programm')}
                </h2>
                <ol className="flex flex-col">
                  {v.programm.map((p, i) => (
                    <li key={i} className="flex items-baseline gap-4 border-t border-linie py-3">
                      <span className="min-w-21 shrink-0 font-bold whitespace-nowrap text-gruen-800 tabular-nums">
                        {t('uhrPrefix', { zeit: p.zeit })}
                      </span>
                      <Text feld={p.text} sprache={sprache} />
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {v.hinweise.length ? (
              <section aria-labelledby="ev-hinweise" className="flex flex-col gap-3 rounded-lg bg-warnung-toenung p-5 md:p-8">
                <h2 id="ev-hinweise" className="flex items-center gap-2.5 text-30">
                  <CircleCheck aria-hidden className="size-6 text-warnung" />
                  {t('hinweise')}
                </h2>
                <ul className="flex flex-col gap-2">
                  {v.hinweise.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CircleAlert aria-hidden className="mt-[3px] size-5 shrink-0 text-warnung" />
                      <Text feld={h} sprache={sprache} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
            <section
              id="anmeldung"
              aria-labelledby="ev-anmeldung"
              className="flex scroll-mt-24 flex-col gap-4 rounded-lg border-2 border-gruen-700 bg-weiss p-6"
            >
              <h2 id="ev-anmeldung" className="text-24">
                {t('anmeldung')}
              </h2>
              {!v.anmeldungAktiv ? (
                <p>{t('keineAnmeldung')}</p>
              ) : (
                <>
                  {quote !== null ? (
                    <>
                      <p className="flex items-baseline gap-2">
                        <span className="text-36 font-bold text-gruen-800 tabular-nums">{quote}%</span>
                        <span className="text-tinte-2">{t('ausgelastet')}</span>
                      </p>
                      <span aria-hidden className="block h-2.5 overflow-hidden rounded-pill border border-rand bg-sand">
                        <span className="block h-full bg-gruen-700" style={{ width: `${quote}%` }} />
                      </span>
                    </>
                  ) : null}
                  <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                    <dt className="text-tinte-2">{t('angemeldet')}</dt>
                    <dd className="font-bold tabular-nums">{angemeldet}</dd>
                    <dt className="text-tinte-2">{verfuegbar !== null ? t('verfuegbar') : t('plaetze')}</dt>
                    <dd className="font-bold tabular-nums">{verfuegbar !== null ? verfuegbar : t('unbegrenzt')}</dd>
                  </dl>
                  {status === 'vergangen' ? <p className="font-bold text-tinte-2">{t('geschlossen')}</p> : null}
                  {status === 'ausgebucht' ? <p className="font-bold text-fehler">{t('ausgebucht')}</p> : null}
                  {/* Immer an derselben Stelle (E-028): Nimmt die Anmeldung den letzten Platz, rendert die Action die Seite
                      als „ausgebucht“ neu – die Insel bleibt erhalten und zeigt weiter die Erfolgsmeldung. */}
                  <FormularInsel aktion={meldeAn}>
                    {anmeldbar ? <AnmeldeFormular veranstaltungId={v.id} sprache={sprache} verfuegbar={verfuegbar} /> : null}
                  </FormularInsel>
                </>
              )}
              <Link href="/kontakt" className={knopfRahmen}>
                <MapPin aria-hidden className="size-5" />
                {t('routeAnzeigen')}
              </Link>
            </section>

            {v.veranstalter || v.kontakt ? (
              <section aria-labelledby="ev-veranstalter" className={cn(karte, 'flex flex-col gap-4 p-6')}>
                <h2 id="ev-veranstalter" className="text-24">
                  {t('veranstalter')}
                </h2>
                {v.veranstalter ? (
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-gruen-50 font-bold text-gruen-800"
                    >
                      {initialen(v.veranstalter.name) ?? <UserRound className="size-6" />}
                    </span>
                    <span className="flex flex-col leading-[1.35]">
                      <strong>{v.veranstalter.name}</strong>
                      {v.veranstalter.funktion || orgName ? (
                        <span className="text-16 text-tinte-2">
                          {v.veranstalter.funktion ? <Text feld={v.veranstalter.funktion} sprache={sprache} /> : orgName}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ) : null}
                {v.kontakt ? (
                  <div className="flex flex-col gap-2 border-t border-linie pt-3">
                    <h3 className="font-text text-18 font-bold tracking-normal">{t('kontakt')}</h3>
                    {v.kontakt.name ? <span className="text-16 text-tinte-2">{v.kontakt.name}</span> : null}
                    {v.kontakt.telefon ? (
                      <span className="flex items-center gap-2.5">
                        <Phone aria-hidden className="size-5 text-gruen-700" />
                        {v.kontakt.telefon.startsWith('[') ? (
                          v.kontakt.telefon
                        ) : (
                          <a href={`tel:${v.kontakt.telefon.replace(/[^\d+]/g, '')}`}>{v.kontakt.telefon}</a>
                        )}
                      </span>
                    ) : null}
                    {v.kontakt.email ? (
                      <a
                        href={`mailto:${v.kontakt.email}`}
                        className="flex min-h-11 items-center gap-2.5 [overflow-wrap:anywhere] underline underline-offset-[3px]"
                      >
                        <Mail aria-hidden className="size-5 shrink-0" />
                        {v.kontakt.email}
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {v.kontakt?.email ? (
                  <a href={`mailto:${v.kontakt.email}`} className={knopfRahmen}>
                    <Mail aria-hidden className="size-5" />
                    {t('nachrichtSenden')}
                  </a>
                ) : (
                  <Link href="/kontakt" className={knopfRahmen}>
                    <User aria-hidden className="size-5" />
                    {t('nachrichtSenden')}
                  </Link>
                )}
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </Seitenrahmen>
  );
}
