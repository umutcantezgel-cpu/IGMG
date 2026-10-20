'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Platz für Inhalte, die über einen Suchparameter gewählt werden (PLAN §3.1): `…/ueben?l=<lektion>` (Lektionsspieler)
 * und `…/tipps?e=<einheit>` (Grammatik-Tipps). Die Seite bleibt eine statische Hülle; der Wert wird erst im Browser
 * gelesen (`useSearchParams` unter `Suspense`; der Service Worker liefert die Hülle mit `ignoreSearch`). Ohne Wert steht
 * der Weg zurück zum Lernpfad, mit Wert der Hinweis „noch nicht verfügbar“, bis die Zusammenführung hier den Spieler
 * (`import('@/components/lernapp/Spieler')`) bzw. die Tipps aus dem Kurspaket einhängt.
 */
export function SuchwertPlatz({
  name,
  ohneWert,
  mitWert,
  lernpfad,
}: {
  /** Suchparameter: `l` (Lektion) oder `e` (Einheit) */
  name: 'l' | 'e';
  ohneWert: string;
  mitWert: string;
  lernpfad: { adresse: string; text: string };
}) {
  const wert = useSearchParams().get(name);
  return (
    <div data-auswahl={wert ?? undefined} className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <p className="text-18">{wert ? mitWert : ohneWert}</p>
      <a href={lernpfad.adresse} className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
        {lernpfad.text}
      </a>
    </div>
  );
}
