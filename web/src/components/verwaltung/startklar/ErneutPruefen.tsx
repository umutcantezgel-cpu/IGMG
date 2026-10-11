'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LadeStern } from '@/components/website/Zustandsgrafik';

/**
 * „Erneut prüfen“ (Startklar-Cockpit): lädt die Seite neu. Der Ladezustand endet, sobald der Server einen neuen Stand
 * liefert (`stand` ist der Zeitpunkt der Prüfung). Ohne Effekt, nur aus Klick und Stand abgeleitet.
 */
export function ErneutPruefen({ stand, texte }: { stand: string; texte: { knopf: string; laeuft: string } }) {
  const router = useRouter();
  const [angestossenBei, setAngestossenBei] = useState<string | null>(null);
  const laeuft = angestossenBei === stand;
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        setAngestossenBei(stand);
        router.refresh();
      }}
    >
      {laeuft ? <LadeStern /> : null}
      {laeuft ? texte.laeuft : texte.knopf}
    </Button>
  );
}
