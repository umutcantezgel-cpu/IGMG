'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { einsaetze, lautstaerke, type Rahmen } from '@/lib/audio/abgleich';
import { AUDIO_DIREKT_PFAD, AUDIO_EINGANG_PFAD, AUDIO_EINGANG_TYP, neuerAudioEingang } from '@/lib/audio/direkt';
import { AUDIO_MAX_BYTES, audioFormat, type AudioFormat } from '@/lib/audio/format';
import { webmMitDauer } from '@/lib/audio/webm';
import { mono, spitzen, type Spitzen } from '@/lib/audio/werkstatt';

/**
 * Browser-Teil der Rezitations-Werkstatt (ADR 0029): Auswerten einer Datei (`decodeAudioData`), Hochladen über den
 * Eingang und ein Abspieler, der genau ein Zeitfenster spielt (Vers, Wort) und die Position je Bildschirmbild meldet.
 */

/** Abtastrate der Auswertung: reicht für Lautstärke, Einsätze und Wellenform und spart Speicher bei langen Suren. */
const AUSWERTUNG_HZ = 16_000;

export type Analyse = { dauerMs: number; rahmen: Rahmen; einsaetze: number[]; spitzen: Spitzen };

export async function werteAus(daten: ArrayBuffer): Promise<Analyse> {
  const kontext = new OfflineAudioContext(1, 1, AUSWERTUNG_HZ);
  const puffer = await kontext.decodeAudioData(daten);
  const kanaele = Array.from({ length: puffer.numberOfChannels }, (_, i) => puffer.getChannelData(i));
  const signal = mono(kanaele);
  const rahmen = lautstaerke(signal, puffer.sampleRate);
  return {
    dauerMs: Math.round(puffer.duration * 1000),
    rahmen,
    einsaetze: einsaetze(rahmen),
    spitzen: spitzen(signal, puffer.sampleRate),
  };
}

const auswertungen = new Map<string, Promise<Analyse>>();

/** Auswertung einer gespeicherten Datei (je Adresse einmal je Seitenaufruf). */
export function werteAdresseAus(url: string): Promise<Analyse> {
  let p = auswertungen.get(url);
  if (!p) {
    p = fetch(url, { credentials: 'same-origin' }).then(async (antwort) => {
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      return werteAus(await antwort.arrayBuffer());
    });
    p.catch(() => auswertungen.delete(url));
    auswertungen.set(url, p);
  }
  return p;
}

/** Prüfung vor dem Hochladen (der Server prüft dieselben Bytes erneut). */
export async function pruefeDatei(datei: Blob): Promise<{ format: AudioFormat } | { fehler: string }> {
  if (datei.size === 0) return { fehler: 'audio_leer' };
  if (datei.size > AUDIO_MAX_BYTES) return { fehler: 'audio_zuGross' };
  const format = audioFormat(new Uint8Array(await datei.slice(0, 16).arrayBuffer()));
  return format ? { format } : { fehler: 'audio_format' };
}

/**
 * Bereitet eine Datei vor: Dauer aus der Auswertung, bei WebM (Aufnahme im Browser) die fehlende Dauer im Kopf ergänzen.
 * Lässt sich die Datei im Browser nicht auswerten, geht sie ohne Dauer hoch (der Server prüft das Format).
 */
export async function bereiteVor(datei: Blob, format: AudioFormat): Promise<{ daten: Blob; dauerMs: number | null }> {
  const roh = await datei.arrayBuffer();
  let dauerMs: number | null = null;
  try {
    dauerMs = (await werteAus(roh.slice(0))).dauerMs;
  } catch {
    dauerMs = null;
  }
  if (format.art === 'webm' && dauerMs) {
    const mitDauer = webmMitDauer(new Uint8Array(roh), dauerMs);
    return { daten: new Blob([mitDauer.slice()], { type: format.mime }), dauerMs };
  }
  return { daten: datei, dauerMs };
}

/** Datei in den Eingang laden: Vercel Blob direkt (große Dateien) oder Rohdaten an die Eingangsroute. */
export async function ladeInEingang(datei: Blob, direkt: boolean, fortschritt: (anteil: number) => void): Promise<string> {
  if (direkt) {
    const { upload } = await import('@vercel/blob/client');
    const ergebnis = await upload(neuerAudioEingang(), datei, {
      access: 'private',
      handleUploadUrl: AUDIO_DIREKT_PFAD,
      contentType: AUDIO_EINGANG_TYP,
      multipart: datei.size > 8 * 1024 * 1024,
      onUploadProgress: (e) => fortschritt(e.percentage / 100),
    });
    return ergebnis.pathname;
  }
  const antwort = await fetch(AUDIO_EINGANG_PFAD, {
    method: 'POST',
    body: datei,
    headers: { 'Content-Type': AUDIO_EINGANG_TYP },
    credentials: 'same-origin',
  });
  const json = (await antwort.json().catch(() => ({}))) as { eingang?: string; fehler?: string };
  if (!antwort.ok || !json.eingang) throw new Error(json.fehler ?? 'hochladenFehlgeschlagen');
  fortschritt(1);
  return json.eingang;
}

