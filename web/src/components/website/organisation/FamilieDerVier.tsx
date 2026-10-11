import { cn } from '@/lib/utils';
import { KUERZEL_ALLE, type Kuerzel } from './stil';

/**
 * Familie der vier (großer Moment B-09): ein Achtstern aus vier Segmenten – je Organisation eines, im Uhrzeigersinn
 * AT, KT, GT, KGT. Das eigene Segment steht in der vollen Organisationsfarbe und enthüllt sich einmal per Maske (900 ms,
 * reines CSS ab dem ersten Bild); die übrigen bleiben als Tönung sichtbar. Dekorativ: Name und Zugehörigkeit stehen im Text.
 * Geometrie: Quadrat 30–90 und dasselbe Quadrat um 45° gedreht (Spitzen bei 17,57 und 102,43), geteilt an den Diagonalen.
 */
const SEGMENT: Record<Kuerzel, string> = {
  at: 'M60 60 30 30h17.57L60 17.57 72.43 30H90z',
  kt: 'M60 60 90 30v17.57L102.43 60 90 72.43V90z',
  gt: 'M60 60 90 90H72.43L60 102.43 47.57 90H30z',
  kgt: 'M60 60 30 90V72.43L17.57 60 30 47.57V30z',
};

/** Flächen vollständig ausgeschrieben, damit Tailwind sie findet (wie STIL in stil.ts). */
const FLAECHE: Record<Kuerzel, { voll: string; leise: string }> = {
  at: { voll: 'fill-org-at', leise: 'fill-org-at/20' },
  kt: { voll: 'fill-org-kt', leise: 'fill-org-kt/20' },
  gt: { voll: 'fill-org-gt', leise: 'fill-org-gt/20' },
  kgt: { voll: 'fill-org-kgt', leise: 'fill-org-kgt/20' },
};

export function FamilieDerVier({ org, className }: { org: Kuerzel; className?: string }) {
  const maske = `familie-${org}-maske`;
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={cn('size-16 shrink-0 md:size-48', className)}>
      <defs>
        <mask id={maske}>
          <circle cx="60" cy="60" r="60" fill="white" className="maske-oeffnet" />
        </mask>
      </defs>
      {KUERZEL_ALLE.map((k) => (
        <path key={k} d={SEGMENT[k]} className={cn(FLAECHE[k].leise, 'stroke-weiss')} strokeWidth="2" strokeLinejoin="round" />
      ))}
      <path
        d={SEGMENT[org]}
        mask={`url(#${maske})`}
        className={cn(FLAECHE[org].voll, 'stroke-weiss')}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
