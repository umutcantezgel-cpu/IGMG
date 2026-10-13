import { describe, expect, it } from 'vitest';
import { audioFormat, audioPfad } from '@/lib/audio/format';

const bytes = (...teile: (string | number[])[]) =>
  new Uint8Array(teile.flatMap((t) => (typeof t === 'string' ? [...t].map((z) => z.charCodeAt(0)) : t)));

describe('Audioformate nur über Magic Bytes', () => {
  it('erkennt m4a, mp3, ogg, webm', () => {
    expect(audioFormat(bytes([0, 0, 0, 0x20], 'ftypM4A ', [0, 0]))?.art).toBe('m4a');
    expect(audioFormat(bytes('ID3', [4, 0, 0, 0, 0, 0, 0, 0, 0]))?.art).toBe('mp3');
    expect(audioFormat(bytes([0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0, 0, 0, 0, 0]))?.art).toBe('mp3');
    expect(audioFormat(bytes('OggS', [0, 2, 0, 0, 0, 0, 0, 0]))?.art).toBe('ogg');
    expect(audioFormat(bytes([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]))?.art).toBe('webm');
  });

  it('weist alles andere ab', () => {
    expect(audioFormat(bytes('%PDF-1.7', [0, 0, 0, 0]))).toBeNull();
    expect(audioFormat(bytes('RIFF', [0, 0, 0, 0], 'WAVE'))).toBeNull();
    expect(audioFormat(bytes([0, 0, 0, 0x20], 'ftypqt  ', [0, 0]))).toBeNull();
    expect(audioFormat(new Uint8Array(0))).toBeNull();
  });

  it('Pfad unter Inhalts-Hash', () => {
    const f = audioFormat(bytes('OggS', [0, 2, 0, 0, 0, 0, 0, 0]))!;
    expect(audioPfad('imam-2026', 1, 0, 'ab'.repeat(32), f)).toBe('audio/imam-2026/001-000-abababababababab.ogg');
    expect(() => audioPfad('../x', 1, 0, 'ab', f)).toThrow();
  });
});
