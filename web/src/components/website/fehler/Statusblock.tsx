import type { ReactNode } from 'react';

/**
 * Statusblock der Zustände (Fehlerseiten, Offline-Seite): dieselbe Karte wie der Leerzustand (REFERENZ §2) – zentriert,
 * Rand Linie, Grafik, Überschrift (h2), ein Satz und die nächsten Schritte. Die Grafik ist eine Zustandsgrafik
 * (`grafik`, K-008/K-009) oder, nur auf der Offline-Seite, ein Sinnbild im Kreis (`sinnbild`). Ohne Hooks und ohne
 * Daten, deshalb in Server- und Client-Komponenten verwendbar. Die Grafik ist dekorativ (aria-hidden); der Text trägt
 * die Bedeutung.
 */
export function Statusblock({
  grafik,
  sinnbild,
  ueberschrift,
  text,
  children,
}: {
  grafik?: ReactNode;
  sinnbild?: ReactNode;
  ueberschrift: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
      {grafik ? (
        grafik
      ) : sinnbild ? (
        <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">{sinnbild}</span>
      ) : null}
      <h2 className="text-display-2">{ueberschrift}</h2>
      <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{text}</p>
      {children ? <div className="flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  );
}
