'use client';

import { createElement, useEffect, useRef, useState } from 'react';

const SPRACHE = {
  de: () => import('altcha/i18n/de'),
  tr: () => import('altcha/i18n/tr'),
  en: () => import('altcha/i18n/en'),
} as const;

/**
 * ALTCHA-Widget (selbst gehostet, ADR 0005): wird erst bei der ersten Interaktion mit dem Formular nachgeladen
 * (≈ 30 kB nicht im ersten Laden, K-12) und löst die Aufgabe dann sofort („onload“). Ohne Cookies, ohne Dritte;
 * CSP-fest über `altcha-laden.ts` (Worker von der eigenen Herkunft).
 * Interaktions-Signatur abgeschaltet (Datensparsamkeit). Das Widget legt das versteckte Feld „altcha“ an.
 */
export function AltchaFeld({ sprache, texte }: { sprache: 'de' | 'tr' | 'en'; texte: { label: string; hinweis: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  // Nach einer Antwort rendert die Action das Feld mit neuem `key` (Lösungen sind einmalig): Ist das Widget schon
  // geladen, sofort neu einbinden – es holt und löst dann eine neue Aufgabe. Beim ersten Laden (Hydrierung) false.
  const [geladen, setGeladen] = useState(() => typeof window !== 'undefined' && Boolean(window.customElements?.get('altcha-widget')));
  useEffect(() => {
    const formular = ref.current?.closest('form');
    if (!formular || geladen) return;
    let aktiv = true;
    const laden = async () => {
      formular.removeEventListener('focusin', laden);
      formular.removeEventListener('pointerdown', laden);
      await import('./altcha-laden');
      await SPRACHE[sprache]().catch(() => undefined);
      if (aktiv) setGeladen(true);
    };
    formular.addEventListener('focusin', laden);
    formular.addEventListener('pointerdown', laden);
    return () => {
      aktiv = false;
      formular.removeEventListener('focusin', laden);
      formular.removeEventListener('pointerdown', laden);
    };
  }, [sprache, geladen]);
  // Rückfall: Wurde das vorige Widget mitten in seiner Prüfung entfernt (Absenden, bevor „Geprüft“ erschien), startet
  // „auto: onload“ im neuen Widget nicht (ALTCHA 3.3) – dann die Prüfung selbst anstoßen.
  useEffect(() => {
    if (!geladen) return;
    const zeit = setTimeout(() => {
      const widget = ref.current?.querySelector('altcha-widget') as
        (HTMLElement & { getState?: () => string; verify?: () => Promise<unknown> }) | null;
      if (widget?.getState?.() === 'unverified') void widget.verify?.();
    }, 500);
    return () => clearTimeout(zeit);
  }, [geladen]);
  return (
    <div ref={ref} className="flex min-h-18 flex-col gap-1.5" role="group" aria-label={texte.label}>
      {geladen
        ? createElement('altcha-widget', {
            challenge: '/api/altcha',
            name: 'altcha',
            auto: 'onload',
            language: sprache,
            configuration: JSON.stringify({ hideLogo: true, hideFooter: true, humanInteractionSignature: false }),
          })
        : null}
      <p className="max-w-text text-16 text-tinte-2">{texte.hinweis}</p>
    </div>
  );
}
