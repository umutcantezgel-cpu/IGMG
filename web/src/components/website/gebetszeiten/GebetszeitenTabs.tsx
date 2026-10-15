'use client';

import { useDeferredValue, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { klassen } from '@/lib/klassen';

export type TabSchluessel = 'heute' | 'ort' | 'monat' | 'qibla' | 'einstellungen';

const REIHENFOLGE: TabSchluessel[] = ['heute', 'ort', 'monat', 'qibla', 'einstellungen'];

/**
 * Tab-Leiste der Gebetszeiten (design/PrayerTimes.dc.html, Blatt S02). Nach dem WAI-ARIA-Muster „Tabs“:
 * Pfeiltasten wechseln den Tab, Pos1 und Ende springen an Anfang und Ende. Alle Panels sind bereits im
 * HTML; die inaktiven tragen `hidden`. Texte, Symbole und Panels kommen als Props (K-12); die Symbole rendert der
 * Server, damit lucide nicht im Browser-Code liegt (H-L01, JS ≤ 180 kB gz).
 *
 * Die Leiste ist immer einzeilig (Sichtabnahme Z-04, G-1; vorher brach sie auf 390 px in drei Zeilen um): Reicht der
 * Platz nicht, scrollt sie waagerecht mit Einrasten, ein Randverlauf zeigt, auf welcher Seite weitere Reiter liegen, und
 * der aktive Reiter wird in den Blick gescrollt (ohne die Seite zu bewegen).
 */
export function GebetszeitenTabs({
  ansichtAria,
  labels,
  symbole,
  panels,
}: {
  ansichtAria: string;
  labels: Record<TabSchluessel, string>;
  symbole: Record<TabSchluessel, ReactNode>;
  panels: Record<TabSchluessel, ReactNode>;
}) {
  const [aktiv, setAktiv] = useState<TabSchluessel>('heute');
  /** Der neue Inhalt blendet erst nach einem Wechsel ein (B-04); beim ersten Laden steht er sofort da. */
  const [gewechselt, setGewechselt] = useState(false);
  const knoepfe = useRef<Partial<Record<TabSchluessel, HTMLButtonElement | null>>>({});
  const leiste = useRef<HTMLDivElement>(null);
  /** Liegen links bzw. rechts weitere Reiter außerhalb des Blicks? Steuert den Randverlauf. */
  const [rand, setRand] = useState({ links: false, rechts: false });
  /**
   * Panel folgt dem Reiter einen Render später (INP, Z-08): Der Klick zeichnet sofort den gewählten Reiter, das Aufdecken
   * des neuen Panels (Stil und Layout etwa der Monatstabellen) läuft danach als unterbrechbarer Render
   * (protokolle/C3-menue-inp.md).
   */
  const sichtbar = useDeferredValue(aktiv);

  /** Randverlauf nach Scrollstand und Breite (nur Darstellung, kein Layout). */
  function pruefeRand() {
    const el = leiste.current;
    if (!el) return;
    const links = el.scrollLeft > 1;
    const rechts = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setRand((alt) => (alt.links === links && alt.rechts === rechts ? alt : { links, rechts }));
  }

  useEffect(() => {
    const el = leiste.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const beobachter = new ResizeObserver(() => pruefeRand());
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  // Aktiver Reiter vollständig in den Blick (nur die Leiste scrollt, nie die Seite); beim ersten Laden ohne Bewegung
  const ersterLauf = useRef(true);
  useEffect(() => {
    const el = leiste.current;
    const knopf = knoepfe.current[aktiv];
    const erster = ersterLauf.current;
    ersterLauf.current = false;
    if (!el || !knopf || el.scrollWidth <= el.clientWidth) return;
    const innen = 4;
    const links = knopf.offsetLeft - innen;
    const rechts = knopf.offsetLeft + knopf.offsetWidth + innen - el.clientWidth;
    const ziel = links < el.scrollLeft ? links : rechts > el.scrollLeft ? rechts : null;
    if (ziel === null) return;
    const ruhig = erster || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: ziel, behavior: ruhig ? 'instant' : 'smooth' });
  }, [aktiv]);

  function zeige(ziel: TabSchluessel) {
    if (ziel === aktiv) return;
    setGewechselt(true);
    setAktiv(ziel);
  }

  function wechsle(ziel: TabSchluessel) {
    zeige(ziel);
    knoepfe.current[ziel]?.focus();
  }

  function tastatur(e: KeyboardEvent<HTMLDivElement>) {
    const position = REIHENFOLGE.indexOf(aktiv);
    const letzte = REIHENFOLGE.length - 1;
    let neu: number | null = null;
    if (e.key === 'ArrowRight') neu = position === letzte ? 0 : position + 1;
    else if (e.key === 'ArrowLeft') neu = position === 0 ? letzte : position - 1;
    else if (e.key === 'Home') neu = 0;
    else if (e.key === 'End') neu = letzte;
    if (neu === null) return;
    e.preventDefault();
    wechsle(REIHENFOLGE[neu]);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Rahmen und Fläche außen, damit der Randverlauf nur die Reiter erfasst; innen scrollt die Leiste (relative: MUSTER 4) */}
      <div className="max-w-full self-start rounded-lg border border-linie bg-sand">
        <div
          ref={leiste}
          role="tablist"
          aria-label={ansichtAria}
          onKeyDown={tastatur}
          onScroll={pruefeRand}
          className={klassen(
            'relative flex snap-x snap-proximity scroll-px-1 scrollbar-none gap-1 overflow-x-auto overscroll-x-contain p-1',
            rand.links && rand.rechts ? 'mask-x-from-85%' : rand.rechts ? 'mask-r-from-85%' : rand.links ? 'mask-l-from-85%' : undefined,
          )}
        >
          {REIHENFOLGE.map((s) => {
            const on = s === aktiv;
            return (
              <button
                key={s}
                ref={(el) => {
                  knoepfe.current[s] = el;
                }}
                type="button"
                role="tab"
                id={`gz-tab-${s}`}
                aria-selected={on}
                aria-controls={`gz-panel-${s}`}
                tabIndex={on ? 0 : -1}
                onClick={() => zeige(s)}
                className={klassen(
                  'relative inline-flex min-h-12 shrink-0 druck cursor-pointer snap-start items-center gap-2 rounded-md px-4.5 text-18 font-bold whitespace-nowrap transition duration-(--dauer-rueckmeldung)',
                  on ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte hover:text-gruen-800',
                )}
              >
                {symbole[s]}
                <span>{labels[s]}</span>
                {on ? <span aria-hidden className="absolute inset-x-3.5 bottom-1 h-0.75 rounded-sm bg-gruen-700" /> : null}
              </button>
            );
          })}
        </div>
      </div>
      {REIHENFOLGE.map((s) => (
        <div
          key={s}
          role="tabpanel"
          id={`gz-panel-${s}`}
          aria-labelledby={`gz-tab-${s}`}
          hidden={s !== sichtbar}
          className={s === sichtbar && gewechselt ? 'blendet-ein' : undefined}
          style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
        >
          {panels[s]}
        </div>
      ))}
    </div>
  );
}
