'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * Breite des Randverlaufs (`--spacing(12)`, 48 px); ein Eintrag gilt erst als ganz sichtbar, wenn er nicht darunter liegt. Der Scroll-Snap
 * hält links denselben Abstand (`scroll-px-12`), damit ein eingerasteter Eintrag nie im Verlauf steht.
 */
const VERLAUF = 48;

/**
 * Bereichsleiste von „Mein Bereich“ unter 1024 px (Sichtabnahme X-2): eine waagerecht scrollbare Reihe mit Scroll-Snap,
 * einem Randverlauf auf der Seite, auf der es weitergeht, und dem aktiven Eintrag ganz im Blick (beim Laden nur
 * waagerecht verschoben, die Seite selbst bewegt sich nicht). Ab 1024 px ist sie die Seitenleiste – dort scrollt nichts,
 * und es entsteht weder Verlauf noch Verschiebung. Der Zustand steht als data-Attribut am Element (kein Neurendern).
 */
export function BereichLeiste({ label, children }: { label: string; children: ReactNode }) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const messen = () => {
      const rest = el.scrollWidth - el.clientWidth - el.scrollLeft;
      el.toggleAttribute('data-links', el.scrollLeft > 1);
      el.toggleAttribute('data-rechts', rest > 1);
    };
    const aktiv = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (aktiv && el.scrollWidth > el.clientWidth) {
      const anfang = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      const zuWeitRechts = aktiv.offsetLeft + aktiv.offsetWidth > el.scrollLeft + el.clientWidth - VERLAUF;
      const zuWeitLinks = aktiv.offsetLeft < el.scrollLeft + anfang;
      if (zuWeitRechts || zuWeitLinks) el.scrollLeft = aktiv.offsetLeft - anfang;
    }
    messen();
    el.addEventListener('scroll', messen, { passive: true });
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(el);
    return () => {
      el.removeEventListener('scroll', messen);
      beobachter.disconnect();
    };
  }, []);

  return (
    <nav
      ref={nav}
      aria-label={label}
      className="relative -mx-4 snap-x snap-mandatory scroll-px-12 overflow-x-auto px-4 data-links:auslauf-links data-rechts:auslauf-rechts data-links:data-rechts:auslauf-beidseitig lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0"
    >
      {children}
    </nav>
  );
}
