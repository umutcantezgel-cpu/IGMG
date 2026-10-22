'use client';

import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Inhalt } from '@/lib/lernapp/aufgaben/schema';
import {
  glosseFuer,
  glossenVerzeichnis,
  leseReihenfolge,
  RFN,
  richtigerIndex,
  stuecke,
} from '@/lib/lernapp/aufgaben/auswertung/lesen_fragen';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText, isoliert } from '../InhaltText';
import { richtung } from '../typen';
import type { AufgabenProps } from '../typen';
import { Wahlgruppe } from './Wahlgruppe';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteLesenFragen as bewerte } from '@/lib/lernapp/aufgaben/auswertung/lesen_fragen';

/** Sprung zwischen Text und Fragen (Knopf mit Linkoptik, Ziel ≥ 44 px). */
const SPRUNG = 'inline-flex min-h-11 items-center self-start font-bold text-gruen-800 underline underline-offset-4';

/** Offene Glosse: Absatz, Wort, Bedeutung und die Kennung des Wort-Knopfs (dorthin kehrt der Fokus beim Schließen zurück). */
type Offen = { absatz: number; wort: string; glosse: Inhalt; knopf: string };

/** Ab so vielen Tabstopps im Text (Wörter mit Glosse) oder Absätzen gibt es „Zu den Fragen springen“ und „Zurück zum Text“. */
export const LANGER_TEXT = { woerter: 8, absaetze: 4 } as const;

/** Glosse unter dem Absatz: erscheint mit Deckkraft und Skalierung .96 → 1 (wie B-14), reduziert nur mit Deckkraft. */
function GlosseKasten({
  id,
  offen,
  textSprache,
  titel,
  schliessen,
  onSchliessen,
}: {
  id: string;
  offen: Offen;
  textSprache: Inhalt['sprache'];
  titel: string;
  schliessen: string;
  onSchliessen: () => void;
}) {
  const [da, setDa] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setDa(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      id={id}
      role="group"
      aria-label={titel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onSchliessen();
        }
      }}
      className={`mt-2 flex flex-wrap items-center gap-3 rounded-md border-2 border-gruen-700 bg-gruen-50 px-4 py-2 transition duration-(--dauer-rueckmeldung) ease-eintritt ${da ? 'scale-100 opacity-100' : 'scale-96 opacity-0 motion-reduce:scale-100'}`}
    >
      <span className="text-18">
        <bdi lang={textSprache} dir={richtung(textSprache)} className="font-bold">
          {offen.wort}
        </bdi>
        {' – '}
        <InhaltText inhalt={offen.glosse} />
      </span>
      <button type="button" onClick={onSchliessen} className="ms-auto min-h-11 font-bold text-gruen-800 underline underline-offset-4">
        {schliessen}
      </button>
    </div>
  );
}

/**
 * Übungstyp `lesen_fragen` (PLAN §4 „Lesen“): Lesetext mit antippbaren Wörtern (Knöpfe, nur wo es eine Glosse gibt; die
 * Glosse erscheint unter dem Absatz – Deckkraft und Skalierung .96 → 1 wie B-14, reduziert nur Deckkraft – und wird in der
 * Live-Region angesagt). Darunter die Fragen als Radiogruppen; „Prüfen“ wird frei, wenn alle beantwortet sind.
 *
 * Längere Texte (A2–B1, L4-03): Der Wort-Knopf schaltet seine Glosse auf und zu (`aria-expanded`, `aria-controls`); Escape
 * im Knopf oder in der Glosse und „Schließen“ schließen sie, der Fokus kehrt auf das Wort zurück. Unter dem Text steht das
 * Glossar (alle Wörter mit Bedeutung, aufklappbar) – ohne Wort für Wort zu tippen. Ab `LANGER_TEXT` springen zwei Knöpfe
 * zwischen Text und Fragen (sonst wären es viele Tabstopps). Absätze haben eine lesbare Zeilenlänge (`max-w-text`).
 */
