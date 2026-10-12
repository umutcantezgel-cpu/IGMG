import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { SYMBOL } from './symbole';

type Wert = UeberUnsInhalt['werte'][number];

/**
 * Werte als ruhige Liste (design/AboutUs.dc.html D:62–73, H-B12): keine Karten und keine Symbolkacheln, eine grüne
 * Kopflinie je Wert, das Symbol steht vor dem Titel. Raster `raster-kacheln` (mindestens 260 px je Spalte).
 */
export function Werte({ eintraege, sprache }: { eintraege: Wert[]; sprache: Sprache }) {
  return (
    <ul className="grid raster-kacheln gap-x-8 gap-y-10">
      {eintraege.map((w, i) => {
        const Icon = SYMBOL[w.symbol];
        return (
          <li key={i}>
            <article className="flex h-full flex-col gap-3 border-t-2 border-gruen-700 pt-5">
              <h3 className="flex items-center gap-2 font-text text-20 leading-snug font-bold tracking-normal">
                <Icon aria-hidden className="size-6 shrink-0 text-gruen-700" />
                <Text feld={w.titel} sprache={sprache} />
              </h3>
              <Text feld={w.beschreibung} sprache={sprache} als="p" className="text-18 text-tinte-2" />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
