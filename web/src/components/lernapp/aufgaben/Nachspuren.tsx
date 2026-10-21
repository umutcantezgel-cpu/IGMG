'use client';

import { type PointerEvent, useId, useMemo, useRef, useState } from 'react';
import { glypheVon, Schreibweg } from '@/components/website/elifbe/Schreibweg';
import type { Buchstabe } from '@/lib/elifbe/alphabet';
import { ausschnitt } from '@/lib/elifbe/schreibweg';
import { bewerteSpur } from '@/lib/elifbe/uebung';
import { schreibweg } from '@/lib/elifbe/zuege';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import type { UiSprache, WeitereTexte } from '../typen';

type Punkt = [number, number];

/**
 * Nachspuren im Vorkurs Arabisch (PLAN §4.4, B-17): erst zeigt der Schreibweg der Elifbe-Seiten (`Schreibweg.tsx`), wie
 * der Buchstabe entsteht; dann wird Zug für Zug vom grünen Punkt aus nachgespurt (tolerant, `bewerteSpur` aus
 * `lib/elifbe/uebung.ts`, wie `/elifbe/ueben`). Ohne Zeiger oder lieber auf Papier: „Ich habe ihn auf Papier geschrieben“
 * (WCAG 2.5.1, 2.5.7 – Ziehen ist nie nötig). Eigener Chunk mit Glyphen und Zügen.
 */
export default function Nachspuren({
  buchstabe,
  name,
  texte,
  sprache,
  ziffern,
  gesperrt,
  fertig,
}: {
  buchstabe: Buchstabe;
  name: string;
  texte: WeitereTexte['aufgaben2']['schriftAr'];
  sprache: UiSprache;
  ziffern: Ziffern;
  gesperrt: boolean;
  fertig: (spur: 'gezeichnet' | 'papier') => void;
}) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const glyphe = glypheVon(buchstabe.slug);
  const weg = useMemo(() => schreibweg(buchstabe), [buchstabe]);
  const [zug, setZug] = useState(0);
  const [spur, setSpur] = useState<Punkt[]>([]);
  const [fast, setFast] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const pfade = useRef<(SVGPathElement | null)[]>([]);
  const zeichnet = useRef(false);
  const aktuell = weg.zuege[zug];
  const start = useMemo(() => {
    const m = /^M(-?[\d.]+)[ ,](-?[\d.]+)/.exec(aktuell?.d ?? '');
    return m ? [Number(m[1]), Number(m[2])] : [0, 0];
  }, [aktuell]);
  if (!glyphe) return null;
  const [vx, vy, vb, vh] = ausschnitt(glyphe.box);
  const alles = zug >= weg.zuege.length;

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
    setSpur([]);
    if (bewerteSpur(spur, proben, Math.max(70, aktuell.breite * 0.7)).ok) {
      setZug(zug + 1);
      if (zug + 1 >= weg.zuege.length) fertig('gezeichnet');
    } else setFast(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Schreibweg buchstabe={buchstabe} id={`${id}-weg`} bild={name} className="size-24 rounded-md bg-sand" />
        <p className="text-16 text-tinte-2">{texte.vorschlag}</p>
      </div>
      <p className="text-18 font-bold" aria-live="off">
        {alles ? texte.geschafft : formatiere(texte.zugNr, { nr: zug + 1, anzahl: weg.zuege.length }, sprache, ziffern)}
      </p>
      <svg
        ref={svg}
        viewBox={`${vx} ${vy} ${vb} ${vh}`}
        role="img"
        aria-label={formatiere(texte.zeichenfeld, { name }, sprache, ziffern)}
        className="mx-auto aspect-square w-full max-w-96 touch-none rounded-lg bg-sand select-none"
        onPointerDown={los}
        onPointerMove={bewege}
        onPointerUp={ende}
        onPointerCancel={ende}
      >
        <defs>
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vb} height={vh}>
            <g fill="none" className="stroke-weiss" strokeLinecap="round" strokeLinejoin="round">
              {weg.zuege.slice(0, zug).map((z) => (
                <path key={z.d} d={z.d} strokeWidth={z.breite} />
              ))}
            </g>
          </mask>
        </defs>
        <line x1={vx} x2={vx + vb} y1="0" y2="0" className="stroke-linie" strokeWidth={6} strokeDasharray="24 18" />
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
        {weg.zuege.map((z, i) => (
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
        {fast ? <p className="text-18 font-bold text-warnung">{texte.nochmal}</p> : null}
        {!alles && !gesperrt ? (
          <button
            type="button"
            onClick={() => fertig('papier')}
            className="ms-auto min-h-12 rounded-pill border-2 border-gruen-700 px-5 font-bold text-gruen-800 hover:bg-gruen-50"
          >
            {texte.papier}
          </button>
        ) : null}
      </div>
    </div>
  );
}
