import { BookOpenCheck, CalendarX2, ClipboardList, KeyRound, MessagesSquare, ShieldCheck, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Haken } from '@/components/konto/Haken';
import { FehlmeldungFormular, type FehlmeldungTexte } from '@/components/kinder/FehlmeldungFormular';
import { Kinderzugang, type KinderzugangTexte } from '@/components/kinder/Kinderzugang';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { KNOPF_PRIMAER, KNOPF_SEKUNDAER, LeerHinweis, Pille, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { Lernweg } from '@/components/mein-bereich/Lernweg';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text, waehle } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { anwesenheitsZaehlung, datumText, localeFuer, zeitspanne } from '@/lib/lernen/ansicht';
import { lernendenUebersicht } from '@/lib/lernen/dienst';
import { tagPlus } from '@/lib/lernen/termine';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { adresse } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { einwilligungAendern } from '@/server/actions/kinder';
import { lageFuerEltern, lernwegVon } from '@/server/queries/mein-bereich/gruppe';
import { einwilligungenDesKindes, kinderzugang, kindKopf } from '@/server/queries/mein-bereich/kinder';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kinder.meta');
  return { title: t('kind') };
}

const UUID = /^[0-9a-f-]{36}$/i;
const STATUS_TON = { anwesend: 'gruen', verspaetet: 'info', entschuldigt: 'sand', fehlt: 'fehler' } as const;

/**
 * Eltern › Kind (AUFTRAG 3.5, ADR 0026): nächster Termin, „Kind fehlt“ melden, Anwesenheitsverlauf, Fortschritt je Stufe
 * (Lernweg wie beim Kind), Einwilligungen einzeln erteilen/widerrufen (Formulare ohne JavaScript, Widerruf wirkt sofort),
 * Kinderzugang mit druckbarer Zugangskarte und der Elternkanal. Fremde Kinder → 404.
 */
