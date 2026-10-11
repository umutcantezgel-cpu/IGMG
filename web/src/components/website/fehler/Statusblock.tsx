import type { ReactNode } from 'react';

/**
 * Statusblock der Fehlerseiten (Blatt S24, abgeleitet aus design/Events.dc.html, Leerzustand): zentriert, gestrichelter
 * Rand, Kreis mit Sinnbild, Überschrift (h2), Text und Knöpfe. Ohne Hooks und ohne Daten, deshalb in Server- und
 * Client-Komponenten verwendbar. Das Sinnbild kommt als Element (`<TriangleAlert aria-hidden className="size-8" />`),
 * damit eine Client-Fehlergrenze nur ihr eigenes Symbol lädt; es ist dekorativ (aria-hidden).
 */
export function Statusblock({
  sinnbild,
  ueberschrift,
  text,
  children,
}: {
  sinnbild: ReactNode;
  ueberschrift: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-rand bg-weiss px-6 py-16 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">{sinnbild}</span>
      <h2 className="text-30">{ueberschrift}</h2>
      <p className="max-w-[52ch] text-tinte-2">{text}</p>
      {children ? <div className="flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  );
}
