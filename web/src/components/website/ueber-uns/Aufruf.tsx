import { ArrowRight, Mail } from 'lucide-react';
import { Link } from '@/i18n/link';

type Schaltflaeche = { text: string; label: string };

/**
 * Aufruf zur Teilnahme (design/AboutUs.dc.html D:75–81, H-F01): helle Fläche (gruen-50) mit gruen-700-Band oben, direkt vor
 * dem Fuß. Der Titel steht in Tinte, „Kontakt“ ist der einzige gefüllte Knopf, „Zum Vorstand“ ein Knopf mit Rand. Der Fuß
 * bleibt die einzige tiefgrüne Schlussfläche (ENTSCHEIDUNGEN L-E15). Der Fokusring ist global gruen-950 und auf Papier
 * sichtbar. Linknamen nach K-11: „Sichtbarer Text: Titel“.
 */
export function Aufruf({ titel, text, kontakt, mehr }: { titel: string; text: string; kontakt: Schaltflaeche; mehr: Schaltflaeche }) {
  return (
    <section aria-labelledby="ueber-aufruf" className="overflow-hidden rounded-lg bg-gruen-50">
      <div aria-hidden className="h-1.5 bg-gruen-700" />
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-12">
        <div className="flex min-w-0 flex-1 basis-105 flex-col gap-2">
          <h2 id="ueber-aufruf" className="text-display-2">
            {titel}
          </h2>
          <p className="max-w-text text-18 text-tinte-2">{text}</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Link
            href="/kontakt"
            aria-label={kontakt.label}
            className="inline-flex min-h-12 w-full druck items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss sm:w-auto"
          >
            <Mail aria-hidden className="size-5" />
            {kontakt.text}
          </Link>
          <Link
            href="/vorstand"
            aria-label={mehr.label}
            className="inline-flex min-h-12 w-full druck items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 sm:w-auto"
          >
            {mehr.text}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
