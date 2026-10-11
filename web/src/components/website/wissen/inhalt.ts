import { z } from 'zod';
import { mehrsprachig } from '../../../lib/validierung/mehrsprachig';

/**
 * Inhalte der Seite „Islamisches Wissen“ (Blatt S14): Artikel, Videos und Experten als Seiteninhalt
 * (Tabelle `seiteninhalt`, Schlüssel „wissen“). Die Themen liegen in der Tabelle `wissen_thema`.
 * Das Schema steht hier und nicht unter `validierung/seiteninhalte/`, weil die Registry
 * (`seiteninhalte.ts`) außerhalb dieses Pakets liegt. Umzug: Datei verschieben, Eintrag in der Registry ergänzen.
 */

/** Datum im Format JJJJ-MM-TT (ISO); die Anzeige formatiert `datumAnzeige` je Sprache. */
const datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum im Format JJJJ-MM-TT');

/** Artikel: Thema per Schlüssel (wissen_thema.slug), Autor/Lesezeit als Text, Textkörper optional. */
export const artikelInhalt = z.object({
  schluessel: z.string().trim().min(1).max(60),
  thema: z.string().trim().min(1).max(60),
  titel: mehrsprachig(200),
  autor: z.string().trim().min(1).max(120),
  lesezeit: z.string().trim().max(20),
  datum: datum.optional(),
  text: mehrsprachig(4000).optional(),
});

/** Video: nur Titel, Dauer und Beschreibung. Eine Videoquelle (URL) ist noch nicht belegt, daher kein Feld dafür. */
export const videoInhalt = z.object({
  schluessel: z.string().trim().min(1).max(60),
  thema: z.string().trim().min(1).max(60),
  titel: mehrsprachig(200),
  dauer: z.string().trim().max(20),
  beschreibung: mehrsprachig(1000),
});

/** Experte: Name und Institution als Text, Fachgebiet und Bio mehrsprachig, Artikelzahl als Text (berechnet, sobald Namen stehen). */
export const expertenInhalt = z.object({
  schluessel: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(120),
  fachgebiet: mehrsprachig(200),
  institution: z.string().trim().max(200),
  bio: mehrsprachig(2000),
  anzahlArtikel: z.string().trim().max(40),
});

export const wissenInhalt = z.object({
  artikel: z.array(artikelInhalt).default([]),
  videos: z.array(videoInhalt).default([]),
  experten: z.array(expertenInhalt).default([]),
});
export type WissenInhalt = z.infer<typeof wissenInhalt>;
