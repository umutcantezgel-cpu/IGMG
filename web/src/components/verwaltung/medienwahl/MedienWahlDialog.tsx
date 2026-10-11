'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useId, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/button';
import type { BildAuswahl } from '@/components/verwaltung/richtext/typen';
import type { BildWahl } from '@/server/queries/verwaltung/medien';

/** Höchstzahl der Bilder in der Auswahl. Entspricht `BILDWAHL_GRENZE` in server/queries/verwaltung/medien.ts (dort nicht importierbar). */
const BILDWAHL_GRENZE = 300;

/** Filter nach Alt-Text oder Dateiname, ohne Groß-/Kleinschreibung und Leerraum am Rand; leerer Filter zeigt alle. */
export function filtereBilder(bilder: readonly BildWahl[], suche: string): BildWahl[] {
  const gesucht = suche.trim().toLocaleLowerCase('de-DE');
  if (!gesucht) return [...bilder];
  return bilder.filter(
    (b) => b.alt.toLocaleLowerCase('de-DE').includes(gesucht) || (b.dateiname ?? '').toLocaleLowerCase('de-DE').includes(gesucht),
  );
}

/** Ergebnis der Auswahl. `null` heißt: abgebrochen oder ohne Wahl geschlossen. */
export type MedienWahlErgebnis = { mediumId: string };

/**
 * Wartet auf die Antwort der Auswahl, ganz ohne DOM (daher prüfbar): je Öffnen genau eine Auflösung. Ein erneutes
 * Öffnen beendet einen offenen Vorgang mit `null`; Abbrechen und Escape ergeben ebenfalls `null`.
 */
export function wahlWarteschlange() {
  let offen: ((wahl: MedienWahlErgebnis | null) => void) | null = null;
  return {
    oeffnen(): Promise<MedienWahlErgebnis | null> {
      offen?.(null);
      return new Promise((antworten) => {
        offen = antworten;
      });
    },
    beenden(wahl: MedienWahlErgebnis | null): void {
      const antwort = offen;
      offen = null;
      antwort?.(wahl);
    },
  };
}

/** Über `ref` erreichbar: `waehle()` öffnet die Auswahl und liefert die gewählte Medien-ID oder `null`. */
export type MedienWahlHandle = { waehle: BildAuswahl };

const filterfeld = 'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3';

/**
 * Mediathek-Auswahl (C11b) als natives `<dialog>`: Filter über Alt-Text und Dateiname (ohne Server), Raster der Bilder
 * und Rückgabe der Medien-ID. Abbrechen und Escape liefern `null`. Fokus: beim Öffnen ins Filterfeld, beim Schließen
 * zurück auf den Auslöser. Das Filterfeld fängt Enter ab, damit das umgebende Formular nicht absendet.
 */
export function MedienWahlDialog({ bilder, ref }: { bilder: BildWahl[]; ref?: Ref<MedienWahlHandle> }) {
  const t = useTranslations('verwaltung.medienwahl');
  const titelId = useId();
  const filterId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const ausloeser = useRef<HTMLElement | null>(null);
  const [warte] = useState(wahlWarteschlange);
  const [suche, setSuche] = useState('');

  const waehle = useCallback(() => {
    const d = dialogRef.current;
    if (!d) return Promise.resolve<MedienWahlErgebnis | null>(null);
    ausloeser.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSuche('');
    if (!d.open) d.showModal();
    filterRef.current?.focus();
    return warte.oeffnen();
  }, [warte]);
  useImperativeHandle(ref, () => ({ waehle }), [waehle]);

  /** Schließt die Auswahl, gibt den Fokus an den Auslöser zurück und meldet das Ergebnis. */
  const schliesse = (wahl: MedienWahlErgebnis | null) => {
    if (dialogRef.current?.open) dialogRef.current.close();
    if (ausloeser.current?.isConnected) ausloeser.current.focus();
    warte.beenden(wahl);
  };

  const treffer = filtereBilder(bilder, suche);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titelId}
      onClose={() => {
        // Escape schließt nativ ohne Ergebnis. Ist die Auswahl inzwischen erneut offen, gilt das Ereignis nicht mehr.
        if (!dialogRef.current?.open) warte.beenden(null);
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-lg border border-linie bg-weiss p-0 text-tinte shadow-s1 backdrop:bg-tinte/50"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 p-5 md:p-6">
        <h2 id={titelId} className="font-display text-24 font-semibold">
          {t('titel')}
        </h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={filterId} className="font-bold">
            {t('filter')}
          </label>
          <input
            id={filterId}
            ref={filterRef}
            type="search"
            autoComplete="off"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            className={filterfeld}
          />
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {bilder.length === 0 ? (
            <p className="text-tinte-2">{t('leer')}</p>
          ) : treffer.length === 0 ? (
            <p className="text-tinte-2">{t('keineTreffer')}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {treffer.map((bild) => (
                <li key={bild.id}>
                  <button
                    type="button"
                    aria-label={t('waehlen', { alt: bild.alt })}
                    onClick={() => schliesse({ mediumId: bild.id })}
                    className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-rand bg-weiss text-left hover:border-gruen-700"
                  >
                    {/* Vorschau ohne Bildoptimierung wie in der Medienliste (Datei ist bereits verkleinert). Der Name steht am Knopf. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bild.url}
                      alt=""
                      width={bild.breite}
                      height={bild.hoehe}
                      loading="lazy"
                      className="aspect-[4/3] w-full bg-sand object-cover"
                    />
                    <span className="line-clamp-2 p-2.5 text-16">{bild.alt}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {bilder.length >= BILDWAHL_GRENZE ? <p className="text-16 text-tinte-2">{t('grenze', { anzahl: BILDWAHL_GRENZE })}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/verwaltung/medien"
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
          >
            {t('zurMediathek')}
            <span className="sr-only"> {t('zurMediathekNeuerTab')}</span>
          </Link>
          <Button type="button" variant="outline" onClick={() => schliesse(null)}>
            {t('abbrechen')}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
