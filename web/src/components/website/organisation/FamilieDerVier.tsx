import { NachRuhe } from '@/components/website/NachRuhe';
import { cn } from '@/lib/utils';
import { KENNUNG, KUERZEL_ALLE, type Kuerzel, STIL } from './stil';

/**
 * Familie der vier (großer Moment B-09): ein Achtstern aus vier Segmenten – je Organisation eines, im Uhrzeigersinn
 * AT, KT, GT, KGT. Das eigene Segment steht in der vollen Organisationsfarbe und wächst einmal aus der Mitte (900 ms,
 * reines CSS ab dem ersten Bild); die übrigen bleiben als Tönung sichtbar. Dekorativ: Name und Zugehörigkeit stehen im Text.
 * `beschriftet` (H-E05): ab lg stehen die Kürzel AT oben, KT rechts, GT unten, KGT links außerhalb des Achtsterns, das
 * eigene fett. Die Kürzel bewegen sich nicht; das Segment bleibt unverändert.
 * Das Aufziehen wartet, bis die Seite nach der Hydrierung zur Ruhe kommt (`NachRuhe`, Z-05: vorher fiel es in die
 * Hydrierung, 7,8 % verworfene Bilder bei 4-facher Drosselung). Das eigene Segment liegt als zweites SVG über den Tönungen und wird als Ganzes skaliert: Alle Segmente beginnen im
 * Mittelpunkt, Skalieren um die Mitte wirkt wie Enthüllen – und läuft nur im Compositor (E3-Tor: die frühere Maske
 * erzwang Neuzeichnen je Bild, 13,9 % verworfene Bilder bei 4-facher Drosselung).
 * Geometrie: Quadrat 30–90 und dasselbe Quadrat um 45° gedreht (Spitzen bei 17,57 und 102,43), geteilt an den Diagonalen.
 * Ausschnitt 16 16 88 88 mit 1,5 px Strich (Fuge ≈ 3 px); eine weiße Unterlage ohne Strich liegt unter den Tönungen.
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

/** Lage der Kürzel außerhalb des Achtsterns (ab lg, H-E05): oben, rechts, unten, links. */
const LAGE: Record<Kuerzel, string> = {
  at: 'bottom-full left-1/2 mb-1 -translate-x-1/2',
  kt: 'left-full top-1/2 ml-2 -translate-y-1/2',
  gt: 'top-full left-1/2 mt-1 -translate-x-1/2',
  kgt: 'right-full top-1/2 mr-2 -translate-y-1/2',
};

export function FamilieDerVier({ org, className, beschriftet = false }: { org: Kuerzel; className?: string; beschriftet?: boolean }) {
  return (
    <NachRuhe className={cn('relative block size-24 shrink-0 md:size-36 lg:size-48', beschriftet && 'lg:mx-10', className)}>
      <svg viewBox="16 16 88 88" aria-hidden="true" className="size-full">
        <path
          d="M30 30h17.57L60 17.57 72.43 30H90v17.57L102.43 60 90 72.43V90H72.43L60 102.43 47.57 90H30V72.43L17.57 60 30 47.57z"
          className="fill-weiss"
        />
        {KUERZEL_ALLE.map((k) => (
          <path key={k} d={SEGMENT[k]} className={cn(FLAECHE[k].leise, 'stroke-weiss')} strokeWidth="1.5" strokeLinejoin="round" />
        ))}
      </svg>
      <svg viewBox="16 16 88 88" aria-hidden="true" className="familie-eigen absolute inset-0 size-full">
        <path d={SEGMENT[org]} className={cn(FLAECHE[org].voll, 'stroke-weiss')} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {beschriftet
        ? KUERZEL_ALLE.map((k) => (
            <span key={k} className={cn('absolute hidden text-16 lg:block', LAGE[k], STIL[k].ink, k === org ? 'font-bold' : 'font-normal')}>
              {KENNUNG[k]}
            </span>
          ))
        : null}
    </NachRuhe>
  );
}
