'use client';

import { type PointerEvent, type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Aufgabe,
  bewerteSpur,
  buchstabeVon,
  FORTSCHRITT_SCHLUESSEL,
  istRichtig,
  leseFortschritt,
  runde,
  trageEin,
  type UebungsArt,
} from '@/lib/elifbe/uebung';
import { fuelle, RUNDE, type SpurGlyphe, type UebenDaten, type UebenTexte } from './uebenTypen';

const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/** Achtstern der Runde: leer (Umriss) oder gefüllt; der eben gewonnene füllt sich von unten (B-18). */
function Stern({ voll, neu }: { voll: boolean; neu: boolean }) {
  return (
    <svg aria-hidden viewBox="2.5 2.5 19 19" className="size-7 overflow-visible">
      <path d={STERN} className="fill-weiss stroke-gruen-700" strokeWidth={1.5} strokeLinejoin="round" />
      {voll ? <path d={STERN} className={`fill-gruen-700 ${neu ? 'stern-fuellt' : ''}`} /> : null}
    </svg>
  );
}

function speichere(slug: string) {
  try {
    const f = trageEin(leseFortschritt(localStorage.getItem(FORTSCHRITT_SCHLUESSEL)), slug);
    localStorage.setItem(FORTSCHRITT_SCHLUESSEL, JSON.stringify(f));
  } catch {
    // Speicher gesperrt oder voll: Übung geht weiter
  }
}

type Phase = 'frage' | 'richtig' | 'falsch';

/**
 * Übungsmaschine (Lazy-Chunk): acht Aufgaben je Runde. Rückmeldung nach B-18: richtig → der Achtstern füllt sich,
 * falsch → Farbe und Text, ohne Bewegung. Nach der Antwort geht der Fokus auf „Weiter“. Fortschritt lokal.
 */
