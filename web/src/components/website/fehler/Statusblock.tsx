import type { ReactNode } from 'react';

/**
 * Statusblock der Zustände (Fehlerseiten, Offline-Seite): dieselbe Karte wie der Leerzustand (REFERENZ §2) – zentriert,
 * Rand Linie, Grafik, Überschrift (h2, nur wenn gesetzt), ein Satz und die nächsten Schritte. Die Grafik ist eine
 * Zustandsgrafik (`grafik`, K-008/K-009) oder, nur auf der Offline-Seite, ein Sinnbild im Kreis (`sinnbild`). Ohne Hooks
 * und ohne Daten, deshalb in Server- und Client-Komponenten verwendbar. Die Grafik ist dekorativ (aria-hidden); der Text
 * trägt die Bedeutung.
 *
 * `ausrichtung="start"` (H-B14): ohne Kartenrahmen direkt auf der Seitenachse – Grafik links in Spalte 1, Text und
 * Schritte daneben (ab lg), einspaltig mit Grafik oben auf dem Telefon. Ohne Grafik nehmen Text und Schritte ab lg die
 * ganze Breite. Ohne `role="status"`: die Seite ist kein Rückmeldungsbereich, sondern der Inhalt selbst.
 */
export function Statusblock({
  grafik,
  sinnbild,
  ueberschrift,
  text,
  ausrichtung = 'mitte',
  children,
}: {
  grafik?: ReactNode;
  sinnbild?: ReactNode;
  ueberschrift?: string;
  text: string;
  ausrichtung?: 'mitte' | 'start';
  children?: ReactNode;
}) {
  if (ausrichtung === 'start') {
    return (
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {grafik ? <div className="justify-self-start">{grafik}</div> : null}
        <div className={`flex w-full flex-col items-start gap-6 ${grafik ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {ueberschrift ? <h2 className="text-display-2">{ueberschrift}</h2> : null}
          <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{text}</p>
          {children ? <div className="flex w-full flex-col items-start gap-6">{children}</div> : null}
        </div>
      </div>
    );
  }
  return (
    <div role="status" className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
      {grafik ? (
        grafik
      ) : sinnbild ? (
        <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">{sinnbild}</span>
      ) : null}
      {ueberschrift ? <h2 className="text-display-2">{ueberschrift}</h2> : null}
      <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{text}</p>
      {children ? <div className="flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  );
}
