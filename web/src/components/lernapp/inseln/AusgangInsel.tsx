'use client';

import { useEffect } from 'react';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';

/**
 * Kurswahl nach Ausgangssprache (ADR 0037 Nr. 7): Der Server zeigt die Sprachkurse der Oberflächensprache offen und die
 * übrigen in aufklappbaren Gruppen `#kurse-aus-<sprache>`. Ist auf dem Gerät eine andere Ausgangssprache gewählt,
 * öffnet diese Insel deren Gruppe. Sie rendert nichts.
 */
export function AusgangInsel({ ui }: { ui: Oberflaeche }) {
  useEffect(() => {
    void einstellungsSpeicher.laden().then((e) => {
      if (!e.ausgang || e.ausgang === ui) return;
      const gruppe = document.getElementById(`kurse-aus-${e.ausgang}`);
      if (gruppe instanceof HTMLDetailsElement) gruppe.open = true;
    });
  }, [ui]);
  return null;
}
