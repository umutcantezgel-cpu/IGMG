import { ArrowRight, CalendarDays, ClipboardCheck, MapPin, UsersRound } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { DatumsMarke, KNOPF_PRIMAER, KNOPF_SEKUNDAER, LeerHinweis, Pille } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { datumText, wochenFenster, wochentagKurz, wochentageText, zeitspanne } from '@/lib/lernen/ansicht';
import { termineDerLeitung } from '@/lib/lernen/dienst';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { erfassteAnwesenheiten, gruppenDerLeitung } from '@/server/queries/mein-bereich/unterricht';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('uebersicht') };
}

/**
 * Lehrkraft › Unterricht (AUFTRAG 3.5): „Heute“ mit dem Weg zur Anwesenheit (ein Bildschirm, B-23), die nächsten Tage
 * und die eigenen Gruppen. Nur Konten der Kontoart Lehrkraft mit zweitem Faktor (`verlangeMeinBereich`); Gruppen und
 * Termine nur aus der eigenen Leitung (ADR 0026). Funktion `lernplattform` aus → 404.
 */
export default async function UnterrichtSeite() {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const heute = berlinerDatum(new Date());
  const { von, bis } = wochenFenster(heute);
  const [t, termine, gruppen] = await Promise.all([
    getTranslations('unterricht'),
    termineDerLeitung(kontext, von, bis),
    gruppenDerLeitung(kontext, heute),
  ]);
  const heuteTermine = termine.filter((x) => x.datum === heute);
  const spaeter = termine.filter((x) => x.datum > heute);
  const erfasst = await erfassteAnwesenheiten(heuteTermine.map((x) => x.id));
  const name = new Map(gruppen.map((g) => [g.id, text(g.name, sprache)]));
  const ort = new Map(gruppen.map((g) => [g.id, g.ort]));

  return (
    <MeinBereichRahmen konto={k} aktuell="unterricht" titel={t('titel')} untertitel={t('untertitel')} sprachZiel="/mein-bereich/unterricht">
      <section
        id="heute"
        aria-labelledby="heute-titel"
        className="scroll-mt-6 overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-gruen-950 px-5 py-4 md:px-7">
          <h2 id="heute-titel" className="flex items-center gap-2 text-24 text-weiss">
            <ClipboardCheck aria-hidden className="size-6 text-gruen-100" />
            {t('heute.titel')}
          </h2>
          <p className="text-18 text-gruen-100">{datumText(heute, sprache, 'tag')}</p>
        </div>
        {heuteTermine.length ? (
          <ul className="divide-y divide-linie">
            {heuteTermine.map((termin) => {
              const gruppe = name.get(termin.gruppeId) ?? termin.gruppe;
              const zeit = zeitspanne(termin.beginn, termin.ende);
              const anzahl = erfasst.get(termin.id) ?? 0;
              return (
                <li key={termin.id} className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                  <div className="flex min-w-0 flex-col gap-1">
                    {zeit ? <p className="font-display text-30 leading-none tabular-nums">{zeit}</p> : null}
                    <p className="text-20 font-bold">{gruppe}</p>
                    <p className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                      {ort.get(termin.gruppeId) ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin aria-hidden className="size-4" />
                          {ort.get(termin.gruppeId)}
                        </span>
                      ) : null}
                      {termin.ausgefallen ? <Pille ton="warnung">{t('heute.ausgefallen')}</Pille> : null}
                      {anzahl ? <Pille ton="gruen">{t('heute.erfasst', { anzahl })}</Pille> : null}
                    </p>
                  </div>
                  <Link
                    href={{
                      pathname: '/mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]',
                      params: { gruppe: termin.gruppeId, termin: termin.id },
                    }}
                    prefetch={false}
                    aria-label={t(anzahl ? 'heute.korrigierenAria' : 'heute.anwesenheitAria', { gruppe, zeit })}
                    className={`${anzahl ? KNOPF_SEKUNDAER : KNOPF_PRIMAER} self-start md:self-center`}
                  >
                    <ClipboardCheck aria-hidden className="size-5" />
                    {t(anzahl ? 'heute.korrigieren' : 'heute.anwesenheit')}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-5 md:p-7">
            <LeerHinweis text={t('heute.leer')} />
          </div>
        )}
      </section>

      <Abschnitt id="woche" Icon={CalendarDays} titel={t('woche.titel')}>
        {spaeter.length ? (
          <ul className="flex flex-col divide-y divide-linie">
            {spaeter.map((termin) => (
              <li key={termin.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <DatumsMarke tag={wochentagKurz(termin.datum, sprache)} datum={termin.datum.slice(8, 10)} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: termin.gruppeId } }}
                    prefetch={false}
                    className="font-bold text-tinte no-underline hover:text-gruen-800 hover:underline"
                  >
                    {name.get(termin.gruppeId) ?? termin.gruppe}
                  </Link>
                  <span className="text-16 text-tinte-2 tabular-nums">
                    {datumText(termin.datum, sprache)}
                    {termin.beginn ? ` · ${zeitspanne(termin.beginn, termin.ende)}` : ''}
                  </span>
                </div>
                {termin.ausgefallen ? <Pille ton="warnung">{t('heute.ausgefallen')}</Pille> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinte-2">{t('woche.leer')}</p>
        )}
      </Abschnitt>

      <section aria-labelledby="gruppen-titel" className="flex flex-col gap-4">
        <h2 id="gruppen-titel" className="text-24">
          {t('gruppen.titel')}
        </h2>
        {gruppen.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {gruppen.map((g) => {
              const n = text(g.name, sprache);
              return (
                <li key={g.id} className="flex">
                  <Link
                    href={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: g.id } }}
                    prefetch={false}
                    aria-label={t('gruppen.oeffnenAria', { gruppe: n })}
                    className="group flex w-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 active:scale-98 motion-reduce:active:scale-100"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
                        <UsersRound aria-hidden className="size-6" />
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="mt-3 size-5 text-gruen-700 transition-transform duration-(--dauer-rueckmeldung) group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </span>
                    <span className="text-20 font-bold">{n}</span>
                    <span className="text-16 text-tinte-2">
                      {[wochentageText(g.wochentage, sprache), zeitspanne(g.uhrzeitVon, g.uhrzeitBis)].filter(Boolean).join(' · ')}
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <Pille ton="gruen">{t(`rolle.${g.rolle}`)}</Pille>
                      <Pille>{t('gruppen.lernende', { anzahl: g.lernende })}</Pille>
                      {g.offeneMeldungen ? <Pille ton="warnung">{t('gruppen.meldungen', { anzahl: g.offeneMeldungen })}</Pille> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <LeerHinweis text={t('gruppen.leer')} rahmen />
        )}
      </section>
    </MeinBereichRahmen>
  );
}
