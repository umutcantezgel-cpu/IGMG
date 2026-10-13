'use client';

import { Mic, Play, Square, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { formatZeit } from '@/lib/audio/werkstatt';
import { audioUebernehmen } from '@/server/actions/rezitationen';
import { bereiteVor, ladeInEingang, pruefeDatei } from './werkstatt-audio';
import { fehlerSchluessel } from './hilfen';

export type SureDatei = { url: string; mime: string; bytes: number; dauerMs: number | null };

const FORMAT: Record<string, string> = { 'audio/webm': 'WebM', 'audio/mp4': 'M4A', 'audio/mpeg': 'MP3', 'audio/ogg': 'Ogg' };
/** Aufnahmeformate in dieser Reihenfolge (Chromium/Firefox: WebM/Opus, Safari: MP4/AAC). */
const AUFNAHME_TYPEN = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'];

export const groesseText = (bytes: number) => `${(bytes / 1_000_000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB`;

type Aufnahme = { blob: Blob; dauerMs: number; puffer: AudioBuffer | null };

/**
 * Schritt 1 der Werkstatt: Aufnahme im Browser (MediaRecorder, Mikrofon nur in der Verwaltung erlaubt) oder Upload einer
 * Datei. Vor dem Hochladen: Größe und Magic Bytes prüfen, Dauer auswerten, bei WebM die Dauer im Kopf ergänzen. Danach
 * Eingang (Vercel Blob direkt oder Eingangsroute) und Übernahme durch die Server Action.
 */
export function AudioQuelle({
  rezitationId,
  sure,
  datei,
  jeVers,
  direkt,
  darfBearbeiten,
}: {
  rezitationId: string;
  sure: number;
  datei: SureDatei | null;
  jeVers: boolean;
  direkt: boolean;
  darfBearbeiten: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt.quelle');
  const tf = useTranslations('verwaltung.rezitationen.fehler');
  const id = useId();
  const [laeuft, setLaeuft] = useState(false);
  const [sekunden, setSekunden] = useState(0);
  const [pegel, setPegel] = useState(0);
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);
  const [probe, setProbe] = useState(false);
  const [anteil, setAnteil] = useState<number | null>(null);
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg'; text: string } | null>(null);
  const [sendet, starteUebergang] = useTransition();
  const recorder = useRef<MediaRecorder | null>(null);
  const kontext = useRef<AudioContext | null>(null);
  const quelle = useRef<AudioBufferSourceNode | null>(null);
  const bild = useRef(0);
  const dateiFeld = useRef<HTMLInputElement>(null);
  const meldungRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (meldung) meldungRef.current?.focus();
  }, [meldung]);

  useEffect(
    () => () => {
      cancelAnimationFrame(bild.current);
      recorder.current?.stream.getTracks().forEach((s) => s.stop());
      quelle.current?.stop();
      void kontext.current?.close();
    },
    [],
  );

  const fehler = (schluessel: string) => setMeldung({ art: 'fehler', text: tf(fehlerSchluessel(schluessel) as never) });

  async function starte() {
    setMeldung(null);
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMeldung({ art: 'fehler', text: t('keinRecorder') });
      return;
    }
    let strom: MediaStream;
    try {
      strom = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      setMeldung({ art: 'fehler', text: t('keinMikrofon') });
      return;
    }
    const typ = AUFNAHME_TYPEN.find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(strom, typ ? { mimeType: typ, audioBitsPerSecond: 128_000 } : undefined);
    const teile: Blob[] = [];
    const beginn = performance.now();
    rec.ondataavailable = (e) => {
      if (e.data.size) teile.push(e.data);
    };
    rec.onstop = () => {
      cancelAnimationFrame(bild.current);
      strom.getTracks().forEach((s) => s.stop());
      setLaeuft(false);
      setPegel(0);
      const blob = new Blob(teile, { type: rec.mimeType || typ || 'audio/webm' });
      const dauerMs = Math.round(performance.now() - beginn);
      void blob
        .arrayBuffer()
        .then((roh) => (kontext.current ??= new AudioContext()).decodeAudioData(roh))
        .then(
          (puffer) => setAufnahme({ blob, dauerMs: Math.round(puffer.duration * 1000), puffer }),
          () => setAufnahme({ blob, dauerMs, puffer: null }),
        );
    };
    // Eingangspegel (nur Anzeige)
    const ctx = (kontext.current ??= new AudioContext());
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(strom).connect(analyser);
    const werte = new Float32Array(analyser.fftSize);
    const messe = () => {
      analyser.getFloatTimeDomainData(werte);
      let summe = 0;
      for (const w of werte) summe += w * w;
      setPegel(Math.min(1, Math.sqrt(summe / werte.length) * 4));
      setSekunden(Math.floor((performance.now() - beginn) / 1000));
      bild.current = requestAnimationFrame(messe);
    };
    recorder.current = rec;
    setAufnahme(null);
    setSekunden(0);
    rec.start(1000);
    setLaeuft(true);
    bild.current = requestAnimationFrame(messe);
  }

  function beende() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }

  function probehoeren() {
    if (probe) {
      quelle.current?.stop();
      return;
    }
    if (!aufnahme?.puffer) return;
    const ctx = (kontext.current ??= new AudioContext());
    const q = ctx.createBufferSource();
    q.buffer = aufnahme.puffer;
    q.connect(ctx.destination);
    q.onended = () => setProbe(false);
    quelle.current = q;
    void ctx.resume();
    q.start();
    setProbe(true);
  }

  function hochladen(blob: Blob) {
    setMeldung(null);
    starteUebergang(async () => {
      const geprueft = await pruefeDatei(blob);
      if ('fehler' in geprueft) return fehler(geprueft.fehler);
      setAnteil(0);
      try {
        const { daten, dauerMs } = await bereiteVor(blob, geprueft.format);
        const eingang = await ladeInEingang(daten, direkt, setAnteil);
        const fd = new FormData();
        fd.set('rezitationId', rezitationId);
        fd.set('sure', String(sure));
        fd.set('eingang', eingang);
        if (dauerMs) fd.set('dauerMs', String(dauerMs));
        const z = await audioUebernehmen({}, fd);
        if (z.fehler) return fehler(z.fehler);
        quelle.current?.stop();
        setAufnahme(null);
        if (dateiFeld.current) dateiFeld.current.value = '';
        setMeldung({
          art: 'erfolg',
          text: t(z.hinweis === 'unveraendert' ? 'unveraendert' : z.hinweis === 'ersetzt' ? 'ersetzt' : 'uebernommen'),
        });
      } catch (e) {
        fehler(e instanceof Error ? e.message : 'hochladenFehlgeschlagen');
      } finally {
        setAnteil(null);
      }
    });
  }

  const gesperrt = !darfBearbeiten || jeVers;

  return (
    <div className="flex flex-col gap-5">
      <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
        {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      </div>
      {datei ? (
        <div className="flex flex-col gap-2">
          <p className="font-bold">
            {datei.dauerMs
              ? t('vorhanden', {
                  format: FORMAT[datei.mime] ?? datei.mime,
                  groesse: groesseText(datei.bytes),
                  dauer: formatZeit(datei.dauerMs, 1),
                })
              : t('vorhandenOhneDauer', { format: FORMAT[datei.mime] ?? datei.mime, groesse: groesseText(datei.bytes) })}
          </p>
          <audio controls preload="none" src={datei.url} aria-label={t('anhoeren')} className="w-full max-w-text" />
        </div>
      ) : jeVers ? null : (
        <p className="text-tinte-2">{t('keine')}</p>
      )}
      {jeVers ? <Meldung art="info">{t('jeVers')}</Meldung> : null}
      {!gesperrt ? (
        <>
          {datei ? <p className="max-w-text text-16 text-tinte-2">{t('ersetzen')}</p> : null}
          <div className="grid gap-6 lg:grid-cols-2">
            <fieldset className="flex flex-col gap-3 rounded-md border border-linie p-4">
              <legend className="px-1 font-bold">{t('aufnahme')}</legend>
              {laeuft ? (
                <>
                  <p className="font-bold tabular-nums">{t('laeuft', { dauer: formatZeit(sekunden * 1000, 0) })}</p>
                  <label className="flex flex-col gap-1 text-16">
                    {t('pegel')}
                    <meter min={0} max={1} low={0.05} high={0.9} optimum={0.5} value={pegel} className="h-3 w-full" />
                  </label>
                  <Button type="button" variant="destructive" onClick={beende} className="self-start">
                    <Square aria-hidden />
                    {t('beenden')}
                  </Button>
                </>
              ) : aufnahme ? (
                <>
                  <p className="font-bold tabular-nums">{t('fertig', { dauer: formatZeit(aufnahme.dauerMs, 1) })}</p>
                  <div className="flex flex-wrap gap-2">
                    {aufnahme.puffer ? (
                      <Button type="button" variant="outline" onClick={probehoeren}>
                        {probe ? <Square aria-hidden /> : <Play aria-hidden />}
                        {probe ? t('probeStopp') : t('probehoeren')}
                      </Button>
                    ) : null}
                    <Button type="button" onClick={() => hochladen(aufnahme.blob)} disabled={sendet}>
                      <Upload aria-hidden />
                      {sendet ? t('laedtHoch') : t('hochladen')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setAufnahme(null)} disabled={sendet}>
                      <Trash2 aria-hidden />
                      {t('verwerfen')}
                    </Button>
                  </div>
                </>
              ) : (
                <Button type="button" variant="secondary" onClick={() => void starte()} disabled={sendet} className="self-start">
                  <Mic aria-hidden />
                  {t('aufnehmen')}
                </Button>
              )}
            </fieldset>
            <fieldset className="flex flex-col gap-3 rounded-md border border-linie p-4">
              <legend className="px-1 font-bold">{t('datei')}</legend>
              <label htmlFor={`${id}-datei`} className="sr-only">
                {t('datei')}
              </label>
              <input
                ref={dateiFeld}
                id={`${id}-datei`}
                type="file"
                accept="audio/mp4,audio/x-m4a,audio/aac,audio/mpeg,audio/ogg,audio/webm,.m4a,.mp3,.ogg,.oga,.opus,.webm"
                aria-describedby={`${id}-hinweis`}
                disabled={sendet}
                className="min-h-12 text-18"
              />
              <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
                {t('dateiHinweis')}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="self-start"
                disabled={sendet}
                onClick={() => {
                  const f = dateiFeld.current?.files?.[0];
                  if (f) hochladen(f);
                  else dateiFeld.current?.focus();
                }}
              >
                <Upload aria-hidden />
                {sendet ? t('laedtHoch') : t('dateiHochladen')}
              </Button>
            </fieldset>
          </div>
          {anteil !== null ? (
            <label className="flex flex-col gap-1 text-16">
              {t('fortschritt')}
              <progress max={1} value={anteil} className="h-3 w-full" />
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
