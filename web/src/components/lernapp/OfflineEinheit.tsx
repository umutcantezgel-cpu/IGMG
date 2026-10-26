'use client';

import { CircleCheck, Download } from 'lucide-react';
import { useState } from 'react';
import { formatiere, intlSprache, ziffernVon, type Ziffern } from '@/lib/lernapp/format';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';
import { speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { meldeStand, speicher } from '@/lib/lernapp/oberflaeche/geraet';
import type { VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';
import { bereiteOfflineVor } from './offline';

export type OfflineTexte = {
  offline: string;
  offlineText: string;
  offlineLaeuft: string;
  offlineFortschritt: string;
  offlineFertig: string;
  offlineFehler: string;
  offlineNichtMoeglich: string;
};

const UMFANG = 2 * Math.PI * 20;

/** B-27: Ring nach echten Bytes (Muster `website/quran/OfflineSpeichern.tsx`); reduziert ohne Übergang. */
function Ring({ anteil, beschriftung }: { anteil: number; beschriftung: string }) {
  return (
    <svg
      role="progressbar"
      aria-label={beschriftung}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(anteil * 100)}
      viewBox="0 0 48 48"
      className="size-12 shrink-0 -rotate-90"
    >
      <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-linie" />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={UMFANG}
        strokeDashoffset={UMFANG * (1 - anteil)}
        className="stroke-gruen-700 transition-strich duration-(--dauer-rueckmeldung) motion-reduce:transition-none"
      />
    </svg>
  );
}

/**
 * Megabyte mit höchstens einer Nachkommastelle (mindestens 0,1) in der Schreibweise der Oberfläche – wie
 * `Intl.NumberFormat(…, { maximumFractionDigits: 1 })`, unter 1000 MB aber ohne Intl (Stufe C N8: das erste Intl-Objekt
 * einer Seite kostet ≈ 20 ms, jede Station zeigt ihre Größe). Komma de/tr „,“, ar östlich „٫“ (U+066B), westlich „.“.
 */
export function megabyte(bytes: number, ui: Oberflaeche, ziffern: Ziffern): string {
  const zehntel = Math.round(Math.max(0.1, bytes / 1e6) * 10);
  const loc = intlSprache(ui, ziffern);
  if (zehntel >= 1e4) return new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(zehntel / 10);
  const komma = ui !== 'ar' ? ',' : ziffern === 'westlich' ? '.' : '\u066B';
  return ziffernVon(zehntel % 10 ? `${Math.floor(zehntel / 10)}${komma}${zehntel % 10}` : String(zehntel / 10), loc);
}

/** Größe einer Einheit samt Tönen (Ring nach Bytes, ADR 0039 Fortschreibung Nr. 8). */
export const einheitBytes = (e: Pick<VerzeichnisEinheit, 'bytes' | 'audio'>): number => e.bytes + e.audio.reduce((s, a) => s + a.bytes, 0);

/**
 * „Einheit offline speichern“ (ADR 0039 Nr. 12, ADR 0038 Nr. 9): Paket und Töne in den Vorrat, als bewusst gespeichert
 * markiert; erst hier bittet die App um dauerhaften Speicher (`navigator.storage.persist()`). Danach die Seiten des Kurses
 * samt Programmteilen für den Start ohne Netz (`bereiteOfflineVor`). Fortschritt als Ring nach Bytes, Ergebnis in einer
 * Live-Region.
 */
export function OfflineEinheit({
  ui,
  ziffern,
  kurs,
  einheit,
  gespeichert,
  onGespeichert,
  texte,
}: {
  ui: Oberflaeche;
  ziffern: Ziffern;
  kurs: KursSlug;
  einheit: VerzeichnisEinheit;
  /** schon bewusst offline gespeichert (Speicher `pakete`, gleicher Hash) */
  gespeichert: boolean;
  /**
   * Nach dem Speichern: die Seite aktualisiert nur, was sich geändert hat (Lernpfad: diese Station, Stufe C N8). Ohne ihn
   * meldet die Einheit `STAND_GEAENDERT` an alle Inseln der Seite.
   */
  onGespeichert?: () => Promise<void>;
  texte: OfflineTexte;
}) {
  const [laeuft, setLaeuft] = useState<{ geladen: number; gesamt: number } | null>(null);
  const [meldung, setMeldung] = useState('');
  const [fertig, setFertig] = useState(gespeichert);
  const moeglich = typeof caches !== 'undefined';
  const mb = (bytes: number) => megabyte(bytes, ui, ziffern);
  const f = (vorlage: string, bytes: number) => formatiere(vorlage, { mb: mb(bytes) }, ui, ziffern);
  const gesamt = einheitBytes(einheit);

  async function speichern() {
    setMeldung('');
    setLaeuft({ geladen: 0, gesamt });
    try {
      const sp = await speicher();
      const e = await speichereOffline(sp, kurs, [einheit], { fortschritt: (geladen, alle) => setLaeuft({ geladen, gesamt: alle }) });
      await bereiteOfflineVor(ui, kurs);
      if (e.fehlgeschlagen.length) setMeldung(texte.offlineFehler);
      else {
        setFertig(true);
        setMeldung(f(texte.offlineFertig, e.bytes));
      }
      if (onGespeichert) void onGespeichert().catch(() => undefined);
      else meldeStand();
    } catch {
      setMeldung(texte.offlineFehler);
    } finally {
      setLaeuft(null);
    }
  }

  if (!moeglich) return <p className="text-16 text-tinte-2">{texte.offlineNichtMoeglich}</p>;
  return (
    <div className="flex flex-col gap-2">
      {laeuft ? (
        <div className="flex flex-wrap items-center gap-3">
          <Ring anteil={laeuft.gesamt ? Math.min(1, laeuft.geladen / laeuft.gesamt) : 0} beschriftung={texte.offlineFortschritt} />
          <span className="tabular-nums">{f(texte.offlineLaeuft, laeuft.geladen)}</span>
        </div>
      ) : fertig ? (
        <p className="flex items-center gap-2 text-16 font-bold text-gruen-800">
          <CircleCheck aria-hidden className="size-6 shrink-0" />
          {f(texte.offlineFertig, gesamt)}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-16 text-tinte-2">{f(texte.offlineText, gesamt)}</p>
          <button
            type="button"
            onClick={() => void speichern()}
            className="inline-flex min-h-12 druck items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 font-bold text-tinte hover:border-gruen-700"
          >
            <Download aria-hidden className="size-5" />
            {texte.offline}
          </button>
        </div>
      )}
      <p role="status" className="sr-only">
        {meldung}
      </p>
      {meldung && !fertig ? <p className="text-16 text-tinte-2">{meldung}</p> : null}
    </div>
  );
}
