'use client';

import { useEffect } from 'react';
import { KONZEPTHINWEIS_GESEHEN } from './konzepthinweis-merker';

function merke() {
  try {
    window.localStorage.setItem(KONZEPTHINWEIS_GESEHEN, '1');
  } catch {
    /* Speicher nicht verfügbar – Hinweis erscheint dann erneut */
  }
}

function gesehen(): boolean {
  try {
    return window.localStorage.getItem(KONZEPTHINWEIS_GESEHEN) === '1';
  } catch {
    return false;
  }
}

/** Erster Fokus auf dem Titel: sonst scrollt der Dialog auf schmalen Bildschirmen zum Knopf und schneidet den Titel ab. */
function zeige(d: HTMLDialogElement) {
  d.showModal();
  document.getElementById('hinweis-titel')?.focus();
}

/**
 * Browser-Teil des Konzept-Hinweises (KonzeptHinweis.tsx): Nach einer Client-Navigation läuft das Inline-Skript nicht,
 * dann öffnet dieser Effekt den noch nicht gesehenen Hinweis modal und merkt das Schließen. Rückfall: Hat der Dialog
 * die oberste Ebene verloren (offen, aber nicht modal), wird er ohne `close` (setzte den Merker) wieder modal.
 */
export function KonzeptHinweisOeffner() {
  useEffect(() => {
    const d = document.getElementById('konzepthinweis');
    if (!(d instanceof HTMLDialogElement)) return;
    if (d.open && !d.matches(':modal')) {
      d.removeAttribute('open');
      zeige(d);
    } else if (!d.open && !gesehen()) {
      d.addEventListener('close', merke, { once: true });
      zeige(d);
    }
  }, []);
  return null;
}