export type Auftrag = {
  url: string;
  startMs: number;
  /** null = bis zum Dateiende */
  endeMs: number | null;
  tempo?: number;
  /** Position je Bildschirmbild (ms in der Datei) */
  beiPosition?: (ms: number) => void;
  /** Ende des Fensters erreicht (nicht bei Anhalten) */
  beiEnde?: () => void;
};

/**
 * Abspieler für Zeitfenster mit genau einem `<audio>`-Element (über `anbinden`). Die Position kommt je Bildschirmbild aus
 * `currentTime` (Medienzeit, unabhängig vom Tempo); am Fensterende hält er an. Tonhöhe bleibt beim langsamen Spielen.
 */
export function useAbspieler() {
  const element = useRef<HTMLAudioElement | null>(null);
  /** Callback-Ref für das `<audio>`-Element der Werkstatt. */
  const anbinden = useCallback((el: HTMLAudioElement | null) => {
    element.current = el;
  }, []);
  const auftrag = useRef<Auftrag | null>(null);
  const bild = useRef(0);
  const [laeuft, setLaeuft] = useState(false);
  const [positionMs, setPositionMs] = useState(0);

  const halt = useCallback(() => {
    cancelAnimationFrame(bild.current);
    auftrag.current = null;
    element.current?.pause();
    setLaeuft(false);
  }, []);

  const spiele = useCallback(
    async (neu: Auftrag): Promise<boolean> => {
      const a = element.current;
      if (!a) return false;
      cancelAnimationFrame(bild.current);
      auftrag.current = null;
      a.pause();
      if (a.getAttribute('src') !== neu.url) {
        a.setAttribute('src', neu.url);
        a.load();
      }
      if (a.readyState < 1)
        await new Promise<void>((fertig, fehler) => {
          a.addEventListener('loadedmetadata', () => fertig(), { once: true });
          a.addEventListener('error', () => fehler(new Error('laden')), { once: true });
        }).catch(() => undefined);
      if (a.readyState < 1) return false;
      a.preservesPitch = true;
      a.playbackRate = neu.tempo ?? 1;
      a.currentTime = neu.startMs / 1000;
      auftrag.current = neu;
      try {
        await a.play();
      } catch {
        auftrag.current = null;
        return false;
      }
      setLaeuft(true);
      // Position je Bildschirmbild; am Fensterende anhalten
      const lauf = () => {
        if (auftrag.current !== neu) return;
        const ms = a.currentTime * 1000;
        setPositionMs(ms);
        neu.beiPosition?.(ms);
        if ((neu.endeMs !== null && ms >= neu.endeMs) || a.ended) {
          halt();
          neu.beiEnde?.();
          return;
        }
        bild.current = requestAnimationFrame(lauf);
      };
      bild.current = requestAnimationFrame(lauf);
      return true;
    },
    [halt],
  );

  /** Position setzen ohne zu spielen (Wellenform anklicken, Positionsregler). */
  const suche = useCallback((url: string, ms: number) => {
    const a = element.current;
    if (!a) return;
    if (a.getAttribute('src') !== url) {
      a.setAttribute('src', url);
      a.load();
    }
    const setze = () => {
      a.currentTime = ms / 1000;
      setPositionMs(ms);
    };
    if (a.readyState >= 1) setze();
    else a.addEventListener('loadedmetadata', setze, { once: true });
  }, []);

  /** Aktuelle Medienzeit (Mitklopfen). */
  const jetztMs = useCallback(() => (element.current ? element.current.currentTime * 1000 : 0), []);

  useEffect(() => () => cancelAnimationFrame(bild.current), []);

  return { anbinden, spiele, halt, suche, jetztMs, laeuft, positionMs };
}

/** Wort hervorheben wie im Player (B-13): CSS Custom Highlight API, sonst Klasse am Wort. */
export function markiereWort(el: HTMLElement | null) {
  const hl = typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null;
  for (const alt of document.querySelectorAll('.werkstatt-wort-aktiv')) alt.classList.remove('werkstatt-wort-aktiv');
  if (!el) {
    hl?.delete('werkstatt-wort');
    return;
  }
  if (hl) {
    const r = document.createRange();
    r.selectNodeContents(el);
    hl.set('werkstatt-wort', new Highlight(r));
  } else el.classList.add('werkstatt-wort-aktiv');
}
