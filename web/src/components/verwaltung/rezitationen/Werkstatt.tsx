'use client';

import { CircleCheck, Pause, Play, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { versgrenzen } from '@/lib/audio/abgleich';
import { formatZeit, punkteAusVerszeiten, verszeitenAusPunkten } from '@/lib/audio/werkstatt';
import { cn } from '@/lib/utils';
import { verszeitenSpeichern, wortzeitenBestaetigen } from '@/server/actions/rezitationen';
import type { WerkstattDaten } from '@/server/queries/verwaltung/rezitationen';
import { AudioQuelle } from './AudioQuelle';
import { fehlerSchluessel, rufe } from './hilfen';
import { Mitklopfen, type Fenster } from './Mitklopfen';
import { Wellenform } from './Wellenform';
import { markiereWort, useAbspieler, werteAdresseAus, type Analyse } from './werkstatt-audio';
import './werkstatt.css';

export type WerkstattProps = { daten: WerkstattDaten; direkt: boolean; darfBearbeiten: boolean };

/** Abschnitt mit Schrittnummer (Karte wie in der Verwaltung). */
export function Abschnitt({ nr, titel, einleitung, children }: { nr: number; titel: string; einleitung?: string; children: ReactNode }) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt');
  return (
    <section
      aria-labelledby={`werkstatt-${nr}`}
      className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-6"
    >
      <div className="flex flex-col gap-1">
        <span className="text-16 font-bold text-gruen-800">{t('schritt', { nr })}</span>
        <h2 id={`werkstatt-${nr}`} className="text-24 font-bold">
          {titel}
        </h2>
        {einleitung ? <p className="max-w-text text-tinte-2">{einleitung}</p> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Rezitations-Werkstatt einer Sure (O-Q02, ADR 0029, AUFTRAG 2.5): 1 Aufnahme oder Upload, 2 Wellenform und
 * Versgrenzen aus Stillephasen, 3 Mitklopfen der Wortanfänge, 4 Prüfwiedergabe mit Vers- und Worthervorhebung wie im
 * öffentlichen Player. Gespeichert wird so, dass der Player die Daten ohne Änderung abspielt.
 */
export default function Werkstatt({ daten, direkt, darfBearbeiten }: WerkstattProps) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt');
  const sureDatei = daten.audio.find((a) => a.vers === 0) ?? null;
  const jeVers = daten.audio.some((a) => a.vers > 0);
  return (
    <div className="flex flex-col gap-8">
      {!darfBearbeiten ? <Meldung art="info">{t('nurLesen')}</Meldung> : null}
      <Abschnitt nr={1} titel={t('quelle.titel')}>
        <AudioQuelle
          rezitationId={daten.rezitation.id}
          sure={daten.sure.nr}
          datei={sureDatei}
          jeVers={jeVers}
          direkt={direkt}
          darfBearbeiten={darfBearbeiten}
        />
      </Abschnitt>
      {daten.audio.length ? <Abgleich key={daten.audio.map((a) => a.url).join('|')} daten={daten} darfBearbeiten={darfBearbeiten} /> : null}
    </div>
  );
}

function Abgleich({ daten, darfBearbeiten }: { daten: WerkstattDaten; darfBearbeiten: boolean }) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt');
  const tf = useTranslations('verwaltung.rezitationen.fehler');
  const { anbinden, ...abspieler } = useAbspieler();
  const anzahl = daten.sure.verseAnzahl;
  const sureDatei = daten.audio.find((a) => a.vers === 0) ?? null;
  const [analyse, setAnalyse] = useState<Analyse | 'laedt' | 'fehler'>('laedt');
  const gespeichert = useMemo(() => punkteAusVerszeiten(daten.verszeiten, anzahl), [daten.verszeiten, anzahl]);
  const [punkte, setPunkte] = useState<number[] | null>(gespeichert);
  const [aktiverVers, setAktiverVers] = useState<number | null>(null);
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg'; text: string } | null>(null);
  const [sendet, starteUebergang] = useTransition();
  const meldungRef = useRef<HTMLDivElement>(null);
  const geaendert = JSON.stringify(punkte) !== JSON.stringify(gespeichert);

  useEffect(() => {
    if (!sureDatei) return;
    let aktiv = true;
    werteAdresseAus(sureDatei.url).then(
      (a) => aktiv && setAnalyse(a),
      () => aktiv && setAnalyse('fehler'),
    );
    return () => {
      aktiv = false;
    };
  }, [sureDatei]);

  useEffect(() => {
    if (meldung) meldungRef.current?.focus();
  }, [meldung]);

  /** Gespeichertes Zeitfenster eines Verses (das veröffentlicht würde). */
  const fenster = (vers: number): Fenster | null => {
    const zeit = daten.verszeiten.find((v) => v[0] === vers);
    if (sureDatei) return zeit ? { url: sureDatei.url, startMs: zeit[1], endeMs: zeit[2] } : null;
    const eigen = daten.audio.find((a) => a.vers === vers);
    if (!eigen) return null;
    return { url: eigen.url, startMs: zeit?.[1] ?? 0, endeMs: zeit?.[2] ?? eigen.dauerMs ?? null };
  };

  const vorschlagen = () => {
    if (typeof analyse !== 'object') return;
    const grenzen = versgrenzen(analyse.rahmen, anzahl, analyse.dauerMs);
    setPunkte([grenzen[0].startMs, ...grenzen.map((g) => g.endeMs)]);
    setMeldung(null);
  };

  const speichern = () => {
    if (!punkte) return;
    starteUebergang(async () => {
      const z = await rufe(verszeitenSpeichern, {
        rezitationId: daten.rezitation.id,
        sure: String(daten.sure.nr),
        verse: JSON.stringify(verszeitenAusPunkten(punkte)),
      });
      if (z.fehler) setMeldung({ art: 'fehler', text: tf(fehlerSchluessel(z.fehler) as never) });
      else {
        const anders = Number(z.hinweis ?? 0);
        setMeldung({
          art: 'erfolg',
          text: anders && daten.wortzeiten.length ? t('wellenform.gespeichertGeaendert', { anzahl: anders }) : t('wellenform.gespeichert'),
        });
      }
    });
  };

  const spieleVers = (vers: number) => {
    if (abspieler.laeuft && aktiverVers === vers) {
      abspieler.halt();
      return;
    }
    const lokal = sureDatei && punkte ? { url: sureDatei.url, startMs: punkte[vers - 1], endeMs: punkte[vers] } : fenster(vers);
    if (!lokal) return;
    setAktiverVers(vers);
    void abspieler.spiele({ ...lokal, beiEnde: () => setAktiverVers(null) }).then((ok) => {
      if (!ok) setMeldung({ art: 'fehler', text: t('spielfehler') });
    });
  };

  return (
    <>
      <audio ref={anbinden} preload="auto" className="hidden" />
      {sureDatei ? (
        <Abschnitt nr={2} titel={t('wellenform.titel')} einleitung={t('wellenform.einleitung')}>
          <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
            {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
          </div>
          {analyse === 'laedt' ? (
            <p role="status" className="text-tinte-2">
              {t('wellenform.laedt')}
            </p>
          ) : analyse === 'fehler' ? (
            <Meldung art="fehler">{t('wellenform.fehler')}</Meldung>
          ) : (
            <>
              <Wellenform
                analyse={analyse}
                punkte={punkte}
                onPunkte={darfBearbeiten ? setPunkte : undefined}
                positionMs={abspieler.positionMs}
                onSuche={(ms) => abspieler.suche(sureDatei.url, ms)}
                aktiverVers={aktiverVers}
                folgen={abspieler.laeuft}
              />
              {darfBearbeiten ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" onClick={vorschlagen}>
                    <Sparkles aria-hidden />
                    {t('wellenform.vorschlagen')}
                  </Button>
                  {gespeichert && geaendert ? (
                    <Button type="button" variant="ghost" onClick={() => setPunkte(gespeichert)}>
                      <RotateCcw aria-hidden />
                      {t('wellenform.zuruecksetzen')}
                    </Button>
                  ) : null}
                  <Button type="button" onClick={speichern} disabled={!punkte || !geaendert || sendet}>
                    <Save aria-hidden />
                    {t('wellenform.speichern')}
                  </Button>
                  {geaendert && punkte ? <span className="text-16 font-bold text-warnung">{t('wellenform.ungespeichert')}</span> : null}
                </div>
              ) : null}
            </>
          )}
          {punkte ? (
            <div
              role="region"
              aria-label={t('wellenform.tabelle')}
              tabIndex={0}
              className="relative overflow-x-auto rounded-md border border-linie"
            >
              <table className="w-full text-start tabular-nums">
                <thead className="bg-sand text-16">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-start">
                      {t('wellenform.spalteVers')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-start">
                      {t('wellenform.spalteStart')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-start">
                      {t('wellenform.spalteEnde')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-start">
                      {t('wellenform.spalteDauer')}
                    </th>
                    <th scope="col" className="px-3 py-2 text-end">
                      <span className="sr-only">{t('wellenform.spalteAktion')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {punkte.slice(0, -1).map((start, i) => {
                    const ende = punkte[i + 1];
                    const spielt = abspieler.laeuft && aktiverVers === i + 1;
                    return (
                      <tr key={i} className={cn('border-t border-linie', aktiverVers === i + 1 && 'bg-gruen-50')}>
                        <th scope="row" className="px-3 py-1 text-start font-bold">
                          {i + 1}
                        </th>
                        <td className="px-3 py-1">{formatZeit(start)}</td>
                        <td className="px-3 py-1">{formatZeit(ende)}</td>
                        <td className="px-3 py-1">{formatZeit(ende - start)}</td>
                        <td className="px-3 py-1 text-end">
                          <Button type="button" variant="ghost" size="icon" onClick={() => spieleVers(i + 1)}>
                            {spielt ? <Pause aria-hidden /> : <Play aria-hidden />}
                            <span className="sr-only">{spielt ? t('wellenform.anhalten') : t('wellenform.abspielen', { nr: i + 1 })}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : analyse !== 'laedt' ? (
            <p className="text-tinte-2">{t('wellenform.keine')}</p>
          ) : null}
        </Abschnitt>
      ) : null}
      <Abschnitt nr={sureDatei ? 3 : 2} titel={t('klopfen.titel')} einleitung={t('klopfen.einleitung')}>
        <Mitklopfen
          daten={daten}
          fenster={fenster}
          abspieler={abspieler}
          darfBearbeiten={darfBearbeiten}
          versgrenzenOffen={Boolean(sureDatei) && (!gespeichert || geaendert)}
        />
      </Abschnitt>
      <Abschnitt nr={sureDatei ? 4 : 3} titel={t('pruefen.titel')} einleitung={t('pruefen.einleitung')}>
        <Pruefwiedergabe daten={daten} fenster={fenster} abspieler={abspieler} darfBearbeiten={darfBearbeiten} />
      </Abschnitt>
    </>
  );
}

type Abspieler = Omit<ReturnType<typeof useAbspieler>, 'anbinden'>;

/**
 * Prüfwiedergabe: Verse wie im Koran-Leser, der laufende Vers getönt, das Wort über die CSS Custom Highlight API
 * (Rückfall Klasse). Nur gespeicherte Zeiten – genau das, was der Player zeigen würde. Bestätigen erst, nachdem der
 * Vers bis zum Ende gehört wurde.
 */
function Pruefwiedergabe({
  daten,
  fenster,
  abspieler,
  darfBearbeiten,
}: {
  daten: WerkstattDaten;
  fenster: (vers: number) => Fenster | null;
  abspieler: Abspieler;
  darfBearbeiten: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt.pruefen');
  const tf = useTranslations('verwaltung.rezitationen.fehler');
  const liste = useRef<HTMLOListElement>(null);
  const [aktiv, setAktiv] = useState<number | null>(null);
  const [ganz, setGanz] = useState(false);
  const [gehoert, setGehoert] = useState<ReadonlySet<number>>(new Set());
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg'; text: string } | null>(null);
  const [sendet, starteUebergang] = useTransition();
  const meldungRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (meldung) meldungRef.current?.focus();
  }, [meldung]);
  useEffect(() => () => markiereWort(null), []);

  const zeitenJe = useMemo(() => {
    const m = new Map<number, [number, number, number, number, boolean][]>();
    for (const w of daten.wortzeiten) m.set(w[0], [...(m.get(w[0]) ?? []), w]);
    return m;
  }, [daten.wortzeiten]);

  const stand = (vers: number, woerter: number): 'keine' | 'offen' | 'geprueft' => {
    const z = zeitenJe.get(vers) ?? [];
    if (z.length < woerter || !woerter) return 'keine';
    return z.every((w) => w[4]) ? 'geprueft' : 'offen';
  };

  const spiele = (vers: number, weiter: boolean) => {
    const f = fenster(vers);
    const li = liste.current?.querySelector<HTMLElement>(`li[data-v="${vers}"]`);
    if (!f || !li) {
      setAktiv(null);
      setGanz(false);
      return;
    }
    setAktiv(vers);
    setGanz(weiter);
    const zeiten = zeitenJe.get(vers) ?? [];
    void abspieler
      .spiele({
        ...f,
        beiPosition: (ms) => {
          const w = zeiten.find((z) => z[2] <= ms && ms < z[3]);
          markiereWort(w ? li.querySelector<HTMLElement>(`[data-w="${w[1]}"]`) : null);
        },
        beiEnde: () => {
          markiereWort(null);
          setGehoert((alt) => new Set(alt).add(vers));
          if (weiter && vers < daten.sure.verseAnzahl) spiele(vers + 1, true);
          else {
            setAktiv(null);
            setGanz(false);
          }
        },
      })
      .then((ok) => {
        if (!ok) setMeldung({ art: 'fehler', text: tf('keineDatei') });
      });
  };

  const halt = () => {
    abspieler.halt();
    markiereWort(null);
    setAktiv(null);
    setGanz(false);
  };

  const bestaetigen = (vers: number) =>
    starteUebergang(async () => {
      const z = await rufe(wortzeitenBestaetigen, { rezitationId: daten.rezitation.id, sure: String(daten.sure.nr), vers: String(vers) });
      setMeldung(
        z.fehler
          ? { art: 'fehler', text: tf(fehlerSchluessel(z.fehler) as never) }
          : { art: 'erfolg', text: t('bestaetigt', { nr: vers }) },
      );
    });

  const spieltGanz = abspieler.laeuft && ganz;
  return (
    <div className="flex flex-col gap-4">
      <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
        {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      </div>
      {fenster(1) ? (
        <Button type="button" variant="secondary" className="self-start" onClick={() => (spieltGanz ? halt() : spiele(1, true))}>
          {spieltGanz ? <Pause aria-hidden /> : <Play aria-hidden />}
          {spieltGanz ? t('anhalten') : t('sure')}
        </Button>
      ) : (
        <p className="text-tinte-2">{t('ohneFenster')}</p>
      )}
      <ol ref={liste} aria-label={t('liste')} className="flex flex-col gap-3">
        {daten.verse.map((v) => {
          const s = stand(v.nr, v.woerter.length);
          const laeuft = abspieler.laeuft && aktiv === v.nr && !ganz;
          return (
            <li
              key={v.nr}
              data-v={v.nr}
              data-aktiv={aktiv === v.nr ? '' : undefined}
              className="werkstatt-vers flex flex-col gap-2 rounded-md border border-linie p-3 md:p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-2 font-bold">
                  {t('versKopf', { nr: v.nr })}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-pill px-3 text-16',
                      s === 'geprueft'
                        ? 'bg-gruen-50 text-gruen-800'
                        : s === 'offen'
                          ? 'bg-warnung-toenung text-tinte'
                          : 'bg-sand text-tinte-2',
                    )}
                  >
                    {s === 'geprueft' ? <CircleCheck aria-hidden className="size-4" /> : null}
                    {t(s === 'geprueft' ? 'standGeprueft' : s === 'offen' ? 'standOffen' : 'standKeine')}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  {fenster(v.nr) ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => (laeuft ? halt() : spiele(v.nr, false))}>
                      {laeuft ? <Pause aria-hidden /> : <Play aria-hidden />}
                      {laeuft ? t('anhalten') : t('vers', { nr: v.nr })}
                    </Button>
                  ) : null}
                  {darfBearbeiten && s === 'offen' ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => bestaetigen(v.nr)}
                      disabled={!gehoert.has(v.nr) || sendet}
                      aria-describedby={gehoert.has(v.nr) ? undefined : `erst-hoeren-${v.nr}`}
                    >
                      <CircleCheck aria-hidden />
                      {t('bestaetigen', { nr: v.nr })}
                    </Button>
                  ) : null}
                </span>
              </div>
              {darfBearbeiten && s === 'offen' && !gehoert.has(v.nr) ? (
                <p id={`erst-hoeren-${v.nr}`} className="text-16 text-tinte-2">
                  {t('erstHoeren')}
                </p>
              ) : null}
              <p lang="ar" dir="rtl" className="werkstatt-vers-ar">
                {v.woerter.map((w, i) => (
                  <span key={w.pos}>
                    {i ? ' ' : null}
                    <span data-w={w.pos}>{w.text}</span>
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
