'use client';

import { type ComponentType, lazy, Suspense, useEffect, useId, useState } from 'react';
import type { Ziffern } from '@/lib/lernapp/format';
import type { Sprache } from '@/lib/lernapp/kurse';
import { SONDERZEICHEN } from '../tastatur/einfuegen';
import { Sonderzeichen } from '../tastatur/Sonderzeichen';
import type { TastaturTexte, UiSprache } from '../typen';

type TastaturProps = {
  texte: TastaturTexte;
  namen: Readonly<Record<string, string>>;
  feldId: string;
  gesperrt: boolean;
  onZeichen: (z: string) => void;
  onLoeschen: () => void;
};

/** Arabische Bildschirmtastatur als eigener Chunk (KERN 4.0 §9: ≤ 10 KB, erst bei arabischem Freitext). */
export const ladeArabischeTastatur = () => import('../tastatur/ArabischeTastatur');
const ArabischeTastatur = lazy(ladeArabischeTastatur) as unknown as ComponentType<TastaturProps>;

/**
 * Zeichenhilfe unter einem Textfeld: für Deutsch und Türkisch die Sonderzeichenleiste, für Arabisch ein Schalter für die
 * Bildschirmtastatur (geladen, sobald ein arabisches Feld erscheint; geöffnet auf Wunsch). `offen` meldet dem Feld, ob die
 * Bildschirmtastatur offen ist (dann `inputMode="none"`, damit die Systemtastatur nicht zusätzlich aufgeht).
 */
export function Zeichenhilfe({
  sprache,
  feldId,
  gesperrt,
  tastatur,
  namen,
  ui,
  ziffern,
  onZeichen,
  onLoeschen,
  onOffen,
}: {
  sprache: Sprache;
  feldId: string;
  gesperrt: boolean;
  tastatur: TastaturTexte;
  namen: Readonly<Record<string, string>>;
  ui: UiSprache;
  ziffern: Ziffern;
  onZeichen: (z: string) => void;
  onLoeschen: () => void;
  onOffen?: (offen: boolean) => void;
}) {
  const id = useId();
  const [offen, setOffen] = useState(false);
  useEffect(() => {
    if (sprache === 'ar') void ladeArabischeTastatur().catch(() => undefined);
  }, [sprache]);

  if (sprache !== 'ar')
    return (
      <Sonderzeichen
        zeichen={SONDERZEICHEN[sprache]}
        sprache={sprache}
        texte={tastatur}
        ui={ui}
        ziffern={ziffern}
        feldId={feldId}
        gesperrt={gesperrt}
        onZeichen={onZeichen}
      />
    );

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        aria-expanded={offen}
        aria-controls={`${id}-tastatur`}
        disabled={gesperrt}
        onClick={() => {
          setOffen(!offen);
          onOffen?.(!offen);
        }}
        className="min-h-11 druck rounded-pill border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 hover:bg-gruen-50 disabled:border-linie disabled:text-tinte-3"
      >
        {tastatur.arabisch}
      </button>
      <div id={`${id}-tastatur`} className="w-full">
        {offen && !gesperrt ? (
          <Suspense fallback={null}>
            <ArabischeTastatur
              texte={tastatur}
              namen={namen}
              feldId={feldId}
              gesperrt={gesperrt}
              onZeichen={onZeichen}
              onLoeschen={onLoeschen}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