export function Uebungen({
  arten,
  daten,
  texte,
  zurueck,
}: {
  arten: UebungsArt[];
  daten: UebenDaten;
  texte: UebenTexte;
  zurueck: () => void;
}) {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>(() => runde(arten, daten, Math.random, RUNDE));
  const [nr, setNr] = useState(0);
  const [phase, setPhase] = useState<Phase>('frage');
  const [wahl, setWahl] = useState<string | null>(null);
  const [ergebnisse, setErgebnisse] = useState<boolean[]>([]);
  const weiterKnopf = useRef<HTMLButtonElement>(null);
  const titel = useRef<HTMLHeadingElement>(null);
  const a = aufgaben[nr];
  const fertig = nr >= aufgaben.length;

  useEffect(() => {
    if (phase !== 'frage') weiterKnopf.current?.focus();
  }, [phase]);

  useEffect(() => {
    titel.current?.focus();
  }, [nr]);

  function antworte(wert: string, richtig?: boolean) {
    if (!a || phase !== 'frage') return;
    const ok = richtig ?? istRichtig(a, wert);
    setWahl(wert);
    setPhase(ok ? 'richtig' : 'falsch');
    setErgebnisse((e) => [...e, ok]);
    if (ok) speichere(buchstabeVon(a));
  }

  function weiter() {
    setNr((n) => n + 1);
    setPhase('frage');
    setWahl(null);
  }

  function neueRunde() {
    setAufgaben(runde(arten, daten, Math.random, RUNDE));
    setErgebnisse([]);
    setNr(0);
    setPhase('frage');
    setWahl(null);
  }

  const sterne = (
    <div
      className="flex flex-wrap items-center gap-1"
      role="img"
      aria-label={`${texte.sterne}: ${ergebnisse.filter(Boolean).length}/${aufgaben.length}`}
    >
      {aufgaben.map((_, i) => (
        <Stern key={i} voll={ergebnisse[i] === true} neu={i === ergebnisse.length - 1 && phase === 'richtig'} />
      ))}
    </div>
  );

  if (fertig || !a) {
    const richtig = ergebnisse.filter(Boolean).length;
    return (
      <section
        aria-labelledby="ueben-fertig"
        className="flex flex-col items-start gap-5 rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:p-10"
      >
        <h2 id="ueben-fertig" ref={titel} tabIndex={-1} className="text-display-2 outline-none">
          {texte.fertigTitel}
        </h2>
        {sterne}
        <p className="text-20 leading-einleitung">{texte.fertig[richtig] ?? ''}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={neueRunde}
            className="min-h-12 druck rounded-pill bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800"
          >
            {texte.nochEineRunde}
          </button>
          <button
            type="button"
            onClick={zurueck}
            className="min-h-12 rounded-pill border-2 border-gruen-700 bg-weiss px-6 font-bold text-gruen-800 hover:bg-gruen-50"
          >
            {texte.andereUebung}
          </button>
        </div>
      </section>
    );
  }

  const frage =
    a.art === 'erkennen'
      ? texte.frageErkennen
      : a.art === 'zuordnen'
        ? `${texte.frageZuordnen} (${texte.formen[a.form]})`
        : a.art === 'lesen'
          ? texte.frageLesen
          : '';
  const loesung = a.art === 'nachspuren' ? '' : (a.optionen.find((o) => o.wert === a.ziel)?.text ?? a.ziel);

  return (
    <section aria-labelledby="ueben-frage" className="flex flex-col gap-5 rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-16 font-bold text-gruen-800">{fuelle(texte.aufgabe, { nr: nr + 1, anzahl: aufgaben.length })}</span>
        {sterne}
      </div>
      {a.art === 'nachspuren' ? (
        <Nachspuren
          key={nr}
          glyphe={daten.spur.find((s) => s.slug === a.ziel) ?? daten.spur[0]!}
          texte={texte}
          titel={titel}
          fertig={(ok) => antworte(a.ziel, ok)}
          gesperrt={phase !== 'frage'}
        />
      ) : (
        <>
          <h2 id="ueben-frage" ref={titel} tabIndex={-1} className="text-24 outline-none">
            {frage}
          </h2>
          <p
            lang="ar"
            dir="rtl"
            className="flex min-h-40 items-center justify-center rounded-lg bg-sand py-2 text-center buchstabe-riesig text-gruen-950"
          >
            {a.zeige}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {a.optionen.map((o) => {
              const gewaehlt = wahl === o.wert;
              const loest = phase !== 'frage' && o.wert === a.ziel;
              const zustand =
                phase === 'frage'
                  ? 'border-rand bg-weiss hover:border-gruen-700 hover:bg-gruen-50'
                  : loest
                    ? 'border-gruen-700 bg-gruen-50'
                    : gewaehlt
                      ? 'border-fehler bg-fehler-toenung text-fehler'
                      : 'border-linie bg-weiss text-tinte-3';
              return (
                <button
                  key={o.wert}
                  type="button"
                  disabled={phase !== 'frage'}
                  aria-pressed={gewaehlt}
                  onClick={() => antworte(o.wert)}
                  className={`min-h-16 rounded-lg border-2 px-3 font-bold transition-colors duration-(--dauer-rueckmeldung) ${zustand} ${
                    a.art === 'zuordnen' ? 'text-48 leading-none' : 'text-24'
                  }`}
                >
                  <span lang={a.art === 'zuordnen' ? 'ar' : undefined}>{o.text}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div role="status" className="min-h-12">
        {phase === 'richtig' ? (
          <p className="text-20 font-bold text-gruen-800">
            {a.art === 'nachspuren'
              ? fuelle(texte.spurGeschafft, { name: daten.spur.find((s) => s.slug === a.ziel)?.name ?? '' })
              : texte.richtig}
          </p>
        ) : phase === 'falsch' && a.art !== 'nachspuren' ? (
          <p className="text-20 font-bold text-fehler">{fuelle(texte.falsch, { antwort: loesung })}</p>
        ) : null}
      </div>
      {phase !== 'frage' ? (
        <button
          ref={weiterKnopf}
          type="button"
          onClick={weiter}
          className="min-h-12 druck self-end rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800"
        >
          {texte.weiter}
        </button>
      ) : null}
    </section>
  );
}

type Punkt = [number, number];

/**
 * Nachspuren mit Zeiger (tolerant, bewerteSpur): Zug für Zug vom grünen Punkt aus; fertige Züge decken die Tinte auf.
 * Für Tastatur und Schaltersteuerung gibt es „Ohne Nachspuren weiter“ (WCAG 2.5.1).
 */
function Nachspuren({
  glyphe,
  texte,
  titel,
  fertig,
  gesperrt,
}: {
  glyphe: SpurGlyphe;
  texte: UebenTexte;
  titel: RefObject<HTMLHeadingElement | null>;
  fertig: (ok: boolean) => void;
  gesperrt: boolean;
}) {
  const [zug, setZug] = useState(0);
  const [spur, setSpur] = useState<Punkt[]>([]);
  const [fast, setFast] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const pfade = useRef<(SVGPathElement | null)[]>([]);
  const zeichnet = useRef(false);
  const id = `spur-${glyphe.slug}`;
  const aktuell = glyphe.zuege[zug];
  const start = useMemo(() => {
    const m = /^M(-?[\d.]+)[ ,](-?[\d.]+)/.exec(aktuell?.d ?? '');
    return m ? [Number(m[1]), Number(m[2])] : [0, 0];
  }, [aktuell]);

  function punkt(e: PointerEvent<SVGSVGElement>): Punkt | null {
    const m = svg.current?.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  }

  function los(e: PointerEvent<SVGSVGElement>) {
    if (gesperrt || !aktuell) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    zeichnet.current = true;
    setFast(false);
    const p = punkt(e);
    setSpur(p ? [p] : []);
  }

  function bewege(e: PointerEvent<SVGSVGElement>) {
    if (!zeichnet.current) return;
    const p = punkt(e);
    if (p) setSpur((s) => [...s, p]);
  }

  function ende() {
    if (!zeichnet.current || !aktuell) return;
    zeichnet.current = false;
    const pfad = pfade.current[zug];
    if (!pfad) return;
    const laenge = pfad.getTotalLength();
    const proben: Punkt[] = Array.from({ length: 40 }, (_, i) => {
      const q = pfad.getPointAtLength((laenge * i) / 39);
      return [q.x, q.y];
    });
    if (bewerteSpur(spur, proben, Math.max(70, aktuell.breite * 0.7)).ok) {
      setSpur([]);
      if (zug + 1 >= glyphe.zuege.length) {
        setZug(zug + 1);
        fertig(true);
      } else setZug(zug + 1);
    } else {
      setFast(true);
      setSpur([]);
    }
  }

  const fertigGezogen = glyphe.zuege.slice(0, zug);
  const alles = zug >= glyphe.zuege.length;

  return (
    <>
      <h2 id="ueben-frage" ref={titel} tabIndex={-1} className="text-24 outline-none">
        {alles ? glyphe.name : fuelle(texte.frageNachspuren, { nr: zug + 1, anzahl: glyphe.zuege.length })}
      </h2>
      <svg
        ref={svg}
        viewBox={glyphe.viewBox}
        role="img"
        aria-label={fuelle(texte.zeichenfeld, { name: glyphe.name })}
        className="mx-auto aspect-square w-full max-w-120 touch-none rounded-lg bg-sand select-none"
        onPointerDown={los}
        onPointerMove={bewege}
        onPointerUp={ende}
        onPointerCancel={ende}
      >
        <defs>
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000">
            <g fill="none" className="stroke-weiss" strokeLinecap="round" strokeLinejoin="round">
              {fertigGezogen.map((z) => (
                <path key={z.d} d={z.d} strokeWidth={z.breite} />
              ))}
            </g>
          </mask>
        </defs>
        <line x1="-2000" x2="3000" y1="0" y2="0" className="stroke-linie" strokeWidth={6} strokeDasharray="24 18" />
        <g className="fill-linie">
          <path d={glyphe.rumpf} />
          {glyphe.punkte.map((p) => (
            <path key={p} d={p} />
          ))}
        </g>
        <path d={glyphe.rumpf} mask={`url(#${id}-m)`} className="fill-gruen-950" />
        {alles ? (
          <g className="fill-gruen-950">
            {glyphe.punkte.map((p) => (
              <path key={p} d={p} />
            ))}
          </g>
        ) : null}
        {glyphe.zuege.map((z, i) => (
          <path
            key={z.d}
            ref={(el) => {
              pfade.current[i] = el;
            }}
            d={z.d}
            fill="none"
            className={i === zug ? 'stroke-gruen-700' : 'stroke-none'}
            strokeWidth={10}
            strokeDasharray="28 30"
            strokeLinecap="round"
          />
        ))}
        {!alles ? <circle cx={start[0]} cy={start[1]} r={46} className="fill-gruen-700 stroke-weiss" strokeWidth={10} /> : null}
        {spur.length > 1 ? (
          <polyline
            points={spur.map((p) => p.join(',')).join(' ')}
            fill="none"
            className="stroke-gruen-800"
            strokeWidth={34}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />
        ) : null}
      </svg>
      <div className="flex min-h-12 flex-wrap items-center gap-3">
        {fast ? <p className="text-18 font-bold text-warnung">{texte.spurNochmal}</p> : null}
        {!alles && !gesperrt ? (
          <button
            type="button"
            onClick={() => fertig(false)}
            className="ms-auto min-h-12 font-bold text-gruen-800 underline underline-offset-4"
          >
            {texte.spurUeberspringen}
          </button>
        ) : null}
      </div>
    </>
  );
}
