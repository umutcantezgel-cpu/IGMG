'use client';

import { Check } from 'lucide-react';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';
import { Leerzustand } from './Leerzustand';

/**
 * Kategorie-Filter der Veranstaltungsliste (Events.dc.html): blendet Karten per data-Attribut aus –
 * die Liste bleibt statisch gerendert, nur die Auswahl läuft im Browser. Leerzustand bei 0 Treffern.
 * Rechts der Chips steht die Trefferzahl des aktiven Filters als Live-Region (aria-live).
 * Unter „Alle“ zeigt `kinder` die Startform mit Aufmacher, für eine Kategorie `kinderGefiltert` (einheitliches Raster).
 * Der neue Inhalt blendet nach einem Wechsel ein (B-04); beim ersten Laden steht er sofort da.
 */
export function VeranstaltungsFilter({
  kategorien,
  zaehler,
  zaehlTexte,
  texte,
  kinder,
  kinderGefiltert,
}: {
  kategorien: { schluessel: string; label: string }[];
  zaehler: Record<string, number>;
  /** Trefferzahl je Filter („Alle“ und jede Kategorie), vom Server übersetzt, z. B. „5 Veranstaltungen“. */
  zaehlTexte: Record<string, string>;
  texte: { gruppe: string; alle: string; leerTitel: string; leerText: string; keineTermine: string };
  /** Liste unter „Alle“: Aufmacher und Rest. */
  kinder: ReactNode;
  /** Liste für eine einzelne Kategorie; fehlt sie, gilt `kinder`. */
  kinderGefiltert?: ReactNode;
}) {
  const [filter, setFilter] = useState('alle');
  const [gewechselt, setGewechselt] = useState(false);
  const alleKnopf = useRef<HTMLButtonElement | null>(null);
  const treffer = filter === 'alle' ? zaehler.alle : (zaehler[filter] ?? 0);

  function waehle(schluessel: string) {
    if (schluessel === filter) return;
    setGewechselt(true);
    setFilter(schluessel);
  }

  const chip = (schluessel: string, label: string) => {
    const an = filter === schluessel;
    return (
      <button
        key={schluessel}
        ref={schluessel === 'alle' ? alleKnopf : undefined}
        type="button"
        aria-pressed={an}
        onClick={() => waehle(schluessel)}
        className={klassen(
          'inline-flex min-h-12 druck cursor-pointer items-center gap-1.5 rounded-pill px-4 text-18 font-bold transition duration-(--dauer-rueckmeldung)',
          an ? 'border-2 border-gruen-700 bg-gruen-700 text-weiss' : 'border border-rand bg-weiss text-tinte hover:bg-gruen-50',
        )}
      >
        <span>{label}</span>
        {an ? <Check aria-hidden className="size-4" /> : null}
      </button>
    );
  };

  // Ohne einen einzigen Termin gibt es nichts zurückzusetzen: Dann nur der Satz dazu.
  const leer =
    zaehler.alle === 0 ? (
      <Leerzustand titel={texte.leerTitel} text={texte.keineTermine} />
    ) : (
      <Leerzustand
        titel={texte.leerTitel}
        text={texte.leerText}
        aktion={
          <button
            type="button"
            onClick={() => {
              // Der Knopf verschwindet mit dem Wechsel: Der Fokus wandert vorher zum Chip „Alle“.
              alleKnopf.current?.focus();
              waehle('alle');
            }}
            className="inline-flex min-h-12 druck cursor-pointer items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800"
          >
            {texte.alle}
          </button>
        }
      />
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={texte.gruppe} className="flex flex-wrap gap-2">
          {chip('alle', texte.alle)}
          {kategorien.map((k) => chip(k.schluessel, k.label))}
        </div>
        <p aria-live="polite" className="text-16 text-tinte-2">
          {zaehlTexte[filter]}
        </p>
      </div>
      <div
        key={filter}
        data-filter={filter}
        className={gewechselt ? 'blendet-ein' : undefined}
        style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
      >
        {treffer > 0 ? (filter === 'alle' ? kinder : (kinderGefiltert ?? kinder)) : leer}
      </div>
    </div>
  );
}
