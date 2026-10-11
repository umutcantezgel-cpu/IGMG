import { ArrowRight, Award, Calendar, Mail, Newspaper, Phone, Star, Target } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { EventCard } from '@/components/website/EventCard';
import { NewsCard } from '@/components/website/NewsCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { OrganisationInhalt } from '@/lib/validierung/seiteninhalte/organisation';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { OrgKarte } from './OrgKarte';
import { KENNUNG, KUERZEL_ALLE, type Kuerzel, STIL, SYMBOL } from './stil';

/** Termine und Meldungen je Organisation (Blatt C11: je drei Einträge). */
const ANZAHL = 3;

const KNOPF =
  'inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss';
const MEHR = 'inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4';

export type OrganizationPageProps = {
  /** Organisation (Enum at | kt | gt | kgt, D-06). Unbekannte Adressen prüft die Seite vorher (notFound). */
  org: Kuerzel;
  /** Seiteninhalt „organisation“ dieser Organisation (ladeSeiteninhalt('organisation-<slug>')). */
  inhalt: OrganisationInhalt;
  /** Sichtbare Veranstaltungen (ladeVeranstaltungen); die Komponente zeigt die kommenden dieser Organisation. */
  veranstaltungen: VeranstaltungsDaten[];
  /** Veröffentlichte Nachrichten (ladeNachrichten); die Komponente zeigt die dieser Organisation. */
  nachrichten: NachrichtDaten[];
};

/** Rückfall auf Deutsch nötig, wenn ein gezeigter Text nur auf Deutsch vorliegt (K-02). */
function brauchtRueckfall(sprache: Sprache, felder: (Mehrsprachig | null | undefined)[]): boolean {
  return felder.some((f) => {
    const w = waehle(f, sprache);
    return w.rueckfall && w.text !== '';
  });
}

/**
 * Organisationsseite (Blatt C11, design/OrganizationPage.dc.html): Kopf mit Logo und Organisationsfarbe, Über,
 * Mission, Vision, Aktivitäten, Veranstaltungen, Nachrichten, Kontakt und die übrigen Organisationen.
 * Reine Server-Komponente ohne Interaktion; Farben nur über Tokens, alle Texte aus messages/Seiteninhalt.
 */
