import type { CSSProperties } from 'react';
import glyphenDaten from '@/lib/elifbe/glyphen.json';
import type { Buchstabe } from '@/lib/elifbe/alphabet';
import { ausschnitt, zeitplan } from '@/lib/elifbe/schreibweg';
import { anfang, schreibweg } from '@/lib/elifbe/zuege';

type Glyphe = { rumpf: string; punkte: string[]; box: number[]; vorschub: number };
const GLYPHEN = glyphenDaten.glyphen as Record<string, Glyphe>;

/** Umriss einer Glyphe (für Karten, Übungen). */
export function glypheVon(slug: string): Glyphe | undefined {
  return GLYPHEN[slug];
}

/**
 * Schreibweg (Bewegungsregister B-17, großer Moment): Die Glyphe steht blass im Hintergrund; Maskenstriche entlang der
 * Mittellinien decken die Tinte Zug für Zug auf (stroke-dashoffset), danach die Punkte – insgesamt ≤ 1,6 s.
 * Ohne JavaScript und ohne Animation ist die Glyphe vollständig sichtbar (Grundwert = Endzustand). Bei reduzierter
 * Bewegung oder auf Wunsch (`data-pfeile="an"`, Knopf in `SchreibwegSteuerung`) stehen nummerierte Zugpfeile auf der
 * blassen Glyphe. Koordinaten: Schrifteinheiten der Amiri (glyphen.json), Grundlinie bei y = 0.
 */
export function Schreibweg({
  buchstabe,
  id,
  bild,
  verzoegerung = 160,
  className,
  stil,
}: {
  buchstabe: Pick<Buchstabe, 'slug' | 'familie'>;
  /** Eindeutige Kennung auf der Seite (Masken, Steuerung). */
  id: string;
  /** Zugänglicher Name des Bildes. */
  bild: string;
  /** Wartezeit bis zum ersten Zug (ms), z. B. nach dem Seitenwechsel. */
  verzoegerung?: number;
  className?: string;
  stil?: CSSProperties;
}) {
  const g = GLYPHEN[buchstabe.slug];
  if (!g) return null;
  const weg = schreibweg(buchstabe);
  // Register B-17: alles zusammen (Vorlauf eingeschlossen) höchstens 1,6 s
  const plan = zeitplan(weg, 1600 - verzoegerung, verzoegerung);
  const [vx, vy, vb, vh] = ausschnitt(g.box);
  const takt = (t: { dauer: number; verzoegerung: number }) =>
    ({ '--dauer': `${t.dauer}ms`, '--verzoegerung': `${t.verzoegerung}ms` }) as CSSProperties;
  const maske = { maskUnits: 'userSpaceOnUse' as const, x: vx, y: vy, width: vb, height: vh };
  const ersterPunkt = weg.punkte[0];
  return (
    <svg id={id} viewBox={`${vx} ${vy} ${vb} ${vh}`} role="img" aria-label={bild} className={className} style={stil} data-schreibweg="">
      <defs>
        <mask id={`${id}-rumpf`} {...maske}>
          <g fill="none" className="stroke-weiss" strokeLinecap="round" strokeLinejoin="round">
            {weg.zuege.map((z, i) => (
              <path key={i} d={z.d} strokeWidth={z.breite} pathLength={1} className="schreibweg-zug" style={takt(plan.zuege[i]!)} />
            ))}
          </g>
        </mask>
        {weg.punkte.length ? (
          <mask id={`${id}-punkte`} {...maske}>
            <g fill="none" className="stroke-weiss" strokeLinecap="round" strokeLinejoin="round">
              {weg.punkte.map((z, i) => (
                <path key={i} d={z.d} strokeWidth={z.breite} pathLength={1} className="schreibweg-zug" style={takt(plan.punkte[i]!)} />
              ))}
            </g>
          </mask>
        ) : null}
        <marker
          id={`${id}-pfeil`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerUnits="userSpaceOnUse"
          markerWidth="64"
          markerHeight="64"
          orient="auto-start-reverse"
        >
          <path d="M1 1 9 5 1 9z" className="fill-gruen-800" />
        </marker>
      </defs>
      {/* Grundlinie (Zeilenlinie des Heftes) */}
      <line x1={vx + 40} x2={vx + vb - 40} y1={0} y2={0} className="stroke-linie" strokeWidth={6} strokeDasharray="24 18" />
      {/* Blasser Umriss im Hintergrund */}
      <g className="fill-linie">
        <path d={g.rumpf} />
        {g.punkte.map((p, i) => (
          <path key={i} d={p} />
        ))}
      </g>
      {/* Tinte: deckt sich entlang der Züge auf */}
      <g className="schreibweg-tinte fill-gruen-950">
        <path d={g.rumpf} mask={`url(#${id}-rumpf)`} />
        {g.punkte.map((p, i) => (
          <path key={i} d={p} mask={`url(#${id}-punkte)`} />
        ))}
      </g>
      {/* Nummerierte Zugpfeile (reduzierte Bewegung oder auf Wunsch) */}
      <g className="schreibweg-pfeile" aria-hidden="true">
        {weg.zuege.map((z, i) => (
          <path
            key={i}
            d={z.d}
            fill="none"
            className="stroke-gruen-800"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={`url(#${id}-pfeil)`}
          />
        ))}
        {weg.punkte.map((z, i) => (
          <path key={i} d={z.d} fill="none" className="stroke-gruen-800" strokeWidth={14} strokeLinecap="round" />
        ))}
        {[...weg.zuege.map((z) => anfang(z.d)), ...(ersterPunkt ? [anfang(ersterPunkt.d)] : [])].map(([x, y], i) => {
          const punkt = i >= weg.zuege.length;
          // Die Nummer der Punkte steht rechts neben dem ersten Punkt, damit sie ihn nicht verdeckt
          const cx = punkt ? x + 110 : x;
          const cy = punkt ? y + 10 : y;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={50} className="fill-gruen-800 stroke-weiss" strokeWidth={8} />
              <text x={cx} y={cy} dy="0.36em" textAnchor="middle" className="fill-weiss font-bold" fontSize={60}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
