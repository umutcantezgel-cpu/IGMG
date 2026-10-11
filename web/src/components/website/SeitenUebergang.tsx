'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { morphKlasse } from './morph';

/**
 * Längste Wartezeit auf die neue Seite. Unter der Grenze des Browsers (4 s, danach bricht er den Übergang ab); danach
 * endet der Übergang auch ohne neue Seite, nichts bleibt eingefroren.
 */
const HOECHSTENS_MS = 3500;

/** Kurze Pause über setTimeout: requestAnimationFrame ruft der Browser während der Übergangs-Aktualisierung nicht auf. */
function pause(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

/** Der sichtbare Seiteninhalt (Seitenrahmen, `data-seite`); verlassene Seiten versteckt Next per Activity. */
function sichtbareSeite(): Element | undefined {
  return [...document.querySelectorAll('[data-seite]')].find((el) => el.getClientRects().length > 0);
}

/**
 * Wartet, bis die Adresse auf das Ziel zeigt und ein neuer Seiteninhalt sichtbar ist (gestreamte Seiten stehen erst
 * nach der Adresse), dann kurz nach. So zeigt der neue Schnappschuss die neue Seite.
 */
async function warteAufSeite(ziel: string, alt: Element | undefined): Promise<void> {
  const start = performance.now();
  const fertig = () => {
    const jetzt = sichtbareSeite();
    return location.pathname + location.search === ziel && jetzt !== undefined && jetzt !== alt;
  };
  while (!fertig() && performance.now() - start < HOECHSTENS_MS) {
    await pause(16);
  }
  await pause(32);
}

/**
 * Gemeinsame Elemente (O-13): Liegt der Link in einer Karte mit `data-morph-karte`, bekommen deren markierte Elemente
 * (`data-morph="titel"`, `"bild"`) jetzt den Namen, den die Detailseite fest trägt (`morphStil`, morph.ts).
 */
function benenneKarte(link: Element): HTMLElement[] {
  const karte = link.closest<HTMLElement>('[data-morph-karte]');
  if (!karte) return [];
  const markiert = [...karte.querySelectorAll<HTMLElement>('[data-morph]')];
  for (const el of markiert) {
    el.style.setProperty('view-transition-name', `${karte.dataset.morphKarte}-${el.dataset.morph}`);
    el.style.setProperty('view-transition-class', morphKlasse(el.dataset.morph));
  }
  return markiert;
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
      const markiert = benenneKarte(link);
      const alt = sichtbareSeite();
      const uebergang = document.startViewTransition(async () => {
        router.push(ziel + url.hash);
        await warteAufSeite(ziel, alt);
      });
      // Nach dem Übergang die Namen wieder lösen (Rückweg ohne doppelte Namen)
      void uebergang.finished.finally(() => {
        for (const el of markiert) {
          el.style.removeProperty('view-transition-name');
          el.style.removeProperty('view-transition-class');
        }
      });
    }
    // Einfangphase am Fenster: vor dem Klick-Handler von next/link, der vorbeugend verhinderte Klicks übergeht.
    window.addEventListener('click', klick, true);
    return () => window.removeEventListener('click', klick, true);
  }, [router]);

  return null;
}
