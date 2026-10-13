'use client';

import { CircleCheck, Download, Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { fuelle, type LeserPfade, type LeserRezitation, type LeserTexte } from './leser-typen';
import { entferne, type Fortschritt, liesVerzeichnis, offlineMoeglich, type OfflineEintrag, sammleAdressen, speichere } from './offline';

const UMFANG = 2 * Math.PI * 20;
const mb = (bytes: number) => (bytes / 1e6).toLocaleString(undefined, { maximumFractionDigits: bytes < 1e7 ? 1 : 0 });

/** B-27: Ring nach echten Bytes (oder Dateien, wenn die Größe offen ist); reduziert ohne Übergang. */
function Ring({ anteil, beschriftung }: { anteil: number; beschriftung: string }) {
  const prozent = Math.round(anteil * 100);
  return (
    <svg
      role="progressbar"
      aria-label={beschriftung}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={prozent}
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
        className="stroke-gruen-700 transition-[stroke-dashoffset] duration-(--dauer-rueckmeldung) motion-reduce:transition-none"
      />
    </svg>
  );
}

/**
 * Offline lesen (H-O01): Die Seite mit Wortangaben, gewählter Übersetzung, Programmteilen und auf Wunsch der
 * Rezitation im Gerät speichern oder wieder entfernen. Lädt erst, wenn die Ansicht geöffnet wird (eigener Chunk).
 */
export default function OfflineSpeichern({
  texte,
  pfade,
  ausgabe,
  htmlAusgabe,
  rezitationen,
  behaelter,
}: {
  texte: LeserTexte['offline'];
  pfade: LeserPfade;
  ausgabe: string | null;
  htmlAusgabe: string | null;
  rezitationen: LeserRezitation[];
  behaelter: () => HTMLElement | null;
}) {
  const [eintrag, setEintrag] = useState<OfflineEintrag | null>(() =>
    typeof window === 'undefined' ? null : (liesVerzeichnis()[location.pathname] ?? null),
  );
  const [moeglich] = useState(() => typeof window !== 'undefined' && offlineMoeglich());
  const [mitAudio, setMitAudio] = useState(false);
  const [fortschritt, setFortschritt] = useState<Fortschritt | null>(null);
  const [meldung, setMeldung] = useState('');
  const abbruch = useRef<AbortController | null>(null);
  const audioId = useId();

  useEffect(() => () => abbruch.current?.abort(), []);

  if (!moeglich) return <p className="text-16 text-tinte-2">{texte.nichtMoeglich}</p>;

  async function starte() {
    const c = behaelter();
    if (!c) return;
    const steuerung = new AbortController();
    abbruch.current = steuerung;
    setMeldung('');
    setFortschritt({ geladen: 0, gesamt: null, dateien: 1, fertig: 0 });
    try {
      const urls = await sammleAdressen({
        behaelter: c,
        pfade,
        ausgabe,
        htmlAusgabe,
        rezitation: mitAudio ? (rezitationen[0]?.id ?? null) : null,
      });
      const titel = document.querySelector('h1')?.textContent?.trim() || location.pathname;
      const neu = await speichere(location.pathname, titel, urls, setFortschritt, steuerung.signal);
      setEintrag(neu);
      setMeldung(texte.fertig);
    } catch {
      setMeldung(steuerung.signal.aborted ? '' : texte.fehler);
    } finally {
      setFortschritt(null);
      abbruch.current = null;
    }
  }

  async function weg() {
    await entferne(location.pathname);
    setEintrag(null);
    setMeldung(texte.entfernt);
  }

  const anteil = fortschritt
    ? fortschritt.gesamt
      ? fortschritt.geladen / fortschritt.gesamt
      : fortschritt.fertig / Math.max(1, fortschritt.dateien)
    : 0;
  const knopf =
    'inline-flex min-h-12 items-center gap-2 rounded-pill border px-4 text-16 font-bold transition duration-(--dauer-rueckmeldung) active:scale-98';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-16 text-tinte-2">{texte.hinweis}</p>
      {fortschritt ? (
        <div className="flex flex-wrap items-center gap-3">
          <Ring anteil={Math.min(1, anteil)} beschriftung={texte.fortschritt} />
          <span className="tabular-nums">{fuelle(texte.laeuft, { mb: mb(fortschritt.geladen) })}</span>
          <button type="button" onClick={() => abbruch.current?.abort()} className={`${knopf} border-rand bg-weiss text-tinte`}>
            <X aria-hidden className="size-5" />
            {texte.abbrechen}
          </button>
        </div>
      ) : eintrag ? (
        <div className="flex flex-wrap items-center gap-3">
          <CircleCheck aria-hidden className="size-6 shrink-0 text-gruen-700" />
          <span>{fuelle(texte.gespeichert, { datum: new Date(eintrag.zeit).toLocaleDateString(), mb: mb(eintrag.bytes) })}</span>
          <button type="button" onClick={() => void weg()} className={`${knopf} border-rand bg-weiss text-tinte hover:border-fehler`}>
            <Trash2 aria-hidden className="size-5" />
            {texte.entfernen}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {rezitationen.length ? (
            <label htmlFor={audioId} className="inline-flex min-h-12 cursor-pointer items-center gap-2 text-16">
              <input
                id={audioId}
                type="checkbox"
                checked={mitAudio}
                onChange={(e) => setMitAudio(e.target.checked)}
                className="size-5 accent-gruen-700"
              />
              {texte.mitRezitation}
            </label>
          ) : null}
          <button
            type="button"
            onClick={() => void starte()}
            className={`${knopf} border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50`}
          >
            <Download aria-hidden className="size-5" />
            {texte.speichern}
          </button>
        </div>
      )}
      <p role="status" className="text-16 empty:hidden">
        {meldung}
      </p>
    </div>
  );
}
