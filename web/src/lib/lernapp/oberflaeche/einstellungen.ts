import { addiereTage, freieRuhetage, tageZwischen } from '../ereignisse/serie';
import type { EreignisEntwurf, Tagesziel } from '../ereignisse/typen';
import type { Ziffern } from '../format';
import { istSprache, type Oberflaeche, type Sprache } from '../kurse';
import { profilBereich } from '../lokal/db';
import { frischAbgeleitet, geraet, heute, meldeStand, vorhandenesProfil } from './geraet';

/**
 * Einstellungen der Lern-App (ADR 0037 Nr. 7, ADR 0043 Nr. 2, KERN 4.0 §7–§8). Gespeichert als Ereignisse `einstellung`
 * bzw. `tagesziel` im Protokoll des Profils (ADR 0038: letzter Schreiber gewinnt nach (am, geraet); mit Konto gleicht der
 * Abgleich sie ab). Gelesen aus dem abgeleiteten Speicher `einstellungen` (ohne Zod und FSRS); Schreiben lädt den Ausgang
 * erst bei der Änderung (`import()`).
 */

export type { Tagesziel };

/** Wählbare Tagesziele (ADR 0043 Nr. 2): kein Ziel, 10/20/30/50 XP, 1/2/3 Lektionen. */
export const TAGESZIELE: readonly Tagesziel[] = [
  { art: 'kein' },
  { art: 'xp', wert: 10 },
  { art: 'xp', wert: 20 },
  { art: 'xp', wert: 30 },
  { art: 'xp', wert: 50 },
  { art: 'lektionen', wert: 1 },
  { art: 'lektionen', wert: 2 },
  { art: 'lektionen', wert: 3 },
];

/** Kurzform eines Tagesziels für Formularwerte: `kein`, `xp-20`, `lektionen-2`. */
export function zielSchluessel(ziel: Tagesziel): string {
  return ziel.art === 'kein' ? 'kein' : `${ziel.art}-${ziel.wert}`;
}

/** Tagesziel aus der Kurzform; nur Werte aus `TAGESZIELE` (die frühere Kurzform `keins` gilt als `kein`). */
export function zielAus(schluessel: unknown): Tagesziel | null {
  const s = schluessel === 'keins' ? 'kein' : schluessel;
  return TAGESZIELE.find((z) => zielSchluessel(z) === s) ?? null;
}

export type Einstellungen = {
  /** Ausgangssprache; `null` = wie die Oberfläche (Standard, ADR 0037 Nr. 7) */
  ausgang: Sprache | null;
  tagesziel: Tagesziel;
  /** Ziffern in der arabischen Oberfläche (O-5, LM-18) */
  ziffern: Ziffern;
  /** Hörübungen bzw. Sprechübungen an (KERN 4.0 §8: „Hörübungen aus“, „Sprechübungen aus“) */
  hoeren: boolean;
  sprechen: boolean;
  /** automatische Pausetage je Kalenderwoche, die die Serie tragen (ADR 0043 Nr. 3: Standard 2, einstellbar 0–3) */
  pausetage: number;
};

/** Wählbare Pausetage je Woche (ADR 0043 Nr. 3). */
export const PAUSETAGE = [0, 1, 2, 3] as const;
const istPausetage = (w: unknown): w is number => typeof w === 'number' && (PAUSETAGE as readonly number[]).includes(w);

/**
 * Standard bis zur Entscheidung O-12 (Standard-Tagesziel, L7): eine Lektion am Tag, wie `TAGESZIEL_STANDARD` der
 * Ableitung (ein Unit-Test hält beide gleich) – ein kleines Ziel ohne Druck. Östlich-arabische Ziffern (O-5).
 */
export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  ausgang: null,
  tagesziel: { art: 'lektionen', wert: 1 },
  ziffern: 'oestlich',
  hoeren: true,
  sprechen: true,
  pausetage: 2,
};

/** Tagesziel aus einem gespeicherten Wert; nur Werte aus `TAGESZIELE` (frühere Form `{ art: 'keins' }` gilt als `kein`). */
function zielVon(roh: unknown): Tagesziel | null {
  if (!roh || typeof roh !== 'object') return null;
  const { art, wert } = roh as { art?: unknown; wert?: unknown };
  return zielAus(art === 'kein' || art === 'keins' ? 'kein' : `${String(art)}-${String(wert)}`);
}

