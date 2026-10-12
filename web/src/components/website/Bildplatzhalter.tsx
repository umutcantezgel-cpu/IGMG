import { cn } from '@/lib/utils';

/** Beschriftete Streifen-Fläche statt Foto (readme: „Bilder: beschriftete Streifen-Platzhalter“, M-018). */
export function Bildplatzhalter({
  beschriftung,
  className,
  kurz,
  kurzBisMd,
  morph,
}: {
  beschriftung: string;
  className?: string;
  kurz?: string;
  /** Kurze Beschriftung nur unter 768 px (Karte, die auf dem Telefon zur Kompaktzeile wird); ab md die volle */
  kurzBisMd?: string;
  /** Markierung für den Seitenwechsel (O-13): SeitenUebergang vergibt beim Klick den Übergangsnamen */
  morph?: string;
}) {
  return (
    <div
      role="img"
      aria-label={beschriftung}
      data-morph={morph}
      className={cn('flex items-center justify-center px-4 text-center text-16 text-tinte-2 streifen-platzhalter', className)}
    >
      <span aria-hidden className="rounded-pill bg-weiss px-3 py-0.5 shadow-s1">
        {kurzBisMd ? (
          <>
            <span className="md:hidden">{kurzBisMd}</span>
            <span className="max-md:hidden">{beschriftung}</span>
          </>
        ) : (
          (kurz ?? beschriftung)
        )}
      </span>
    </div>
  );
}
