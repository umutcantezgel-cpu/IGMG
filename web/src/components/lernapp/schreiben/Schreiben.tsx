'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { KRITERIEN, type Pruefliste, type Pruefung, pruefeText, wortzahl } from '@/lib/lernapp/aufgaben/auswertung/schreiben';
import type { Note } from '@/lib/lernapp/bewertung';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText } from '../InhaltText';
import { richtung } from '../typen';
import type { AufgabenProps } from '../typen';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteSchreiben as bewerte } from '@/lib/lernapp/aufgaben/auswertung/schreiben';

const KNOPF = 'min-h-12 druck rounded-pill border-2 border-gruen-700 bg-weiss px-6 font-bold text-gruen-800 hover:bg-gruen-50';
const HAUPT = 'min-h-12 druck rounded-pill bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800';
const STUFEN = [0, 1, 2, 3] as const;

/**
 * Schreibübung (PLAN §4.3, ADR 0042 Nr. 11): Formular mit Zähler (Wörter im Bereich), Pflichtwörtern und der
 * Rechtschreibprüfung des Browsers (`spellcheck`, `lang` der Zielsprache). „Text prüfen“ prüft nur Länge und Pflichtwörter;
 * danach Musterantwort(en), die Prüfliste nach GER als Fieldsets (je 4 Stufen, eigene Formulierungen) und die
 * Selbsteinschätzung. Der Text bleibt im Arbeitsspeicher dieser Seite – kein Ereignis, kein Speicher, keine Anfrage; die
 * Abgabe an die Lehrkraft folgt in L7 (`lib/lernapp/schreiben/abgabe.ts`).
 */
export default function Schreiben({ aufgabe, weitere, sprache, ziffern, gesperrt, gibAb, melde }: AufgabenProps<'schreiben'>) {
  const t = weitere.schreiben;
  const id = useId();
  const ziel = aufgabe.aufgabe.sprache;
  const [text, setText] = useState('');
  const [pruefung, setPruefung] = useState<Pruefung | null>(null);
  const [liste, setListe] = useState<Pruefliste>({});
  const ergebnis = useRef<HTMLHeadingElement>(null);
  const f = (vorlage: string, werte?: Record<string, string | number>) => formatiere(vorlage, werte, sprache, ziffern);
  const n = wortzahl(text, ziel);

  useEffect(() => {
    if (pruefung) ergebnis.current?.focus();
  }, [pruefung]);

  function pruefe() {
    const p = pruefeText(aufgabe, text);
    setPruefung(p);
    melde(p.laenge === 'passt' ? t.laengePasst : p.laenge === 'kurz' ? t.zuKurz : t.zuLang);
  }

  const bewerte = (selbst: Note) => gibAb({ typ: 'schreiben', selbst });

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby={`${id}-aufgabe`} className="flex flex-col gap-2 rounded-lg bg-sand p-4 md:p-6">
        <h3 id={`${id}-aufgabe`} className="text-16 font-bold text-tinte-2">
          {t.aufgabe}
        </h3>
        <p className="text-20">
          <InhaltText inhalt={aufgabe.aufgabe} />
        </p>
        {aufgabe.uebersetzung ? (
          <p className="text-16 text-tinte-2">
            <InhaltText inhalt={aufgabe.uebersetzung} />
          </p>
        ) : null}
        {aufgabe.pflichtwoerter ? (
          <div className="flex flex-col gap-1">
            <p className="text-16 font-bold">{t.pflichtwoerter}</p>
            <ul lang={ziel} dir={richtung(ziel)} className="flex flex-wrap gap-2">
              {aufgabe.pflichtwoerter.map((w, i) => {
                const da = pruefung?.pflicht[i];
                return (
                  <li
                    key={w}
                    className={`rounded-md border-2 px-3 py-1 text-18 ${da === undefined ? 'border-linie bg-weiss' : da ? 'border-gruen-700 bg-gruen-50' : 'border-warnung bg-warnung-toenung'}`}
                  >
                    {w}
                    {da === undefined ? null : (
                      <span lang={sprache} dir={richtung(sprache)} className="ms-2 text-16 font-bold">
                        {da ? t.pflichtDa : t.pflichtFehlt}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-text`} className="text-18 font-bold">
          {t.text}
        </label>
        <textarea
          id={`${id}-text`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (pruefung) setPruefung(null);
          }}
          readOnly={gesperrt}
          lang={ziel}
          dir={richtung(ziel)}
          spellCheck
          rows={8}
          aria-describedby={`${id}-zaehler ${id}-lokal`}
          className={`w-full rounded-lg border-2 border-rand bg-weiss p-3 text-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gruen-950 ${ziel === 'ar' ? 'font-arabic' : ''}`}
        />
        <p
          id={`${id}-zaehler`}
          className={`text-16 ${n >= aufgabe.woerter.min && n <= aufgabe.woerter.max ? 'text-gruen-800' : 'text-tinte-2'}`}
        >
          {f(t.woerter, { n, min: aufgabe.woerter.min, max: aufgabe.woerter.max })}
        </p>
        <p id={`${id}-lokal`} className="text-16 text-tinte-2">
          {t.lokal}
        </p>
        {gesperrt ? null : (
          <button type="button" onClick={pruefe} disabled={!text.trim()} className={`${HAUPT} self-start disabled:opacity-60`}>
            {t.pruefen}
          </button>
        )}
      </div>

      {pruefung ? (
        <section aria-labelledby={`${id}-ergebnis`} className="flex flex-col gap-5">
          <h3 id={`${id}-ergebnis`} ref={ergebnis} tabIndex={-1} className="text-20 font-bold outline-none">
            {pruefung.laenge === 'passt' ? t.laengePasst : pruefung.laenge === 'kurz' ? t.zuKurz : t.zuLang}
          </h3>
          {aufgabe.muster.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border-2 border-gruen-700 bg-gruen-50 p-4">
              <p className="text-16 font-bold">{aufgabe.muster.length > 1 ? f(t.musterN, { nr: i + 1 }) : t.muster}</p>
              <p className="text-20">
                <InhaltText inhalt={m} />
              </p>
            </div>
          ))}
          <div className="flex flex-col gap-4">
            <h4 className="text-18 font-bold">{t.pruefliste.titel}</h4>
            <p className="text-16">{t.pruefliste.einleitung}</p>
            {KRITERIEN.map((k) => (
              <fieldset key={k} className="flex flex-col gap-2">
                <legend className="mb-1 text-18 font-bold">{t.pruefliste[k].titel}</legend>
                {STUFEN.map((s) => (
                  <label key={s} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 hover:bg-sand">
                    <input
                      type="radio"
                      name={`${id}-${k}`}
                      checked={liste[k] === s}
                      onChange={() => setListe((l) => ({ ...l, [k]: s }))}
                      disabled={gesperrt}
                      className="size-5 accent-gruen-700"
                    />
                    <span className="text-18">{t.pruefliste[k][`s${s}`]}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-18 font-bold">{t.selbstFrage}</legend>
            <div className="flex flex-wrap gap-3">
              {(['nochmal', 'schwer', 'gut'] as const).map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => bewerte(note)}
                  disabled={gesperrt}
                  className={note === 'gut' ? HAUPT : KNOPF}
                >
                  {t.selbst[note]}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      ) : null}
    </div>
  );
}
