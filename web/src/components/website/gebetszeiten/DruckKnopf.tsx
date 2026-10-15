'use client';

import type { ReactNode } from 'react';

/**
 * Druckknopf der Monatsansicht (window.print). Symbol und Text kommen als Kinder vom Server (K-12), damit das
 * lucide-Symbol nicht im Browser-Code liegt (H-L01, JS ≤ 180 kB gz).
 */
export function DruckKnopf({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 druck cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 print:hidden"
    >
      {children}
    </button>
  );
}
