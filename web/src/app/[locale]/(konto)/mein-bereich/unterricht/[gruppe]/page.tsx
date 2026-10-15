import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  History,
  type LucideIcon,
  MessagesSquare,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { DatumsMarke, KNOPF_LEISE, KNOPF_SEKUNDAER, Pille, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, wochentagKurz, wochentageText, zeitspanne } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { terminAusfallSetzen } from '@/server/actions/lehrkraft';
import { gruppeFuerLeitung, type TerminZeile } from '@/server/queries/mein-bereich/unterricht';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('gruppe') };
}

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Lehrkraft › Gruppe (AUFTRAG 3.5): Kopf mit Zeiten und Chat-Stand, Werkzeuge (Fortschritt nur Lehrkraft, Moderation und
 * Kanäle nur mit Funktion `chat`), nächste Termine mit „ausfallen lassen“, letzte Termine, Lernende (Vorname + Initial,
 * S-14) und Leitung. Fremde Gruppe → 404 (kein Unterschied zu „gibt es nicht“).
 */
export default async function GruppeSeite({ params }: PageProps<'/[locale]/mein-bereich/unterricht/[gruppe]'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const { gruppe: gruppeId } = await params;
  if (!UUID.test(gruppeId)) notFound();
  const heute = berlinerDatum(new Date());
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const [g, chatAn, t] = await Promise.all([
    gruppeFuerLeitung(gruppeId, kontext, heute),
    funktionAn('chat'),
    getTranslations('unterricht'),
  ]);
  if (!g) notFound();
  const name = text(g.name, sprache);
  const tg = (s: string, w?: Record<string, string | number>) => t(`gruppe.${s}`, w);

  const werkzeuge: { schluessel: string; Icon: LucideIcon; titel: string; text: string; ziel: Ziel; zusatz?: string }[] = [
    ...(g.rolle === 'lehrkraft'
      ? [
          {
            schluessel: 'fortschritt',
            Icon: TrendingUp,
            titel: tg('fortschritt'),
            text: tg('fortschrittText'),
            ziel: { pathname: '/mein-bereich/unterricht/[gruppe]/fortschritt', params: { gruppe: g.id } } as Ziel,
          },
        ]
      : []),
    ...(chatAn
      ? [
          {
            schluessel: 'moderation',
            Icon: ShieldCheck,
            titel: tg('moderation'),
            text: tg('moderationText'),
            ziel: { pathname: '/mein-bereich/unterricht/[gruppe]/moderation', params: { gruppe: g.id } } as Ziel,
            zusatz: g.offeneMeldungen ? t('gruppen.meldungen', { anzahl: g.offeneMeldungen }) : undefined,
          },
          {
            schluessel: 'chatGruppe',
            Icon: MessagesSquare,
            titel: tg('chatGruppe'),
            text: tg('chatGruppeText'),
            ziel: { pathname: '/mein-bereich/gruppen/[id]/chat', params: { id: g.id } } as Ziel,
          },
          {
            schluessel: 'chatEltern',
            Icon: Users,
            titel: tg('chatEltern'),
            text: tg('chatElternText'),
            ziel: { pathname: '/mein-bereich/gruppen/[id]/chat', params: { id: g.id }, query: { kanal: 'eltern' } } as Ziel,
          },
        ]
      : []),
  ];

  const anwesenheitsLink = (termin: TerminZeile) => (
    <Link
      href={{ pathname: '/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]', params: { gruppe: g.id, termin: termin.id } }}
      prefetch={false}
      aria-label={tg('anwesenheitAria', { datum: datumText(termin.datum, sprache, 'tag') })}
      className={KNOPF_SEKUNDAER}
    >
      <ClipboardCheck aria-hidden className="size-5" />
      {tg('anwesenheit')}
    </Link>
  );

  const terminZeile = (termin: TerminZeile, vergangen: boolean) => (
    <li key={termin.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <DatumsMarke tag={wochentagKurz(termin.datum, sprache)} datum={termin.datum.slice(8, 10)} hervor={termin.datum === heute} />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-bold">{datumText(termin.datum, sprache, 'tag')}</span>
          <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2 tabular-nums">
            {zeitspanne(termin.beginn, termin.ende)}
            {termin.ausgefallen ? <Pille ton="warnung">{tg('ausgefallen')}</Pille> : null}
            {termin.datum <= heute ? (
              termin.erfasst ? (
                <Pille ton="gruen">{tg('erfasst', { anzahl: termin.erfasst })}</Pille>
              ) : (
                <Pille>{tg('nichtErfasst')}</Pille>
              )
            ) : null}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {termin.datum <= heute ? anwesenheitsLink(termin) : null}
        {!vergangen ? (
          <form action={terminAusfallSetzen}>
            <input type="hidden" name="terminId" value={termin.id} />
            <input type="hidden" name="ausgefallen" value={termin.ausgefallen ? '0' : '1'} />
            <button
              type="submit"
              aria-label={tg(termin.ausgefallen ? 'findetStattAria' : 'ausfallAria', { datum: datumText(termin.datum, sprache, 'tag') })}
              className={KNOPF_LEISE}
            >
              {tg(termin.ausgefallen ? 'findetStatt' : 'ausfall')}
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );

  const zeiten = [wochentageText(g.wochentage, sprache), zeitspanne(g.uhrzeitVon, g.uhrzeitBis)].filter(Boolean).join(' · ');

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="unterricht"
      titel={name}
      untertitel={[zeiten, g.ort].filter(Boolean).join(' · ') || undefined}
      sprachZiel={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: g.id } }}
      zwischen={[{ label: t('titel'), ziel: '/mein-bereich/unterricht' }]}
    >
      <ZurueckLink ziel="/mein-bereich/unterricht" text={tg('zurueck')} />
      <div className="flex flex-wrap gap-2">
        <Pille ton="gruen">{t(`rolle.${g.rolle}`)}</Pille>
        <Pille>{t('gruppen.lernende', { anzahl: g.lernende.length })}</Pille>
        {chatAn ? (
          <Pille ton={g.chatModus === 'offen' ? 'info' : 'sand'}>
            {tg(`chatModus.${g.chatModus}`, { von: g.chatVon, bis: g.chatBis })}
          </Pille>
        ) : null}
      </div>

      {werkzeuge.length ? (
        <section aria-labelledby="werkzeuge-titel" className="flex flex-col gap-4">
          <h2 id="werkzeuge-titel" className="sr-only">
            {tg('werkzeuge')}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {werkzeuge.map(({ schluessel, Icon, titel, text: beschreibung, ziel, zusatz }) => (
              <li key={schluessel} className="flex">
                <Link
                  href={ziel}
                  prefetch={false}
                  className="group flex w-full druck items-center gap-4 rounded-lg border border-linie bg-weiss p-4 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-18 font-bold">{titel}</span>
                    <span className="text-16 text-pretty text-tinte-2">{beschreibung}</span>
                    {zusatz ? (
                      <Pille ton="warnung" className="mt-1 self-start">
                        {zusatz}
                      </Pille>
                    ) : null}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0 text-gruen-700 transition-transform duration-(--dauer-rueckmeldung) motion-safe:group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Abschnitt id="termine" Icon={CalendarDays} titel={tg('termineTitel')}>
        {g.kommende.length ? (
          <ul className="flex flex-col divide-y divide-linie">{g.kommende.map((x) => terminZeile(x, false))}</ul>
        ) : (
          <p className="text-tinte-2">{tg('termineLeer')}</p>
        )}
      </Abschnitt>

      {g.vergangene.length ? (
        <Abschnitt id="vergangen" Icon={History} titel={tg('vergangeneTitel')}>
          <ul className="flex flex-col divide-y divide-linie">{g.vergangene.map((x) => terminZeile(x, true))}</ul>
        </Abschnitt>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="min-w-0 xl:col-span-3">
          <Abschnitt id="lernende" Icon={UserRound} titel={tg('lernendeTitel')}>
            {g.lernende.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {g.lernende.map((l) => (
                  <li key={l.id} className="flex flex-col gap-1 rounded-md bg-papier px-4 py-3">
                    <span className="font-bold">{l.name}</span>
                    {l.fehltAm.length ? (
                      <span className="text-16 text-tinte-2">
                        {tg('fehltAm', { daten: l.fehltAm.map((d) => datumText(d, sprache)).join(', ') })}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-tinte-2">{tg('lernendeLeer')}</p>
            )}
          </Abschnitt>
        </div>
        <div className="min-w-0 xl:col-span-2">
          <Abschnitt id="leitung" Icon={Users} titel={tg('leitungTitel')}>
            <ul className="flex flex-col gap-2">
              {g.leitung.map((l, i) => (
                <li key={`${l.name}-${i}`} className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{l.ich ? `${l.name} (${tg('ich')})` : l.name}</span>
                  <Pille>{t(`rolle.${l.rolle}`)}</Pille>
                </li>
              ))}
            </ul>
          </Abschnitt>
        </div>
      </div>
    </MeinBereichRahmen>
  );
}
