import { z } from 'zod';
import { mehrsprachig } from '../mehrsprachig';

/**
 * Seiteninhalt „igmg“ (Blatt S12, Abschnitt DATEN): redaktionelle Texte, Zahlen und Zentralkontakte der
 * IGMG-Seite. Überschriften, Reiter und Bedienelemente stehen in messages/bereiche/igmg.json. Fehlt ein Wert,
 * bleibt ein Platzhalter in eckigen Klammern (G-05).
 */

/** Zahl als Text; widersprüchliche oder unbestätigte Angaben stehen als Platzhalter „[Zahl fehlt: …]“ (Blatt S12, Auffälligkeit 1). */
const zahl = (bezeichnung: string) => z.string().trim().max(40).default(`[Zahl fehlt: ${bezeichnung}]`);

/** Kontaktwert der Zentralverwaltung, nicht mehrsprachig; bis zur Bestätigung ein Platzhalter (G-05, Laufbuch lb:225–226, lb:250). */
const kontaktWert = (platzhalter: string, max = 200) => z.string().trim().max(max).default(platzhalter);

/**
 * Seiteninhalt „igmg“. Alle Felder haben Standardwerte, damit eine fehlende Zeile trotzdem rendert (ladeSeiteninhalt).
 * Listen dürfen leer sein; mehrsprachige Texte: Deutsch Pflicht, Türkisch und Englisch mit sichtbarem Rückfall (K-02).
 */
export const schema = z.object({
  ueberblick: z
    .object({
      text: mehrsprachig(2000).default({ de: '[Text fehlt: Überblick]' }),
      auftrag: mehrsprachig(2000).default({ de: '[Text fehlt: Auftrag]' }),
    })
    .default({ text: { de: '[Text fehlt: Überblick]' }, auftrag: { de: '[Text fehlt: Auftrag]' } }),
  zahlen: z
    .object({
      moscheen: zahl('Moscheen'),
      zweigstellen: zahl('Zweigstellen'),
      menschenErreicht: zahl('Menschen erreicht'),
    })
    .default({
      moscheen: '[Zahl fehlt: Moscheen]',
      zweigstellen: '[Zahl fehlt: Zweigstellen]',
      menschenErreicht: '[Zahl fehlt: Menschen erreicht]',
    }),
  bedeutung: z.object({ absaetze: z.array(mehrsprachig(2000)).max(6).default([]) }).default({ absaetze: [] }),
  geschichte: z
    .object({
      eintraege: z
        .array(z.object({ label: mehrsprachig(120), text: mehrsprachig(2000) }))
        .max(12)
        .default([]),
    })
    .default({ eintraege: [] }),
  struktur: z
    .object({
      praesidium: mehrsprachig(2000).default({ de: '[Text fehlt: Präsidium]' }),
      ausschuss: mehrsprachig(2000).default({ de: '[Text fehlt: Ausführungsausschuss]' }),
    })
    .default({ praesidium: { de: '[Text fehlt: Präsidium]' }, ausschuss: { de: '[Text fehlt: Ausführungsausschuss]' } }),
  kontakt: z
    .object({
      adresse: kontaktWert('[Adresse]', 300),
      telefon: kontaktWert('[Telefonnummer]', 60),
      email: kontaktWert('[E-Mail]'),
      website: kontaktWert('[Website]'),
    })
    .default({ adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '[E-Mail]', website: '[Website]' }),
});

export type IgmgInhalt = z.infer<typeof schema>;
