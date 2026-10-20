import { type Ableitung, leiteAb } from '../ereignisse/ableiten';
import { EINSTELLUNG_WERTE, istArt } from '../ereignisse/typen';
import { ereignisse } from './ausgang';
import { type EinstellungsEintrag, profilBereich, type Speicher } from './db';
import { aendereProfil } from './profile';

/**
 * Abgeleitete Speicher eines Profils aus dem Protokoll neu schreiben (Karten, Lektionen, Tage, Einstellungen samt
 * aktuellem Tagesziel unter dem Schlüssel `tagesziel`) und die
 * Ableitungsversion am Profil vermerken. `heute` ist der Lerntag des Geräts.
 */
export async function leiteNeuAb(sp: Speicher, profil: string, heute: string): Promise<Ableitung> {
  const alle = await ereignisse(sp, profil);
  const basen = (await sp.lies('sync', profil))?.basen;
  const a = leiteAb(alle, heute, basen ? { basen: new Map(Object.entries(basen)) } : {});
  const bereich = profilBereich(profil);
  await sp.loescheBereich('karten', bereich);
  await sp.loescheBereich('lektionen', bereich);
  await sp.loescheBereich('tage', bereich);
  await sp.schreibe(
    'karten',
    [...a.karten.values()].map((k) => ({ ...k, profil })),
  );
  await sp.schreibe(
    'lektionen',
    [...a.lektionen.values()].map((l) => ({ ...l, profil })),
  );
  await sp.schreibe(
    'tage',
    [...a.tage.values()].map((t) => ({ ...t, profil })),
  );
  // Einstellungen: je bekanntem Schlüssel der letzte gültige Schreiber (am, geraet)
  const sieger = new Map<string, EinstellungsEintrag>();
  for (const e of alle.filter(istArt('einstellung'))) {
    const schema = EINSTELLUNG_WERTE[e.daten.schluessel as keyof typeof EINSTELLUNG_WERTE];
    if (schema?.safeParse(e.daten.wert).success)
      sieger.set(e.daten.schluessel, { profil, schluessel: e.daten.schluessel, wert: e.daten.wert, am: e.am, geraet: e.geraet });
  }
  // Tagesziel (eigene Ereignisart) steht als Schlüssel `tagesziel` daneben: Inseln lesen es ohne Ableitung
  const ziel = alle.filter(istArt('tagesziel')).at(-1);
  if (ziel) sieger.set('tagesziel', { profil, schluessel: 'tagesziel', wert: ziel.daten.ziel, am: ziel.am, geraet: ziel.geraet });
  await sp.loescheBereich('einstellungen', bereich);
  await sp.schreibe('einstellungen', [...sieger.values()]);
  if (await sp.lies('profile', profil)) await aendereProfil(sp, profil, { ableitungsVersion: a.version });
  return a;
}
