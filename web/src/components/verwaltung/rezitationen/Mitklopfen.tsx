'use client';

import { Minus, Play, Plus, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState, useTransition, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { rasteEin } from '@/lib/audio/abgleich';
import { bereinigeAnfaenge, formatZeit, MIN_WORT_MS, SCHRITT_MS, verschiebeGrenze } from '@/lib/audio/werkstatt';
import { wortzeitenSpeichern } from '@/server/actions/rezitationen';
import type { WerkstattDaten } from '@/server/queries/verwaltung/rezitationen';
import { fehlerSchluessel, rufe } from './hilfen';
import { werteAdresseAus, type useAbspieler } from './werkstatt-audio';

export type Fenster = { url: string; startMs: number; endeMs: number | null };
const TEMPI = [0.6, 0.7, 0.8] as const;

/**
 * Mitklopfen der Wortanfänge (ADR 0029): Der Vers läuft mit 0,6- bis 0,8-facher Geschwindigkeit; jedes Tippen (Zeiger
 * oder Leertaste) nimmt die Medienzeit. Danach rasten die Zeiten an Einsätzen (`einsaetze`, ±150 ms) ein, werden ins
 * Versfenster gebracht und lassen sich je Wort um 50 ms verschieben und anhören. Gespeichert wird ungeprüft.
 */
export function Mitklopfen({
  daten,
  fenster,
  abspieler,
  darfBearbeiten,
  versgrenzenOffen,
}: {
  daten: WerkstattDaten;
  fenster: (vers: number) => Fenster | null;
  abspieler: Omit<ReturnType<typeof useAbspieler>, 'anbinden'>;
  darfBearbeiten: boolean;
  versgrenzenOffen: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt.klopfen');
  const tf = useTranslations('verwaltung.rezitationen.fehler');
  const id = useId();
  const zeitenJe = useMemo(() => {
    const m = new Map<number, [number, number, number, number, boolean][]>();
    for (const w of daten.wortzeiten) m.set(w[0], [...(m.get(w[0]) ?? []), w]);
    return m;
  }, [daten.wortzeiten]);
  const stand = (vers: number): 'keine' | 'offen' | 'geprueft' => {
    const n = daten.verse[vers - 1]?.woerter.length ?? 0;
    const z = zeitenJe.get(vers) ?? [];
    if (!n || z.length < n) return 'keine';
    return z.every((w) => w[4]) ? 'geprueft' : 'offen';
  };
  const gespeicherte = (vers: number): number[] | null => {
    const z = zeitenJe.get(vers) ?? [];
    return z.length && z.length === daten.verse[vers - 1]?.woerter.length ? z.map((w) => w[2]) : null;
  };

  const [vers, setVers] = useState(() => daten.verse.find((v) => stand(v.nr) === 'keine')?.nr ?? 1);
  const [tempo, setTempo] = useState<number>(0.7);
  const [phase, setPhase] = useState<'bereit' | 'klopfen' | 'korrektur'>(() => (gespeicherte(vers) ? 'korrektur' : 'bereit'));
  const [anfaenge, setAnfaenge] = useState<number[] | null>(() => gespeicherte(vers));
  const [getippt, setGetippt] = useState(0);
  const [ende, setEnde] = useState<number | null>(null);
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg' | 'info'; text: string } | null>(null);
  const [sendet, starteUebergang] = useTransition();
  const taps = useRef<number[]>([]);
  const klopft = useRef(false);
  const flaeche = useRef<HTMLButtonElement>(null);
  const meldungRef = useRef<HTMLDivElement>(null);

  const woerter = daten.verse[vers - 1]?.woerter ?? [];
  const f = fenster(vers);
  const endeMs = f?.endeMs ?? ende;

  useEffect(() => {
    if (meldung && meldung.art !== 'info') meldungRef.current?.focus();
  }, [meldung]);

  const waehle = (neu: number) => {
    abspieler.halt();
    klopft.current = false;
    taps.current = [];
    setVers(neu);
    setAnfaenge(gespeicherte(neu));
    setPhase(gespeicherte(neu) ? 'korrektur' : 'bereit');
    setGetippt(0);
    setEnde(null);
    setMeldung(null);
  };

  const fertig = async (fen: Fenster, anzahl: number) => {
    if (!klopft.current) return;
    klopft.current = false;
    const roh = taps.current;
    if (roh.length < anzahl) {
      setPhase(anfaenge ? 'korrektur' : 'bereit');
      setMeldung({ art: 'fehler', text: t('zuWenig', { anzahl: anzahl - roh.length }) });
      return;
    }
    const analyse = await werteAdresseAus(fen.url).catch(() => null);
    const bis = fen.endeMs ?? analyse?.dauerMs ?? roh[roh.length - 1] + 1000;
    const eins = analyse ? analyse.einsaetze.filter((e) => e >= fen.startMs && e < bis) : [];
    setEnde(bis);
    setAnfaenge(bereinigeAnfaenge(rasteEin(roh.slice(0, anzahl), 1, eins), { startMs: fen.startMs, endeMs: bis }));
    setPhase('korrektur');
    setMeldung({ art: 'info', text: t('fertig') });
  };

  const starte = async () => {
    if (!f) return;
    const anzahl = woerter.length;
    taps.current = [];
    klopft.current = true;
    setGetippt(0);
    setMeldung(null);
    setPhase('klopfen');
    const ok = await abspieler.spiele({ ...f, tempo, beiEnde: () => void fertig(f, anzahl) });
    if (!ok) {
      klopft.current = false;
      setPhase('bereit');
      setMeldung({ art: 'fehler', text: tf('keineDatei') });
      return;
    }
    flaeche.current?.focus();
  };

  const abbrechen = () => {
    klopft.current = false;
    abspieler.halt();
    setPhase(anfaenge ? 'korrektur' : 'bereit');
  };

  const tippe = () => {
    if (!klopft.current || !f) return;
    taps.current = [...taps.current, Math.round(abspieler.jetztMs())];
    setGetippt(taps.current.length);
    if (taps.current.length >= woerter.length) {
      abspieler.halt();
      void fertig(f, woerter.length);
    }
  };

  const taste = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (!e.repeat) tippe();
  };

  const verschiebe = (i: number, delta: number) => {
    if (!anfaenge || !f || endeMs === null) return;
    setAnfaenge(
      verschiebeGrenze(anfaenge, i, anfaenge[i] + delta, { minMs: f.startMs, maxMs: endeMs - MIN_WORT_MS, abstandMs: MIN_WORT_MS }),
    );
  };

  const hoereWort = (i: number) => {
    if (!anfaenge || !f) return;
    void abspieler.spiele({ url: f.url, startMs: anfaenge[i], endeMs: anfaenge[i + 1] ?? endeMs, tempo: 1 });
  };

  const speichern = () => {
    if (!anfaenge) return;
    starteUebergang(async () => {
      const z = await rufe(wortzeitenSpeichern, {
        rezitationId: daten.rezitation.id,
        sure: String(daten.sure.nr),
        vers: String(vers),
        anfaenge: JSON.stringify(anfaenge),
        ...(f?.endeMs === null && endeMs !== null ? { endeMs: String(endeMs) } : {}),
      });
      setMeldung(
        z.fehler
          ? { art: 'fehler', text: tf(fehlerSchluessel(z.fehler) as never) }
          : { art: 'erfolg', text: t('gespeichert', { nr: vers }) },
      );
    });
  };

  const standText = (v: number) => t(stand(v) === 'geprueft' ? 'standGeprueft' : stand(v) === 'offen' ? 'standOffen' : 'standKeine');
  const gesperrt = !darfBearbeiten || versgrenzenOffen || !f;

  return (
    <div className="flex flex-col gap-4">
      <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
        {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      </div>
      {versgrenzenOffen ? <Meldung art="info">{t('ohneVerse')}</Meldung> : null}
      <div className="flex flex-wrap items-end gap-4">
        <label htmlFor={`${id}-vers`} className="flex flex-col gap-1.5 font-bold">
          {t('vers')}
          <select
            id={`${id}-vers`}
            value={vers}
            onChange={(e) => waehle(Number(e.target.value))}
            disabled={phase === 'klopfen'}
            className={`${eingabe} w-auto font-normal`}
          >
            {daten.verse.map((v) => (
              <option key={v.nr} value={v.nr}>
                {t('versOption', { nr: v.nr, stand: standText(v.nr) })}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="font-bold">{t('tempo')}</legend>
          <div className="flex flex-wrap gap-2">
            {TEMPI.map((wert) => (
              <label
                key={wert}
                className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-rand px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
              >
                <input
                  type="radio"
                  name={`${id}-tempo`}
                  value={wert}
                  checked={tempo === wert}
                  onChange={() => setTempo(wert)}
                  disabled={phase === 'klopfen'}
                  className="size-5 accent-gruen-700"
                />
                {t('tempoWert', { faktor: wert.toLocaleString('de-DE') })}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p lang="ar" dir="rtl" className="werkstatt-vers-ar">
        {woerter.map((w, i) => (
          <span key={w.pos}>
            {i ? ' ' : null}
            <span
              className="werkstatt-klopf-wort"
              data-stand={phase === 'klopfen' ? (i < getippt ? 'getippt' : i === getippt ? 'naechstes' : undefined) : undefined}
            >
              {w.text}
            </span>
          </span>
        ))}
      </p>
      {!gesperrt ? (
        phase === 'klopfen' ? (
          <div className="flex flex-col gap-3">
            <button
              ref={flaeche}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                tippe();
              }}
              onKeyDown={taste}
              className="flex min-h-32 w-full touch-manipulation flex-col items-center justify-center gap-1 rounded-lg border-2 border-gruen-700 bg-gruen-50 px-4 text-20 font-bold text-gruen-950 select-none active:bg-gruen-100"
            >
              {t('flaeche')}
              <span className="text-16 font-normal tabular-nums" aria-live="polite">
                {t('zaehler', { getippt, gesamt: woerter.length })}
              </span>
            </button>
            <Button type="button" variant="ghost" className="self-start" onClick={abbrechen}>
              <X aria-hidden />
              {t('abbrechen')}
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" className="self-start" onClick={() => void starte()}>
            <Play aria-hidden />
            {t('starten')}
          </Button>
        )
      ) : null}
      {phase === 'korrektur' && anfaenge && f ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-20 font-bold">{t('korrektur')}</h3>
          <div role="region" aria-label={t('korrektur')} tabIndex={0} className="relative overflow-x-auto rounded-md border border-linie">
            <table className="w-full text-start">
              <thead className="bg-sand text-16">
                <tr>
                  <th scope="col" className="px-2 py-2 text-start md:px-3">
                    {t('spalteWort')}
                  </th>
                  <th scope="col" className="px-2 py-2 text-start md:px-3">
                    {t('spalteStart')}
                  </th>
                  <th scope="col" className="px-2 py-2 text-end md:px-3">
                    {t('spalteAktion')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {woerter.map((w, i) => (
                  <tr key={w.pos} className="border-t border-linie">
                    <th scope="row" className="px-2 py-1 text-start font-bold md:px-3">
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums">{w.pos}</span>
                        <span lang="ar" dir="rtl" className="font-quran text-arabisch-3 font-normal">
                          {w.text}
                        </span>
                      </span>
                    </th>
                    <td className="px-2 py-1 tabular-nums md:px-3">{formatZeit(anfaenge[i])}</td>
                    <td className="px-2 py-1 md:px-3">
                      <span className="flex justify-end gap-0.5 md:gap-1">
                        {darfBearbeiten ? (
                          <>
                            <Button type="button" variant="ghost" size="icon" onClick={() => verschiebe(i, -SCHRITT_MS)}>
                              <Minus aria-hidden />
                              <span className="sr-only">{t('frueher', { nr: w.pos })}</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => verschiebe(i, SCHRITT_MS)}>
                              <Plus aria-hidden />
                              <span className="sr-only">{t('spaeter', { nr: w.pos })}</span>
                            </Button>
                          </>
                        ) : null}
                        <Button type="button" variant="ghost" size="icon" onClick={() => hoereWort(i)}>
                          <Play aria-hidden />
                          <span className="sr-only">{t('anhoeren', { nr: w.pos })}</span>
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {darfBearbeiten ? (
            <Button type="button" className="self-start" onClick={speichern} disabled={sendet}>
              <Save aria-hidden />
              {t('speichern')}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
