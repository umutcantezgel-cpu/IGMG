import { TriangleAlert } from 'lucide-react';
import { klassen } from '@/lib/klassen';

/**
 * Marke „Entwurf“ an einem Wissensthema, das die religiöse Prüfung noch nicht freigegeben hat (Schalter
 * `website_wissen_vorschau`, ADR 0047): Themenleiste, Themenkopf, Suchtreffer. Ohne Hooks und ohne `'use client'`; die Insel
 * `WissenInsel` bekommt sie fertig gerendert vom Server (Prop `entwurfMarke`, nicht im Client-Bundle, K-12). Der Text kommt vom Server (`wissen.entwurf.marke`); das Zeichen
 * ist nur Schmuck. Tokens wie das Abzeichen „Beispielinhalt“ der Experten.
 */
export function EntwurfMarke({ text, className }: { text: string; className?: string }) {
  return (
    <span
      data-wissen-entwurf-marke=""
      className={klassen(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung',
        className,
      )}
    >
      <TriangleAlert aria-hidden className="size-4" />
      {text}
    </span>
  );
}