export async function OrganizationPage({ org, inhalt, veranstaltungen, nachrichten }: OrganizationPageProps) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('organisation');
  const tk = await getTranslations('karten');
  const ta = await getTranslations('allgemein');
  const s = STIL[org];
  const kennung = KENNUNG[org];
  const name = t(`${kennung}.title`);
  const termine = veranstaltungen.filter((v) => v.organisation === org && !v.vergangen).slice(0, ANZAHL);
  const meldungen = nachrichten.filter((n) => n.organisation === org).slice(0, ANZAHL);
  const mail = z.email().safeParse(inhalt.kontakt.email).success ? inhalt.kontakt.email : null;
  const hinweis = (felder: (Mehrsprachig | null | undefined)[]) =>
    brauchtRueckfall(sprache, felder) ? <p className="text-16 text-tinte-2">{ta('nurDeutsch')}</p> : null;

  return (
    <>
      <PageHeader
        kennung={kennung}
        titel={name}
        untertitel={t(`${kennung}.subtitle`)}
        logo={s.logo}
        logoAlt={t('logoAlt', { name })}
        akzent={s.akzent}
        flaeche={s.tint}
        kennungFarbe={s.ink}
      />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 pt-8 pb-12 md:gap-16 md:px-8 md:pt-16 md:pb-24">
        <section aria-labelledby={`${org}-ueber`} className="flex flex-wrap items-stretch gap-6">
          <div className="flex min-w-0 flex-[3_1_520px] flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
            <h2 id={`${org}-ueber`} className="flex items-center gap-2.5 text-30 md:text-36">
              <span className={cn('flex', s.ink)}>
                <Target aria-hidden className="size-7" />
              </span>
              {t(`${kennung}.aboutTitle`)}
            </h2>
            <Text feld={inhalt.beschreibung} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty" />
            {hinweis([inhalt.beschreibung, inhalt.mission, inhalt.vision])}
          </div>
          <div className="flex min-w-0 flex-[2_1_360px] flex-col gap-4">
            <div className={cn('flex flex-1 flex-col overflow-hidden rounded-lg', s.tint)}>
              <div aria-hidden className={cn('h-1.5', s.band)} />
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h3 className="flex items-center gap-2 text-24">
                  <span className={cn('flex', s.ink)}>
                    <Award aria-hidden className="size-6" />
                  </span>
                  {t('about.mission')}
                </h3>
                <Text feld={inhalt.mission} sprache={sprache} als="p" />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-lg border border-linie bg-weiss p-6">
              <h3 className="flex items-center gap-2 text-24">
                <span className={cn('flex', s.ink)}>
                  <Star aria-hidden className="size-6" />
                </span>
                {t('about.vision')}
              </h3>
              <Text feld={inhalt.vision} sprache={sprache} als="p" />
            </div>
          </div>
        </section>

        {inhalt.aktivitaeten.length ? (
          <section aria-labelledby={`${org}-aktiv`} className="flex flex-col gap-5">
            <h2 id={`${org}-aktiv`} className="text-30 md:text-36">
              {t('activities.title')}
            </h2>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
              {inhalt.aktivitaeten.map((a, i) => {
                const Icon = SYMBOL[a.symbol];
                return (
                  <li key={i} className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
                    <span className={cn('flex size-12 items-center justify-center rounded-lg', s.tint, s.ink)}>
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <Text feld={a.titel} sprache={sprache} als="h3" className="text-20 leading-snug font-bold" />
                    <Text feld={a.text} sprache={sprache} als="p" className="text-16 text-tinte-2" />
                  </li>
                );
              })}
            </ul>
            {hinweis(inhalt.aktivitaeten.flatMap((a) => [a.titel, a.text]))}
          </section>
        ) : null}

        <div className="flex flex-wrap items-start gap-6">
          <section
            aria-labelledby={`${org}-termine`}
            className="flex min-w-0 flex-[1_1_440px] flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8"
          >
            <h2 id={`${org}-termine`} className="flex items-center gap-2.5 text-30">
              <span className={cn('flex', s.ink)}>
                <Calendar aria-hidden className="size-7" />
              </span>
              {t('events.title')}
            </h2>
            {termine.length ? (
              <ul className="flex flex-col gap-4">
                {termine.map((v) => (
                  <li key={v.id}>
                    <EventCard v={v} sprache={sprache} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{t('events.leer')}</p>
            )}
            <Link href="/veranstaltungen" className={MEHR}>
              {t('events.all')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </section>

          <section
            aria-labelledby={`${org}-news`}
            className="flex min-w-0 flex-[1_1_440px] flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8"
          >
            <h2 id={`${org}-news`} className="flex items-center gap-2.5 text-30">
              <span className={cn('flex', s.ink)}>
                <Newspaper aria-hidden className="size-7" />
              </span>
              {t('news.title')}
            </h2>
            {meldungen.length ? (
              <ul className="flex flex-col gap-4">
                {meldungen.map((n) => (
                  <li key={n.id}>
                    <NewsCard n={n} sprache={sprache} variante="standard" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{t('news.leer')}</p>
            )}
          </section>
        </div>

        <section aria-labelledby={`${org}-kontakt`} className={cn('overflow-hidden rounded-lg', s.tint)}>
          <div aria-hidden className={cn('h-1.5', s.band)} />
          <div className="flex flex-col gap-6 p-5 md:p-10">
            <h2 id={`${org}-kontakt`} className="flex items-center gap-2.5 text-30">
              <span className={cn('flex', s.ink)}>
                <Phone aria-hidden className="size-7" />
              </span>
              {t('contact.title')}
            </h2>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <dt className={cn('font-bold', s.ink)}>{t('contact.address')}</dt>
                <dd>
                  {t('contact.gemeinde')}
                  <br />
                  {inhalt.kontakt.adresse}
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <dt className={cn('font-bold', s.ink)}>{t('contact.phone')}</dt>
                <dd>{inhalt.kontakt.telefon}</dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <dt className={cn('font-bold', s.ink)}>{t('contact.email')}</dt>
                <dd className="[overflow-wrap:anywhere]">
                  {mail ? (
                    <a href={`mailto:${mail}`} className="text-tinte underline underline-offset-[3px]">
                      {mail}
                    </a>
                  ) : (
                    inhalt.kontakt.email
                  )}
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <dt className={cn('font-bold', s.ink)}>{t('contact.hours')}</dt>
                <dd className="flex flex-col">
                  {inhalt.oeffnungszeiten.map((zeile, i) => (
                    <Text key={i} feld={zeile} sprache={sprache} className="block" />
                  ))}
                </dd>
              </div>
            </dl>
            {hinweis(inhalt.oeffnungszeiten)}
            {mail ? (
              <a href={`mailto:${mail}`} aria-label={`${t('contact.button')}: ${name}`} className={KNOPF}>
                <Mail aria-hidden className="size-5" />
                {t('contact.button')}
              </a>
            ) : null}
          </div>
        </section>

        <section aria-labelledby={`${org}-orgs`} className="flex flex-col gap-5">
          <h2 id={`${org}-orgs`} className="text-30 md:text-36">
            {t('orgs.title')}
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
            {KUERZEL_ALLE.filter((k) => k !== org).map((k) => (
              <li key={k}>
                <OrgKarte kuerzel={k} name={t(`${KENNUNG[k]}.title`)} kurz={tk(`org_${k}`)} beschreibung={t('orgs.beschreibung')} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
