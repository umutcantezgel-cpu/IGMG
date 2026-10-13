'use client';

import { useEffect, useState } from 'react';

/**
 * „Link kopieren“ der Hadith-Karten (AUFTRAG 3.3): eine Insel je Liste statt einer je Karte. Sie hört auf Klicks an
 * Links mit `data-hadith-link`, kopiert die volle Adresse mit Anker und meldet das Ergebnis in einer Live-Region
 * (WCAG 4.1.3). Ohne JavaScript bleibt der Link ein Sprung zum Anker. Keine Bibliothek, kein next-intl (K-12).
 */
export function LinkKopieren({ texte }: { texte: { kopiert: string; fehler: string } }) {
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    let zeit: ReturnType<typeof setTimeout> | undefined;
    async function klick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[data-hadith-link]') : null;
      if (!link) return;
      e.preventDefault();
      const anker = link.getAttribute('href') ?? '';
      // Die Adresse zeigt den Anker auch ohne Sprung (Rückfall, falls die Zwischenablage gesperrt ist)
      history.replaceState(history.state, '', anker);
      try {
        await navigator.clipboard.writeText(`${location.origin}${location.pathname}${anker}`);
        setMeldung(`${texte.kopiert}: ${link.dataset.hadithLink ?? ''}`);
      } catch {
        setMeldung(texte.fehler);
      }
      clearTimeout(zeit);
      zeit = setTimeout(() => setMeldung(''), 4000);
    }
    document.addEventListener('click', klick);
    return () => {
      document.removeEventListener('click', klick);
      clearTimeout(zeit);
    };
  }, [texte.kopiert, texte.fehler]);

  return (
    <p
      role="status"
      className="fixed inset-x-4 bottom-4 z-(--ebene-toast) mx-auto w-fit max-w-text rounded-md bg-gruen-950 px-4 py-3 text-16 font-bold text-weiss shadow-s2 empty:hidden"
    >
      {meldung}
    </p>
  );
}
