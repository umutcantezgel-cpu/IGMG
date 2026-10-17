import { ABLEITUNGS_VERSION, type Ableitung, leiteAb } from '../ereignisse/ableiten';
import { lerntagVon } from '../ereignisse/serie';
import { EINSTELLUNG_WERTE, type Ereignis, type EreignisEntwurf, EreignisEntwurfSchema, EreignisSchema, istArt } from '../ereignisse/typen';
import { ereignisSchluessel, vereinige } from '../ereignisse/zusammenfuehren';
import { type EinstellungsEintrag, type GespeichertesEreignis, type Profil, profilBereich, type Speicher } from './db';
import { aendereProfil } from './profile';

/**
 * Ausgang (ADR 0038 Nr. 2 und 5): Der Spieler meldet Ereignis-Entwürfe; hier bekommen sie Gerät, laufende Nummer je
 * Gerät, Zeit und Lerntag in Ortszeit und werden geprüft angehängt (`synchron: 0`). Der Abgleich mit dem Server
 * (lokal/sync.ts, L1-05) liest `ausstehende`, markiert gesendete und übernimmt fremde Ereignisse idempotent. Abgeleitete
 * Speicher entstehen neu aus dem Protokoll (`leiteNeuAb`), auch wenn sich `ABLEITUNGS_VERSION` ändert.
 */

const ohneSpeicherfelder = ({ profil: _p, synchron: _s, ...e }: GespeichertesEreignis): Ereignis => e as Ereignis;

export type AnhaengenOptionen = { jetzt?: Date; zeitzone?: string };

/** Entwurf prüfen, Nummer vergeben, anhängen. */
export async function haengeAn(
  sp: Speicher,
  profil: Pick<Profil, 'id' | 'geraet'>,
  entwurf: EreignisEntwurf,
  { jetzt = new Date(), zeitzone }: AnhaengenOptionen = {},
): Promise<Ereignis> {
  const geprueft = EreignisEntwurfSchema.parse(entwurf);
  const gespeichert = await sp.haengeAn(profil.id, profil.geraet, (seq) => ({
    ...EreignisSchema.parse({ geraet: profil.geraet, seq, am: jetzt.toISOString(), tag: lerntagVon(jetzt, zeitzone), ...geprueft }),
    profil: profil.id,
    synchron: 0,
  }));
  return ohneSpeicherfelder(gespeichert);
}

/** Mehrere Entwürfe nacheinander (Reihenfolge bleibt in den Nummern erhalten). */
export async function haengeAlleAn(
  sp: Speicher,
  profil: Pick<Profil, 'id' | 'geraet'>,
  entwuerfe: readonly EreignisEntwurf[],
  optionen: AnhaengenOptionen = {},
): Promise<Ereignis[]> {
  const ergebnis: Ereignis[] = [];
  for (const e of entwuerfe) ergebnis.push(await haengeAn(sp, profil, e, optionen));
  return ergebnis;
}

/** Alle Ereignisse eines Profils (sortiert nach Zeit, Gerät, Nummer). */
export async function ereignisse(sp: Speicher, profil: string): Promise<Ereignis[]> {
  return vereinige((await sp.alle('ereignisse', profilBereich(profil))).map(ohneSpeicherfelder));
}

/** Noch nicht abgeglichene Ereignisse (höchstens `hoechstens`, Grenze der Sync-API: 500). */
export async function ausstehende(sp: Speicher, profil: string, hoechstens = 500): Promise<Ereignis[]> {
  const offen = await sp.alleIndex('ereignisse', 'profil-synchron', [
    [profil, 0],
    [profil, 0],
  ]);
  return vereinige(offen.map(ohneSpeicherfelder)).slice(0, hoechstens);
}

/** Nach erfolgreichem Senden: als abgeglichen markieren. */
export async function markiereSynchron(sp: Speicher, profil: string, gesendet: readonly Pick<Ereignis, 'geraet' | 'seq'>[]): Promise<void> {
  const werte: GespeichertesEreignis[] = [];
  for (const g of gesendet) {
    const e = await sp.lies('ereignisse', [profil, g.geraet, g.seq]);
    if (e && e.synchron === 0) werte.push({ ...e, synchron: 1 });
  }
  if (werte.length) await sp.schreibe('ereignisse', werte);
}

/** Fremde Ereignisse (vom Server oder aus einem Import) idempotent übernehmen; ungültige werden übergangen. */
export async function uebernimm(
  sp: Speicher,
  profil: string,
  fremde: readonly unknown[],
  { synchron = 1 }: { synchron?: 0 | 1 } = {},
): Promise<{ neu: number; vorhanden: number; ungueltig: number }> {
  const bekannt = new Set((await sp.alle('ereignisse', profilBereich(profil))).map(ereignisSchluessel));
  const neu: GespeichertesEreignis[] = [];
  let vorhanden = 0;
  let ungueltig = 0;
  for (const roh of fremde) {
    const p = EreignisSchema.safeParse(roh);
    if (!p.success) {
      ungueltig++;
      continue;
    }
    const s = ereignisSchluessel(p.data);
    if (bekannt.has(s)) {
      vorhanden++;
      continue;
    }
    bekannt.add(s);
    neu.push({ ...p.data, profil, synchron });
  }
  if (neu.length) await sp.schreibe('ereignisse', neu);
  if (synchron === 1)
    await markiereSynchron(
      sp,
      profil,
      fremde.flatMap((f) => (EreignisSchema.safeParse(f).success ? [f as Ereignis] : [])),
    );
  return { neu: neu.length, vorhanden, ungueltig };
}

/** Muss neu abgeleitet werden (neue Ableitungsregeln seit dem letzten Lauf)? */
export const brauchtNeuableitung = (p: Pick<Profil, 'ableitungsVersion'>): boolean => p.ableitungsVersion !== ABLEITUNGS_VERSION;

/**
 * Abgeleitete Speicher eines Profils aus dem Protokoll neu schreiben (Karten, Lektionen, Tage, Einstellungen) und die
 * Ableitungsversion am Profil vermerken. `heute` ist der Lerntag des Geräts.
 */
export async function leiteNeuAb(sp: Speicher, profil: string, heute: string): Promise<Ableitung> {
  const alle = await ereignisse(sp, profil);
  const a = leiteAb(alle, heute);
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
  await sp.loescheBereich('einstellungen', bereich);
  await sp.schreibe('einstellungen', [...sieger.values()]);
  if (await sp.lies('profile', profil)) await aendereProfil(sp, profil, { ableitungsVersion: a.version });
  return a;
}
