import { cn } from '@/lib/utils';

/**
 * Beschriftete Streifenfläche statt Foto (design/AboutUs.dc.html D:32 und D:46, Platzhalter nach M-018), im Stil von
 * `Bildplatzhalter` (Beschriftung als Pille, keine eigene Schrift).
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
        'flex items-center justify-center rounded-md border border-linie px-4 text-center text-16 text-tinte-2 streifen-platzhalter',
        className,
      )}
    >
      <span aria-hidden className="rounded-pill bg-weiss px-3 py-0.5 shadow-s1">
        {beschriftung}
      </span>
    </div>
  );
}
