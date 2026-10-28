import { describe, expect, it } from 'vitest';
import { API_KOPFZEILEN, apiAntwort, monatErlaubt, monatPlus, vorgerenderteMonate } from '@/lib/gebetszeiten/lese-api';
import type { GebetszeitenMonat } from '@/server/queries/gebetszeiten';

/** Lese-API `/api/gebetszeiten/<JJJJ-MM>` (ADR 0048): erlaubte und vorgerenderte Monate, Aufbau der Antwort, Kopfzeilen. */
describe('Lese-API der Gebetszeiten', () => {
  it('erlaubt nur gültige Monate bis zwölf Monate vor und nach heute', () => {
    expect(monatErlaubt('2026-10', '2026-10-28')).toBe(true);
    expect(monatErlaubt('2027-10', '2026-10-28')).toBe(true);
    expect(monatErlaubt('2027-11', '2026-10-28')).toBe(false);
    expect(monatErlaubt('2025-10', '2026-10-28')).toBe(true);
    expect(monatErlaubt('2025-09', '2026-10-28')).toBe(false);
    for (const falsch of ['2026-13', '2026-1', '26-10', '2026-10-01', 'x']) expect(monatErlaubt(falsch, '2026-10-28')).toBe(false);
  });

  it('rendert Vormonat bis zwölf Monate voraus vor (Jahreswechsel eingeschlossen)', () => {
    const m = vorgerenderteMonate('2026-12-05');
    expect(m[0]).toBe('2026-11');
    expect(m).toContain('2027-01');
    expect(m.at(-1)).toBe('2027-12');
    expect(m).toHaveLength(14);
    expect(monatPlus('2026-01', -1)).toBe('2025-12');
  });

  it('Antwort mit Quelle je Tag, Stand und Quellenangabe nur bei IGMG-Tagen', () => {
    const tag = { imsak: '06:20', gunes: '07:58', ogle: '13:16', ikindi: '15:52', aksam: '18:23', yatsi: '19:56', ramadan: false };
    const monat: GebetszeitenMonat = {
      monat: '2026-11',
      tage: [
        { datum: '2026-11-01', ...tag, quelle: 'igmg' },
        { datum: '2026-11-02', ...tag, quelle: 'berechnet' },
      ],
      quelle: 'gemischt',
      bestaetigt: false,
      stand: '2026-10-28',
    };
    const a = apiAntwort(monat, 'Wetzlar');
    expect(a).toMatchObject({ monat: '2026-11', ort: 'Wetzlar', zeitzone: 'Europe/Berlin', quelle: 'gemischt', stand: '2026-10-28' });
    expect(a.quellenangabe?.url).toBe('https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238');
    expect(a.tage[1]).toEqual({
      datum: '2026-11-02',
      imsak: '06:20',
      gunes: '07:58',
      ogle: '13:16',
      ikindi: '15:52',
      aksam: '18:23',
      yatsi: '19:56',
      quelle: 'berechnet',
    });
    expect(apiAntwort({ ...monat, tage: [monat.tage[1]], quelle: 'berechnet', stand: null }, 'Wetzlar').quellenangabe).toBeNull();
  });

  it('öffentlich lesbar nur für GET, ohne Raten des Inhaltstyps, fünf Minuten im Browser', () => {
    expect(API_KOPFZEILEN).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    });
  });
});
