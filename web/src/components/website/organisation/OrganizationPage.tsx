import { ArrowRight, Award, Mail, Telescope } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { Stern8 } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { Text } from '@/components/website/Text';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { OrganisationInhalt } from '@/lib/validierung/seiteninhalte/organisation';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import type { VeranstaltungsDaten } from '@/server/queries/veranstaltungen';
import { FamilieDerVier } from './FamilieDerVier';
import { OrgKarte } from './OrgKarte';
import { OrgMeldungen } from './OrgMeldungen';
import { OrgTermine } from './OrgTermine';
import { KENNUNG, KUERZEL_ALLE, type Kuerzel, MEHR_LINK, STIL, SYMBOL } from './stil';

/** Termine und Meldungen je Organisation (Blatt C11: je drei Einträge). */
const ANZAHL = 3;

const KNOPF =
  'inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss druck';

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
  const tStart = await getTranslations('start');
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
        zierde={<FamilieDerVier org={org} beschriftet />}
      />
      {/* Komposition nach der Referenz (O-12): Abschnitte im Wechsel Papier/Sand, Kopfzeilen mit text-display-2 */}
      <div className="bg-papier">
        <section
          aria-labelledby={`${org}-ueber`}
          className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-3">
              <p className={cn('flex items-center gap-2 text-16 font-bold', s.ink)}>
                <Stern8 className="size-4" />
                {t('about.kennung')}
              </p>
              <h2 id={`${org}-ueber`} className="text-display-2">
                {t(`${kennung}.aboutTitle`)}
              </h2>
            </div>
            <Text feld={inhalt.beschreibung} sprache={sprache} als="p" className="max-w-text text-18 leading-relaxed text-pretty" />
            {hinweis([inhalt.beschreibung, inhalt.mission, inhalt.vision])}
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div className={cn('flex flex-col overflow-hidden rounded-lg', s.tint)}>
              <div aria-hidden className={cn('h-1.5 shrink-0', s.band)} />
              <div className="flex flex-col gap-2 px-6 pt-4.5 pb-6">
                <h3 className="flex items-center gap-2 font-text text-20 leading-snug font-bold tracking-normal">
                  <Award aria-hidden className={cn('size-6 shrink-0', s.ink)} />
                  {t('about.mission')}
                </h3>
                <Text feld={inhalt.mission} sprache={sprache} als="p" />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-6">
              <h3 className="flex items-center gap-2 font-text text-20 leading-snug font-bold tracking-normal">
                <Telescope aria-hidden className={cn('size-6 shrink-0', s.ink)} />
                {t('about.vision')}
              </h3>
              <Text feld={inhalt.vision} sprache={sprache} als="p" />
            </div>
          </div>
        </section>
      </div>

      {inhalt.aktivitaeten.length ? (
        <div className="border-y border-linie bg-sand">
          <section
            aria-labelledby={`${org}-aktiv`}
            className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8"
          >
            <div className="flex max-w-einleitung flex-col gap-3">
              <p className={cn('flex items-center gap-2 text-16 font-bold', s.ink)}>
                <Stern8 className="size-4" />
                {t('activities.kennung')}
              </p>
              <h2 id={`${org}-aktiv`} className="text-display-2">
                {t('activities.title')}
              </h2>
            </div>
            <ul className="grid raster-kacheln gap-x-8 gap-y-10">
              {inhalt.aktivitaeten.map((a, i) => {
                const Icon = SYMBOL[a.symbol];
                return (
                  <li key={i} className={cn('flex flex-col gap-3 border-t-2 pt-5', s.akzent)}>
                    <h3 className="flex items-center gap-2 font-text text-20 leading-snug font-bold tracking-normal">
                      <Icon aria-hidden className={cn('size-6 shrink-0', s.ink)} />
                      <Text feld={a.titel} sprache={sprache} als="span" />
                    </h3>
                    <Text feld={a.text} sprache={sprache} als="p" className="text-18 text-tinte-2" />
                  </li>
                );
              })}
            </ul>
            {hinweis(inhalt.aktivitaeten.flatMap((a) => [a.titel, a.text]))}
          </section>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt md:px-8">
        <div className="grid grid-cols-1 gap-x-12 gap-y-abschnitt-klein lg:grid-cols-2">
          <section aria-labelledby={`${org}-termine`} className={cn('flex min-w-0 flex-col gap-3 border-t-2 pt-6', s.akzent)}>
            <h2 id={`${org}-termine`} className="text-display-2">
              {t('events.title')}
            </h2>
            {termine.length ? (
              <OrgTermine termine={termine} sprache={sprache} org={org} />
            ) : (
              <div className="flex items-center gap-4 py-4">
                <Zustandsgrafik art="leer" groesse={48} />
                <p className="text-tinte-2">{t('events.leer')}</p>
              </div>
            )}
            <Link href="/veranstaltungen" className={MEHR_LINK}>
              {t('events.all')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </section>

          <section aria-labelledby={`${org}-news`} className={cn('flex min-w-0 flex-col gap-3 border-t-2 pt-6', s.akzent)}>
            <h2 id={`${org}-news`} className="text-display-2">
              {t('news.title')}
            </h2>
            {meldungen.length ? (
              <OrgMeldungen meldungen={meldungen} sprache={sprache} />
            ) : (
              <div className="flex items-center gap-4 py-4">
                <Zustandsgrafik art="leer" groesse={48} />
                <p className="text-tinte-2">{t('news.leer')}</p>
              </div>
            )}
            <Link href="/nachrichten" className={MEHR_LINK}>
              {tStart('alleNeuigkeiten')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </section>
        </div>

        <section aria-labelledby={`${org}-kontakt`} className={cn('overflow-hidden rounded-lg', s.tint)}>
          <div aria-hidden className={cn('h-1.5', s.band)} />
          <div className="flex flex-col gap-6 p-5 md:p-10">
            <h2 id={`${org}-kontakt`} className="text-display-2">
              {t('contact.title')}
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <dd className="wrap-anywhere">
                  {mail ? (
                    <a href={`mailto:${mail}`} className="text-tinte underline underline-offset-3">
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
      </div>

      <div className="border-t border-linie bg-sand">
        <section
          aria-labelledby={`${org}-orgs`}
          className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt md:px-8"
        >
          <div className="flex max-w-einleitung flex-col gap-3">
            <p className={cn('flex items-center gap-2 text-16 font-bold', s.ink)}>
              <Stern8 className="size-4" />
              {t('orgs.kennung')}
            </p>
            <h2 id={`${org}-orgs`} className="text-display-2">
              {t('orgs.title')}
            </h2>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {KUERZEL_ALLE.map((k) => (
              <li key={k}>
                <OrgKarte
                  kuerzel={k}
                  name={t(`${KENNUNG[k]}.title`)}
                  kurz={tk(`org_${k}`)}
                  beschreibung={t('orgs.beschreibung')}
                  aktuell={k === org}
                  aktuellText={t('orgs.aktuell')}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
