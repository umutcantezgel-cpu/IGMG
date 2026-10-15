import { ArrowRight, type LucideIcon } from 'lucide-react';
import NextLink from 'next/link';

export type Kachel = { schluessel: string; Icon: LucideIcon; titel: string; text: string; href: string | null };

const PFEIL =
  'size-5 shrink-0 text-gruen-700 transition-transform duration-(--dauer-rueckmeldung) motion-safe:group-hover:translate-x-1 motion-reduce:transition-none';

/**
 * Kacheln der Startseite von „Mein Bereich“: Link-Karten (ganze Fläche klickbar, ≥ 48 px) oder – für noch nicht
 * gebaute Bereiche – ruhige Karten mit „bald verfügbar“ ohne Link (nie kaputt). Auf dem Telefon als kompakte Zeile
 * (Symbol, Text, Pfeil), ab 640 px als Karte im Raster.
 */
export function Kacheln({ titel, kacheln, bald }: { titel: string; kacheln: Kachel[]; bald: string }) {
  return (
    <section aria-labelledby="kacheln-titel" className="flex flex-col gap-4">
      <h2 id="kacheln-titel" className="text-24">
        {titel}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kacheln.map(({ schluessel, Icon, titel: name, text, href }) => (
          <li key={schluessel} className="flex">
            {href ? (
              <NextLink
                href={href}
                prefetch={false}
                className="group flex w-full druck items-start gap-4 rounded-lg border border-linie bg-weiss p-4 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 sm:flex-col sm:gap-3 sm:p-5"
              >
                <span className="flex shrink-0 items-center justify-between gap-3 sm:w-full">
                  <span className="flex size-12 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <ArrowRight aria-hidden className={`${PFEIL} max-sm:hidden`} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-3">
                  <span className="text-18 font-bold sm:text-20">{name}</span>
                  <span className="text-16 text-pretty text-tinte-2">{text}</span>
                </span>
                <ArrowRight aria-hidden className={`${PFEIL} mt-3.5 sm:hidden`} />
              </NextLink>
            ) : (
              <div className="flex w-full items-start gap-4 rounded-lg border border-dashed border-rand bg-papier p-4 sm:flex-col sm:gap-3 sm:p-5">
                <span className="flex shrink-0 items-center justify-between gap-3 sm:w-full">
                  <span className="flex size-12 items-center justify-center rounded-md bg-sand text-tinte-2">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="rounded-pill bg-sand px-2.5 py-0.5 text-16 font-bold text-tinte-2 max-sm:hidden">{bald}</span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-3">
                  <span className="text-18 font-bold text-tinte-2 sm:text-20">{name}</span>
                  <span className="text-16 text-pretty text-tinte-2">{text}</span>
                  <span className="self-start rounded-pill bg-sand px-2.5 py-0.5 text-16 font-bold text-tinte-2 sm:hidden">{bald}</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
