import { TriangleAlert } from 'lucide-react';
import { klassen } from '@/lib/klassen';

/**
 * Hinweis „Entwurf zur Prüfung – noch nicht vom Imam geprüft“ an einem Wissensthema der Website (Schalter
 * `website_wissen_vorschau`, ADR 0047; Muster `components/lernapp/EntwurfHinweis.tsx`): Kasten in Warnfarbe aus den Tokens,
 * das Zeichen ist nur Schmuck. `kompakt`: eine Zeile für eingebettete Erklärungen (`WissenErklaerung`) – ohne eigene
 * Überschrift, damit die Gliederung der einbettenden Seite stimmt. Texte vom Aufrufer (`wissen.entwurf.*`).
 * `data-wissen-entwurf` für E2E. Server-Komponente ohne Client-Code (K-12).
 */
export function EntwurfHinweis({
  titel,
  text,
  kompakt = false,
  className,
}: {
  titel: string;
  text: string;
  kompakt?: boolean;
  className?: string;
}) {
  if (kompakt)
    return (
      <p
        role="note"
        data-wissen-entwurf="kompakt"
        className={klassen('flex gap-2 rounded-md border border-warnung bg-warnung-toenung px-3 py-2 text-16 text-tinte', className)}
      >
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-warnung" />
        <span>
          <strong>{titel}</strong> {text}
        </span>
      </p>
    );
  return (
    <section
      data-wissen-entwurf="hinweis"
      aria-label={titel}
      className={klassen('flex max-w-einleitung gap-3 rounded-lg border border-warnung bg-warnung-toenung p-5 text-tinte', className)}
    >
      <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0 text-warnung" />
      <div className="flex flex-col gap-1">
        <h2 className="text-18 font-bold">{titel}</h2>
        <p className="text-18 text-pretty">{text}</p>
      </div>
    </section>
  );
}
