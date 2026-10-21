'use client';

import { Gauge, Play, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

/** Ein Clip in einem Bündel `.lpa` (Adresse der Route `/lern-app/audio/…`, Versatz und Länge) oder eine ganze Datei. */
export type ClipQuelle = { adresse: string; versatz?: number; laenge?: number; mime?: string };

const buendelVorrat = new Map<string, Promise<Blob>>();

/** Bündel bzw. Datei einmal je Seite laden (ganz, ohne `Range`, wie die App, ADR 0039 Fortschreibung S5 Nr. 5). */
function lade(adresse: string): Promise<Blob> {
  let p = buendelVorrat.get(adresse);
  if (!p) {
    p = fetch(adresse, { credentials: 'same-origin' }).then((a) => {
      if (!a.ok) throw new Error(`HTTP ${a.status}`);
      return a.blob();
    });
    p.catch(() => buendelVorrat.delete(adresse));
    buendelVorrat.set(adresse, p);
  }
  return p;
}

/**
 * Anhören eines Clips in der Verwaltung (Sprachprüfung, Audio-Studio; L3-06): schneidet den Clip mit `Blob.slice` aus dem
 * Bündel und spielt ihn in einem `<audio>`; „langsam“ mit 0,75 und gleicher Tonhöhe. Kein Autoplay, nur nach Klick.
 */
export function ClipAnhoeren({
  quelle,
  texte,
  langsamAnbieten = true,
}: {
  quelle: ClipQuelle;
  texte: { anhoeren: string; langsam: string; stopp: string; fehler: string };
  langsamAnbieten?: boolean;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState(false);

  useEffect(
    () => () => {
      audio.current?.pause();
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );

  async function spiele(tempo: number) {
    setFehler(false);
    try {
      const blob = await lade(quelle.adresse);
      const teil =
        quelle.versatz !== undefined && quelle.laenge !== undefined
          ? blob.slice(quelle.versatz, quelle.versatz + quelle.laenge, quelle.mime ?? 'audio/webm')
          : blob;
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(teil);
      const a = (audio.current ??= new Audio());
      a.src = url.current;
      a.preservesPitch = true;
      a.defaultPlaybackRate = tempo;
      a.playbackRate = tempo;
      a.onended = () => setLaeuft(false);
      a.onerror = () => {
        setLaeuft(false);
        setFehler(true);
      };
      await a.play();
      setLaeuft(true);
    } catch {
      setLaeuft(false);
      setFehler(true);
    }
  }

  function halt() {
    audio.current?.pause();
    setLaeuft(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {laeuft ? (
        <Button type="button" variant="outline" size="sm" onClick={halt}>
          <Square aria-hidden />
          {texte.stopp}
        </Button>
      ) : (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => void spiele(1)}>
            <Play aria-hidden />
            {texte.anhoeren}
          </Button>
          {langsamAnbieten ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => void spiele(0.75)}>
              <Gauge aria-hidden />
              {texte.langsam}
            </Button>
          ) : null}
        </>
      )}
      {fehler ? (
        <span role="alert" className="text-16 font-bold text-fehler">
          {texte.fehler}
        </span>
      ) : null}
    </div>
  );
}
