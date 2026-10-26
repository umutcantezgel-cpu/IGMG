import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { START_TAGS } from '@/lib/cache/tags';

/**
 * Cache-Erneuerung (ADR 0017, BETRIEB.md): ohne Angabe verfallen alle Start-Tags; mit `?tag=` nur die genannten (N5: der
 * Koran-Test der Lern-App lässt nur `lernapp-kurs-koran` verfallen, damit die Kursverzeichnisse warm bleiben). Unbekannte
 * Tags → 400, nichts verfällt; ohne WARTUNG_TOKEN → 401.
 */
const verfallen = vi.hoisted(() => [] as { tag: string; profil: unknown }[]);
vi.mock('next/cache', () => ({ revalidateTag: (tag: string, profil: unknown) => verfallen.push({ tag, profil }) }));
const { POST } = await import('@/app/api/wartung/cache-erneuern/route');

const TOKEN = 't'.repeat(32);
const vorher = process.env.WARTUNG_TOKEN;
beforeEach(() => {
  verfallen.length = 0;
  process.env.WARTUNG_TOKEN = TOKEN;
});
afterEach(() => {
  if (vorher === undefined) delete process.env.WARTUNG_TOKEN;
  else process.env.WARTUNG_TOKEN = vorher;
});

const anfrage = (suche = '', auth = `Bearer ${TOKEN}`) =>
  new Request(`https://example.test/api/wartung/cache-erneuern${suche}`, { method: 'POST', headers: { authorization: auth } });

describe('POST /api/wartung/cache-erneuern', () => {
  it('ohne gültiges Token → 401, nichts verfällt', async () => {
    const antwort = await POST(anfrage('', `Bearer ${'x'.repeat(32)}`));
    expect(antwort.status).toBe(401);
    expect(verfallen).toEqual([]);
  });

  it('ohne ?tag: alle Start-Tags sofort (expire 0)', async () => {
    const antwort = await POST(anfrage());
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ erneuert: START_TAGS.length });
    expect(verfallen.map((v) => v.tag)).toEqual([...START_TAGS]);
    expect(verfallen.every((v) => JSON.stringify(v.profil) === '{"expire":0}')).toBe(true);
    expect(antwort.headers.get('cache-control')).toBe('no-store');
  });

  it('mit ?tag=lernapp-kurs-koran: nur dieser Tag, `lernapp` und die anderen Kurse bleiben', async () => {
    const antwort = await POST(anfrage('?tag=lernapp-kurs-koran'));
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ erneuert: 1 });
    expect(verfallen).toEqual([{ tag: 'lernapp-kurs-koran', profil: { expire: 0 } }]);
  });

  it('mehrere Tags (Start-Tag und Kurs-Tag), doppelte nur einmal', async () => {
    const antwort = await POST(anfrage('?tag=quran&tag=lernapp-kurs-tr&tag=quran'));
    expect(await antwort.json()).toEqual({ erneuert: 2 });
    expect(verfallen.map((v) => v.tag)).toEqual(['quran', 'lernapp-kurs-tr']);
  });

  it('ein unbekannter Tag → 400, und auch die bekannten verfallen nicht', async () => {
    for (const suche of ['?tag=lernapp-kurs-fr', '?tag=quran&tag=beliebig', '?tag=', '?tag=veranstaltung:1']) {
      const antwort = await POST(anfrage(suche));
      expect(antwort.status, suche).toBe(400);
      expect(await antwort.json()).toEqual({ fehler: 'unbekannter_tag' });
    }
    expect(verfallen).toEqual([]);
  });
});
