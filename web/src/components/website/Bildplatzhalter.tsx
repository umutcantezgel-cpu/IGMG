import { cn } from '@/lib/utils';

/** Beschriftete Streifen-Fläche statt Foto (readme: „Bilder: beschriftete Streifen-Platzhalter“, M-018). */
export function Bildplatzhalter({
  beschriftung,
  className,
  kurz,
  morph,
}: {
  beschriftung: string;
  className?: string;
  kurz?: string;
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
      <span aria-hidden className="rounded-pill bg-weiss/85 px-3 py-0.5 shadow-s1">
        {kurz ?? beschriftung}
      </span>
    </div>
  );
}
