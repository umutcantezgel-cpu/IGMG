'use client';

/**
 * Pegel der laufenden Aufnahme (B-35, funktional): Balken nach dem Eingangspegel, vom Zeilenanfang aus (gespiegelt in RTL).
 * Reduziert: statischer Punkt mit dem Text „Aufnahme läuft“ (der Text steht immer da).
 */
export function Pegel({ pegel, text }: { pegel: number; text: string }) {
  const a = Math.max(0, Math.min(1, pegel));
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="inline-block size-3 shrink-0 rounded-pill bg-fehler" />
      <span className="text-18 font-bold">{text}</span>
      <span aria-hidden className="relative h-3 min-w-24 flex-1 overflow-hidden rounded-pill bg-sand motion-reduce:hidden rtl:-scale-x-100">
        <span className="absolute inset-0 rounded-pill bg-gruen-700" style={{ scale: `${a} 1`, transformOrigin: '0 50%' }} />
      </span>
    </div>
  );
}
