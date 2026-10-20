import { MAX_AUFNAHME_MS } from '@/lib/lernapp/sprechen/auswertung';
import { ABTASTRATE } from '@/lib/lernapp/sprechen/modell';

/**
 * Aufnahme im Browser (ADR 0042 Nr. 7, KERN 4.0 §6): Mikrofon mit `autoGainControl`, `MediaRecorder` für das eigene
 * Anhören, ein Analysator für den Pegelbalken (B-35). Alles bleibt im Arbeitsspeicher: kein Upload, kein Speichern in
 * IndexedDB oder Cache; die Spuren werden nach dem Stopp beendet. Höchstens 15 s (Fortschreibung S2 Nr. 2).
 */

export type Aufnahme = { blob: Blob; pcm: Float32Array; dauerMs: number };
export type LaufendeAufnahme = { stopp: () => Promise<Aufnahme>; abbrechen: () => void };

/** Mikrofon nur auf den Übungsseiten (Permissions-Policy, ADR 0042 Nr. 9); hier zusätzlich am Pfad geprüft. */
export const mikrofonErlaubtHier = (pfad: string): boolean => /^\/lern-app\/(de|tr|ar)\/[a-z-]+\/(ueben|wiederholen)\/?$/.test(pfad);

/** Aufnahme in 16-kHz-Mono umrechnen (der Browser rechnet beim Dekodieren auf die Rate des Kontexts um). */
export async function alsPcm(blob: Blob): Promise<Float32Array> {
  const ctx = new AudioContext({ sampleRate: ABTASTRATE });
  try {
    const puffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    const n = puffer.length;
    const pcm = new Float32Array(n);
    for (let k = 0; k < puffer.numberOfChannels; k++) {
      const kanal = puffer.getChannelData(k);
      for (let i = 0; i < n; i++) pcm[i]! += (kanal[i] ?? 0) / puffer.numberOfChannels;
    }
    return pcm;
  } finally {
    void ctx.close();
  }
}

export async function starteAufnahme({
  onPegel,
  onEnde,
}: {
  onPegel: (pegel: number) => void;
  onEnde: () => void;
}): Promise<LaufendeAufnahme> {
  const strom = await navigator.mediaDevices.getUserMedia({
    audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const rekorder = new MediaRecorder(strom);
  const stuecke: Blob[] = [];
  rekorder.ondataavailable = (e) => {
    if (e.data.size) stuecke.push(e.data);
  };
  const ctx = new AudioContext();
  const analysator = ctx.createAnalyser();
  analysator.fftSize = 1024;
  ctx.createMediaStreamSource(strom).connect(analysator);
  const werte = new Float32Array(analysator.fftSize);
  let rahmen = 0;
  const messe = () => {
    analysator.getFloatTimeDomainData(werte);
    let summe = 0;
    for (const v of werte) summe += v * v;
    // Effektivwert in dBFS auf 0…1 (−60 dB … 0 dB)
    const db = 20 * Math.log10(Math.sqrt(summe / werte.length) || 1e-6);
    onPegel(Math.max(0, Math.min(1, (db + 60) / 60)));
    rahmen = requestAnimationFrame(messe);
  };
  rahmen = requestAnimationFrame(messe);
  const beginn = performance.now();
  const ende = new Promise<void>((fertig) => {
    rekorder.onstop = () => fertig();
  });
  const zeitgrenze = setTimeout(() => {
    if (rekorder.state === 'recording') {
      rekorder.stop();
      onEnde();
    }
  }, MAX_AUFNAHME_MS);
  rekorder.start();

  const aufraeumen = () => {
    clearTimeout(zeitgrenze);
    cancelAnimationFrame(rahmen);
    strom.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };

  return {
    async stopp() {
      if (rekorder.state === 'recording') rekorder.stop();
      await ende;
      aufraeumen();
      const blob = new Blob(stuecke, { type: rekorder.mimeType || 'audio/webm' });
      return { blob, pcm: await alsPcm(blob), dauerMs: Math.round(performance.now() - beginn) };
    },
    abbrechen() {
      if (rekorder.state === 'recording') rekorder.stop();
      aufraeumen();
    },
  };
}
