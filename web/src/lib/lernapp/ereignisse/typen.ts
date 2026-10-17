import { z } from 'zod';
import { LEKTIONS_ARTEN, XP_HOECHSTENS } from '../engine/xp';
import { NOTEN } from '../srs';

/**
 * Ereignisprotokoll der Lern-App (ADR 0038 Nr. 2, PLAN §3.8): die einzige Wahrheit über den Fortschritt, nur anhängen.
 *
 * `{ geraet, seq, am, tag, art, daten }`
 * - `geraet`: UUID je Gerät und Profil; `seq`: fortlaufend je Gerät (ab 0)
 * - `am`: Gerätezeit (ISO mit Zone); der Server klemmt auf höchstens Empfang + 5 min (serie.ts `klemmeEreignis`)
 * - `tag`: Lerntag `JJJJ-MM-TT` in Ortszeit des Geräts – Serie und Tagesziel rechnen damit, nie mit `am`
 * - `art` und `daten`: je Art ein eigenes Zod-Schema (unten)
 *
 * Alle Zustände (Karten, Lektionen, XP, Tagesziel, Serie, Einstellungen) sind daraus abgeleitet (ableiten.ts).
 */

export const EREIGNIS_ARTEN = ['bewertung', 'lektion', 'xp', 'pause', 'einstellung', 'einstufung', 'tagesziel'] as const;
export type EreignisArt = (typeof EREIGNIS_ARTEN)[number];

const TAG_MUSTER = /^\d{4}-\d{2}-\d{2}$/;

/** Gültiger Kalendertag `JJJJ-MM-TT` (auch Schaltjahre). */
export function istGueltigerTag(tag: string): boolean {
  if (!TAG_MUSTER.test(tag)) return false;
  const [j, m, t] = tag.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(j, m - 1, t));
  return d.getUTCFullYear() === j && d.getUTCMonth() === m - 1 && d.getUTCDate() === t;
}

export const TagSchema = z.string().refine(istGueltigerTag, { message: 'Lerntag JJJJ-MM-TT' });

/** Stabile Schlüssel aus dem Inhalt (z. B. `tr-aus-de`, `tr.a1.e03.l0042`, `tr-aus-de.a1.e01.l02`). */
export const SchluesselSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9][a-z0-9._:-]*$/i);

/** UUID nach RFC 9562 (crypto.randomUUID ergibt Version 4). */
export const GeraetSchema = z.uuid({ message: 'Gerät als UUID' });

export const STUFEN = ['a1', 'a2', 'b1', 'b2', 'c1'] as const;

export const TageszielSchema = z.discriminatedUnion('art', [
  z.strictObject({ art: z.literal('xp'), wert: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(50)]) }),
  z.strictObject({ art: z.literal('lektionen'), wert: z.union([z.literal(1), z.literal(2), z.literal(3)]) }),
  z.strictObject({ art: z.literal('kein') }),
]);
export type Tagesziel = z.infer<typeof TageszielSchema>;

/** Standard des Tagesziels bis zur Antwort (ADR 0043 Nr. 2 „[Standard festlegen]“): eine Lektion am Tag. */
export const TAGESZIEL_STANDARD: Tagesziel = { art: 'lektionen', wert: 1 };

/** Bekannte Einstellungen mit ihrem Wertebereich; unbekannte Schlüssel bleiben im Protokoll, wirken aber nicht. */
export const EINSTELLUNG_WERTE = {
  /** automatische Pausetage je Kalenderwoche (ADR 0043 Nr. 3) */
  pausetage: z.int().min(0).max(3),
  /** Ziffern der arabischen Oberfläche (O-5) */
  ziffern: z.enum(['oestlich', 'westlich']),
  hoerenAus: z.boolean(),
  sprechenAus: z.boolean(),
  ausgangssprache: z.enum(['de', 'tr', 'ar']),
  oberflaeche: z.enum(['de', 'tr', 'ar']),
} as const;

export type Einstellungen = {
  pausetage: number;
  ziffern: 'oestlich' | 'westlich';
  hoerenAus: boolean;
  sprechenAus: boolean;
  ausgangssprache?: 'de' | 'tr' | 'ar';
  oberflaeche?: 'de' | 'tr' | 'ar';
};

export const EINSTELLUNGEN_STANDARD: Readonly<Einstellungen> = Object.freeze({
  pausetage: 2,
  ziffern: 'oestlich',
  hoerenAus: false,
  sprechenAus: false,
});

