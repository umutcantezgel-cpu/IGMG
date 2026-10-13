/**
 * Audioformate der Rezitationen (ADR 0029): Erkennung nur über Magic Bytes, nie über Endung oder MIME-Angabe des
 * Browsers. Erlaubt sind m4a (MP4/AAC), mp3, ogg (Opus/Vorbis) und webm (Opus, Aufnahme im Browser). Höchstens 60 MB je Sure.
 */
export const AUDIO_MAX_BYTES = 60 * 1024 * 1024;
export type AudioFormat = { art: 'm4a' | 'mp3' | 'ogg' | 'webm'; mime: string; endung: string };

const FORMATE: Record<AudioFormat['art'], AudioFormat> = {
  m4a: { art: 'm4a', mime: 'audio/mp4', endung: 'm4a' },
  mp3: { art: 'mp3', mime: 'audio/mpeg', endung: 'mp3' },
  ogg: { art: 'ogg', mime: 'audio/ogg', endung: 'ogg' },
  webm: { art: 'webm', mime: 'audio/webm', endung: 'webm' },
};

/** Erkennt das Format aus den ersten Bytes (mindestens 12); null bei allem anderen. */
export function audioFormat(kopf: Uint8Array): AudioFormat | null {
  const b = (i: number) => kopf[i] ?? -1;
  const ascii = (von: number, text: string) => [...text].every((z, i) => b(von + i) === z.charCodeAt(0));
  // MP4/M4A: „ftyp“ ab Byte 4, Marke M4A/mp42/isom/iso5/dash
  if (ascii(4, 'ftyp') && ['M4A ', 'mp42', 'isom', 'iso5', 'dash', 'mp41', 'M4B '].some((m) => ascii(8, m))) return FORMATE.m4a;
  // MP3: ID3-Kopf oder Frame-Sync 0xFFE (MPEG Audio Layer III)
  if (ascii(0, 'ID3') || (b(0) === 0xff && (b(1) & 0xe6) === 0xe2)) return FORMATE.mp3;
  if (ascii(0, 'OggS')) return FORMATE.ogg;
  // WebM/Matroska: EBML-Kopf 1A 45 DF A3
  if (b(0) === 0x1a && b(1) === 0x45 && b(2) === 0xdf && b(3) === 0xa3) return FORMATE.webm;
  return null;
}

/** Ablage unter Inhalts-Hash (unveränderlich, ADR 0029): audio/<rezitation>/<sure>-<vers>-<sha256[0..16]>.<endung> */
export function audioPfad(rezitationId: string, sure: number, vers: number, sha256: string, f: AudioFormat): string {
  if (!/^[a-z0-9-]{2,40}$/.test(rezitationId)) throw new Error('Ungültige Rezitations-ID');
  return `audio/${rezitationId}/${String(sure).padStart(3, '0')}-${String(vers).padStart(3, '0')}-${sha256.slice(0, 16)}.${f.endung}`;
}
