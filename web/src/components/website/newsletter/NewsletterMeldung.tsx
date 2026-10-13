'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { NewsletterMeldung as Meldung } from '@/lib/newsletter/ziel';

/**
 * Meldung nach Bestätigen oder Abmelden (AUFTRAG 3.10): Die Route Handler leiten auf /newsletter#bestaetigt,
 * #abgemeldet oder #ungueltig; die statische Seite liest den Anker erst im Browser und zeigt den passenden Text
 * (vom Server, K-12). Auf dem Server und beim Hydrieren leer; danach Fokus auf die Meldung. Texte als Props.
 */
function abonnieren(rueckruf: () => void) {
  window.addEventListener('hashchange', rueckruf);
  return () => window.removeEventListener('hashchange', rueckruf);
}

export function NewsletterMeldung({ texte }: { texte: Record<Meldung, string> }) {
  const anker = useSyncExternalStore(
    abonnieren,
    () => window.location.hash.slice(1),
    () => '',
  );
  const meldung = Object.hasOwn(texte, anker) ? (anker as Meldung) : null;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (meldung) ref.current?.focus();
  }, [meldung]);
  if (!meldung) return null;
  const fehler = meldung === 'ungueltig';
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role={fehler ? 'alert' : 'status'}
      data-meldung={meldung}
      className={
        fehler
          ? 'rounded-lg border-2 border-warnung bg-warnung-toenung px-5 py-4 font-bold text-warnung outline-none'
          : 'tritt-auf rounded-lg border-2 border-gruen-700 bg-gruen-50 px-5 py-4 font-bold text-gruen-800 outline-none'
      }
    >
      {texte[meldung]}
    </div>
  );
}
