import { CalendarDays, CircleCheck, ListChecks, MessagesSquare, Route, ShieldCheck, UsersRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { waehle, text } from '@/lib/i18n/inhalt';
import { datumText, localeFuer, zeitspanne } from '@/lib/lernen/ansicht';
import { meineZuweisungen, zuweisungsDetails } from '@/lib/lernapp/gruppe/dienst';
import { lernAdresse } from '@/lib/lernapp/adressen';
import type { Konto } from '@/lib/rechte/gemeinde';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { cn } from '@/lib/utils';
import { eigeneEinwilligungAendern } from '@/server/actions/schueler';
import { eigeneEinwilligungen, lernwegVon, meineGruppen } from '@/server/queries/mein-bereich/gruppe';
import { KNOPF_PRIMAER, KNOPF_SEKUNDAER, LeerHinweis, Pille } from './Bausteine';
import { Lernweg } from './Lernweg';

/**
 * Schüler-Start (AUFTRAG 3.5, B-24): Lernweg mit Linie bis zur aktuellen Station, „Meine Gruppe“ mit nächstem Termin
 * und Weg in den Gruppenchat, ab 16 „Meine Einwilligungen“ (DSFA D-11: eigene Zustimmung für Chat und Push).
 * Mit dem Schalter `lernapp_gruppen` zusätzlich die Aufgaben der Lehrkraft in der Lern-App (L7-02) mit Link in die
 * Lektion und Erledigt-Vermerk aus dem Abgleich. Kinder werden geduzt. Daten nur aus dem eigenen Lerndatensatz und den
 * eigenen Gruppen.
 */
export async function SchuelerStart({
  konto,
  sprache,
  heute,
  chatAn,
  rueckmeldung,
}: {
  konto: Konto;
  sprache: Locale;
  heute: string;
  chatAn: boolean;
  rueckmeldung?: 'erteilt' | 'widerrufen';
}) {
  const kontext = await ladeGruppenKontext(konto.benutzerId);
  const [weg, gruppen, eigene, t, tk, zuweisungen] = await Promise.all([
    kontext.eigeneLernendeId ? lernwegVon(kontext.eigeneLernendeId, kontext) : null,
    meineGruppen(kontext, heute),
    eigeneEinwilligungen(kontext, heute),
    getTranslations('lernweg'),
    getTranslations('unterricht.lernapp.kurs'),
    funktionAn('lernapp_gruppen').then((an) => (an ? meineZuweisungen(kontext) : [])),
  ]);
  const details = await zuweisungsDetails(zuweisungen);
  // Lern-App-Oberfläche passend zur Seite: tr bleibt tr, de und en führen auf die deutsche Oberfläche
  const ui = sprache === 'tr' ? 'tr' : 'de';
  const ohneFortschritt = weg ? weg.stationen.every((s) => s.status === null) : true;
  const datumLang = new Intl.DateTimeFormat(localeFuer(sprache), { dateStyle: 'long', timeZone: 'Europe/Berlin' });

  return (
    <>
      <section
        id="lernweg"
        aria-labelledby="lernweg-titel"
        className="scroll-mt-6 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-7"
      >
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="lernweg-titel" className="flex items-center gap-3 text-24">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
              <Route aria-hidden className="size-5" />
            </span>
            {t('titel')}
          </h2>
          {weg ? (
            <p className="font-bold text-gruen-800">
              {t('stand', { kursart: t(`kursart.${weg.kursart}`), aktuell: weg.aktuell + 1, gesamt: weg.stationen.length })}
            </p>
          ) : null}
        </div>
        {weg ? (
          <div className="flex flex-col gap-5">
            <Lernweg
              stationen={weg.stationen.map((s) => {
                const w = waehle(s.titel, sprache);
                return {
                  schluessel: s.id,
                  nr: s.reihenfolge,
                  titel: w.text,
                  titelLang: w.rueckfall ? 'de' : undefined,
                  status: s.status,
                  statusText: t(`status.${s.status ?? 'offen'}`),
                };
              })}
              aktuell={weg.aktuell}
              listenLabel={t('stationenLabel')}
              jetztText={t('jetzt')}
              stationText={(nr) => t('station', { nr })}
            />
            {weg.geschafft ? <p className="text-20 font-bold text-gruen-800">{t('geschafft')}</p> : null}
            {ohneFortschritt ? <p className="text-16 text-tinte-2">{t('leer')}</p> : null}
            {weg.weitere.length ? (
              <ul className="flex flex-col gap-1 text-16 text-tinte-2">
                {weg.weitere.map((w) => (
                  <li key={w.kursart}>{t('weitere', { kursart: t(`kursart.${w.kursart}`), erreicht: w.erreicht, gesamt: w.gesamt })}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <LeerHinweis text={t('keinLernweg')} />
        )}
      </section>

      {zuweisungen.length ? (
        <section
          id="lern-app"
          aria-labelledby="lernapp-titel"
          className="flex scroll-mt-6 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-7"
        >
          <h2 id="lernapp-titel" className="flex items-center gap-3 text-24">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
              <ListChecks aria-hidden className="size-5" />
            </span>
            {t('lernapp.titel')}
          </h2>
          <p className="text-tinte-2">{t('lernapp.text')}</p>
          <ul className="flex flex-col divide-y divide-linie">
            {zuweisungen.map((z) => {
              const d = details.get(z.id);
              const thema = (d?.thema && (d.thema[ui] ?? d.thema.de)) || z.einheit;
              const titel = [thema, d?.nr ? t('lernapp.lektion', { nr: d.nr }) : z.lektion ? null : t('lernapp.ganze')]
                .filter(Boolean)
                .join(' · ');
              const adresse = d?.paketLektion
                ? `${lernAdresse(ui, z.kurs, 'ueben')}?l=${encodeURIComponent(d.paketLektion)}`
                : lernAdresse(ui, z.kurs);
              return (
                <li key={z.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-bold">{titel}</span>
                    <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                      <span>{tk(z.kurs)}</span>
                      {z.faellig ? <span>{t('lernapp.faellig', { datum: datumText(z.faellig, sprache) })}</span> : null}
                      <Pille ton={z.erledigt ? 'gruen' : 'sand'}>
                        {z.erledigt ? <CircleCheck aria-hidden className="size-4" /> : null}
                        {t(z.erledigt ? 'lernapp.erledigt' : 'lernapp.offen')}
                      </Pille>
                    </span>
                  </div>
                  <a href={adresse} aria-label={t('lernapp.oeffnenAria', { titel })} className={KNOPF_SEKUNDAER}>
                    {t('lernapp.oeffnen')}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-16 text-tinte-2">{t('lernapp.hinweis')}</p>
          <a
            href={lernAdresse(ui, 'gruppe')}
            className="inline-flex min-h-12 items-center self-start font-bold underline-offset-4 hover:underline"
          >
            {t('lernapp.gruppe')}
          </a>
        </section>
      ) : null}

      <section aria-labelledby="gruppe-titel" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-7">
        <h2 id="gruppe-titel" className="flex items-center gap-3 text-24">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
            <UsersRound aria-hidden className="size-5" />
          </span>
          {t('gruppeTitel')}
        </h2>
        {gruppen.length ? (
          <ul className="flex flex-col gap-5">
            {gruppen.map((g) => (
              <li key={g.id} className="flex flex-col gap-3">
                <p className="text-20 font-bold">{text(g.name, sprache)}</p>
                <p className="flex items-center gap-2 text-tinte-2">
                  <CalendarDays aria-hidden className="size-5 shrink-0 text-gruen-700" />
                  <span>
                    <span className="font-bold text-tinte">{t('naechster')}: </span>
                    {g.naechster
                      ? [datumText(g.naechster.datum, sprache, 'tag'), zeitspanne(g.naechster.beginn, g.naechster.ende)]
                          .filter(Boolean)
                          .join(', ')
                      : t('keinTermin')}
                  </span>
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={{ pathname: '/mein-bereich/gruppen/[id]', params: { id: g.id } }}
                    prefetch={false}
                    className={KNOPF_SEKUNDAER}
                  >
                    {t('gruppeOeffnen')}
                  </Link>
                  {chatAn && g.chatModus !== 'aus' ? (
                    <Link
                      href={{ pathname: '/mein-bereich/gruppen/[id]/chat', params: { id: g.id } }}
                      prefetch={false}
                      className={KNOPF_PRIMAER}
                    >
                      <MessagesSquare aria-hidden className="size-5" />
                      {t('chatOeffnen')}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tinte-2">{t('keineGruppe')}</p>
        )}
      </section>

      {eigene ? (
        <section
          id="einwilligungen"
          aria-labelledby="einwilligungen-titel"
          className="flex scroll-mt-6 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-7"
        >
          <h2 id="einwilligungen-titel" className="flex items-center gap-3 text-24">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
              <ShieldCheck aria-hidden className="size-5" />
            </span>
            {t('einwilligungen.titel')}
          </h2>
          <p className="max-w-text text-pretty text-tinte-2">{t('einwilligungen.text')}</p>
          <Meldung art="info">{t(`einwilligungen.${eigene.lage}`, { datum: datumText(eigene.ab, sprache, 'lang') })}</Meldung>
          {rueckmeldung ? <Meldung art="erfolg">{t(`einwilligungen.ok.${rueckmeldung}`)}</Meldung> : null}
          <ul className="grid gap-4 xl:grid-cols-2">
            {eigene.arten.map((e) => {
              const titel = t(`einwilligungen.art.${e.art}.titel`);
              return (
                <li key={e.art} className="flex">
                  <article
                    aria-labelledby={`eigen-${e.art}`}
                    className={cn(
                      'flex w-full flex-col gap-3 rounded-lg border p-4 md:p-5',
                      e.gilt ? 'border-gruen-700 bg-gruen-50' : 'border-linie bg-papier',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 id={`eigen-${e.art}`} className="text-20">
                        {titel}
                      </h3>
                      <Pille ton={e.gilt ? 'gruen' : 'sand'}>{t(e.gilt ? 'einwilligungen.gilt' : 'einwilligungen.giltNicht')}</Pille>
                    </div>
                    <p className="text-16 text-pretty">{t(`einwilligungen.art.${e.art}.text`)}</p>
                    {e.eigen ? (
                      <p className="text-16 text-tinte-2">{t('einwilligungen.durchDich', { datum: datumLang.format(e.eigen) })}</p>
                    ) : null}
                    {!e.eigen && e.eltern && eigene.lage === 'uebergang' ? (
                      <p className="text-16 text-tinte-2">
                        {t('einwilligungen.durchEltern', { datum: datumText(eigene.ab, sprache, 'lang') })}
                      </p>
                    ) : null}
                    <form action={eigeneEinwilligungAendern} className="mt-auto">
                      <input type="hidden" name="sprache" value={sprache} />
                      <input type="hidden" name="art" value={e.art} />
                      <input type="hidden" name="aktion" value={e.eigen ? 'widerrufen' : 'erteilen'} />
                      <button
                        type="submit"
                        aria-label={t(e.eigen ? 'einwilligungen.widerrufenAria' : 'einwilligungen.erteilenAria', { titel })}
                        className={e.eigen ? KNOPF_SEKUNDAER : KNOPF_PRIMAER}
                      >
                        {t(e.eigen ? 'einwilligungen.widerrufen' : 'einwilligungen.erteilen')}
                      </button>
                    </form>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