export default function LesenFragen({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  auswertung,
  setzeAntwort,
  melde,
}: AufgabenProps<'lesen_fragen'>) {
  const t = weitere.aufgaben2;
  const id = useId();
  const textSprache = aufgabe.text[0]!.sprache;
  const verzeichnis = useMemo(() => glossenVerzeichnis(aufgabe, textSprache), [aufgabe, textSprache]);
  const [wahlen, setWahlen] = useState<(number | null)[]>(() => aufgabe.fragen.map(() => null));
  const [offen, setOffen] = useState<Offen | null>(null);
  const textKopf = useRef<HTMLHeadingElement>(null);
  const fragenKopf = useRef<HTMLHeadingElement>(null);
  const l = weitere.ansichten.lesen;
  const zerlegt = useMemo(() => aufgabe.text.map((absatz) => stuecke(absatz.text)), [aufgabe]);
  const tabstopps = useMemo(
    () =>
      zerlegt.reduce(
        (n, teile, a) => n + teile.filter((x) => x.wort && glosseFuer(verzeichnis, x.text, aufgabe.text[a]!.sprache)).length,
        0,
      ),
    [zerlegt, verzeichnis, aufgabe],
  );
  const langerText = tabstopps >= LANGER_TEXT.woerter || aufgabe.text.length >= LANGER_TEXT.absaetze;

  function waehle(frage: number, wahl: number) {
    const neu = wahlen.map((w, i) => (i === frage ? wahl : w));
    setWahlen(neu);
    setzeAntwort(neu.every((w) => w !== null) ? { typ: 'lesen_fragen', wahlen: neu as number[] } : null);
  }

  function zeige(absatz: number, wort: string, glosse: Inhalt, knopf: string) {
    if (offen?.knopf === knopf) {
      schliesse();
      return;
    }
    setOffen({ absatz, wort, glosse, knopf });
    melde(`${isoliert(wort)}: ${isoliert(glosse.text)}`);
  }

  /** Glosse schließen; der Fokus kehrt auf das Wort zurück (der Knopf „Schließen“ verschwindet mit der Glosse). */
  function schliesse() {
    const knopf = offen?.knopf;
    setOffen(null);
    if (knopf) document.getElementById(knopf)?.focus();
  }

  function escape(e: KeyboardEvent<HTMLButtonElement>, knopf: string) {
    if (e.key === 'Escape' && offen?.knopf === knopf) {
      e.preventDefault();
      schliesse();
    }
  }

  const rfnText = (i: number) => t.lesenFragen.rfn[RFN[i]!];
  const offenGlosse = (absatz: number) =>
    offen && offen.absatz === absatz ? (
      <GlosseKasten
        key={offen.knopf}
        id={`${id}-glosse`}
        offen={offen}
        textSprache={textSprache}
        titel={formatiere(t.lesenFragen.glosseZu, { wort: isoliert(offen.wort) }, sprache, ziffern)}
        schliessen={t.lesenFragen.glosseSchliessen}
        onSchliessen={schliesse}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby={`${id}-text`} className="flex flex-col gap-3 rounded-lg bg-sand p-4 md:p-6">
        <h3 id={`${id}-text`} ref={textKopf} tabIndex={-1} className="text-20 font-bold outline-none">
          {aufgabe.titel ? <InhaltText inhalt={aufgabe.titel} /> : t.lesenFragen.text}
        </h3>
        {langerText ? (
          <button type="button" onClick={() => fragenKopf.current?.focus()} className={SPRUNG}>
            {l.zuDenFragen}
          </button>
        ) : null}
        {verzeichnis.size ? <p className="text-16 text-tinte-2">{t.lesenFragen.wortTipp}</p> : null}
        {aufgabe.text.map((absatz, a) => (
          <div key={a}>
            <p
              lang={absatz.sprache}
              dir={richtung(absatz.sprache)}
              className={`max-w-text ${absatz.sprache === 'ar' ? 'font-arabic text-arabisch-3' : 'text-20 leading-loose'}`}
            >
              {zerlegt[a]!.map((s, k) => {
                const glosse = s.wort ? glosseFuer(verzeichnis, s.text, absatz.sprache) : null;
                const knopf = `${id}-w${a}-${k}`;
                const auf = offen?.knopf === knopf;
                return glosse ? (
                  <button
                    key={k}
                    id={knopf}
                    type="button"
                    onClick={() => zeige(a, s.text, glosse, knopf)}
                    onKeyDown={(e) => escape(e, knopf)}
                    aria-expanded={auf}
                    aria-controls={auf ? `${id}-glosse` : undefined}
                    className="inline cursor-pointer rounded-sm py-2 underline decoration-gruen-700 decoration-dotted decoration-2 underline-offset-4 hover:bg-gruen-50 focus-visible:outline-2 focus-visible:outline-gruen-950"
                  >
                    {s.text}
                  </button>
                ) : (
                  <span key={k}>{s.text}</span>
                );
              })}
            </p>
            {offenGlosse(a)}
          </div>
        ))}
        {aufgabe.glossen?.length ? (
          <details className="rounded-md border border-linie bg-weiss">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 font-bold">
              {formatiere(l.woerter, { n: aufgabe.glossen.length }, sprache, ziffern)}
            </summary>
            <div className="flex flex-col gap-3 px-4 pb-4">
              <p className="text-16 text-tinte-2">{l.woerterText}</p>
              <dl className="flex flex-col gap-2">
                {aufgabe.glossen.map((g) => (
                  <div key={g.wort} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <dt
                      lang={textSprache}
                      dir={richtung(textSprache)}
                      className={`font-bold ${textSprache === 'ar' ? 'font-arabic text-arabisch-3' : 'text-18'}`}
                    >
                      {g.wort}
                    </dt>
                    <dd className="text-18">
                      <InhaltText inhalt={g.glosse} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        ) : null}
      </section>
      <section aria-labelledby={`${id}-fragen`} className="flex flex-col gap-5">
        <h3 id={`${id}-fragen`} ref={fragenKopf} tabIndex={-1} className="text-20 font-bold outline-none">
          {t.lesenFragen.fragen}
        </h3>
        {langerText ? (
          <button type="button" onClick={() => textKopf.current?.focus()} className={SPRUNG}>
            {l.zumText}
          </button>
        ) : null}
        {aufgabe.fragen.map((f, i) => {
          const reihe = leseReihenfolge(aufgabe, i);
          const richtig = richtigerIndex(f);
          const ok = auswertung ? wahlen[i] === richtig : null;
          const nummer = formatiere(t.lesenFragen.frageNr, { nr: i + 1 }, sprache, ziffern);
          return (
            <div key={i} className="flex flex-col gap-3">
              <p className="text-18 font-bold">
                {nummer}: <InhaltText inhalt={f.art === 'auswahl' ? f.frage : f.aussage} />
              </p>
              <Wahlgruppe
                legende={
                  <>
                    {nummer}: <InhaltText inhalt={f.art === 'auswahl' ? f.frage : f.aussage} />
                  </>
                }
                tasten={t.gemeinsam.tasten}
                optionen={reihe.map((k) => ({
                  index: k,
                  inhalt: f.art === 'auswahl' ? <InhaltText inhalt={f.optionen[k]!} /> : rfnText(k),
                }))}
                gewaehlt={wahlen[i] ?? null}
                richtig={auswertung ? richtig : null}
                gesperrt={gesperrt}
                setze={(k) => waehle(i, k)}
                sprache={sprache}
                ziffern={ziffern}
                markeRichtig={t.gemeinsam.richtigeAntwort}
                markeFalsch={t.gemeinsam.deineAntwort}
                zweispaltig={f.art === 'auswahl'}
              />
              {ok === null ? null : (
                <p className={`text-18 font-bold ${ok ? 'text-gruen-800' : 'text-fehler'}`}>
                  {ok
                    ? t.lesenFragen.ergebnisRichtig
                    : formatiere(
                        t.lesenFragen.ergebnisFalsch,
                        { loesung: isoliert(f.art === 'auswahl' ? (f.optionen[richtig]?.text ?? '') : rfnText(richtig)) },
                        sprache,
                        ziffern,
                      )}
                </p>
              )}
            </div>
          );
        })}
        {!auswertung && wahlen.some((w) => w === null) ? <p className="text-16 text-tinte-2">{t.lesenFragen.offen}</p> : null}
      </section>
    </div>
  );
}
