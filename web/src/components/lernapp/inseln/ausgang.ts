import { useEffect } from 'react';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import type { Profil, Speicher } from '@/lib/lernapp/lokal/db';

/**
 * Ausgang der Ereignisse (`lokal/ausgang.ts` samt Zod der Ereignisse) als eigener Chunk, geladen erst bei der ersten
 * Handlung in der Lektion bzw. beim ersten Ereignis – die erste Aufgabe braucht ihn nicht (KERN 4.0 §9, Spieler-Route).
 * Ereignisse warten der Reihe nach in einem Puffer: Lädt der Ausgang nicht (z. B. ohne Netz und noch nicht im Vorrat),
 * bleiben sie dort und gehen mit dem nächsten Ereignis bzw. am Ende der Lektion hinaus.
 */
export const ladeAusgang = () => import('@/lib/lernapp/lokal/ausgang');

export type EreignisKette = { schritt: Promise<void>; offen: EreignisEntwurf[] };
export const neueKette = (): EreignisKette => ({ schritt: Promise.resolve(), offen: [] });

/** Gepufferte Ereignisse an den Ausgang geben (der Reihe nach, nach allen vorigen Schritten). */
function leere(k: EreignisKette, sp: Speicher, profil: Profil): Promise<void> {
  k.schritt = k.schritt.then(async () => {
    let ausgang: Awaited<ReturnType<typeof ladeAusgang>>;
    try {
      ausgang = await ladeAusgang();
    } catch {
      return; // bleibt im Puffer bis zum nächsten Versuch
    }
    for (const e of k.offen.splice(0)) await ausgang.haengeAn(sp, profil, e).catch(() => undefined);
  });
  return k.schritt;
}

/** Ein Ereignis anhängen. */
export function melde(k: EreignisKette, sp: Speicher, profil: Profil, e: EreignisEntwurf): void {
  k.offen.push(e);
  void leere(k, sp, profil);
}

/** Warten, bis alle Ereignisse geschrieben sind (ein letzter Versuch für den Puffer). */
export const allesGeschrieben = (k: EreignisKette, sp: Speicher, profil: Profil): Promise<void> =>
  k.offen.length ? leere(k, sp, profil) : k.schritt;

/** Ausgang mit der ersten Eingabe (Zeiger oder Taste) vorladen, solange `aktiv` (der Spieler steht). */
export function useAusgangVorladen(aktiv: boolean) {
  useEffect(() => {
    if (!aktiv) return;
    const vor = () => void ladeAusgang().catch(() => undefined);
    const o = { once: true, capture: true } as const;
    document.addEventListener('pointerdown', vor, o);
    document.addEventListener('keydown', vor, o);
    return () => {
      document.removeEventListener('pointerdown', vor, o);
      document.removeEventListener('keydown', vor, o);
    };
  }, [aktiv]);
}
