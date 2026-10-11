'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { KNOPF_RAHMEN } from './stil';

/**
 * Kartenfläche der Anfahrt (K-14): Vor dem Klick nur ein beschrifteter Platzhalter, danach die Einbettung.
 * Texte und Adresse kommen als Props (K-12). Ohne Einbettung, also solange keine Koordinaten bestätigt sind
 * (M-010), zeigt die Fläche einen Leerzustand mit Zustandsgrafik, einem Satz und einem nächsten Schritt.
 * Die Karte erscheint erst nach dem Klick und blendet dann ein (B-04); davor gibt es keine Anfrage an OpenStreetMap.
 */
export function KarteNachKlick({
  einbettung,
  texte,
}: {
  einbettung?: string;
  texte: {
    platzhalter: string;
    laden: string;
    hinweis: string;
    ohneKoordinaten: string;
    iframeTitel: string;
    naechsterSchritt: { label: string; href: string };
  };
}) {
  const [geladen, setGeladen] = useState(false);
  const flaeche = useRef<HTMLDivElement>(null);

  // Der Knopf verschwindet beim Laden; der Fokus wandert deshalb in die Fläche, damit er nicht verloren geht (K-11).
  useEffect(() => {
    if (geladen) flaeche.current?.focus();
  }, [geladen]);

  let inhalt: ReactNode;
  if (geladen && einbettung) {
    inhalt = (
      <iframe
        src={einbettung}
        title={texte.iframeTitel}
        referrerPolicy="no-referrer"
        className="blendet-ein absolute inset-0 size-full border-0"
        style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
      />
    );
  } else if (einbettung) {
    inhalt = (
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
    );
  } else {
    inhalt = (
      <div className="m-6 flex max-w-text flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
        <Zustandsgrafik art="leer" />
        <p className="text-16 text-tinte-2">{texte.platzhalter}</p>
        <p className="text-16">{texte.ohneKoordinaten}</p>
        <a href={texte.naechsterSchritt.href} className={KNOPF_RAHMEN}>
          {texte.naechsterSchritt.label}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        ref={flaeche}
        tabIndex={-1}
        className="relative flex min-h-85 flex-1 items-center justify-center overflow-hidden rounded-lg border border-linie streifen-platzhalter"
      >
        {inhalt}
      </div>
      {einbettung ? <p className="text-16 text-tinte-2">{texte.hinweis}</p> : null}
    </div>
  );
}
