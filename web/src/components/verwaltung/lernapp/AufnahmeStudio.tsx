'use client';

import { Mic, Play, Save, Square, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { bereiteVor } from '@/components/verwaltung/rezitationen/werkstatt-audio';
import { Button } from '@/components/ui/button';
import { eingabe } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { audioFormat } from '@/lib/audio/format';
import { AUFNAHME_MAX_BYTES, AUFNAHME_MAX_MS } from '@/lib/lernapp/verwaltung/audio';
import { aufnahmeSpeichern } from '@/server/actions/lernapp-audio';

/** Aufnahmeformate in dieser Reihenfolge (Chromium/Firefox: WebM/Opus, Safari: MP4/AAC) – wie die Rezitations-Werkstatt. */
const AUFNAHME_TYPEN = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'];

/**
 * Aufnahme im Audio-Studio (L3-06, ADR 0039 Nr. 8) mit den Bausteinen der Rezitations-Werkstatt: MediaRecorder (Mikrofon nur
 * in `/verwaltung/lernapp/audio`, Permissions-Policy), Probehören, Prüfung von Größe und Magic Bytes im Browser,
 * `bereiteVor` (Dauer, WebM-Kopf mit Dauer); der Server prüft dieselben Bytes erneut und legt die Datei unter ihrem
 * Inhalts-Hash ab. Ohne Sprecher*in mit Vereinbarung keine Aufnahme.
 */
export function AufnahmeStudio({ eintrag, sprecher }: { eintrag: string; sprecher: { id: string; name: string }[] }) {
  const t = useTranslations('verwaltung.lernapp');
  const id = useId();
  const [offen, setOffen] = useState(false);
  const [gewaehlt, setWer] = useState('');
  // Eine einzige Person mit Vereinbarung ist vorausgewählt – auch, wenn sie erst nach dem ersten Rendern angelegt wurde
  const wer = gewaehlt || (sprecher.length === 1 ? sprecher[0]!.id : '');
  const [laeuft, setLaeuft] = useState(false);
  const [sekunden, setSekunden] = useState(0);
  const [aufnahme, setAufnahme] = useState<Blob | null>(null);
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg'; text: string } | null>(null);
  const [sendet, starte] = useTransition();
  const recorder = useRef<MediaRecorder | null>(null);
  const takt = useRef<number | null>(null);
  const probe = useRef<HTMLAudioElement | null>(null);
  const probeUrl = useRef<string | null>(null);
  const dateiFeld = useRef<HTMLInputElement>(null);
  const meldungRef = useRef<HTMLDivElement>(null);
  const sprecherFeld = useRef<HTMLSelectElement>(null);
  const startKnopf = useRef<HTMLButtonElement>(null);
  const stoppKnopf = useRef<HTMLButtonElement>(null);
  const probeKnopf = useRef<HTMLButtonElement>(null);
  /** Nur Start und Ende werden angesagt; die sekündliche Zeitanzeige ist keine Live-Region. */
  const [ansage, setAnsage] = useState('');

  useEffect(() => {
    if (meldung) meldungRef.current?.focus();
  }, [meldung]);
  // Fokusführung (WCAG 2.4.3): Öffnen → Auswahl der Sprecherin; Start → „Aufnahme beenden“; Ende → „Probehören“. Der
  // ersetzte Knopf verschwindet, der Fokus fiele sonst auf den Seitenanfang zurück.
  useEffect(() => {
    if (offen) sprecherFeld.current?.focus();
  }, [offen]);
  useEffect(() => {
    if (laeuft) stoppKnopf.current?.focus();
    else (probeKnopf.current ?? startKnopf.current)?.focus({ preventScroll: true });
  }, [laeuft]);
  useEffect(
    () => () => {
      if (takt.current) window.clearInterval(takt.current);
      recorder.current?.stream.getTracks().forEach((s) => s.stop());
      probe.current?.pause();
      if (probeUrl.current) URL.revokeObjectURL(probeUrl.current);
    },
    [],
  );

  const fehler = (k: string) =>
    setMeldung({ art: 'fehler', text: t.has(`fehler.${k}`) ? t(`fehler.${k}` as never) : t('fehler.hochladenFehlgeschlagen') });

  if (!sprecher.length) return <p className="text-16 text-tinte-2">{t('audio.ohneSprecher')}</p>;
  if (!offen)
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOffen(true)}
        aria-label={t('audio.aufnehmenFuer', { schluessel: eintrag })}
      >
        <Mic aria-hidden />
        {t('audio.aufnehmen')}
      </Button>
    );

  async function start() {
    setMeldung(null);
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia)
      return setMeldung({ art: 'fehler', text: t('audio.keinRecorder') });
    let strom: MediaStream;
    try {
      strom = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      return setMeldung({ art: 'fehler', text: t('audio.keinMikrofon') });
    }
    const typ = AUFNAHME_TYPEN.find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(strom, typ ? { mimeType: typ } : undefined);
    const teile: Blob[] = [];
    const beginn = performance.now();
    rec.ondataavailable = (e) => {
      if (e.data.size) teile.push(e.data);
    };
    rec.onstop = () => {
      if (takt.current) window.clearInterval(takt.current);
      strom.getTracks().forEach((s) => s.stop());
      setLaeuft(false);
      setAnsage(t('audio.aufnahmeBeendet', { sekunden: Math.floor((performance.now() - beginn) / 1000) }));
      setAufnahme(new Blob(teile, { type: rec.mimeType || typ || 'audio/webm' }));
    };
    recorder.current = rec;
    setAufnahme(null);
    setSekunden(0);
    rec.start(500);
    setLaeuft(true);
    setAnsage(t('audio.aufnahmeGestartet'));
    takt.current = window.setInterval(() => {
      const s = Math.floor((performance.now() - beginn) / 1000);
      setSekunden(s);
      // Höchstdauer: von selbst beenden
      if (s * 1000 >= AUFNAHME_MAX_MS && rec.state === 'recording') rec.stop();
    }, 250);
  }

  function stopp() {
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }

  function probehoeren() {
    if (!aufnahme) return;
    if (probeUrl.current) URL.revokeObjectURL(probeUrl.current);
    probeUrl.current = URL.createObjectURL(aufnahme);
    const a = (probe.current ??= new Audio());
    a.src = probeUrl.current;
    void a.play().catch(() => undefined);
  }

  function speichere(blob: Blob) {
    setMeldung(null);
    if (!wer) return setMeldung({ art: 'fehler', text: t('feldFehler.sprecherFehlt') });
    starte(async () => {
      if (blob.size === 0) return fehler('audio_leer');
      if (blob.size > AUFNAHME_MAX_BYTES) return fehler('audio_zuGross');
      const format = audioFormat(new Uint8Array(await blob.slice(0, 16).arrayBuffer()));
      if (!format) return fehler('audio_format');
      try {
        const { daten, dauerMs } = await bereiteVor(blob, format);
        const fd = new FormData();
        fd.set('eintrag', eintrag);
        fd.set('sprecher', wer);
        fd.set('datei', new File([daten], `aufnahme.${format.endung}`, { type: format.mime }));
        if (dauerMs) fd.set('dauerMs', String(Math.min(dauerMs, AUFNAHME_MAX_MS)));
        const z = await aufnahmeSpeichern({}, fd);
        if (z.fehler) {
          const feld = z.feldFehler?.sprecher;
          return feld ? setMeldung({ art: 'fehler', text: t(`feldFehler.${feld}` as never) }) : fehler(z.fehler);
        }
        setAufnahme(null);
        if (dateiFeld.current) dateiFeld.current.value = '';
        setMeldung({
          art: 'erfolg',
          text: t(`audio.ergebnis.${z.hinweis === 'ersetzt' ? 'ersetzt' : z.hinweis === 'unveraendert' ? 'unveraendert' : 'neu'}`),
        });
      } catch {
        fehler('hochladenFehlgeschlagen');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-linie p-3">
      <div ref={meldungRef} tabIndex={-1} className="outline-none empty:hidden">
        {meldung ? <Meldung art={meldung.art}>{meldung.text}</Meldung> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-sprecher`} className="font-bold">
          {t('audio.sprecher')}
        </label>
        <select ref={sprecherFeld} id={`${id}-sprecher`} value={wer} onChange={(e) => setWer(e.target.value)} className={eingabe}>
          <option value="">{t('audio.sprecherWaehlen')}</option>
          {sprecher.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <p role="status" className="sr-only">
        {ansage}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {laeuft ? (
          <>
            <span className="font-bold tabular-nums">{t('audio.laeuftAufnahme', { sekunden })}</span>
            <Button ref={stoppKnopf} type="button" variant="destructive" size="sm" onClick={stopp}>
              <Square aria-hidden />
              {t('audio.stopp')}
            </Button>
          </>
        ) : (
          <Button ref={startKnopf} type="button" variant="secondary" size="sm" onClick={() => void start()} disabled={sendet}>
            <Mic aria-hidden />
            {t('audio.start')}
          </Button>
        )}
        {aufnahme && !laeuft ? (
          <>
            <Button ref={probeKnopf} type="button" variant="outline" size="sm" onClick={probehoeren}>
              <Play aria-hidden />
              {t('audio.probehoeren')}
            </Button>
            <Button type="button" size="sm" onClick={() => speichere(aufnahme)} disabled={sendet}>
              <Save aria-hidden />
              {sendet ? t('audio.laedtHoch') : t('audio.hochladen')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAufnahme(null)} disabled={sendet}>
              <Trash2 aria-hidden />
              {t('audio.verwerfen')}
            </Button>
          </>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-datei`} className="text-16">
          {t('audio.datei')}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={dateiFeld}
            id={`${id}-datei`}
            type="file"
            accept="audio/mp4,audio/x-m4a,audio/aac,audio/mpeg,audio/ogg,audio/webm,.m4a,.mp3,.ogg,.oga,.opus,.webm"
            disabled={sendet}
            className="min-h-12 max-w-full text-16"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={sendet}
            onClick={() => {
              const f = dateiFeld.current?.files?.[0];
              if (f) speichere(f);
              else dateiFeld.current?.focus();
            }}
          >
            <Upload aria-hidden />
            {t('audio.dateiSpeichern')}
          </Button>
        </div>
      </div>
    </div>
  );
}