/** Liest Einstellungen feldweise (frühere Speicherform im Browser); Unbekanntes fällt auf den Standard zurück. */
export function pruefeEinstellungen(roh: unknown): Einstellungen {
  const e = roh && typeof roh === 'object' ? (roh as Record<string, unknown>) : {};
  return {
    ausgang: istSprache(e.ausgang) ? e.ausgang : null,
    tagesziel: zielVon(e.tagesziel) ?? STANDARD_EINSTELLUNGEN.tagesziel,
    ziffern: e.ziffern === 'westlich' || e.ziffern === 'latn' ? 'westlich' : 'oestlich',
    hoeren: typeof e.hoeren === 'boolean' ? e.hoeren : true,
    sprechen: typeof e.sprechen === 'boolean' ? e.sprechen : true,
    pausetage: istPausetage(e.pausetage) ? e.pausetage : STANDARD_EINSTELLUNGEN.pausetage,
  };
}

/** Einstellungen aus den Einträgen des abgeleiteten Speichers (Schlüssel der Ereignisse, ADR 0038). */
export function einstellungenAusEintraegen(eintraege: readonly { schluessel: string; wert: unknown }[]): Einstellungen {
  const e: Einstellungen = { ...STANDARD_EINSTELLUNGEN };
  for (const { schluessel, wert } of eintraege) {
    if (schluessel === 'ausgangssprache') e.ausgang = istSprache(wert) ? wert : null;
    else if (schluessel === 'tagesziel') e.tagesziel = zielVon(wert) ?? e.tagesziel;
    else if (schluessel === 'ziffern' && (wert === 'oestlich' || wert === 'westlich')) e.ziffern = wert;
    else if (schluessel === 'hoerenAus' && typeof wert === 'boolean') e.hoeren = !wert;
    else if (schluessel === 'sprechenAus' && typeof wert === 'boolean') e.sprechen = !wert;
    else if (schluessel === 'pausetage' && istPausetage(wert)) e.pausetage = wert;
  }
  return e;
}

/** Geänderte Felder als Ereignis-Entwürfe (`einstellung` bzw. `tagesziel`). */
export function einstellungsEreignisse(alt: Einstellungen, neu: Einstellungen): EreignisEntwurf[] {
  const aus: EreignisEntwurf[] = [];
  const setze = (schluessel: string, wert: string | number | boolean | null) =>
    aus.push({ art: 'einstellung', daten: { schluessel, wert } });
  if (alt.ausgang !== neu.ausgang) setze('ausgangssprache', neu.ausgang);
  if (zielSchluessel(alt.tagesziel) !== zielSchluessel(neu.tagesziel)) aus.push({ art: 'tagesziel', daten: { ziel: neu.tagesziel } });
  if (alt.ziffern !== neu.ziffern) setze('ziffern', neu.ziffern);
  if (alt.hoeren !== neu.hoeren) setze('hoerenAus', !neu.hoeren);
  if (alt.sprechen !== neu.sprechen) setze('sprechenAus', !neu.sprechen);
  if (alt.pausetage !== neu.pausetage) setze('pausetage', neu.pausetage);
  return aus;
}

/** Wirksame Ausgangssprache: gewählt oder wie die Oberfläche. */
export function ausgangVon(e: Pick<Einstellungen, 'ausgang'>, ui: Oberflaeche): Sprache {
  return e.ausgang ?? ui;
}

/** Name des Fenster-Ereignisses, mit dem Inseln einander über Änderungen informieren; zugleich der Schlüssel der früheren Speicherform. */
export const EINSTELLUNGEN_SCHLUESSEL = 'igmg-lernapp-einstellungen';

export type EinstellungsSpeicher = {
  laden(): Promise<Einstellungen>;
  /** true = gespeichert; false = der Browser lässt nichts dauerhaft speichern (privater Modus, voll, ohne IndexedDB) */
  speichern(e: Einstellungen): Promise<boolean>;
};

/** Frühere Speicherform (L1-03, Gerätespeicher des Browsers): einmal lesen, dann übernehmen und entfernen. */
function alteEinstellungen(): Einstellungen | null {
  try {
    const roh = window.localStorage.getItem(EINSTELLUNGEN_SCHLUESSEL);
    return roh ? pruefeEinstellungen(JSON.parse(roh)) : null;
  } catch {
    return null;
  }
}

function entferneAlte(): void {
  try {
    window.localStorage.removeItem(EINSTELLUNGEN_SCHLUESSEL);
  } catch {
    // privater Modus: nichts zu entfernen
  }
}

