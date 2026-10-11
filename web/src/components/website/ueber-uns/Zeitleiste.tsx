import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { Text, textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { ErstesSichtbarwerden } from '@/components/website/ErstesSichtbarwerden';
import { Bildflaeche } from './Bildflaeche';
import { SYMBOL } from './symbole';

type Eintrag = UeberUnsInhalt['zeitleiste'][number];

/** Punktfarbe nach Stufe: die ersten beiden hell, die letzte Marke tiefgrün (design/AboutUs.dc.html D:46, D:92–96). */
function punktFarbe(i: number, anzahl: number): string {
  if (i < 2) return 'bg-gruen-700';
  return i < anzahl - 1 ? 'bg-gruen-800' : 'bg-gruen-950';
}

/**
 * Zeitleiste „Unsere Reise“ (design/AboutUs.dc.html D:37–50): Punkt mit Symbol, Jahresmarke, Ort, Titel und Bildfläche;
 * jede Station als Karte am Weg (O-10).
 * Die Bildflächen sind nicht anklickbar (Blatt S08, INTERAKTIONEN). Als „Weg der Gemeinde“ (B-07) zieht sich die
 * Verbindungslinie beim ersten Sichtbarwerden durch die Stationen (`ErstesSichtbarwerden`).
 */
export function Zeitleiste({ eintraege, sprache }: { eintraege: Eintrag[]; sprache: Sprache }) {
  return (
    <ErstesSichtbarwerden als="ol" className="flex flex-col">
      {eintraege.map((e, i) => {
        const Icon = SYMBOL[e.symbol];
        const bild = textMitSprache(e.bildbeschreibung, sprache);
        return (
          <li key={i} className="flex gap-5" style={{ '--i': i, '--n': eintraege.length } as CSSProperties}>
            <div aria-hidden className="flex shrink-0 flex-col items-center">
              <span
                className={cn(
                  'weg-punkt flex size-12 items-center justify-center rounded-pill text-weiss',
                  punktFarbe(i, eintraege.length),
                )}
              >
                <Icon aria-hidden className="size-5" />
              </span>
              {i < eintraege.length - 1 ? <span className="weg-linie min-h-6 w-0.5 flex-1 bg-gruen-700/50" /> : null}
            </div>
            {/* Station als Karte am Weg; der Abstand unten gehört zur Zeile, damit die Linie bis zum nächsten Punkt reicht */}
            <div className="min-w-0 flex-1 pb-6 md:pb-8">
              <div className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:flex-row md:items-stretch md:gap-6 md:p-6">
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text
                      feld={e.kennzeichnung}
                      sprache={sprache}
                      className="inline-flex rounded-pill bg-gruen-700 px-3 py-0.5 text-16 font-bold text-weiss"
                    />
                    {e.ort?.de ? (
                      <span className="inline-flex items-center gap-1.5 text-16 text-tinte-2">
                        <MapPin aria-hidden className="size-4" />
                        <Text feld={e.ort} sprache={sprache} />
                      </span>
                    ) : null}
                  </div>
                  <Text feld={e.titel} sprache={sprache} als="h3" className="text-24 text-pretty" />
                </div>
                {e.bild ? (
                  <div className="relative h-28 overflow-hidden rounded-md border border-linie md:h-auto md:min-h-36 md:w-70 md:shrink-0">
                    <Image src={e.bild} alt={bild.text} fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" />
                  </div>
                ) : (
                  <Bildflaeche beschriftung={bild.text} lang={bild.lang} className="h-28 md:h-auto md:min-h-36 md:w-70 md:shrink-0" />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ErstesSichtbarwerden>
  );
}
