import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { SYMBOL } from './symbole';

type Wert = UeberUnsInhalt['werte'][number];

/** Werte-Karten (design/AboutUs.dc.html D:62–73): Raster mit mindestens 260 px je Karte, Symbol, Titel, Text. */
export function Werte({ eintraege, sprache }: { eintraege: Wert[]; sprache: Sprache }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
      {eintraege.map((w, i) => {
        const Icon = SYMBOL[w.symbol];
        return (
          <li key={i}>
            <article className="flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-lg bg-gruen-50 text-gruen-800">
                <Icon aria-hidden className="size-6" />
              </span>
              <Text feld={w.titel} sprache={sprache} als="h3" className="text-24" />
              <Text feld={w.beschreibung} sprache={sprache} als="p" className="text-18 text-tinte-2" />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
