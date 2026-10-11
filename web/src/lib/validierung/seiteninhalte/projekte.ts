import { z } from 'zod';
import { mehrsprachig, mehrsprachigOptional } from '../mehrsprachig';

/** Status eines Bauprojekts; die Bezeichnungen stehen in messages/bereiche/projekte.json (Namensraum projekte.status). */
export const PROJEKT_STATI = ['in_planung', 'im_bau', 'fertiggestellt'] as const;
export type ProjektStatus = (typeof PROJEKT_STATI)[number];

/** Jahreszahl (Beginn, Fertigstellung); ohne Angabe bleibt der Platzhalter der Seite. */
const jahr = z.number().int().min(1900).max(2100).nullable().default(null);

/** Zahl mit Einheit (Kapazität): die Einheit ist mehrsprachig (Gläubige · Cemaat · Worshippers). */
const zahlMitEinheit = z.object({
  wert: z.number().int().min(0).max(1_000_000).nullable().default(null),
  einheit: mehrsprachigOptional(60).default({ de: '' }),
});

/** Meilenstein „Projektmeilensteine“ (Blatt S10, DATEN); die Reihenfolge ist die Reihenfolge der Liste. */
const meilenstein = z.object({
  titel: mehrsprachig(120),
  beschreibung: mehrsprachig(300),
  datum: mehrsprachig(60),
  erledigt: z.boolean().default(false),
});

/**
 * Seiteninhalt „projekte“ (Blatt S10, Abschnitt DATEN): redaktionelle Texte, Zahlen und Meilensteine, die die Gemeinde
 * pflegt. Jeder Bereich hat Standardwerte mit Platzhaltern (G-05), damit die Seite auch ohne gespeicherten Inhalt
 * rendert. Beträge und Bankverbindung sind Fakten der Gemeinde: ohne Angabe bleiben sie leer bzw. Platzhalter.
 */
export const schema = z.object({
  projekt: z
    .object({
      name: mehrsprachig(120).default({ de: '[Projektname – von der Gemeinde]' }),
      status: z.enum(PROJEKT_STATI).default('in_planung'),
      ort: mehrsprachigOptional(120).default({ de: '[Ortsangabe]' }),
      beginn: jahr,
      fertigstellung: jahr,
      beschreibung: mehrsprachig(4000).default({ de: '[Projektbeschreibung – von der Gemeinde]' }),
      kapazitaet: zahlMitEinheit.default({ wert: null, einheit: { de: '' } }),
      flaecheM2: z.number().int().min(0).max(1_000_000).nullable().default(null),
      einrichtungen: z.array(mehrsprachig(80)).max(30).default([]),
      /** 3D-Modell als Pfad unter /public (K-14: keine fremden Adressen). Die Ansicht ist vorerst ein Platzhalter. */
      modell: z
        .string()
        .trim()
        .max(300)
        .regex(/^\/(?![/\\])\S*$/)
        .nullable()
        .default(null),
    })
    .prefault({}),
  spende: z
    .object({
      titel: mehrsprachig(120).default({ de: '[Titel – von der Gemeinde]' }),
      text: mehrsprachig(2000).default({ de: '[Spendentext – von der Gemeinde]' }),
      gesammelt: z.number().nonnegative().max(1_000_000_000).nullable().default(null),
      ziel: z.number().positive().max(1_000_000_000).nullable().default(null),
      bankverbindung: mehrsprachigOptional(300).default({ de: '[Bankverbindung – von der Gemeinde]' }),
    })
    .prefault({}),
  unterstuetzung: z
    .object({
      titel: mehrsprachig(120).default({ de: '[Titel – von der Gemeinde]' }),
      text: mehrsprachig(2000).default({ de: '[Text – von der Gemeinde]' }),
      dank: mehrsprachig(2000).default({ de: '[Dank – von der Gemeinde]' }),
    })
    .prefault({}),
  meilensteine: z.array(meilenstein).max(30).default([]),
});

export type ProjekteInhalt = z.infer<typeof schema>;
