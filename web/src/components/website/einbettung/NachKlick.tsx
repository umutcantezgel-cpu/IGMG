'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';

/** Texte der Einbettung (vom Server, K-12). `link`: reiner Link zum Anbieter, z. B. „Auf YouTube ansehen“. */
export type NachKlickTexte = { laden: string; hinweis: string; iframeTitel: string; link?: string };

/**
 * Einbettung erst nach Klick (K-14): Vor dem Klick nur der Platzhalter vom Server, der Ladeknopf und der Hinweis auf die
 * Datenübertragung – keine Anfrage an den Anbieter, kein Vorschaubild (auch nicht von ytimg). Nach dem Klick die
 * Einbettung, blendet ein (B-04). Die Fläche hat feste Maße (Video: Seitenverhältnis 16:9), damit nichts springt (CLS).
 * Die Adressen berechnet der Server (`youtubeEinbettung`, `osmEinbettung`); Hosts nur aus `frame-src` der CSP.
 */
export function NachKlick({
  einbettung,
  texte,
  platzhalter,
  verhaeltnis,
  referrerPolicy,
  allow,
  vollbild = false,
  linkZiel,
  kontext,
}: {
  einbettung: string;
  texte: NachKlickTexte;
  /** Inhalt der Fläche vor dem Klick (Server-Element, z. B. Titel und Symbol). */
  platzhalter: ReactNode;
  verhaeltnis: 'video' | 'karte';
  referrerPolicy: 'no-referrer' | 'strict-origin-when-cross-origin';
  allow?: string;
  vollbild?: boolean;
  /** Adresse für `texte.link` (z. B. `youtubeLink(id)`); ohne beide kein Link. */
  linkZiel?: string;
  /** Kontext für Knopf und Link, wenn mehrere Einbettungen auf einer Seite stehen (z. B. der Videotitel, MUSTER §4). */
  kontext?: string;
}) {
  const mitKontext = (sichtbar: string) => (kontext ? `${sichtbar}: ${kontext}` : undefined);
  const [geladen, setGeladen] = useState(false);
  const flaeche = useRef<HTMLDivElement>(null);

  // Der Knopf verschwindet beim Laden; der Fokus wandert deshalb in die Fläche, damit er nicht verloren geht (K-11).
  useEffect(() => {
    if (geladen) flaeche.current?.focus();
  }, [geladen]);

  return (
    <div className={klassen('flex flex-col gap-3', verhaeltnis === 'karte' && 'flex-1')}>
      <div
        ref={flaeche}
        tabIndex={-1}
        className={klassen(
          'relative flex items-center justify-center overflow-hidden rounded-lg border border-linie streifen-platzhalter',
          verhaeltnis === 'video' ? 'aspect-video' : 'min-h-85 flex-1',
        )}
      >
        {geladen ? (
          <iframe
            src={einbettung}
            title={texte.iframeTitel}
            referrerPolicy={referrerPolicy}
            allow={allow}
            allowFullScreen={vollbild}
            className="blendet-ein absolute inset-0 size-full border-0"
            style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            {platzhalter}
            <button
              type="button"
              onClick={() => setGeladen(true)}
              aria-label={mitKontext(texte.laden)}
              className="inline-flex min-h-12 druck items-center justify-center rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800"
            >
              {texte.laden}
            </button>
          </div>
        )}
      </div>
      <p className="text-16 text-tinte-2">{texte.hinweis}</p>
      {texte.link && linkZiel ? (
        <a
          href={linkZiel}
          rel="noopener noreferrer"
          aria-label={mitKontext(texte.link)}
          className="inline-flex min-h-12 items-center self-start font-bold text-gruen-700 underline underline-offset-3"
        >
          {texte.link}
        </a>
      ) : null}
    </div>
  );
}
