import type { ComponentType } from 'react';
import { abzeichenArt } from '@/lib/lernapp/ereignisse/abzeichen';
import type { AbschlussStand } from '@/lib/lernapp/ereignisse/ableiten';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { type AbschlussTexte, ZielRing } from './Abschluss';
import { Abzeichen, abzeichenText } from './Abzeichen';
import { Serie } from './Serie';

export type AbschlussInhaltProps = { stand: AbschlussStand; texte: AbschlussTexte; ui: Oberflaeche; ziffern: Ziffern };

/** Stand nach der Lektion mit seiner Anzeige (eigener Chunk, von der Insel geladen; Muster `MeldenDialog`). */
export type AbschlussAnzeige = { stand: AbschlussStand; Anzeige: ComponentType<AbschlussInhaltProps> };

/**
 * Was nach einer Lektion dazukommt (ADR 0043, PLAN §8): Tagesziel als Ring mit Text, die Serie als Wochenband (B-33: der
 * heutige Stern füllt sich einmal am Tag) und die neu erhaltenen Abzeichen (B-34). Alles aus dem Ereignisprotokoll des
 * Geräts (`leiteAbNachLektion`), ohne Konto voll nutzbar. Alle Zahlen stehen sofort mit ihrem Endwert da; ein verfehltes
 * Ziel hat keine Folge und keinen Vorwurf. Ohne Tagesziel („kein Ziel“) nur die XP des Tages.
 */
export function AbschlussInhalt({ stand, texte, ui, ziffern }: AbschlussInhaltProps) {
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
