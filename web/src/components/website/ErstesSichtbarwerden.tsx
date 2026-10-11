'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * Auslöser für große Momente beim ersten Sichtbarwerden (B-07 Weg der Gemeinde, B-08 Meilensteinlinie): setzt
 * `data-sicht="bereit"` und beim Eintritt in den Bildschirm `data-sicht="laeuft"`; die Stufen stehen in globals.css.
 * Nur wenn das Element beim Einhängen außerhalb des Bildschirms liegt – sonst bleibt der Endzustand stehen (nichts
 * verschwindet vor den Augen). Ohne JavaScript und bei reduzierter Bewegung: Endzustand.
 */
export function ErstesSichtbarwerden({
  als = 'div',
  children,
  className,
}: {
  als?: 'div' | 'ol';
  children: ReactNode;
  className?: string;
}) {
  const element = useRef<HTMLDivElement & HTMLOListElement>(null);
  useEffect(() => {
    const el = element.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.dataset.sicht = 'bereit';
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (!eintrag?.isIntersecting) return;
        el.dataset.sicht = 'laeuft';
        beobachter.disconnect();
      },
      { threshold: 0.15 },
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);
  const Element = als;
  return (
    <Element ref={element} className={className}>
      {children}
    </Element>
  );
}
