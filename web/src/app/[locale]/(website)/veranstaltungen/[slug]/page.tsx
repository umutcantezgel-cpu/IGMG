import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
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
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { terminDatum, uhrzeitText } from '@/components/website/EventCard';
import { Stern8 } from '@/components/website/Icons';
import { MedienBild, SIZES_KOPF } from '@/components/website/MedienBild';
import { LOGOS } from '@/components/website/navigation';
import { PageHeader } from '@/components/website/PageHeader';
import { RichText } from '@/components/website/RichText';
import { JsonLd } from '@/components/website/JsonLd';
import { morphStil } from '@/components/website/morph';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text, textMitSprache } from '@/components/website/Text';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { AnmeldeFormular } from '@/components/website/veranstaltungen/AnmeldeFormular';
import { TeilenKnopf } from '@/components/website/veranstaltungen/TeilenKnopf';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { datumLang } from '@/lib/i18n/format';
import { text } from '@/lib/i18n/inhalt';
import { telefonHref } from '@/lib/telefon';
import { ORGANISATION, veranstaltung } from '@/lib/seo/jsonld';
import { adresse, basisUrl, metadatenFuer } from '@/lib/seo/metadaten';
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
  const t = await getTranslations('veranstaltungen');
  return metadatenFuer({
    pfad: { pathname: '/veranstaltungen/[slug]', params: { slug } },
    eigenesBild: true,
    titel: text(v.titel, sprache),
    // Ohne Kurztext: Untertitel der Übersicht statt der Platzhalter-Beschreibung des Layouts (Muster Islamisches Wissen)
    beschreibung: text(v.kurztext, sprache) || t('untertitel'),
  });
}

type Status = 'offen' | 'ausgebucht' | 'vergangen' | null;
const STATUS_STIL = {
  offen: { klasse: 'bg-gruen-50 text-gruen-800', Icon: CircleCheck },
  ausgebucht: { klasse: 'bg-fehler-toenung text-fehler', Icon: CircleAlert },
  vergangen: { klasse: 'border border-linie bg-weiss text-tinte-2', Icon: CircleMinus },
} as const;
/** Kategorie-Abzeichen sandfarben wie in EventCard (H-C01): Kategorien bleiben neutral, nur „Wichtig“ trägt Farbe. */
const KATEGORIE_TOENUNG = 'border border-linie bg-sand text-tinte-2';
/** Organisationsfarben: Rahmen des Logos (PageHeader leitet daraus das Band unter dem Kopf ab) und Text der Kennung. */
const ORG_AKZENT = { at: 'border-org-at', kt: 'border-org-kt', gt: 'border-org-gt', kgt: 'border-org-kgt' } as const;
const ORG_TEXT = { at: 'text-org-at-text', kt: 'text-org-kt-text', gt: 'text-org-gt-text', kgt: 'text-org-kgt-text' } as const;

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
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98';
const knopfRahmen =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98';