export default async function KindSeite({ params, searchParams }: PageProps<'/[locale]/mein-bereich/kinder/[id]'>) {
  if (!(await funktionAn('lernplattform'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['eltern']);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const kopf = await kindKopf(id, kontext);
  if (!kopf) notFound();
  const heute = berlinerDatum(new Date());
  const [uebersicht, weg, einwilligungen, zugang, chatAn, t, tu] = await Promise.all([
    lernendenUebersicht(id, kontext),
    lernwegVon(id, kontext),
    einwilligungenDesKindes(id, kontext),
    kinderzugang(id, kontext),
    funktionAn('chat'),
    getTranslations('kinder.detail'),
    getTranslations('unterricht.fortschritt'),
  ]);
  if (!einwilligungen) notFound();

  const gruppenName = new Map(uebersicht.gruppen.map((g) => [g.id, g.name]));
  const ortVon = new Map(uebersicht.gruppen.map((g) => [g.id, g.ort]));
  const termine = uebersicht.naechste;
  const naechster = termine.find((x) => !x.ausgefallen) ?? null;
  const danach = termine.filter((x) => x !== naechster).slice(0, 3);
  const gemeldet = [...new Map(uebersicht.fehlmeldungen.map((f) => [f.datum, f])).values()];
  const zaehlung = anwesenheitsZaehlung(uebersicht.anwesenheit.map((a) => a.status));
  const datumZeit = (d: string, b: string | null, e: string | null) =>
    [datumText(d, sprache, 'tag'), zeitspanne(b, e)].filter(Boolean).join(', ');
  const kinderkontoAktiv = einwilligungen.find((e) => e.art === 'kinderkonto')?.aktiv ?? false;
  const datumLang = new Intl.DateTimeFormat(localeFuer(sprache), { dateStyle: 'long', timeZone: 'Europe/Berlin' });
  const rueckmeldungArt = typeof sp.art === 'string' ? sp.art : null;
  // D-11: ab 16 (nach 30 Tagen Übergang) entscheidet das Kind über Chat und Push selbst
  const sechzehn = lageFuerEltern(kopf.sechzehnAm, heute);

  const fehlTexte: FehlmeldungTexte = {
    datum: t('fehlen.datum'),
    grund: t('fehlen.grund'),
    gruende: {
      krank: t('fehlen.gruende.krank'),
      familie: t('fehlen.gruende.familie'),
      schule: t('fehlen.gruende.schule'),
      sonstiges: t('fehlen.gruende.sonstiges'),
    },
    senden: t('fehlen.senden'),
    gesendet: t('fehlen.gesendet'),
    fehler: t('fehlen.fehler'),
  };
  const zt = (s: string) => t(`zugang.${s}`);
  const zugangTexte: KinderzugangTexte = {
    benutzername: zt('benutzername'),
    benutzernameHilfe: zt('benutzernameHilfe'),
    passwort: zt('passwort'),
    passwortHilfe: zt('passwortHilfe'),
    vorschlag: zt('vorschlag'),
    anlegen: zt('anlegen'),
    neuesPasswort: zt('neuesPasswort'),
    zuruecksetzenTitel: zt('zuruecksetzenTitel'),
    zuruecksetzenText: zt('zuruecksetzenText'),
    zuruecksetzen: zt('zuruecksetzen'),
    gesperrt: zt('gesperrt'),
    angelegt: zt('angelegt'),
    gesetzt: zt('gesetzt'),
    fehler: Object.fromEntries(
      [
        'kurz',
        'lang',
        'zeichen',
        'vergeben',
        'passwort',
        'keinElternteil',
        'keineEinwilligung',
        'bereitsKonto',
        'keinZugang',
        'zuViele',
        'unbekannt',
      ].map((f) => [f, zt(`fehler.${f}`)]),
    ),
    karteTitel: zt('karteTitel'),
    karteText: zt('karteText'),
    karteEinmal: zt('karteEinmal'),
    karteOhnePasswort: zt('karteOhnePasswort'),
    karteKopf: zt('karteKopf'),
    karteFuer: t.raw('zugang.karteFuer') as string,
    anmeldung: zt('anmeldung'),
    passwortZeile: zt('passwortZeile'),
    passwortLeer: zt('passwortLeer'),
    drucken: zt('drucken'),
  };

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="kinder"
      titel={kopf.name}
      untertitel={uebersicht.gruppen.map((g) => text(g.name, sprache)).join(', ') || undefined}
      sprachZiel={{ pathname: '/mein-bereich/kinder/[id]', params: { id } }}
      zwischen={[{ label: t('zurueck'), ziel: '/mein-bereich/kinder' }]}
    >
      <ZurueckLink ziel="/mein-bereich/kinder" text={t('zurueck')} />

      <div className="grid gap-4 lg:grid-cols-2 print:hidden">
        <section aria-labelledby="naechster-titel" className="flex flex-col gap-4 rounded-lg bg-gruen-950 p-6 text-weiss">
          <h2 id="naechster-titel" className="text-18 font-bold text-gruen-100">
            {t('naechsterTitel')}
          </h2>
          {naechster ? (
            <div className="flex flex-col gap-1">
              <p className="font-display text-30 leading-tight">{datumText(naechster.datum, sprache, 'tag')}</p>
              <p className="text-20 tabular-nums">{zeitspanne(naechster.beginn, naechster.ende)}</p>
              <p className="text-gruen-100">
                {text(gruppenName.get(naechster.gruppeId), sprache)}
                {ortVon.get(naechster.gruppeId) ? ` · ${t('ort', { ort: ortVon.get(naechster.gruppeId)! })}` : ''}
              </p>
            </div>
          ) : (
            <p>{t('keinTermin')}</p>
          )}
          {danach.length ? (
            <div className="flex flex-col gap-1 border-t border-gruen-800 pt-3">
              <p className="text-16 font-bold text-gruen-100">{t('danach')}</p>
              <ul className="flex flex-col gap-0.5 text-16">
                {danach.map((x) => (
                  <li key={x.id} className={cn('tabular-nums', x.ausgefallen && 'text-gruen-100 line-through')}>
                    {datumZeit(x.datum, x.beginn, x.ende)}
                    {x.ausgefallen ? <span className="ms-2 no-underline">({t('ausgefallen')})</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="fehlen-titel" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
              <CalendarX2 aria-hidden className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 id="fehlen-titel" className="pt-1 text-24">
                {t('fehlenTitel')}
              </h2>
              <p className="text-16 text-pretty text-tinte-2">{t('fehlenText')}</p>
            </div>
          </div>
          <FehlmeldungFormular
            lernendeId={id}
            vorschlag={naechster?.datum ?? heute}
            min={heute}
            max={tagPlus(heute, 60)}
            texte={fehlTexte}
          />
          {gemeldet.length ? (
            <div className="flex flex-col gap-1.5 border-t border-linie pt-3">
              <p className="text-16 font-bold">{t('fehlen.gemeldetTitel')}</p>
              <ul className="flex flex-wrap gap-2">
                {gemeldet.map((f) => (
                  <li key={f.datum}>
                    <Pille>{t('fehlen.gemeldet', { datum: datumText(f.datum, sprache), grund: t(`fehlen.gruende.${f.grund}`) })}</Pille>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <div className="flex flex-col gap-8 print:hidden">
        <Abschnitt id="anwesenheit" Icon={ClipboardList} titel={t('anwesenheitTitel')}>
          {uebersicht.anwesenheit.length ? (
            <div className="flex flex-col gap-4">
              <p className="max-w-text text-pretty">{t('anwesenheitSatz', { gesamt: uebersicht.anwesenheit.length, ...zaehlung })}</p>
              <ul className="flex flex-wrap gap-2">
                {uebersicht.anwesenheit.slice(0, 12).map((a, i) => (
                  <li key={`${a.datum}-${i}`}>
                    <Pille ton={STATUS_TON[a.status]}>
                      <span className="tabular-nums">{datumText(a.datum, sprache)}</span>
                      <span className="font-normal">{t(`status.${a.status}`)}</span>
                    </Pille>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-tinte-2">{t('anwesenheitLeer')}</p>
          )}
        </Abschnitt>

        <Abschnitt id="fortschritt" Icon={TrendingUp} titel={t('fortschrittTitel')}>
          {weg && uebersicht.fortschritt.length ? (
            <div className="flex flex-col gap-5">
              <p className="font-bold text-gruen-800">
                {t('fortschrittStand', { kursart: tu(`kursart.${weg.kursart}`), aktuell: weg.aktuell + 1, gesamt: weg.stationen.length })}
              </p>
              <Lernweg
                stationen={weg.stationen.map((s) => {
                  const w = waehle(s.titel, sprache);
                  return {
                    schluessel: s.id,
                    nr: s.reihenfolge,
                    titel: w.text,
                    titelLang: w.rueckfall ? 'de' : undefined,
                    status: s.status,
                    statusText: t(`fortschrittStatus.${s.status ?? 'offen'}`),
                  };
                })}
                aktuell={weg.aktuell}
                listenLabel={t('fortschrittTitel')}
                jetztText={t(`fortschrittStatus.${weg.stationen[weg.aktuell]?.status ?? 'offen'}`)}
                stationText={(nr) => tu('stufe', { nr })}
                zusatz={
                  weg.weitere.length ? (
                    <ul className="flex flex-col gap-1 text-16 text-tinte-2">
                      {weg.weitere.map((w) => (
                        <li key={w.kursart}>
                          {t('fortschrittWeitere', { kursart: tu(`kursart.${w.kursart}`), erreicht: w.erreicht, gesamt: w.gesamt })}
                        </li>
                      ))}
                    </ul>
                  ) : null
                }
              />
            </div>
          ) : (
            <p className="text-tinte-2">{t('fortschrittLeer')}</p>
          )}
          {uebersicht.hifz.length ? (
            <div className="mt-6 flex flex-col gap-2 border-t border-linie pt-5">
              <h3 className="flex items-center gap-2 text-20">
                <BookOpenCheck aria-hidden className="size-5 text-gruen-700" />
                {t('hifzTitel')}
              </h3>
              <ul className="flex flex-col gap-1">
                {uebersicht.hifz.slice(0, 8).map((h) => (
                  <li key={h.id} className="flex flex-wrap justify-between gap-x-4">
                    <span>{t('hifzEintrag', { sure: h.sure, von: h.vonVers, bis: h.bisVers })}</span>
                    <span className="text-16 text-tinte-2">{datumText(h.datum, sprache)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Abschnitt>

        <Abschnitt id="einwilligungen" Icon={ShieldCheck} titel={t('einwilligungenTitel')} text={t('einwilligungenText')}>
          {sechzehn.lage !== 'eltern' && sechzehn.ab ? (
            <div className="mb-4">
              <Meldung art="info">
                {t(`sechzehn.${sechzehn.lage}`, { name: kopf.name, datum: datumText(sechzehn.ab, sprache, 'lang') })}
              </Meldung>
            </div>
          ) : null}
          <ul className="grid gap-4 xl:grid-cols-2">
            {einwilligungen.map((e) => {
              const titel = t(`einwilligung.${e.art}.titel`);
              const hier = rueckmeldungArt === e.art;
              const zugangLoeschen = e.art === 'kinderkonto' && zugang !== null;
              const nurKind = sechzehn.lage === 'eigene' && (e.art === 'gruppenchat' || e.art === 'push_kind');
              return (
                <li key={e.art} id={`einwilligung-${e.art}`} className="flex scroll-mt-6">
                  <article
                    aria-labelledby={`einwilligung-${e.art}-titel`}
                    className={cn(
                      'flex w-full flex-col gap-3 rounded-lg border p-4 md:p-5',
                      e.aktiv ? 'border-gruen-700 bg-gruen-50' : 'border-linie bg-papier',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 id={`einwilligung-${e.art}-titel`} className="text-20">
                        {titel}
                      </h3>
                      {nurKind ? null : <Pille ton={e.aktiv ? 'gruen' : 'sand'}>{t(e.aktiv ? 'aktiv' : 'inaktiv')}</Pille>}
                    </div>
                    <p className="text-16 text-pretty">{t(`einwilligung.${e.art}.text`)}</p>
                    <p className="text-16 text-tinte-2">
                      {nurKind
                        ? null
                        : e.aktiv && e.erteiltAm
                          ? t('erteiltAm', { datum: datumLang.format(e.erteiltAm), von: t(e.durchMich ? 'durchSie' : 'durchAndere') })
                          : e.widerrufenAm
                            ? t('widerrufenAm', { datum: datumLang.format(e.widerrufenAm) })
                            : null}
                    </p>
                    {hier && typeof sp.ok === 'string' && ['erteilt', 'widerrufen'].includes(sp.ok) ? (
                      <Meldung art="erfolg">{t(`ok.${sp.ok}`)}</Meldung>
                    ) : null}
                    {hier &&
                    typeof sp.fehler === 'string' &&
                    ['einvernehmen', 'bestaetigen', 'sorgerecht', 'nurKind'].includes(sp.fehler) ? (
                      <Meldung art="fehler">{sp.fehler === 'nurKind' ? t('sechzehn.nurKind') : t(`fehler.${sp.fehler}`)}</Meldung>
                    ) : null}
                    {nurKind ? (
                      <p className="mt-auto font-bold text-gruen-800">{t('sechzehn.nurKind')}</p>
                    ) : (
                      <form action={einwilligungAendern} className="mt-auto flex flex-col gap-3">
                        <input type="hidden" name="sprache" value={sprache} />
                        <input type="hidden" name="lernendeId" value={id} />
                        <input type="hidden" name="art" value={e.art} />
                        <input type="hidden" name="aktion" value={e.aktiv ? 'widerrufen' : 'erteilen'} />
                        {e.aktiv ? (
                          zugangLoeschen ? (
                            <>
                              <p className="text-16 font-bold text-warnung">{t('zugangWarnung')}</p>
                              <Haken id={`bestaetigt-${e.art}`} name="bestaetigt" label={t('zugangBestaetigen')} />
                            </>
                          ) : null
                        ) : (
                          <Haken id={`einvernehmen-${e.art}`} name="einvernehmen" label={t('einvernehmen')} />
                        )}
                        <button
                          type="submit"
                          aria-label={t(e.aktiv ? 'widerrufenAria' : 'erteilenAria', { titel })}
                          className={cn(e.aktiv ? KNOPF_SEKUNDAER : KNOPF_PRIMAER, 'self-start')}
                        >
                          {t(e.aktiv ? 'widerrufen' : 'erteilen')}
                        </button>
                      </form>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-16">
            <Link href="/datenschutz" prefetch={false} className="font-bold underline-offset-4">
              {t('datenschutz')}
            </Link>
          </p>
        </Abschnitt>
      </div>

      <Abschnitt id="zugang" Icon={KeyRound} titel={t('zugangTitel')} text={t('zugangText')}>
        {zugang || kinderkontoAktiv ? (
          <Kinderzugang
            lernendeId={id}
            sprache={sprache}
            kindName={kopf.name}
            benutzername={zugang?.benutzername ?? null}
            gesperrt={zugang?.gesperrt ?? false}
            adresse={adresse({ pathname: '/anmelden', query: { zugang: 'kind' } }, sprache)}
            texte={zugangTexte}
          />
        ) : (
          <LeerHinweis text={t('zugangErst')} />
        )}
      </Abschnitt>

      {chatAn && uebersicht.gruppen.length ? (
        <div className="print:hidden">
          <Abschnitt id="elternkanal" Icon={MessagesSquare} titel={t('chatTitel')} text={t('chatText')}>
            <ul className="flex flex-col gap-3">
              {uebersicht.gruppen.map((g) => {
                const n = text(g.name, sprache);
                return (
                  <li key={g.id} className="flex flex-wrap items-center gap-3">
                    <Link
                      href={{ pathname: '/mein-bereich/gruppen/[id]/chat', params: { id: g.id }, query: { kanal: 'eltern' } }}
                      prefetch={false}
                      aria-label={t('chatOeffnenAria', { gruppe: n })}
                      className={KNOPF_PRIMAER}
                    >
                      <MessagesSquare aria-hidden className="size-5" />
                      {t('chatOeffnen')}
                    </Link>
                    <Link
                      href={{ pathname: '/mein-bereich/gruppen/[id]', params: { id: g.id } }}
                      prefetch={false}
                      aria-label={t('gruppeOeffnenAria', { gruppe: n })}
                      className={KNOPF_SEKUNDAER}
                    >
                      {t('gruppeOeffnen')}
                    </Link>
                    {uebersicht.gruppen.length > 1 ? <span className="font-bold">{n}</span> : null}
                  </li>
                );
              })}
            </ul>
          </Abschnitt>
        </div>
      ) : null}
    </MeinBereichRahmen>
  );
}
