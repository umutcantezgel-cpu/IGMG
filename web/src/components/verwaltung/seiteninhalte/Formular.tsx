'use client';

import type { VerwaltungsStand } from './bereiche';
import { DachverbandFormular } from './Dachverband';
import { IgmgFormular } from './Igmg';
import type { Aktion } from './Rahmen';
import { DatenschutzFormular, ImpressumFormular } from './Rechtstexte';
import { ProjekteFormular } from './Projekte';
import { UeberUnsFormular } from './UeberUns';
import { VorstandFormular } from './Vorstand';

/**
 * Formular eines Bereichs. Die diskriminierte Union `stand.bereich` legt den Inhalt fest, sodass jedes Formular nur den
 * zu seinem Bereich passenden Inhalt erhält.
 */
export function SeiteninhaltFormular({ stand, nurLesen, aktion }: { stand: VerwaltungsStand; nurLesen: boolean; aktion: Aktion }) {
  switch (stand.bereich) {
    case 'ueber-uns':
      return <UeberUnsFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'vorstand':
      return <VorstandFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'projekte':
      return <ProjekteFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'igmg':
      return <IgmgFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'impressum':
      return <ImpressumFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'datenschutz':
      return <DatenschutzFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
    case 'dachverband':
      return <DachverbandFormular startwerte={stand.inhalt} nurLesen={nurLesen} aktion={aktion} />;
  }
}