/**
 * Veranstaltungsdetails (design/EventDetails.dc.html, Blatt S05). Kopf im Seitenkopf-Muster: Rückweg, Organisation,
 * Titel, Status, Fakten und Aktionen; darunter Inhalt ohne Kästen, Anmeldung als einzige Karte. URL-Daten nur innerhalb
 * von Suspense lesen (keeping-pages-static, Schritt 3); mit ensureStatic 'navigation' wartet die erste Anfrage auf die ganze Seite.
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
  const [t, tk, tp, tf, kontaktSeite, angemeldet] = await Promise.all([
    getTranslations('veranstaltung'),
    getTranslations('karten'),
    getTranslations('kopf'),
    getTranslations('formulare'),
    ladeSeiteninhalt('kontakt'),
    v.anmeldungAktiv ? ladeAnmeldezahl(v.id) : Promise.resolve(0),
  ]);
  const titel = textMitSprache(v.titel, sprache);
  const status = statusVon(v, angemeldet);
  const StatusIcon = status ? STATUS_STIL[status].Icon : null;
  const beginn = new Date(v.beginn);
  const datum = await terminDatum(v, sprache);
  // Hinweis „ganztägig“, sobald der Schlüssel in den Sprachdateien steht (Bedarf: karten.ganztaegig)
  const zeit = uhrzeitText(v, sprache, tk.has('ganztaegig') ? tk('ganztaegig') : null);
  const wiederkehrend = v.wiederholung.art !== 'einmalig';
  const quote = v.plaetze ? Math.min(100, Math.round((angemeldet / v.plaetze) * 100)) : null;
  const verfuegbar = v.plaetze !== null ? Math.max(0, v.plaetze - angemeldet) : null;
  const orgName = v.organisation ? tk(`orgName_${v.organisation}`) : null;
  // Rich-Text in der Sprache, sonst sichtbarer Rückfall auf Deutsch (K-02)
  const beschreibungSprache = v.beschreibung ? (sprache !== 'de' && v.beschreibung[sprache] ? sprache : 'de') : null;
  const anmeldbar = status === 'offen';
  const telefonZiel = telefonHref(v.kontakt?.telefon);

  // Fakt der Faktenzeile: Icon und Beschriftung, ohne eigene Fläche; ab lg durch Trennlinien getrennt
  const fakt = (Icon: typeof Calendar, label: string, inhalt: React.ReactNode) => (
    <div className="flex gap-3 lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <dt className="flex pt-0.5 text-gruen-700">
        <Icon aria-hidden className="size-5" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="flex min-w-0 flex-1 flex-col leading-snug">
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
      pfad={[{ label: tp('veranstaltungen'), ziel: '/veranstaltungen' }, { label: titel.text }]}
    >
      <JsonLd
        daten={veranstaltung({
          url: adresse({ pathname: '/veranstaltungen/[slug]', params: { slug } }, sprache),
          name: titel.text,
          beschreibung: text(v.kurztext, sprache),
          bild: v.bild ? `${basisUrl()}${v.bild.url}` : null,
          beginn: v.beginn,
          ende: v.ende,
          ort: text(v.ort, sprache),
          adresse: kontaktSeite.adresse,
          vergangen: v.vergangen,
          veranstalter: v.organisation && orgName ? orgName : ORGANISATION,
        })}
      />
      <PageHeader
        oben={
          <Link
            href="/veranstaltungen"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('zurueckListe')}
          </Link>
        }
        akzent={v.organisation ? ORG_AKZENT[v.organisation] : undefined}
        kennung={orgName ?? tk(`kat_${v.kategorie}`)}
        // Mit Organisation steht das Logo (20 px) vor der Kennung; ohne Organisation bleibt der Achtstern
        kennungZeichen={
          v.organisation ? (
            <Image src={LOGOS[v.organisation]} alt="" width={40} height={40} className="size-5 shrink-0 rounded-sm border border-linie" />
          ) : undefined
        }
        kennungFarbe={v.organisation ? ORG_TEXT[v.organisation] : undefined}
        // Kopfbild (H-C02): ab lg ein Platzhalter, wenn kein Bild gepflegt ist; die Fläche trägt den Übergangsnamen
        bildAbLg={!v.bild}
        bild={
          <div style={morphStil(`v-${v.slug}-bild`)}>
            {v.bild ? (
              <MedienBild
                bild={v.bild}
                sprache={sprache}
                sizes={SIZES_KOPF}
                className="h-55 rounded-lg border border-linie md:h-75 lg:aspect-4/3 lg:h-auto"
              />
            ) : (
              <Bildplatzhalter
                beschriftung={`${tk('foto')}: ${titel.text}`}
                className="h-55 rounded-lg border border-linie md:h-75 lg:aspect-4/3 lg:h-auto"
              />
            )}
          </div>
        }
        titel={titel.text}
        titelId="ev-titel"
        titelLang={titel.lang}
        titelStil={morphStil(`v-${v.slug}-titel`, 'text')}
        kinder={
          <>
            <div className="flex flex-wrap items-center gap-2">
              {/* Ohne Organisation steht die Kategorie schon als Kennung über dem Titel: keine zweite Pille */}
              {v.organisation ? (
                <span
                  className={cn('inline-flex items-center rounded-pill px-3 py-0.5 text-16 leading-normal font-bold', KATEGORIE_TOENUNG)}
                >
                  {tk(`kat_${v.kategorie}`)}
                </span>
              ) : null}
              {status && StatusIcon ? (
                <span
                  className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-16 font-bold', STATUS_STIL[status].klasse)}
                >
                  <StatusIcon aria-hidden className="size-4" />
                  {t(status)}
                </span>
              ) : null}
            </div>
            <dl className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-6 lg:auto-cols-auto lg:grid-flow-col lg:grid-cols-none lg:gap-x-0 lg:divide-x lg:divide-linie">
              {fakt(
                Calendar,
                t('datum'),
                <>
                  <strong className="whitespace-nowrap">{datum}</strong>
                  {wiederkehrend && !v.vergangen ? (
                    <span className="text-16 lg:w-0 lg:min-w-full">{t('naechster', { datum: datumLang(beginn, sprache) })}</span>
                  ) : null}
                </>,
              )}
              {zeit ? fakt(Clock, t('uhrzeit'), <strong className="whitespace-nowrap">{zeit}</strong>) : null}
              {fakt(
                MapPin,
                t('ort'),
                <>
                  {v.ort ? <Text feld={v.ort} sprache={sprache} als="strong" /> : null}
                  <span className="text-16 lg:w-0 lg:min-w-full">{kontaktSeite.adresse}</span>
                  <Link
                    href={{ pathname: '/kontakt', hash: 'karte' }}
                    className="inline-flex min-h-12 items-center gap-1.5 font-bold text-gruen-700 underline underline-offset-4 lg:whitespace-nowrap"
                  >
                    {t('routeAnzeigen')}
                  </Link>
                </>,
              )}
              {v.zielgruppe || v.teilnehmerHinweis
                ? fakt(Users, tk('zielgruppe'), <Text feld={v.zielgruppe ?? v.teilnehmerHinweis} sprache={sprache} als="strong" />)
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
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-rand bg-weiss px-4.5 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte active:scale-98"
              >
                <CalendarPlus aria-hidden className="size-5" />
                {t('merken')}
                <span className="sr-only">: {t('merkenHinweis')}</span>
              </a>
            </div>
          </>
        }
      />

      <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-12 px-4 py-abschnitt md:px-8 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-12 lg:col-span-2">
          {v.beschreibung || v.schlagwoerter.length ? (
            <section aria-labelledby="ev-beschreibung" className="flex flex-col gap-4">
              <h2 id="ev-beschreibung" className="text-display-2">
                {t('beschreibung')}
              </h2>
              {v.beschreibung && beschreibungSprache ? (
                <RichText
                  doc={v.beschreibung[beschreibungSprache] as JSONContent}
                  lang={beschreibungSprache !== sprache ? 'de' : undefined}
                  className="max-w-text text-pretty"
                />
              ) : (
                <Text feld={v.kurztext} sprache={sprache} als="p" className="max-w-text text-pretty" />
              )}
              {v.schlagwoerter.length ? (
                <ul aria-label={t('schlagwoerter')} className="flex flex-wrap gap-2">
                  {v.schlagwoerter.map((s, i) => (
                    <li key={i} className="inline-flex rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 font-bold text-tinte-2">
                      <Text feld={s} sprache={sprache} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {v.programm.length ? (
            <section aria-labelledby="ev-programm" className="flex flex-col gap-4">
              <h2 id="ev-programm" className="text-display-2">
                {t('programm')}
              </h2>
              {/* Zeitleiste: die senkrechte Linie ist ein Pseudo-Element der Liste (nur Schmuck; ein span direkt in ol wäre ungültiges HTML) */}
              <ol className="relative flex flex-col before:absolute before:inset-y-3 before:left-1.5 before:w-0.5 before:bg-linie before:content-['']">
                {v.programm.map((p, i) => (
                  <li key={i} className="relative flex items-baseline gap-4 py-2.5 pl-8">
                    <Stern8 aria-hidden className="absolute top-4 left-0 text-gruen-700" />
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
            <section aria-labelledby="ev-hinweise" className="flex flex-col gap-4">
              <h2 id="ev-hinweise" className="text-display-2">
                {t('hinweise')}
              </h2>
              <ul className="flex flex-col gap-2">
                {v.hinweise.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Stern8 aria-hidden className="mt-1.5 shrink-0 text-gruen-700" />
                    <Text feld={h} sprache={sprache} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section
            id="anmeldung"
            aria-labelledby="ev-anmeldung"
            className={cn(
              'flex scroll-mt-24 flex-col gap-4 rounded-lg bg-weiss p-6',
              anmeldbar ? 'border-2 border-gruen-700' : 'border border-linie',
            )}
          >
            <h2 id="ev-anmeldung" className="text-24">
              {t('anmeldung')}
            </h2>
            {!v.anmeldungAktiv ? (
              <p>{t('keineAnmeldung')}</p>
            ) : (
              <>
                {status === 'vergangen' ? (
                  <>
                    <p className="flex items-center gap-2 text-18 font-bold text-tinte">
                      <CircleMinus aria-hidden className="size-5 text-tinte-2" />
                      {t('geschlossen')}
                    </p>
                    <Link
                      href="/veranstaltungen"
                      className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
                    >
                      <ArrowLeft aria-hidden className="size-5" />
                      {t('zurueckListe')}
                    </Link>
                  </>
                ) : null}
                {status === 'ausgebucht' ? (
                  <p className="flex items-center gap-2 text-20 font-bold text-fehler">
                    <CircleAlert aria-hidden className="size-5" />
                    {t('ausgebucht')}
                  </p>
                ) : null}
                {status === 'offen' && quote !== null ? (
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
                {status !== 'vergangen' ? (
                  <dl className="flex flex-col gap-1">
                    <div className="flex justify-between gap-3">
                      <dt className="text-tinte-2">{t('angemeldet')}</dt>
                      <dd className="font-bold tabular-nums">{angemeldet}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-tinte-2">{verfuegbar !== null ? t('verfuegbar') : t('plaetze')}</dt>
                      <dd className="font-bold tabular-nums">{verfuegbar !== null ? verfuegbar : t('unbegrenzt')}</dd>
                    </div>
                  </dl>
                ) : null}
                {/* Immer an derselben Stelle (E-028): Nimmt die Anmeldung den letzten Platz, rendert die Action die Seite
                    als „ausgebucht“ neu – die Insel bleibt erhalten und zeigt weiter die Erfolgsmeldung. */}
                <FormularInsel aktion={meldeAn} ohneSkript={tf('ohneSkript')}>
                  {anmeldbar ? <AnmeldeFormular veranstaltungId={v.id} sprache={sprache} verfuegbar={verfuegbar} /> : null}
                </FormularInsel>
              </>
            )}
          </section>

          {v.veranstalter || v.kontakt ? (
            <section aria-labelledby="ev-veranstalter" className="flex flex-col gap-4 border-t border-linie pt-6">
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
                  <span className="flex flex-col leading-snug">
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
                      {telefonZiel ? <a href={telefonZiel}>{v.kontakt.telefon}</a> : v.kontakt.telefon}
                    </span>
                  ) : null}
                  {v.kontakt.email ? (
                    <a
                      href={`mailto:${v.kontakt.email}`}
                      className="flex min-h-12 items-center gap-2.5 wrap-anywhere underline underline-offset-3"
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
    </Seitenrahmen>
  );
}
