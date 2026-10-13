import { Flag, MessagesSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { Abschnitt } from '@/components/mein-bereich/Abschnitt';
import { FELD, KNOPF_LEISE, KNOPF_PRIMAER, KNOPF_SEKUNDAER, LeerHinweis, Pille, ZurueckLink } from '@/components/mein-bereich/Bausteine';
import { MeinBereichRahmen } from '@/components/mein-bereich/MeinBereichRahmen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { meldungsKontext } from '@/lib/chat/dienst';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { verlangeMeinBereich } from '@/lib/konto/zugang';
import { localeFuer, MASSNAHMEN, type Massnahme } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import { cn } from '@/lib/utils';
import { kanalPauseSetzen, moderiereMeldung } from '@/server/actions/lehrkraft';
import { gruppeFuerLeitung, kanalStatus, offeneMeldungen, type MeldungKurz } from '@/server/queries/mein-bereich/unterricht';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('unterricht.meta');
  return { title: t('moderation') };
}

const UUID = /^[0-9a-f-]{36}$/i;
const OK = ['entfernen', 'stumm', 'mitglied', 'in_bearbeitung', 'erledigt', 'pausiert', 'fortgesetzt'] as const;
const FEHLER = ['grund', 'nichtMoeglich', 'allgemein'] as const;

/** Welche Maßnahmen passen zu dieser Meldung? (Der Server prüft es erneut.) */
function moeglich(m: MeldungKurz): Massnahme[] {
  return MASSNAHMEN.filter((x) => {
    if (x === 'entfernen') return m.nachrichtId !== null && !m.nachrichtEntfernt;
    if (x === 'stumm30' || x === 'stummTag') return m.absenderId !== null && !m.absenderIstLeitung;
    if (x === 'mitglied') return m.absenderLernendeId !== null;
    if (x === 'in_bearbeitung') return m.status === 'offen';
    return true;
  });
}

/**
 * Lehrkraft › Moderation (S-07…S-11): Kanäle pausieren/fortsetzen und offene Meldungen der Gruppe bearbeiten – immer mit
 * Grund, jede Maßnahme im Moderationsprotokoll. Den Verlauf um eine Meldung (±10 Nachrichten) lädt erst die Einzelansicht
 * (`?meldung=`), jede Einsicht wird protokolliert. Nur Gruppenleitung; nie Meldungen über eigene Nachrichten (D-02).
 * Funktioniert ohne JavaScript (Formulare mit Server Actions).
 */
