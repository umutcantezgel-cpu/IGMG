'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { Inhalt } from '@/lib/lernapp/aufgaben/schema';
import { glosseFuer, glossenVerzeichnis, leseReihenfolge, RFN, richtigerIndex, stuecke } from '@/lib/lernapp/aufgaben/lesen_fragen';
import { formatiere } from '@/lib/lernapp/format';
import { InhaltText, isoliert } from '../InhaltText';
import { richtung } from '../typen';
import type { AufgabenProps } from '../typen';
import { Wahlgruppe } from './Wahlgruppe';

type Offen = { absatz: number; wort: string; glosse: Inhalt };

/** Glosse unter dem Absatz: erscheint mit Deckkraft und Skalierung .96 → 1 (wie B-14), reduziert nur mit Deckkraft. */
function GlosseKasten({
  offen,
  textSprache,
  titel,
  schliessen,
  onSchliessen,
}: {
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
      role="group"
      aria-label={titel}
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

  function waehle(frage: number, wahl: number) {
    const neu = wahlen.map((w, i) => (i === frage ? wahl : w));
    setWahlen(neu);
    setzeAntwort(neu.every((w) => w !== null) ? { typ: 'lesen_fragen', wahlen: neu as number[] } : null);
  }

  function zeige(absatz: number, wort: string, glosse: Inhalt) {
    setOffen({ absatz, wort, glosse });
    melde(`${isoliert(wort)}: ${isoliert(glosse.text)}`);
  }

  const rfnText = (i: number) => t.lesenFragen.rfn[RFN[i]!];
  const offenGlosse = (absatz: number) =>
    offen && offen.absatz === absatz ? (
      <GlosseKasten
        key={`${offen.absatz}:${offen.wort}`}
        offen={offen}
        textSprache={textSprache}
        titel={formatiere(t.lesenFragen.glosseZu, { wort: isoliert(offen.wort) }, sprache, ziffern)}
        schliessen={t.lesenFragen.glosseSchliessen}
        onSchliessen={() => setOffen(null)}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby={`${id}-text`} className="flex flex-col gap-3 rounded-lg bg-sand p-4 md:p-6">
        <h3 id={`${id}-text`} className="text-20 font-bold">
          {aufgabe.titel ? <InhaltText inhalt={aufgabe.titel} /> : t.lesenFragen.text}
        </h3>
        {verzeichnis.size ? <p className="text-16 text-tinte-2">{t.lesenFragen.wortTipp}</p> : null}
        {aufgabe.text.map((absatz, a) => (
          <div key={a}>
            <p
              lang={absatz.sprache}
              dir={richtung(absatz.sprache)}
              className={absatz.sprache === 'ar' ? 'font-arabic text-arabisch-3' : 'text-20 leading-loose'}
            >
              {stuecke(absatz.text).map((s, k) => {
                const glosse = s.wort ? glosseFuer(verzeichnis, s.text, absatz.sprache) : null;
                return glosse ? (
                  <button
                    key={k}
                    type="button"
                    onClick={() => zeige(a, s.text, glosse)}
                    aria-expanded={offen?.absatz === a && offen.wort === s.text}
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
      </section>
      <section aria-labelledby={`${id}-fragen`} className="flex flex-col gap-5">
        <h3 id={`${id}-fragen`} className="text-20 font-bold">
          {t.lesenFragen.fragen}
        </h3>
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
                legende={`${nummer}: ${f.art === 'auswahl' ? f.frage.text : f.aussage.text}`}
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
