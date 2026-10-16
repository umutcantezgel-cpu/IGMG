'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Klebende Speicherleisten der Editoren (Reihenfolge, Menüs, Seiten) und WCAG 2.4.11 „Fokus nicht verdeckt“.
 *
 * - `useLeistenAbstand`: Solange die Leiste steht, hält `scroll-padding-bottom` des Dokuments (gemessene Leistenhöhe plus
 *   `--spacing` × 4) jedes Element, das der Browser ins Bild holt, oberhalb der Leiste – beim Tab-Schritt wie beim
 *   `scrollIntoView` unten.
 * - `fokussiereSichtbar`: Nach dem Verschieben bleibt der Fokus am Knopf, der Knopf wandert aber mit seinem Eintrag.
 *   `focus()` allein holt ihn nicht ins Bild (ist er schon fokussiert, scrollt der Browser gar nicht), er lag dann unter
 *   der Leiste oder unterhalb des Fensters (Stufe-C-Nachprüfung 2, Z-07). Deshalb danach `scrollIntoView` mit
 *   `block: 'nearest'` (achtet auf `scroll-padding`); bei reduzierter Bewegung ohne weiches Scrollen.
 */
export function useLeistenAbstand(leisteRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const leiste = leisteRef.current;
    if (!leiste) return;
    const html = document.documentElement;
    const vorher = html.style.scrollPaddingBottom;
    const setze = () => {
      html.style.scrollPaddingBottom = `calc(${Math.ceil(leiste.getBoundingClientRect().height)}px + var(--spacing) * 4)`;
    };
    setze();
    const beobachter = new ResizeObserver(setze);
    beobachter.observe(leiste);
    return () => {
      beobachter.disconnect();
      html.style.scrollPaddingBottom = vorher;
    };
  }, [leisteRef]);
}

/** Fokus auf `el` setzen und es vollständig ins Bild holen (über der Speicherleiste). Ohne Element: `false`. */
export function fokussiereSichtbar(el: HTMLElement | null | undefined): boolean {
  if (!el) return false;
  el.focus({ preventScroll: true });
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: ruhig ? 'auto' : 'smooth' });
  return true;
}
