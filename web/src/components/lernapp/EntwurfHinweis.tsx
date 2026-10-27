import { TriangleAlert } from 'lucide-react';

/**
 * Hinweis „Entwurf zur Prüfung“ (Vorschau des Wissenskurses, Schalter `lernapp_wissen_vorschau`, L3-E22): Überschrift und Text
 * in einem Kasten in Warnfarbe (Tokens aus `globals.css`); das Zeichen ist nur Schmuck. Ohne `'use client'`: auf der Kursseite
 * und beim Wiederholen auf dem Server gezeichnet, über dem Spieler im Client. `kennung` setzt `data-wissen-entwurf` (E2E).
 */
export function EntwurfHinweis({ titel, text, kennung }: { titel: string; text: string; kennung: string }) {
  return (
    <section
      data-wissen-entwurf={kennung}
      aria-label={titel}
      className="flex max-w-einleitung gap-3 rounded-lg border border-warnung bg-warnung-toenung p-5 text-tinte"
    >
      <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0 text-warnung" />
      <div className="flex flex-col gap-1">
        <h2 className="text-18 font-bold">{titel}</h2>
        <p className="text-18 text-pretty">{text}</p>
      </div>
    </section>
  );
}
