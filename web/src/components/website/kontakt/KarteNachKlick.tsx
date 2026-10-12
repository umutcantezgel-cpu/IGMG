'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Kartenfläche der Anfahrt (K-14): Vor dem Klick nur der Hinweis und der Ladeknopf, danach die Einbettung.
 * Texte kommen als Props (K-12). Die Einbettung ist Pflicht: Ohne bestätigte Koordinaten (M-010) rendert die
 * Anfahrt auf dem Server den Platzhalter, diese Insel gibt es dann nicht (H-B10).
 * Die Karte erscheint erst nach dem Klick und blendet dann ein (B-04); davor gibt es keine Anfrage an OpenStreetMap.
 */
export function KarteNachKlick({
  einbettung,
  texte,
}: {
  einbettung: string;
  texte: {
    platzhalter: string;
    laden: string;
    hinweis: string;
    iframeTitel: string;
  };
}) {
  const [geladen, setGeladen] = useState(false);
  const flaeche = useRef<HTMLDivElement>(null);

  // Der Knopf verschwindet beim Laden; der Fokus wandert deshalb in die Fläche, damit er nicht verloren geht (K-11).
  useEffect(() => {
    if (geladen) flaeche.current?.focus();
  }, [geladen]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        ref={flaeche}
        tabIndex={-1}
        className="relative flex min-h-85 flex-1 items-center justify-center overflow-hidden rounded-lg border border-linie streifen-platzhalter"
      >
        {geladen ? (
          <iframe
            src={einbettung}
            title={texte.iframeTitel}
            referrerPolicy="no-referrer"
            className="blendet-ein absolute inset-0 size-full border-0"
            style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="text-16 text-tinte-2">{texte.platzhalter}</p>
            <button
              type="button"
              onClick={() => setGeladen(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98"
            >
              {texte.laden}
            </button>
          </div>
        )}
      </div>
      <p className="text-16 text-tinte-2">{texte.hinweis}</p>
    </div>
  );
}
