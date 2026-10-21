/**
 * Rückfallstufe 2 der Lern-Audio-Wiedergabe (ADR 0039, Fortschreibung S4/S5 Nr. 4): Die Opus-Scheibe dekodiert der Browser
 * mit `decodeAudioData`; daraus entsteht ein WAV (PCM 16 Bit, mono), das jedes `<audio>` spielt. Eigenes Modul, erst bei
 * Bedarf geladen (≈ 1 KB).
 */

/** PCM-Daten (−1 … 1) als WAV-Datei (16 Bit, mono). */
export function wavAus(daten: Float32Array, rate: number): Blob {
  const puffer = new ArrayBuffer(44 + daten.length * 2);
  const v = new DataView(puffer);
  const text = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(pos + i, s.charCodeAt(i));
  };
  text(0, 'RIFF');
  v.setUint32(4, 36 + daten.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, 'data');
  v.setUint32(40, daten.length * 2, true);
  for (let i = 0; i < daten.length; i++) {
    const x = Math.max(-1, Math.min(1, daten[i] ?? 0));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return new Blob([puffer], { type: 'audio/wav' });
}

/** Scheibe dekodieren (erster Kanal) und als WAV zurückgeben. */
export async function alsWav(scheibe: Blob): Promise<Blob> {
  const Kontext = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Kontext) throw new Error('kein AudioContext');
  const k = new Kontext();
  try {
    const audio = await k.decodeAudioData(await scheibe.arrayBuffer());
    return wavAus(audio.getChannelData(0), audio.sampleRate);
  } finally {
    void k.close().catch(() => undefined);
  }
}
