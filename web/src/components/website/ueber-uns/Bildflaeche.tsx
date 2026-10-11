import { cn } from '@/lib/utils';

/**
 * Beschriftete Streifenfläche statt Foto (design/AboutUs.dc.html D:32 und D:46, Platzhalter nach M-018).
 * Die Beschriftung steht am role="img" als aria-label; der sichtbare Text ist für Hilfstechnik ausgeblendet.
 * `lang="de"` kennzeichnet deutschen Rückfall (K-02).
 */
export function Bildflaeche({ beschriftung, lang, className }: { beschriftung: string; lang?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={beschriftung}
      lang={lang}
      className={cn(
        'flex items-center justify-center rounded-md border border-linie bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_10px,var(--color-papier)_10px_20px)] px-3 text-center font-mono text-16 text-tinte-2',
        className,
      )}
    >
      <span aria-hidden>{beschriftung}</span>
    </div>
  );
}
