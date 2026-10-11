'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Längste Wartezeit auf die neue Seite; danach endet der Übergang ohne sie (kein eingefrorenes Bild). */
const HOECHSTENS_MS = 4000;

function naechstesBild(): Promise<void> {
  return new Promise((fertig) => requestAnimationFrame(() => fertig()));
}

/** Wartet, bis die Adresse auf das Ziel zeigt (Next setzt sie beim Übernehmen der neuen Seite), dann zwei Bilder. */
async function warteAufSeite(ziel: string): Promise<void> {
  const start = performance.now();
  while (location.pathname + location.search !== ziel && performance.now() - start < HOECHSTENS_MS) {
    await naechstesBild();
  }
  await naechstesBild();
  await naechstesBild();
}

/**
 * B-05 Seitenwechsel (L-E10): Kopf und Leiste stehen, der Inhalt (`view-transition-name: seite` im Seitenrahmen)
 * blendet über. React-`<ViewTransition>` löst hier nicht aus, weil Next mit Cache Components verlassene Seiten per
 * `<Activity>` versteckt statt sie auszuhängen. Deshalb startet dieser Baustein den Übergang selbst: Klick auf einen
 * internen Link → `document.startViewTransition` → darin `router.push` → Ende, sobald die neue Seite steht.
 * Ohne Unterstützung im Browser, bei reduzierter Bewegung, Zusatztasten, neuen Fenstern, Downloads, fremden Zielen
 * und Sprungmarken auf derselben Seite bleibt der normale Link-Klick unverändert.
 */
export function SeitenUebergang() {
  const router = useRouter();

  useEffect(() => {
    function klick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof document.startViewTransition !== 'function') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const link = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      const ziel = url.pathname + url.search;
      if (ziel === location.pathname + location.search) return;
      e.preventDefault();
      document.startViewTransition(async () => {
        router.push(ziel + url.hash);
        await warteAufSeite(ziel);
      });
    }
    // Einfangphase am Fenster: vor dem Klick-Handler von next/link, der vorbeugend verhinderte Klicks übergeht.
    window.addEventListener('click', klick, true);
    return () => window.removeEventListener('click', klick, true);
  }, [router]);

  return null;
}
