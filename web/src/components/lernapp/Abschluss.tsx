import { abzeichenArt } from '@/lib/lernapp/ereignisse/abzeichen';
import type { AbschlussStand } from '@/lib/lernapp/ereignisse/ableiten';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import type de from '../../../messages/lernapp/de.json';
import { Abzeichen, abzeichenText, type AbzeichenTexte } from './Abzeichen';
import { Serie, type SerieTexte } from './Serie';

/** Achtstern (Geometrie wie `LernStern`, 24er-Raster). */
const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';
/** Kreis, der oben beginnt und im Uhrzeigersinn läuft (in `rtl` gespiegelt). */
const KREIS = 'M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20';

/** Texte des Abschlussbildschirms (Namensräume `abschluss`, `serie`, `abzeichen`). */
export type AbschlussTexte = { abschluss: (typeof de)['abschluss']; serie: SerieTexte; abzeichen: AbzeichenTexte };

/**
 * Lektion abgeschlossen (B-30, großer Moment, KERN 4.0 §10): Der Achtstern-Ring zeichnet sich einmal (`linie-zeichnet`
 * mit `--dauer-moment` = 1,2 s, also ≤ 1,6 s); Ergebnis, XP und Tagesziel stehen daneben statisch – nichts zählt hoch.
 * Reduziert: Endzustand (globals.css setzt die Animation von `linie-zeichnet` aus). Rein dekorativ (`aria-hidden`).
 */
export function AbschlussRing() {
  return (
    <svg aria-hidden viewBox="2 2 20 20" fill="none" strokeLinejoin="round" className="size-16 shrink-0 text-gruen-700">
      <path d={STERN} stroke="currentColor" strokeWidth={0.75} className="opacity-25" />
      <path d={STERN} stroke="currentColor" strokeWidth={1.5} pathLength={1} className="linie-zeichnet" />
    </svg>
  );
}

/** Tagesziel als Ring (statisch, ohne Übergang): Anteil 0–1 des Ziels; dekorativ, der Text daneben sagt dasselbe. */
export function ZielRing({ anteil }: { anteil: number }) {
  const a = Math.max(0, Math.min(1, anteil));
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-12 shrink-0 rtl:-scale-x-100">
      <path d={KREIS} strokeWidth={3} className="stroke-gruen-50" />
      {a > 0 ? (
        <path d={KREIS} pathLength={1} strokeDasharray={`${a} 1`} strokeWidth={3} strokeLinecap="round" className="stroke-gruen-700" />
      ) : null}
    </svg>
  );
}

/**
 * Was nach einer Lektion dazukommt (ADR 0043, PLAN §8): Tagesziel als Ring mit Text, die Serie als Wochenband (B-33: der
 * heutige Stern füllt sich einmal am Tag) und die neu erhaltenen Abzeichen (B-34). Alles aus dem Ereignisprotokoll des
 * Geräts (`leiteAbNachLektion`), ohne Konto voll nutzbar. Alle Zahlen stehen sofort mit ihrem Endwert da; ein verfehltes
 * Ziel hat keine Folge und keinen Vorwurf. Ohne Tagesziel („kein Ziel“) nur die XP des Tages.
 */
export function Abschluss({
  stand,
  texte,
  ui,
  ziffern,
}: {
  stand: AbschlussStand;
  texte: AbschlussTexte;
  ui: Oberflaeche;
  ziffern: Ziffern;
}) {
  const f = (vorlage: string, werte: Record<string, number>) => formatiere(vorlage, werte, ui, ziffern);
  const { tag, serie, neu } = stand;
  const ziel = tag.ziel;
  const wert = ziel.art === 'xp' ? tag.xp : ziel.art === 'lektionen' ? tag.lektionen : 0;
  const anteil = ziel.art === 'kein' ? 0 : wert / ziel.wert;
  const t = texte.abschluss;
  const abzeichen = neu.flatMap((id) => {
    const art = abzeichenArt(id);
    return art ? [{ art, ...abzeichenText(art, texte.abzeichen, ui, ziffern) }] : [];
  });

  return (
    <div className="flex w-full flex-col gap-4" data-abschluss>
      <div className="flex items-center gap-4 rounded-md bg-sand p-4">
        {ziel.art === 'kein' ? null : <ZielRing anteil={anteil} />}
        <div className="flex flex-col gap-1">
          <p className="font-bold">{t.tagesziel}</p>
          <p className="text-18 tabular-nums">
            {ziel.art === 'kein'
              ? f(t.keinZiel, { xp: tag.xp })
              : tag.erreicht
                ? t.zielErreicht
                : f(ziel.art === 'xp' ? t.zielXp : t.zielLektionen, { erreicht: wert, ziel: ziel.wert })}
          </p>
        </div>
      </div>
      <Serie
        laenge={serie.laenge}
        woche={serie.woche}
        heute={serie.heute}
        texte={texte.serie}
        ui={ui}
        ziffern={ziffern}
        wiedereinstieg={serie.wiedereinstieg}
        pausetage={serie.pausetage}
        flaeche="bg-sand"
      />
      {abzeichen.length ? (
        <section aria-labelledby="abschluss-abzeichen" className="flex flex-col gap-3 rounded-md bg-sand p-4">
          <h3 id="abschluss-abzeichen" className="font-bold">
            {f(t.neueAbzeichen, { n: abzeichen.length })}
          </h3>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {abzeichen.map((a) => (
              <li key={a.art.id}>
                <Abzeichen art={a.art} name={a.name} text={a.text} neu />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
