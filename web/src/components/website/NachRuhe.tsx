'use client';

import type { ReactNode } from 'react';
import { useNachRuhe } from '@/lib/zeit/useNachRuhe';

/**
 * Hülle für einen großen Moment aus reinem CSS (B-09): `data-ruhe="nein"`, bis der Browser nach dem Einhängen zur
 * Ruhe kommt, dann `"ja"`. Die Regel in globals.css hält die Animation nur bei aktivem Skript bis dahin an
 * (`@media (scripting: enabled)`); ohne JavaScript läuft sie wie bisher ab dem ersten Bild und endet im Endzustand.
 */
export function NachRuhe({ children, className }: { children: ReactNode; className?: string }) {
  const ruhe = useNachRuhe();
  return (
    <span aria-hidden="true" data-ruhe={ruhe ? 'ja' : 'nein'} className={className}>
      {children}
    </span>
  );
}
