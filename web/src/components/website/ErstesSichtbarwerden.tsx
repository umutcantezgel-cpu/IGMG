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
    // Die erste Meldung des Beobachters sagt, ob das Element beim Einhängen schon zu sehen ist – ohne erzwungene
    // Layoutberechnung in der Hydrierung (H-L01; früher getBoundingClientRect).
    let erste = true;
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (!eintrag) return;
        if (erste) {
          erste = false;
          if (eintrag.isIntersecting) {
            beobachter.disconnect();
            return;
          }
          el.dataset.sicht = 'bereit';
          return;
        }
        if (eintrag.intersectionRatio < 0.15) return;
        el.dataset.sicht = 'laeuft';
        beobachter.disconnect();
      },
      { threshold: [0, 0.15] },
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
