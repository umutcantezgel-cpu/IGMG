import { cn } from '@/lib/utils';

/** Beschriftete Streifen-Fläche statt Foto (readme: „Bilder: beschriftete Streifen-Platzhalter“, M-018). */
export function Bildplatzhalter({ beschriftung, className, kurz }: { beschriftung: string; className?: string; kurz?: string }) {
  return (
    <div
      role="img"
      aria-label={beschriftung}
      className={cn(
        'flex items-center justify-center bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_10px,var(--color-papier)_10px_20px)] px-4 text-center font-mono text-[15px] text-tinte-2',
        className,
      )}
    >
      <span aria-hidden>{kurz ?? beschriftung}</span>
    </div>
  );
}