export default async function ModerationSeite({
  params,
  searchParams,
}: PageProps<'/[locale]/mein-bereich/unterricht/[gruppe]/moderation'>) {
  // Zeit und Sitzung je Anfrage (Cache Components: `new Date()` erst nach `connection()`)
  await connection();
  if (!(await funktionAn('lernplattform')) || !(await funktionAn('chat'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const k = await verlangeMeinBereich(sprache, ['lehrkraft']);
  const [{ gruppe: gruppeId }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(gruppeId)) notFound();
  const kontext = await ladeGruppenKontext(k.benutzerId);
  const [g, meldungen, kanaele, t, tc] = await Promise.all([
    gruppeFuerLeitung(gruppeId, kontext, berlinerDatum(new Date())),
    offeneMeldungen(gruppeId, kontext),
    kanalStatus(gruppeId),
    getTranslations('unterricht'),
    getTranslations('chatFenster'),
  ]);
  if (!g || !meldungen) notFound();
  const name = text(g.name, sprache);
  const tm = (s: string, w?: Record<string, string | number>) => t(`moderation.${s}`, w);
  const zeit = new Intl.DateTimeFormat(localeFuer(sprache), { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
  const offen = typeof sp.meldung === 'string' ? meldungen.find((m) => m.id === sp.meldung) : undefined;
  const kontextDaten = offen ? await meldungsKontext(offen.id, k.benutzerId) : null;
  const ok = OK.find((x) => x === sp.ok);
  const fehler = FEHLER.find((x) => x === sp.fehler);
  const ziel = (query?: Record<string, string>, hash?: string) => ({
    pathname: '/mein-bereich/unterricht/[gruppe]/moderation' as const,
    params: { gruppe: gruppeId },
    ...(query ? { query } : {}),
    ...(hash ? { hash } : {}),
  });

  return (
    <MeinBereichRahmen
      konto={k}
      aktuell="unterricht"
      titel={tm('titel')}
      untertitel={name}
      sprachZiel={ziel()}
      // Ein kurzes Zwischenglied: Brotkrumen stehen auf dem Telefon in einer Zeile, nur das Endglied kürzt sich
      zwischen={[{ label: t('meta.gruppe'), ziel: { pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } } }]}
    >
      <ZurueckLink ziel={{ pathname: '/mein-bereich/unterricht/[gruppe]', params: { gruppe: gruppeId } }} text={tm('zurueck')} />
      {ok ? <Meldung art="erfolg">{tm(`ok.${ok}`)}</Meldung> : null}
      {fehler ? <Meldung art="fehler">{tm(`fehler.${fehler}`)}</Meldung> : null}
      <div className="flex max-w-text flex-col gap-2 text-pretty text-tinte-2">
        <p>{tm('einleitung')}</p>
        <p>{tm('eigene')}</p>
        <p className="font-bold text-tinte">{tm('kinderschutz')}</p>
      </div>

      <Abschnitt id="kanaele" Icon={MessagesSquare} titel={tm('kanaeleTitel')}>
        {kanaele.length ? (
          <ul className="flex flex-col divide-y divide-linie">
            {kanaele.map((kanal) => {
              const pause = kanal.status === 'aktiv';
              return (
                <li key={kanal.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-18 font-bold">{tm(`kanal.${kanal.art}`)}</span>
                    <Pille ton={kanal.status === 'aktiv' ? 'gruen' : 'warnung'}>{tm(`kanalStatus.${kanal.status}`)}</Pille>
                  </div>
                  {kanal.status !== 'archiviert' ? (
                    <form action={kanalPauseSetzen} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <input type="hidden" name="sprache" value={sprache} />
                      <input type="hidden" name="gruppeId" value={gruppeId} />
                      <input type="hidden" name="kanalId" value={kanal.id} />
                      <input type="hidden" name="pause" value={pause ? '1' : '0'} />
                      <label className="flex flex-col gap-1">
                        <span className="text-16 font-bold">{tm('pauseGrund')}</span>
                        <input name="grund" required minLength={3} maxLength={300} className={cn(FELD, 'sm:w-72')} />
                      </label>
                      <button type="submit" className={pause ? KNOPF_SEKUNDAER : KNOPF_PRIMAER}>
                        {tm(pause ? 'pausieren' : 'fortsetzen')}
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-tinte-2">{tm('keineKanaele')}</p>
        )}
      </Abschnitt>

      <Abschnitt id="meldungen" Icon={Flag} titel={tm('meldungenTitel')}>
        {meldungen.length ? (
          <ul className="flex flex-col gap-4">
            {meldungen.map((m) => {
              const geoeffnet = offen?.id === m.id;
              const wann = zeit.format(m.erstelltAm);
              const optionen = moeglich(m);
              return (
                <li
                  key={m.id}
                  id={`meldung-${m.id}`}
                  className={cn(
                    'scroll-mt-6 rounded-lg border p-4 md:p-5',
                    geoeffnet ? 'border-2 border-gruen-700 bg-weiss' : 'border-linie bg-papier',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-18 font-bold">{tc(`gruende.${m.grund}`)}</span>
                        <Pille ton={m.status === 'offen' ? 'warnung' : 'info'}>{tm(`meldungStatus.${m.status}`)}</Pille>
                      </span>
                      <span className="text-16 text-tinte-2">
                        {tm(`kanal.${m.kanalArt}`)} · {tm('gemeldetAm', { zeit: wann })}
                      </span>
                      <span className="text-16 text-tinte-2">
                        {m.absenderName ? tm('absender', { name: m.absenderName }) : tm('absenderUnbekannt')}
                        {m.nachrichtEntfernt ? ` · ${tm('nachrichtEntfernt')}` : ''}
                      </span>
                    </div>
                    {geoeffnet ? (
                      <Link href={ziel(undefined, 'meldungen')} prefetch={false} className={KNOPF_LEISE}>
                        {tm('schliessen')}
                      </Link>
                    ) : (
                      <Link
                        href={ziel({ meldung: m.id }, `meldung-${m.id}`)}
                        prefetch={false}
                        aria-label={tm('ansehenAria', { zeit: wann })}
                        className={KNOPF_SEKUNDAER}
                      >
                        {tm('ansehen')}
                      </Link>
                    )}
                  </div>

                  {geoeffnet ? (
                    <div className="mt-5 flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-20">{tm('kontextTitel')}</h3>
                        <p className="text-16 text-tinte-2">{tm('kontextHinweis')}</p>
                        {kontextDaten?.kontext.length ? (
                          <ol className="flex flex-col gap-2 rounded-md bg-papier p-3">
                            {kontextDaten.kontext.map((n) => (
                              <li
                                key={n.id}
                                className={cn(
                                  'flex flex-col gap-0.5 rounded-md px-3 py-2',
                                  n.gemeldet ? 'border-2 border-warnung bg-warnung-toenung' : 'bg-weiss',
                                )}
                              >
                                <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                                  <span className="font-bold text-tinte">{n.name}</span>
                                  <time dateTime={n.zeit}>{zeit.format(new Date(n.zeit))}</time>
                                  {n.gemeldet ? <Pille ton="warnung">{tm('gemeldet')}</Pille> : null}
                                </span>
                                <span className="wrap-anywhere whitespace-pre-wrap">{n.text || tm('entfernt')}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-tinte-2">{tm('kontextLeer')}</p>
                        )}
                        {kontextDaten?.freitext ? (
                          <div className="rounded-md border border-linie bg-weiss px-4 py-3">
                            <p className="text-16 font-bold">{tm('freitext')}</p>
                            <p className="wrap-anywhere whitespace-pre-wrap">{kontextDaten.freitext}</p>
                          </div>
                        ) : null}
                      </div>

                      <form action={moderiereMeldung} className="flex flex-col gap-4">
                        <input type="hidden" name="sprache" value={sprache} />
                        <input type="hidden" name="gruppeId" value={gruppeId} />
                        <input type="hidden" name="meldungId" value={m.id} />
                        <fieldset className="flex flex-col gap-2">
                          <legend className="mb-1 text-18 font-bold">{tm('massnahmeTitel')}</legend>
                          {optionen.map((x, i) => (
                            <label
                              key={x}
                              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-rand bg-weiss px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
                            >
                              <input
                                type="radio"
                                name="massnahme"
                                value={x}
                                defaultChecked={i === 0}
                                required
                                className="size-5 accent-gruen-700"
                              />
                              <span>{tm(`massnahme.${x}`)}</span>
                            </label>
                          ))}
                        </fieldset>
                        <label className="flex flex-col gap-1">
                          <span className="font-bold">{tm('begruendung')}</span>
                          <textarea
                            name="grund"
                            required
                            minLength={3}
                            maxLength={300}
                            rows={2}
                            aria-describedby={`grund-hilfe-${m.id}`}
                            className="min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 py-2 text-18"
                          />
                          <span id={`grund-hilfe-${m.id}`} className="text-16 text-tinte-2">
                            {tm('begruendungHilfe')}
                          </span>
                        </label>
                        <label className="flex min-h-12 cursor-pointer items-center gap-3">
                          <input type="checkbox" name="abschliessen" value="ja" defaultChecked className="size-5 accent-gruen-700" />
                          <span>{tm('abschliessen')}</span>
                        </label>
                        <button type="submit" className={cn(KNOPF_PRIMAER, 'self-start')}>
                          {tm('ausfuehren')}
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <LeerHinweis art="erfolg" text={tm('leer')} />
        )}
      </Abschnitt>
    </MeinBereichRahmen>
  );
}
