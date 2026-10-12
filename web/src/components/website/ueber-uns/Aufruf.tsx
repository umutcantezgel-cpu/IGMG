import { ArrowRight, Mail } from 'lucide-react';
import { Link } from '@/i18n/link';

type Schaltflaeche = { text: string; label: string };

/**
 * Aufruf zur Teilnahme (design/AboutUs.dc.html D:75–81): dunkle Fläche, zwei Schaltflächen als Links zu Kontakt und Vorstand.
 * Der Fokusring ist auf Tiefgrün unsichtbar, darum hell (K-11, Abweichung siehe Bericht). Linknamen nach K-11: „Sichtbarer Text: Titel“.
 */
export function Aufruf({ titel, text, kontakt, mehr }: { titel: string; text: string; kontakt: Schaltflaeche; mehr: Schaltflaeche }) {
  return (
    <section
      aria-labelledby="ueber-aufruf"
      className="flex flex-wrap items-center justify-between gap-6 rounded-lg bg-gruen-950 p-6 text-weiss md:p-12"
    >
      <div className="flex min-w-0 flex-1 basis-105 flex-col gap-2">
        <h2 id="ueber-aufruf" className="text-30 text-weiss md:text-36">
          {titel}
        </h2>
        <p className="max-w-text text-18 text-gruen-100">{text}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/kontakt"
          aria-label={kontakt.label}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-weiss px-6 font-bold text-gruen-950 no-underline hover:bg-gruen-50 hover:text-gruen-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weiss"
        >
          <Mail aria-hidden className="size-5" />
          {kontakt.text}
        </Link>
        <Link
          href="/vorstand"
          aria-label={mehr.label}
          className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-weiss px-5.5 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weiss"
        >
          {mehr.text}
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>
    </section>
  );
}
