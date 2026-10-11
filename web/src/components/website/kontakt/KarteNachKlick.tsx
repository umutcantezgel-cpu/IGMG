'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Kartenfläche der Anfahrt (K-14): Vor dem Klick nur ein beschrifteter Platzhalter, danach die Einbettung.
 * Texte und Adresse kommen als Props (K-12). Ohne Einbettung, also solange keine Koordinaten bestätigt sind
 * (M-010), gibt es nur Platzhalter und Hinweis, keine Schaltfläche.
 */
export function KarteNachKlick({
  einbettung,
  texte,
}: {
  einbettung?: string;
  texte: { platzhalter: string; laden: string; hinweis: string; ohneKoordinaten: string; iframeTitel: string };
}) {
  const [geladen, setGeladen] = useState(false);
  const flaeche = useRef<HTMLDivElement>(null);

  // Der Knopf verschwindet beim Laden; der Fokus wandert deshalb in die Fläche, damit er nicht verloren geht (K-11).
  useEffect(() => {
    if (geladen) flaeche.current?.focus();
  }, [geladen]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={flaeche}
        tabIndex={-1}
        className="relative flex min-h-85 items-center justify-center overflow-hidden rounded-lg border border-linie bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_10px,var(--color-papier)_10px_20px)]"
      >
        {geladen && einbettung ? (
          <iframe src={einbettung} title={texte.iframeTitel} referrerPolicy="no-referrer" className="absolute inset-0 size-full border-0" />
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="font-mono text-16 text-tinte-2">{texte.platzhalter}</p>
            {einbettung ? (
              <button
                type="button"
                onClick={() => setGeladen(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800"
              >
                {texte.laden}
              </button>
            ) : (
              <p className="max-w-(--container-text) text-16 text-tinte-2">{texte.ohneKoordinaten}</p>
            )}
          </div>
        )}
      </div>
      {einbettung ? <p className="text-16 text-tinte-2">{texte.hinweis}</p> : null}
    </div>
  );
}
