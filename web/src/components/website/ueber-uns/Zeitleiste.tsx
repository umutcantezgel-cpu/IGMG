import { MapPin } from 'lucide-react';
import { Bild } from '../Bild';
import { Achtstern } from '@/components/website/Icons';
import { Text, textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { UeberUnsInhalt } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { ErstesSichtbarwerden } from '@/components/website/ErstesSichtbarwerden';
import { Bildflaeche } from './Bildflaeche';
import { SYMBOL } from './symbole';

type Eintrag = UeberUnsInhalt['zeitleiste'][number];

/** Punktfarbe nach Stufe: die ersten beiden Stationen hell, die letzte Marke tiefgrün (design/AboutUs.dc.html D:46, D:92–96). Die Marke ist ein gefüllter Achtstern, die Farbe kommt über `text-*`. */
function punktFarbe(i: number, anzahl: number): string {
  if (i < 2) return 'text-gruen-700';
  return i < anzahl - 1 ? 'text-gruen-800' : 'text-gruen-950';
}

/**
 * Zeitleiste „Unsere Reise“ (design/AboutUs.dc.html D:37–50): Achtstern-Marke mit Symbol, Jahresmarke, Ort, Titel und Bildfläche;
 * jede Station als Karte am Weg (O-10). Die Verbindungslinie ist durchgehend (H-B12): Die Linie reicht bis zur nächsten Marke,
 * darum hat die Punktspalte oben Abstand und die Linie unten ein negatives Maß.
 * Die Bildflächen sind nicht anklickbar (Blatt S08, INTERAKTIONEN). Als „Weg der Gemeinde“ (B-07) zieht sich die
 * Verbindungslinie beim ersten Sichtbarwerden durch die Stationen (`ErstesSichtbarwerden`); jede Station tritt hervor, wenn
 * die Linie sie erreicht (Punkt mit `--i` + 0,5: der Abschnitt davor endet genau dann).
 * B-07 mit Eröffnung (AUFTRAG 4, H-B09): Die letzte Station ist das Ziel des Wegs (heute die Eröffnung der neuen
 * Fatih-Moschee) – tiefgrüne Marke mit hellem Achtstern-Hof und grün gerahmter Karte. Der Hof liegt außerhalb des
 * Layouts, damit die Punktspalte überall gleich breit bleibt und die Linie gerade durchläuft.
 * Ära, Titel, Ort (ab md unten bündig mit der Bildfläche): Die Textspalte stapelt die drei Zeilen in fester Reihenfolge.
 */
export function Zeitleiste({ eintraege, sprache }: { eintraege: Eintrag[]; sprache: Sprache }) {
  return (
    <ErstesSichtbarwerden als="ol" className="flex flex-col">
      {eintraege.map((e, i) => {
        const Icon = SYMBOL[e.symbol];
        const bild = textMitSprache(e.bildbeschreibung, sprache);
        const ziel = eintraege.length > 1 && i === eintraege.length - 1;
        return (
          <li key={i} className="flex gap-3 md:gap-5" style={{ '--i': i, '--n': eintraege.length } as CSSProperties}>
            <div aria-hidden className="flex shrink-0 flex-col items-center pt-3.5">
              <span
                className={cn('weg-punkt relative flex size-10 items-center justify-center md:size-12', punktFarbe(i, eintraege.length))}
                style={{ '--i': i + 0.5 } as CSSProperties}
              >
                {ziel ? (
                  <span className="absolute -inset-2.5 text-gruen-700/20">
                    <Achtstern viewBox="3.5 3.5 17 17" className="size-full" />
                  </span>
                ) : null}
                <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
                <Icon aria-hidden className="relative size-5 stroke-weiss" />
              </span>
              {i < eintraege.length - 1 ? <span className="weg-linie -mb-3.5 min-h-6 w-1 flex-1 bg-gruen-700" /> : null}
            </div>
            {/* Station als Karte am Weg; der Abstand unten gehört zur Zeile, damit die Linie bis zum nächsten Punkt reicht */}
            <div className="min-w-0 flex-1 pb-6 md:pb-8">
              <div
                className={cn(
                  'flex flex-col gap-4 rounded-lg border bg-weiss p-5 shadow-s1 md:flex-row md:items-stretch md:gap-6 md:p-6',
                  ziel ? 'border-gruen-700' : 'border-linie',
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-start gap-2">
                  <Text feld={e.kennzeichnung} sprache={sprache} className="text-16 font-bold text-gruen-800" />
                  <Text feld={e.titel} sprache={sprache} als="h3" className="text-24 text-pretty" />
                  {e.ort?.de ? (
                    <span className="inline-flex items-center gap-1.5 self-start text-16 text-tinte-2 md:mt-auto">
                      <MapPin aria-hidden className="size-4" />
                      <Text feld={e.ort} sprache={sprache} />
                    </span>
                  ) : null}
                </div>
                {e.bild ? (
                  <div className="relative h-28 overflow-hidden rounded-md border border-linie md:h-36 md:w-60 md:shrink-0">
                    <Bild src={e.bild} alt={bild.text} fill sizes="(min-width: 768px) 240px, 100vw" className="object-cover" />
                  </div>
                ) : (
                  <Bildflaeche beschriftung={bild.text} lang={bild.lang} className="h-28 md:h-36 md:w-60 md:shrink-0" />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ErstesSichtbarwerden>
  );
}
