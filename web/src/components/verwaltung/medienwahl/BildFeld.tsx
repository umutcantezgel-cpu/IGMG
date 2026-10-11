'use client';

import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BildWahl } from '@/server/queries/verwaltung/medien';
import { MedienWahlDialog, type MedienWahlHandle } from './MedienWahlDialog';

export type BildFeldProps = {
  /** Feld-ID: die Schaltfläche „Bild wählen“ trägt sie, damit Fehler-Sprungverweise dorthin führen. */
  id: string;
  /** Auswählbare Bilder aus der Mediathek (`ladeBildAuswahl`). */
  bilder: BildWahl[];
  /** Gespeicherte Medien-ID oder leer für kein Bild. */
  startwert: string;
  /** Fehlertext, bereits übersetzt. */
  fehler?: string;
};

/**
 * Bildfeld eines Formulars (C11b): gewähltes Bild als verborgenes Feld `bildId` (leer = kein Bild), Vorschau mit
 * Alt-Text aus der Mediathek und Knöpfe zum Wählen, Ändern und Entfernen. Ist der Startwert nicht in der Liste (etwa im
 * Papierkorb), steht ein Hinweis, und der Wert bleibt entfernbar.
 */
export function BildFeld(props: BildFeldProps) {
  // Nach einer Serverantwort ändert sich der Startwert; dann übernimmt das Feld ihn, indem es neu aufgebaut wird.
  return <BildFeldKern key={props.startwert} {...props} />;
}

function BildFeldKern({ id, bilder, startwert, fehler }: BildFeldProps) {
  const t = useTranslations('verwaltung.medienwahl');
  const [wert, setWert] = useState(startwert);
  const wahl = useRef<MedienWahlHandle>(null);
  // Der Auslöser bleibt an derselben Stelle; nach „Bild entfernen“ behält er den Fokus.
  const ausloeser = useRef<HTMLButtonElement>(null);
  const labelId = `${id}-label`;
  const hinweisId = `${id}-hinweis`;
  const fehlerId = `${id}-fehler`;
  const bild = bilder.find((b) => b.id === wert);
  const beschreibung = fehler ? `${hinweisId} ${fehlerId}` : hinweisId;

  async function bildWaehlen() {
    const ergebnis = await wahl.current?.waehle();
    if (ergebnis) setWert(ergebnis.mediumId);
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-1.5">
      <span id={labelId} className="font-bold">
        {t('feldTitel')}
      </span>
      <p id={hinweisId} className="text-16 text-tinte-2">
        {t('feldHinweis')}
      </p>
      <input type="hidden" name="bildId" value={wert} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-linie bg-sand p-2 sm:w-56">
          {bild ? (
            // Verwaltung: einfache Vorschau ohne Bildoptimierung (Datei ist bereits verkleinert), wie in der Medienliste
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bild.url}
              alt={bild.alt}
              width={bild.breite}
              height={bild.hoehe}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="text-center text-16 text-tinte-2">{wert ? t('unbekannt') : t('keinBild')}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            ref={ausloeser}
            id={id}
            type="button"
            variant="outline"
            aria-invalid={fehler ? true : undefined}
            aria-describedby={beschreibung}
            onClick={() => {
              void bildWaehlen();
            }}
          >
            {wert ? t('bildAendern') : t('bildWaehlen')}
          </Button>
          {wert ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setWert('');
                ausloeser.current?.focus();
              }}
            >
              {t('bildEntfernen')}
            </Button>
          ) : null}
        </div>
      </div>
      {fehler ? (
        <p id={fehlerId} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
      <MedienWahlDialog ref={wahl} bilder={bilder} />
    </div>
  );
}
