import {
  BookOpen,
  BookText,
  CalendarCheck,
  CalendarDays,
  Compass,
  Footprints,
  Languages,
  Library,
  type LucideIcon,
  Mic,
  Milestone,
  Mountain,
  PenLine,
  RotateCcw,
  Users,
} from 'lucide-react';
import { createElement } from 'react';
import type { AbzeichenArt, AbzeichenGruppe } from '@/lib/lernapp/ereignisse/abzeichen';
import { formatiere, type Werte, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import type de from '../../../messages/lernapp/de.json';

/** Texte der Abzeichen (Namensraum `abzeichen` in `messages/lernapp/<ui>.json`). */
export type AbzeichenTexte = (typeof de)['abzeichen'];

/** Achtstern (Geometrie wie `LernStern` und `KategorieMarke`, 24er-Raster). */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';
/** Derselbe Stern, kleiner um die Mitte (zweite Linie ab Rang 2). */
const INNEN = 'translate(12 12) scale(0.72) translate(-12 -12)';
/** Kranz ab Rang 5: acht Punkte zwischen den Spitzen des Sterns (22,5° + k · 45°, Radius 10). */
const KRANZ = Array.from({ length: 8 }, (_, k) => {
  const w = ((22.5 + k * 45) * Math.PI) / 180;
  return { x: Math.round((12 + 10 * Math.cos(w)) * 100) / 100, y: Math.round((12 + 10 * Math.sin(w)) * 100) / 100 };
});

/** Symbol je Gruppe (Oberflächensymbole nur aus Lucide, KERN 4.0 §7). */
const SYMBOL: Record<AbzeichenGruppe, LucideIcon> = {
  stufe: Mountain,
  lerntage: CalendarDays,
  woerter: BookOpen,
  schrift: Languages,
  lektionen: Footprints,
  geschichten: BookText,
  wiederholungen: RotateCcw,
  pruefsteine: Milestone,
  tagesziel: CalendarCheck,
  erstes: PenLine,
  einstufung: Compass,
  wissen: Library,
  gruppe: Users,
};
const symbolVon = (art: Pick<AbzeichenArt, 'gruppe' | 'wert'>): LucideIcon =>
  art.gruppe === 'erstes' && art.wert === 'sprechen' ? Mic : SYMBOL[art.gruppe];

/** Name und Bedingung eines Abzeichens in der Oberflächensprache (Zahlen über `{n, number}` bzw. `#`). */
export function abzeichenText(
  art: Pick<AbzeichenArt, 'gruppe' | 'wert'>,
  texte: AbzeichenTexte,
  ui: Oberflaeche,
  ziffern: Ziffern,
): { name: string; text: string } {
  const werte: Werte = typeof art.wert === 'number' ? { n: art.wert } : { wert: art.wert, stufe: art.wert.toUpperCase() };
  const t = texte.arten[art.gruppe];
  return { name: formatiere(t.name, werte, ui, ziffern), text: formatiere(t.text, werte, ui, ziffern) };
}

/**
 * Form eines Abzeichens aus der Achtstern-Geometrie (ADR 0043 Nr. 5): Der Rang in der Gruppe ändert die Form, nicht nur
 * die Farbe – Rang 1 eine Linie, 2 eine zweite Linie innen, 3 getönte Fläche, 4 kräftige Fläche mit hellem Kern, 5 dazu
 * ein Kranz aus acht Punkten. Noch offene Abzeichen stehen als blasse Linie da. Dekorativ (`aria-hidden`).
 */
function Form({ rang, offen }: { rang: number; offen: boolean }) {
  const aussen = offen
    ? 'fill-weiss stroke-tinte-3'
    : rang >= 4
      ? 'fill-gruen-700 stroke-gruen-700'
      : rang === 3
        ? 'fill-gruen-100 stroke-gruen-700'
        : 'fill-gruen-50 stroke-gruen-700';
  const innen = offen ? 'fill-none stroke-tinte-3' : rang >= 3 ? 'fill-weiss stroke-gruen-700' : 'fill-none stroke-gruen-700';
  return (
    <svg aria-hidden viewBox="1 1 22 22" className="absolute inset-0 size-full overflow-visible">
      {rang >= 5 && !offen ? KRANZ.map((p) => <circle key={`${p.x},${p.y}`} cx={p.x} cy={p.y} r={0.9} className="fill-gruen-700" />) : null}
      <path d={STERN} className={aussen} strokeWidth={1.25} strokeLinejoin="round" />
      {rang >= 2 ? <path d={STERN} transform={INNEN} className={innen} strokeWidth={1.25} strokeLinejoin="round" /> : null}
    </svg>
  );
}

/**
 * Abzeichen (ADR 0043 Nr. 5, B-34): Form aus der Achtstern-Geometrie mit dem Symbol der Gruppe in der Mitte, darunter Name
 * und – auf Wunsch – die Bedingung. Ein neu erhaltenes Abzeichen erscheint mit Deckkraft und Skalierung 0,96 → 1 (wie
 * B-14), rein in CSS über `@starting-style` (Tailwind `starting:`); reduziert nur Deckkraft. Ohne Unterstützung im Browser
 * steht es sofort da. Kein Vergleich, keine Zahl, die hochzählt; „Stufe abgeschlossen“ heißt nie „Zertifikat“ (KERN 4.0 §1).
 */
export function Abzeichen({
  art,
  name,
  text,
  neu = false,
  neuText,
  offen = false,
}: {
  /** Gruppe, Wert und Rang aus `ABZEICHEN` (ohne: Rang 1 ohne Symbol) */
  art?: Pick<AbzeichenArt, 'gruppe' | 'wert' | 'rang'>;
  name: string;
  /** Bedingung als Satz (Fortschritt) */
  text?: string;
  /** gerade erhalten: Auftritt B-34 und Hinweis `neuText` */
  neu?: boolean;
  neuText?: string;
  /** noch nicht erhalten (blasse Linie) */
  offen?: boolean;
}) {
  const auftritt = neu
    ? 'transition duration-(--dauer-auftritt) ease-eintritt starting:scale-96 starting:opacity-0 motion-reduce:starting:scale-100'
    : '';
  return (
    <figure
      className={`flex flex-col items-center gap-2 text-center ${auftritt}`}
      data-abzeichen={art ? `${art.gruppe}-${art.wert}` : undefined}
    >
      <span className="relative inline-flex size-20 shrink-0 items-center justify-center">
        <Form rang={art?.rang ?? 1} offen={offen} />
        {art
          ? createElement(symbolVon(art), {
              'aria-hidden': true,
              strokeWidth: 2,
              className: `relative size-7 ${offen ? 'text-tinte-2' : art.rang >= 3 ? 'text-gruen-800' : 'text-gruen-700'}`,
            })
          : null}
      </span>
      <figcaption className="flex flex-col gap-1">
        <span className={`text-16 font-bold ${offen ? 'text-tinte-2' : ''}`}>{name}</span>
        {neu && neuText ? <span className="text-16 text-gruen-800">{neuText}</span> : null}
        {text ? <span className="text-16 text-tinte-2">{text}</span> : null}
      </figcaption>
    </figure>
  );
}
