'use client';

import type { Ref } from 'react';

/** Pegel 0…1 direkt am Balken setzen (ohne React-Zustand: die Messung läuft je Animationsbild, KERN 4.0 §9 INP). */
export function zeigePegel(balken: { style: { scale: string } } | null, pegel: number): void {
  if (balken) balken.style.scale = `${Math.max(0, Math.min(1, pegel))} 1`;
}

/**
 * Pegel der laufenden Aufnahme (B-35, funktional): Balken nach dem Eingangspegel, vom Zeilenanfang aus (gespiegelt in RTL).
 * Den Wert setzt die Aufnahme über `balken` und `zeigePegel` je Animationsbild direkt am Element; die Übung rendert dafür
 * nicht neu. Reduziert: statischer Punkt mit dem Text „Aufnahme läuft“ (der Text steht immer da).
 */
export function Pegel({ balken, text }: { balken: Ref<HTMLSpanElement>; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="inline-block size-3 shrink-0 rounded-pill bg-fehler" />
      <span className="text-18 font-bold">{text}</span>
      <span aria-hidden className="relative h-3 min-w-24 flex-1 overflow-hidden rounded-pill bg-sand motion-reduce:hidden rtl:-scale-x-100">
        <span ref={balken} className="absolute inset-0 rounded-pill bg-gruen-700" style={{ scale: '0 1', transformOrigin: '0 50%' }} />
      </span>
    </div>
  );
}
