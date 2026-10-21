'use client';

import { CalendarCheck, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { formatiere } from '@/lib/lernapp/format';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';
import { beimOeffnen } from '@/lib/lernapp/oberflaeche/abgleich';
import {
  einstellungsSpeicher,
  EINSTELLUNGEN_SCHLUESSEL,
  STANDARD_EINSTELLUNGEN,
  type Einstellungen,
} from '@/lib/lernapp/oberflaeche/einstellungen';
import { STAND_GEAENDERT } from '@/lib/lernapp/oberflaeche/geraet';
import { LEERER_START_STAND, ladeStartStand, type StartStand } from '@/lib/lernapp/oberflaeche/stand';
import { Serie, type SerieTexte } from '../Serie';

export type HeuteTexte = {
  titel: string;
  tagesziel: string;
  zielXp: string;
  zielLektionen: string;
  keinZiel: string;
  zielErreicht: string;
  zielAendern: string;
  weiter: string;
  weiterText: string;
  nochNichts: string;
  faellig: string;
  wiederholen: string;
};

/**
 * Insel „Heute“ auf der Startseite (PLAN §3.1, ADR 0043): Tagesziel, „Weiter lernen“ und fällige Wiederholungen aus
 * dem Stand auf dem Gerät (`ladeStartStand`: abgeleitete Speicher der lokalen Datenbank). Der Server rendert den Zustand
 * eines neuen Geräts; im Browser kommen Einstellungen und Stand dazu, ohne dass sich der Aufbau verschiebt. Zahlen stehen
 * statisch (keine hochzählenden Zahlen, KERN 4.0 §1); kein Druck: Ein verfehltes Ziel hat keine Folge. Dazu das Wochenband
 * der Serie (B-33), sobald auf dem Gerät gelernt wurde. Mit gebundenem
 * Konto gleicht die Insel beim Öffnen ab (`beimOeffnen`, ohne Konto keine Anfrage).
 */
export function HeuteInsel({
  ui,
  texte,
  serieTexte,
  kurse,
  adressen,
}: {
  ui: Oberflaeche;
  texte: HeuteTexte;
  serieTexte: SerieTexte;
  /** Titel je Kurs (für „Weiter lernen“ und die Wiederholung) */
  kurse: Partial<Record<KursSlug, string>>;
  adressen: { einstellungen: string; kurs: Partial<Record<KursSlug, string>> };
}) {
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(STANDARD_EINSTELLUNGEN);
  const [stand, setStand] = useState<StartStand>(LEERER_START_STAND);

  useEffect(() => {
    let aktiv = true;
    const speicher = einstellungsSpeicher(ui);
    const laden = () =>
      Promise.all([speicher.laden(), ladeStartStand()])
        .then(([e, s]) => {
          if (!aktiv) return;
          setEinstellungen(e);
          setStand(s);
        })
        .catch(() => undefined);
    void laden();
    void beimOeffnen().catch(() => undefined);
    window.addEventListener(EINSTELLUNGEN_SCHLUESSEL, laden);
    window.addEventListener(STAND_GEAENDERT, laden);
    return () => {
      aktiv = false;
      window.removeEventListener(EINSTELLUNGEN_SCHLUESSEL, laden);
      window.removeEventListener(STAND_GEAENDERT, laden);
    };
  }, [ui]);

  const f = (text: string, werte: Record<string, number> = {}) => formatiere(text, werte, ui, einstellungen.ziffern);
  const ziel = einstellungen.tagesziel;
  const erreicht = ziel.art === 'xp' ? stand.heute.xp : ziel.art === 'lektionen' ? stand.heute.lektionen : 0;
  const anteil = ziel.art === 'kein' ? 0 : Math.min(1, erreicht / ziel.wert);
  const faellig = stand.faellig.filter((f) => f.anzahl > 0 && adressen.kurs[f.kurs]);

  return (
    <section aria-labelledby="heute-titel" className="flex flex-col gap-5 rounded-lg bg-sand p-5 md:p-8">
      <h2 id="heute-titel" className="text-display-2">
        {texte.titel}
      </h2>
      <div className="flex flex-col gap-3 rounded-md bg-weiss p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="flex items-center gap-2 font-bold">
            <CalendarCheck aria-hidden className="size-5 shrink-0 text-gruen-700" />
            {texte.tagesziel}
          </span>
          <a
            href={adressen.einstellungen}
            className="inline-flex min-h-11 items-center text-16 font-bold underline-offset-4 hover:underline"
          >
            {texte.zielAendern}
          </a>
        </div>
        {ziel.art === 'kein' ? (
          <p className="text-16 text-tinte-2">{texte.keinZiel}</p>
        ) : (
          <>
            <p className="text-18 tabular-nums">
              {f(ziel.art === 'xp' ? texte.zielXp : texte.zielLektionen, { erreicht, ziel: ziel.wert })}
            </p>
            <div aria-hidden className="h-2 overflow-hidden rounded-pill bg-sand">
              <div className="h-full lern-leiste bg-gruen-700" style={{ '--anteil': anteil } as CSSProperties} />
            </div>
            {anteil >= 1 ? <p className="text-16 font-bold text-gruen-800">{texte.zielErreicht}</p> : null}
          </>
        )}
      </div>
      {stand.serie ? (
        <Serie
          laenge={stand.serie.laenge}
          woche={stand.serie.woche}
          heute={stand.serie.heute}
          texte={serieTexte}
          ui={ui}
          ziffern={einstellungen.ziffern}
        />
      ) : null}
      {stand.weiter && adressen.kurs[stand.weiter.kurs] ? (
        <a
          href={`${adressen.kurs[stand.weiter.kurs]}/ueben?l=${encodeURIComponent(stand.weiter.lektion)}`}
          className="flex min-h-14 items-center gap-3 rounded-md bg-gruen-700 px-5 py-3 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss"
        >
          <Sparkles aria-hidden className="size-5 shrink-0" />
          <span className="flex flex-col">
            <span>{texte.weiter}</span>
            <span className="text-16 font-normal">{stand.weiter.titel ?? kurse[stand.weiter.kurs] ?? texte.weiterText}</span>
          </span>
        </a>
      ) : null}
      {!stand.begonnen ? <p className="text-16 text-tinte-2">{texte.nochNichts}</p> : null}
      {faellig.length ? (
        <ul className="flex flex-col gap-2">
          {faellig.map((k) => (
            <li key={k.kurs}>
              <a
                href={`${adressen.kurs[k.kurs]}/wiederholen`}
                className="flex min-h-11 items-center gap-3 rounded-md bg-weiss px-4 py-2 font-bold no-underline hover:bg-gruen-50"
              >
                <RotateCcw aria-hidden className="size-5 shrink-0 text-gruen-700" />
                <span className="flex flex-col">
                  <span>{kurse[k.kurs]}</span>
                  <span className="text-16 font-normal text-tinte-2">{f(texte.faellig, { n: k.anzahl })}</span>
                </span>
                <span className="ms-auto text-16 text-gruen-800">{texte.wiederholen}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
