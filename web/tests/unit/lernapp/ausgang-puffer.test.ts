import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import type { Profil, Speicher } from '@/lib/lernapp/lokal/db';

/**
 * Puffer des Ausgangs (components/lernapp/inseln/ausgang.ts): Ereignisse gehen der Reihe nach hinaus; lädt der Ausgang nicht
 * (z. B. ohne Netz), bleiben sie im Puffer und gehen mit dem nächsten Versuch hinaus. Der Ausgang selbst ist hier ersetzt.
 */
const AUSGANG = '@/lib/lernapp/lokal/ausgang';
const geschrieben: string[] = [];
const ausgang = {
  haengeAn: async (_sp: unknown, _p: unknown, e: EreignisEntwurf) => {
    if (e.art === 'pause') throw new Error('ungültig');
    geschrieben.push(e.art);
  },
};

const sp = {} as Speicher;
const profil = { id: 'p1' } as Profil;
const ereignis = (art: EreignisEntwurf['art']) => ({ art, daten: {} }) as unknown as EreignisEntwurf;

describe('Ausgang mit Puffer', () => {
  beforeEach(() => {
    geschrieben.length = 0;
    vi.resetModules();
  });

  it('schreibt der Reihe nach; ein ungültiges Ereignis hält die übrigen nicht auf', async () => {
    vi.doMock(AUSGANG, () => ausgang);
    const { allesGeschrieben, melde, neueKette } = await import('@/components/lernapp/inseln/ausgang');
    const k = neueKette();
    melde(k, sp, profil, ereignis('bewertung'));
    melde(k, sp, profil, ereignis('pause'));
    melde(k, sp, profil, ereignis('lektion'));
    await allesGeschrieben(k, sp, profil);
    expect(geschrieben).toEqual(['bewertung', 'lektion']);
    expect(k.offen).toEqual([]);
  });

  it('ohne Ausgang bleiben Ereignisse im Puffer und gehen mit dem nächsten Versuch hinaus', async () => {
    vi.doMock(AUSGANG, () => {
      throw new Error('kein Netz');
    });
    const { allesGeschrieben, melde, neueKette } = await import('@/components/lernapp/inseln/ausgang');
    const k = neueKette();
    melde(k, sp, profil, ereignis('bewertung'));
    await k.schritt;
    expect(k.offen).toHaveLength(1);
    expect(geschrieben).toEqual([]);
    vi.doMock(AUSGANG, () => ausgang);
    vi.resetModules();
    melde(k, sp, profil, ereignis('lektion'));
    await allesGeschrieben(k, sp, profil);
    expect(geschrieben).toEqual(['bewertung', 'lektion']);
    expect(k.offen).toEqual([]);
  });
});