const Quote = <T extends { richtig: number; gesamt: number }>(d: T) => d.richtig <= d.gesamt;

/** Daten je Art. */
export const DATEN = {
  bewertung: z.strictObject({
    karte: SchluesselSchema,
    note: z.enum(NOTEN),
    kurs: SchluesselSchema.optional(),
    aufgabe: SchluesselSchema.optional(),
    /** Selbstbewertung (nur Sprechen und Schreiben, srs.ts) */
    selbst: z.literal(true).optional(),
  }),
  lektion: z
    .strictObject({
      kurs: SchluesselSchema,
      lektion: SchluesselSchema,
      art: z.enum(LEKTIONS_ARTEN),
      richtig: z.int().min(0).max(1000),
      gesamt: z.int().min(1).max(1000),
    })
    .refine(Quote, { message: 'richtig ≤ gesamt' }),
  xp: z.strictObject({ menge: z.int().min(1).max(XP_HOECHSTENS), grund: z.enum(LEKTIONS_ARTEN), bezug: SchluesselSchema.optional() }),
  /** Ruhezeit (Urlaub, Krankheit, Ramadan): Tage von–bis, höchstens 30 je Ereignis. */
  pause: z
    .strictObject({ von: TagSchema, bis: TagSchema })
    .refine((d) => d.von <= d.bis && (Date.parse(d.bis) - Date.parse(d.von)) / 86_400_000 < 30, {
      message: 'von ≤ bis, höchstens 30 Tage',
    }),
  einstellung: z.strictObject({
    schluessel: z.string().regex(/^[a-z][a-zA-Z0-9]{0,39}$/),
    wert: z.union([z.string().max(200), z.number(), z.boolean(), z.null()]),
  }),
  einstufung: z
    .strictObject({
      kurs: SchluesselSchema,
      stufe: z.enum(STUFEN),
      einheit: SchluesselSchema.optional(),
      richtig: z.int().min(0).max(100),
      gesamt: z.int().min(1).max(100),
    })
    .refine(Quote, { message: 'richtig ≤ gesamt' }),
  tagesziel: z.strictObject({ ziel: TageszielSchema }),
} as const;

const kopf = {
  geraet: GeraetSchema,
  seq: z.int().min(0).max(2_147_483_647),
  am: z.iso.datetime({ offset: true }),
  tag: TagSchema,
};

export const EreignisSchema = z.discriminatedUnion('art', [
  z.strictObject({ ...kopf, art: z.literal('bewertung'), daten: DATEN.bewertung }),
  z.strictObject({ ...kopf, art: z.literal('lektion'), daten: DATEN.lektion }),
  z.strictObject({ ...kopf, art: z.literal('xp'), daten: DATEN.xp }),
  z.strictObject({ ...kopf, art: z.literal('pause'), daten: DATEN.pause }),
  z.strictObject({ ...kopf, art: z.literal('einstellung'), daten: DATEN.einstellung }),
  z.strictObject({ ...kopf, art: z.literal('einstufung'), daten: DATEN.einstufung }),
  z.strictObject({ ...kopf, art: z.literal('tagesziel'), daten: DATEN.tagesziel }),
]);

export type Ereignis = z.infer<typeof EreignisSchema>;
export type EreignisVon<A extends EreignisArt> = Extract<Ereignis, { art: A }>;

/** Was der Spieler meldet; Gerät, Nummer, Zeit und Lerntag ergänzt der Ausgang (lokal/ausgang.ts). */
export type EreignisEntwurf = { [A in EreignisArt]: { art: A; daten: EreignisVon<A>['daten'] } }[EreignisArt];

export const EreignisEntwurfSchema = z.discriminatedUnion('art', [
  z.strictObject({ art: z.literal('bewertung'), daten: DATEN.bewertung }),
  z.strictObject({ art: z.literal('lektion'), daten: DATEN.lektion }),
  z.strictObject({ art: z.literal('xp'), daten: DATEN.xp }),
  z.strictObject({ art: z.literal('pause'), daten: DATEN.pause }),
  z.strictObject({ art: z.literal('einstellung'), daten: DATEN.einstellung }),
  z.strictObject({ art: z.literal('einstufung'), daten: DATEN.einstufung }),
  z.strictObject({ art: z.literal('tagesziel'), daten: DATEN.tagesziel }),
]);

export const istArt =
  <A extends EreignisArt>(art: A) =>
  (e: Ereignis): e is EreignisVon<A> =>
    e.art === art;
