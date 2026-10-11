'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * Weg der Gemeinde (großer Moment B-07): Beim ersten Sichtbarwerden zieht sich die Linie durch die Stationen, jede Station
 * tritt hervor, wenn die Linie sie erreicht. Nur wenn die Liste beim Einhängen außerhalb des Bildschirms liegt – sonst
 * bleibt der Endzustand stehen (nichts verschwindet vor den Augen). Ohne JavaScript und bei reduzierter Bewegung:
 * Endzustand. Die Stufen stehen in globals.css (`[data-weg]`).
 */
export function WegBeobachter({ children, className }: { children: ReactNode; className?: string }) {
  const liste = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = liste.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.dataset.weg = 'bereit';
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (!eintrag?.isIntersecting) return;
        el.dataset.weg = 'laeuft';
        beobachter.disconnect();
      },
      { threshold: 0.15 },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);
  return (
    <ol ref={liste} className={className}>
      {children}
    </ol>
  );
}
