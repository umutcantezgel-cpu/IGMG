'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type FehlerTexte = { titel: string; text: string; nochmal: string; start: string; startAdresse: string };

const Kontext = createContext<FehlerTexte | null>(null);

/**
 * Texte der Fehlerseite (`error.tsx`, Client-Komponente) in der Oberflächensprache: Das Wurzel-Layout reicht sie vom
 * Server herein, weil der Client der Lern-App kein next-intl lädt (KERN 4.0 §9) und die Fehlergrenze keine Props vom
 * Server bekommt. Die Grenze liegt innerhalb dieses Anbieters.
 */
export function FehlerTexteAnbieter({ texte, children }: { texte: FehlerTexte; children: ReactNode }) {
  return <Kontext value={texte}>{children}</Kontext>;
}

export function useFehlerTexte(): FehlerTexte | null {
  return useContext(Kontext);
}
