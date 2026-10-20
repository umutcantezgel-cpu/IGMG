import type { Ziffern } from '../format';
import { istSprache, type Oberflaeche, type Sprache } from '../kurse';

/**
 * Einstellungen der Lern-App auf dem Gerät (ADR 0037 Nr. 7, ADR 0043 Nr. 2, KERN 4.0 §7–§8). Rein bis auf den Speicher
 * unten; auch im Client nutzbar. Einstellungen gelten je Gerät („letzter Schreiber gewinnt“, ADR 0038); mit Konto
 * gleicht der Abgleich sie später als Ereignis `einstellung` ab.
 */

/** Tagesziel (ADR 0043 Nr. 2): XP oder Lektionen am Lerntag, oder kein Ziel. */
export type Tagesziel = { art: 'keins' } | { art: 'xp'; wert: number } | { art: 'lektionen'; wert: number };

/** Wählbare Tagesziele (ADR 0043 Nr. 2): 10/20/30/50 XP, 1/2/3 Lektionen, kein Ziel. */
export const TAGESZIELE: readonly Tagesziel[] = [
  { art: 'keins' },
  { art: 'xp', wert: 10 },
  { art: 'xp', wert: 20 },
  { art: 'xp', wert: 30 },
  { art: 'xp', wert: 50 },
  { art: 'lektionen', wert: 1 },
  { art: 'lektionen', wert: 2 },
  { art: 'lektionen', wert: 3 },
];

/** Kurzform eines Tagesziels für Formularwerte: `keins`, `xp-20`, `lektionen-2`. */
export function zielSchluessel(ziel: Tagesziel): string {
  return ziel.art === 'keins' ? 'keins' : `${ziel.art}-${ziel.wert}`;
}

/** Tagesziel aus der Kurzform; nur Werte aus `TAGESZIELE`. */
export function zielAus(schluessel: unknown): Tagesziel | null {
  return TAGESZIELE.find((z) => zielSchluessel(z) === schluessel) ?? null;
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
};

/**
 * Standard bis zur Entscheidung O-12 (Standard-Tagesziel, L7): 10 XP, also etwa eine Lektion am Tag – ein kleines
 * Ziel ohne Druck. Östlich-arabische Ziffern in der arabischen Oberfläche (O-5).
 */
export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  ausgang: null,
  tagesziel: { art: 'xp', wert: 10 },
  ziffern: 'oestlich',
  hoeren: true,
  sprechen: true,
};

/** Liest gespeicherte Einstellungen feldweise; Unbekanntes fällt auf den Standard zurück. */
export function pruefeEinstellungen(roh: unknown): Einstellungen {
  const e = roh && typeof roh === 'object' ? (roh as Record<string, unknown>) : {};
  const ziel = e.tagesziel && typeof e.tagesziel === 'object' ? zielAus(zielSchluessel(e.tagesziel as Tagesziel)) : null;
  return {
    ausgang: istSprache(e.ausgang) ? e.ausgang : null,
    tagesziel: ziel ?? STANDARD_EINSTELLUNGEN.tagesziel,
    ziffern: e.ziffern === 'westlich' || e.ziffern === 'latn' ? 'westlich' : 'oestlich',
    hoeren: typeof e.hoeren === 'boolean' ? e.hoeren : true,
    sprechen: typeof e.sprechen === 'boolean' ? e.sprechen : true,
  };
}

/** Wirksame Ausgangssprache: gewählt oder wie die Oberfläche. */
export function ausgangVon(e: Pick<Einstellungen, 'ausgang'>, ui: Oberflaeche): Sprache {
  return e.ausgang ?? ui;
}

/** Schlüssel im Gerätespeicher und Name des Ereignisses, mit dem Inseln einander über Änderungen informieren. */
export const EINSTELLUNGEN_SCHLUESSEL = 'igmg-lernapp-einstellungen';

export type EinstellungsSpeicher = {
  laden(): Promise<Einstellungen>;
  /** true = gespeichert; false = der Browser lässt nichts speichern (privater Modus, voll) */
  speichern(e: Einstellungen): Promise<boolean>;
};

/**
 * Speicher der Einstellungen bis zur Zusammenführung mit der lokalen Datenbank (`lokal/*`, Paket L1-04): eine Zeile im
 * Gerätespeicher des Browsers, ohne Cookie und ohne Netz. Die Zusammenführung ersetzt nur diesen Speicher (gleiche
 * Schnittstelle) und übernimmt einen vorhandenen Wert einmal in die Datenbank.
 */
export const einstellungsSpeicher: EinstellungsSpeicher = {
  async laden() {
    try {
      return pruefeEinstellungen(JSON.parse(window.localStorage.getItem(EINSTELLUNGEN_SCHLUESSEL) ?? 'null'));
    } catch {
      return STANDARD_EINSTELLUNGEN;
    }
  },
  async speichern(e) {
    try {
      window.localStorage.setItem(EINSTELLUNGEN_SCHLUESSEL, JSON.stringify(e));
      window.dispatchEvent(new Event(EINSTELLUNGEN_SCHLUESSEL));
      return true;
    } catch {
      return false;
    }
  },
};