/** Speicher der Einstellungen im Protokoll des aktiven Profils (Client). */
export function einstellungsSpeicher(ui: Oberflaeche): EinstellungsSpeicher {
  const lies = async (): Promise<Einstellungen> => {
    const { sp, profil } = await vorhandenesProfil();
    if (!profil) return STANDARD_EINSTELLUNGEN;
    const p = await frischAbgeleitet(sp, profil);
    return einstellungenAusEintraegen(await sp.alle('einstellungen', profilBereich(p.id)));
  };
  const schreibe = async (neu: Einstellungen, alt: Einstellungen): Promise<boolean> => {
    const entwuerfe = einstellungsEreignisse(alt, neu);
    const { sp, profil } = await geraet(ui);
    if (entwuerfe.length) {
      const [{ haengeAlleAn }, { leiteNeuAb }] = await Promise.all([import('../lokal/ausgang'), import('../lokal/ableitung')]);
      await haengeAlleAn(sp, profil, entwuerfe);
      await leiteNeuAb(sp, profil.id, heute());
      if (profil.benutzerId) void import('./abgleich').then((a) => a.nachHandlung());
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EINSTELLUNGEN_SCHLUESSEL));
    meldeStand();
    return sp.art === 'indexeddb';
  };
  return {
    async laden() {
      try {
        const alt = alteEinstellungen();
        if (alt) {
          await schreibe(alt, await lies());
          entferneAlte();
        }
        return await lies();
      } catch {
        return STANDARD_EINSTELLUNGEN;
      }
    },
    async speichern(neu) {
      try {
        return await schreibe(neu, await lies());
      } catch {
        return false;
      }
    },
  };
}

// ——— Ruhezeit (ADR 0043 Nr. 3): bis zu 30 Tage im Jahr, z. B. Urlaub oder Krankheit; trägt die Serie ———

/** Höchstens so viele Tage je Eintrag und je Kalenderjahr (Ereignis `pause`, `ruhetageAus`). */
export const RUHEZEIT_HOECHSTENS = 30;

export type RuhezeitFehler = 'form' | 'reihenfolge' | 'zuLang' | 'zuWeit' | 'jahr';

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
/** Gültiger Kalendertag `JJJJ-MM-TT` (auch Schaltjahre; `Date.parse` nähme den 30. Februar an). */
const istTag = (t: string): boolean =>
  DATUM.test(t) && !Number.isNaN(Date.parse(t)) && new Date(`${t}T00:00:00Z`).toISOString().startsWith(t);

/**
 * Prüft einen Zeitraum vor dem Eintragen: gültige Daten, `von` ≤ `bis`, höchstens 30 Tage, höchstens ein Jahr vor oder nach
 * heute und nicht mehr neue Tage, als im Kalenderjahr noch frei sind. `null` = in Ordnung.
 */
export function pruefeRuhezeit(von: string, bis: string, heute: string, ruhetage: Iterable<string>): RuhezeitFehler | null {
  if (!istTag(von) || !istTag(bis)) return 'form';
  if (bis < von) return 'reihenfolge';
  if (tageZwischen(von, bis) >= RUHEZEIT_HOECHSTENS) return 'zuLang';
  if (Math.abs(tageZwischen(heute, von)) > 366 || Math.abs(tageZwischen(heute, bis)) > 366) return 'zuWeit';
  const schon = new Set(ruhetage);
  const neuJeJahr = new Map<string, number>();
  for (let t = von; t <= bis; t = addiereTage(t, 1))
    if (!schon.has(t)) neuJeJahr.set(t.slice(0, 4), (neuJeJahr.get(t.slice(0, 4)) ?? 0) + 1);
  for (const [jahr, n] of neuJeJahr) if (n > freieRuhetage(schon, jahr, RUHEZEIT_HOECHSTENS)) return 'jahr';
  return null;
}

/** Eingetragene Ruhetage des aktiven Profils (abgeleitet, Schlüssel `ruhetage`). */
export async function ladeRuhetage(): Promise<string[]> {
  const { sp, profil } = await vorhandenesProfil();
  if (!profil) return [];
  const p = await frischAbgeleitet(sp, profil);
  const e = await sp.lies('einstellungen', [p.id, 'ruhetage']);
  return Array.isArray(e?.wert) ? e.wert.filter((t): t is string => typeof t === 'string') : [];
}

/** Ruhezeit eintragen (Ereignis `pause` im Protokoll, danach neu ableiten). Ergebnis wie `speichern`. */
export async function trageRuhezeitEin(ui: Oberflaeche, von: string, bis: string): Promise<boolean> {
  try {
    const { sp, profil } = await geraet(ui);
    const [{ haengeAn }, { leiteNeuAb }] = await Promise.all([import('../lokal/ausgang'), import('../lokal/ableitung')]);
    await haengeAn(sp, profil, { art: 'pause', daten: { von, bis } });
    await leiteNeuAb(sp, profil.id, heute());
    if (profil.benutzerId) void import('./abgleich').then((a) => a.nachHandlung());
    meldeStand();
    return sp.art === 'indexeddb';
  } catch {
    return false;
  }
}
